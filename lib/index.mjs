import {SetSDK as $hIoAt$SetSDK} from "hollowdb";
import {ArweaveSigner as $hIoAt$ArweaveSigner} from "warp-contracts-plugin-deploy";
import {Heap as $hIoAt$Heap} from "heap-js";
import {Reader as $hIoAt$Reader, Writer as $hIoAt$Writer, util as $hIoAt$util, roots as $hIoAt$roots} from "protobufjs/minimal";



class $ad07535c9a7c45b4$export$40b5ebc2b6c53be8 extends (0, $hIoAt$Heap) {
    constructor(elems = []){
        super($ad07535c9a7c45b4$export$5da954c098483040);
        if (elems.length !== 0) super.addAll(elems);
    }
}
function $ad07535c9a7c45b4$export$5da954c098483040(a, b) {
    return a[0] - b[0];
}
function $ad07535c9a7c45b4$export$88d1b1b3b8e9de14(a, b) {
    return a.reduce((sum, val, idx)=>sum + val * b[idx], 0);
}
function $ad07535c9a7c45b4$export$1991ecd29cc92c6b(a) {
    return Math.sqrt(a.reduce((sum, val)=>sum + val * val, 0));
}
function $ad07535c9a7c45b4$export$b529292445965cab(a, b) {
    return 1 - $ad07535c9a7c45b4$export$88d1b1b3b8e9de14(a, b) / ($ad07535c9a7c45b4$export$1991ecd29cc92c6b(a) * $ad07535c9a7c45b4$export$1991ecd29cc92c6b(b));
}
function $ad07535c9a7c45b4$export$2af647116e455992(a, b) {
    return $ad07535c9a7c45b4$export$88d1b1b3b8e9de14(a, b);
}
function $ad07535c9a7c45b4$export$eda62639d7a2a8a8(a, b) {
    return Math.sqrt(a.reduce((sum, val, idx)=>sum + Math.pow(val - b[idx], 2), 0));
}


class $213f7845fa511a9a$export$179858115d652742 {
    constructor(db, M, ef_construction, ef_search){
        this.db = db;
        this.m = M; // paper proposes [5,48] is a good range for m (Weavite uses 64)
        this.m_max0 = M * 2; // paper proposes max0 is 2 times m
        this.ml = 1 / Math.log(M); // papers heuristic to select ml, maximum layers
        this.ef_construction = ef_construction;
        this.ef = ef_search;
    }
    /** Returns the vector & its metadata at given index. */ async get_vector(idx) {
        const point = await this.db.get_point(idx);
        const metadata = await this.db.get_metadata(idx);
        return {
            point: point,
            metadata: metadata
        };
    }
    /** Paper proposes this heuristic for layer selection for insertion of `q`. */ select_layer() {
        return Math.floor(-Math.log(Math.random()) * this.ml);
    }
    /** Insert a query point.
     * @see https://arxiv.org/pdf/1603.09320.pdf Algorithm 1
     */ async insert(q, metadata) {
        const ep_index = await this.db.get_ep();
        const L = await this.db.get_num_layers() - 1;
        const l = this.select_layer();
        // a point is added and we get its index
        const idx = await this.db.new_point(q);
        if (metadata) await this.db.set_metadata(idx, metadata);
        if (ep_index !== null) {
            const dist = (0, $ad07535c9a7c45b4$export$b529292445965cab)(q, await this.db.get_point(ep_index));
            // iterate for each layer from L to l+1 and find entry point
            let ep = [
                [
                    dist,
                    ep_index
                ]
            ];
            for(let i = L; i > l; i--){
                const ep_copy = ep.map((e)=>[
                        e[0],
                        e[1]
                    ]);
                // search with ef = 1, returning only one neighbor
                const W = await this.search_layer(q, ep_copy, 1, i);
                // if nearest neighbor found in layer i is closer than ep, then ep = nearest neighbor
                if (W.length > 0 && ep[0][0] > W[0][0]) ep = W;
            }
            // search all layers
            for(let l_c = Math.min(L, l); l_c >= 0; l_c--){
                const W = await this.search_layer(q, ep, this.ef_construction, l_c);
                const newNode = {}; // this is for `this.graphs[l_c][idx] = {}`
                ep = W.map((e)=>[
                        e[0],
                        e[1]
                    ]); // copy W to ep
                const neighbors = this.select_neighbors(q, W, l_c);
                const indices = neighbors.map(([, idx])=>idx);
                const nodes = await this.db.get_neighbors(l_c, indices);
                // add bidirectional connections from neighbors to q at layer l_c
                const M = l_c === 0 ? this.m_max0 : this.m;
                for (const e of neighbors){
                    newNode[e[1]] = e[0];
                    nodes[e[1]][idx] = e[0];
                }
                for (const e of neighbors){
                    const eConn = Object.entries(nodes[e[1]]).map(([k, v])=>[
                            v,
                            parseInt(k)
                        ]);
                    if (eConn.length > M) {
                        // shrink connections
                        const eNewConn = this.select_neighbors(await this.db.get_point(e[1]), eConn, l_c);
                        // loop below equivalent to: self.graphs[l_c][e[1]] = {ind: dist for dist, ind in eNewConn}
                        const dict = {};
                        for (const eNew of eNewConn)dict[eNew[1]] = eNew[0];
                        nodes[e[1]] = dict; // equiv: this.graphs[l_c][e[1]] = dict;
                    }
                }
                await this.db.upsert_neighbor(l_c, idx, newNode);
                await this.db.upsert_neighbors(l_c, nodes);
            }
        }
        // add a new small world for each new layer
        const LL = await this.db.get_num_layers();
        if (LL < l + 1) await this.db.set_ep(idx);
        // TODO: can make this in parallel via a new function that adds N to num_layers
        for(let i = LL; i < l + 1; i++)await this.db.new_neighbor(idx);
    }
    /** Search a query point.
     * @see https://arxiv.org/pdf/1603.09320.pdf Algorithm 2
     */ async search_layer(q, ep, ef, l_c) {
        // set of visited elements | v = set(p for _, p in ep)
        const V = new Set(ep.map(([, id])=>id));
        // set of candidates, min-heapified
        const C = new (0, $ad07535c9a7c45b4$export$40b5ebc2b6c53be8)(ep);
        // dynamic list of found neighbors, max-heapified | W = [(-mdist, p) for mdist, p in ep]
        // due to negation of `dist` value, this actually becomes a max-heap
        const W = new (0, $ad07535c9a7c45b4$export$40b5ebc2b6c53be8)(ep.map(([mdist, p])=>[
                -mdist,
                p
            ]));
        while(!C.isEmpty()){
            const c = C.pop(); // extract nearest element from C
            const c_v = c[0]; // get distance of c
            const f_dist = -W.top(1)[0][0]; // get furthest distance from q, multiply by -1 to make get real distance
            if (c_v > f_dist) break;
            // un-visited nodes
            const neighbors = Object.keys(await this.db.get_neighbor(l_c, c[1])).map((k)=>parseInt(k)).filter((k)=>!V.has(k));
            // distances to `q`
            const points = await this.db.get_points(neighbors);
            const dists = points.map((p)=>(0, $ad07535c9a7c45b4$export$b529292445965cab)(p, q));
            // visit neighbors w.r.t distances
            dists.forEach((dist, i)=>{
                const e = neighbors[i];
                V.add(e); // mark `e` as visited
                if (dist < f_dist || W.length < ef) {
                    C.push([
                        dist,
                        e
                    ]);
                    W.push([
                        -dist,
                        e
                    ]);
                    // possible if `dist < f_dist`
                    if (W.length > ef) W.pop();
                }
            });
        }
        if (ef === 1) {
            if (W.length !== 0) {
                // TODO: is there a faster way to do this code block?
                const dd = new (0, $ad07535c9a7c45b4$export$40b5ebc2b6c53be8)(W.heapArray.map((W_i)=>[
                        -W_i[0],
                        W_i[1]
                    ]));
                return [
                    dd.pop()
                ];
            } else return [];
        }
        return W.heapArray.map((W_i)=>[
                -W_i[0],
                W_i[1]
            ]);
    }
    /** Selects and adds neighbors to the graph.
     * @see https://arxiv.org/pdf/1603.09320.pdf Algorithm 4
     */ select_neighbors(q, C, l_c, keepPrunedConnections = true) {
        const R = new (0, $ad07535c9a7c45b4$export$40b5ebc2b6c53be8)();
        const W = new (0, $ad07535c9a7c45b4$export$40b5ebc2b6c53be8)(C);
        const M = l_c > 0 ? this.m : this.m_max0; // number of neighbors to return
        const W_d = new (0, $ad07535c9a7c45b4$export$40b5ebc2b6c53be8)(); // queue for discarded candidates
        while(W.length > 0 && R.length < M){
            const e = W.pop(); // extract nearest element from W to q
            const r_top = R.top(1)[0]; // point with minimum distance to q in all R
            // it is possible that `r_top` is undefined, that is okay & is handled below
            if (R.length === 0 || r_top && e[0] < r_top[0]) R.push([
                e[0],
                e[1]
            ]);
            else W_d.push([
                e[0],
                e[1]
            ]);
        }
        if (keepPrunedConnections) while(W_d.length > 0 && R.length < M)R.push(W_d.pop());
        return R.heapArray;
    }
    /** K-nearest Neighbor search. */ async knn_search(q, K) {
        const ep_index = await this.db.get_ep();
        // edge case: no points were added at all
        if (ep_index === null) return [];
        const L = await this.db.get_num_layers() - 1;
        const dist = (0, $ad07535c9a7c45b4$export$b529292445965cab)(q, await this.db.get_point(ep_index));
        // search from top layer to layer 1
        let ep = [
            [
                dist,
                ep_index
            ]
        ];
        for(let l_c = L; l_c > 0; l_c--)ep = await this.search_layer(q, ep, 1, l_c);
        ep = await this.search_layer(q, ep, this.ef, 0);
        // sort the results & get top K
        ep.sort((0, $ad07535c9a7c45b4$export$5da954c098483040));
        const ep_topk = ep.slice(0, K);
        // retrieve metadatas
        const metadatas = await this.db.get_metadatas(ep_topk.map((ep)=>ep[1]));
        return ep_topk.map((ep, i)=>({
                id: ep[1],
                distance: ep[0],
                metadata: metadatas[i]
            }));
    }
}


var $cef39ec2dd3784ad$exports = {};
/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/ "use strict";

// Common aliases
var $cef39ec2dd3784ad$var$$Reader = $hIoAt$Reader, $cef39ec2dd3784ad$var$$Writer = $hIoAt$Writer, $cef39ec2dd3784ad$var$$util = $hIoAt$util;
// Exported root namespace
var $cef39ec2dd3784ad$var$$root = $hIoAt$roots["default"] || ($hIoAt$roots["default"] = {});
$cef39ec2dd3784ad$var$$root.index_buffer = function() {
    /**
     * Namespace index_buffer.
     * @exports index_buffer
     * @namespace
     */ var index_buffer = {};
    index_buffer.LayerNode = function() {
        /**
         * Properties of a LayerNode.
         * @memberof index_buffer
         * @interface ILayerNode
         * @property {number|null} [level] LayerNode level
         * @property {number|null} [idx] LayerNode idx
         * @property {boolean|null} [visible] LayerNode visible
         * @property {Object.<string,number>|null} [neighbors] LayerNode neighbors
         */ /**
         * Constructs a new LayerNode.
         * @memberof index_buffer
         * @classdesc Represents a LayerNode.
         * @implements ILayerNode
         * @constructor
         * @param {index_buffer.ILayerNode=} [properties] Properties to set
         */ function LayerNode(properties) {
            this.neighbors = {};
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * LayerNode level.
         * @member {number} level
         * @memberof index_buffer.LayerNode
         * @instance
         */ LayerNode.prototype.level = 0;
        /**
         * LayerNode idx.
         * @member {number} idx
         * @memberof index_buffer.LayerNode
         * @instance
         */ LayerNode.prototype.idx = 0;
        /**
         * LayerNode visible.
         * @member {boolean} visible
         * @memberof index_buffer.LayerNode
         * @instance
         */ LayerNode.prototype.visible = false;
        /**
         * LayerNode neighbors.
         * @member {Object.<string,number>} neighbors
         * @memberof index_buffer.LayerNode
         * @instance
         */ LayerNode.prototype.neighbors = $cef39ec2dd3784ad$var$$util.emptyObject;
        /**
         * Creates a new LayerNode instance using the specified properties.
         * @function create
         * @memberof index_buffer.LayerNode
         * @static
         * @param {index_buffer.ILayerNode=} [properties] Properties to set
         * @returns {index_buffer.LayerNode} LayerNode instance
         */ LayerNode.create = function create(properties) {
            return new LayerNode(properties);
        };
        /**
         * Encodes the specified LayerNode message. Does not implicitly {@link index_buffer.LayerNode.verify|verify} messages.
         * @function encode
         * @memberof index_buffer.LayerNode
         * @static
         * @param {index_buffer.ILayerNode} message LayerNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ LayerNode.encode = function encode(message, writer) {
            if (!writer) writer = $cef39ec2dd3784ad$var$$Writer.create();
            if (message.level != null && Object.hasOwnProperty.call(message, "level")) writer.uint32(/* id 1, wireType 0 =*/ 8).uint32(message.level);
            if (message.idx != null && Object.hasOwnProperty.call(message, "idx")) writer.uint32(/* id 2, wireType 0 =*/ 16).uint32(message.idx);
            if (message.visible != null && Object.hasOwnProperty.call(message, "visible")) writer.uint32(/* id 3, wireType 0 =*/ 24).bool(message.visible);
            if (message.neighbors != null && Object.hasOwnProperty.call(message, "neighbors")) for(var keys = Object.keys(message.neighbors), i = 0; i < keys.length; ++i)writer.uint32(/* id 4, wireType 2 =*/ 34).fork().uint32(/* id 1, wireType 0 =*/ 8).uint32(keys[i]).uint32(/* id 2, wireType 5 =*/ 21).float(message.neighbors[keys[i]]).ldelim();
            return writer;
        };
        /**
         * Encodes the specified LayerNode message, length delimited. Does not implicitly {@link index_buffer.LayerNode.verify|verify} messages.
         * @function encodeDelimited
         * @memberof index_buffer.LayerNode
         * @static
         * @param {index_buffer.ILayerNode} message LayerNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ LayerNode.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a LayerNode message from the specified reader or buffer.
         * @function decode
         * @memberof index_buffer.LayerNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {index_buffer.LayerNode} LayerNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ LayerNode.decode = function decode(reader, length) {
            if (!(reader instanceof $cef39ec2dd3784ad$var$$Reader)) reader = $cef39ec2dd3784ad$var$$Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $cef39ec2dd3784ad$var$$root.index_buffer.LayerNode(), key, value;
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        message.level = reader.uint32();
                        break;
                    case 2:
                        message.idx = reader.uint32();
                        break;
                    case 3:
                        message.visible = reader.bool();
                        break;
                    case 4:
                        if (message.neighbors === $cef39ec2dd3784ad$var$$util.emptyObject) message.neighbors = {};
                        var end2 = reader.uint32() + reader.pos;
                        key = 0;
                        value = 0;
                        while(reader.pos < end2){
                            var tag2 = reader.uint32();
                            switch(tag2 >>> 3){
                                case 1:
                                    key = reader.uint32();
                                    break;
                                case 2:
                                    value = reader.float();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                            }
                        }
                        message.neighbors[key] = value;
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a LayerNode message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof index_buffer.LayerNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {index_buffer.LayerNode} LayerNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ LayerNode.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $cef39ec2dd3784ad$var$$Reader)) reader = new $cef39ec2dd3784ad$var$$Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a LayerNode message.
         * @function verify
         * @memberof index_buffer.LayerNode
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ LayerNode.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.level != null && message.hasOwnProperty("level")) {
                if (!$cef39ec2dd3784ad$var$$util.isInteger(message.level)) return "level: integer expected";
            }
            if (message.idx != null && message.hasOwnProperty("idx")) {
                if (!$cef39ec2dd3784ad$var$$util.isInteger(message.idx)) return "idx: integer expected";
            }
            if (message.visible != null && message.hasOwnProperty("visible")) {
                if (typeof message.visible !== "boolean") return "visible: boolean expected";
            }
            if (message.neighbors != null && message.hasOwnProperty("neighbors")) {
                if (!$cef39ec2dd3784ad$var$$util.isObject(message.neighbors)) return "neighbors: object expected";
                var key = Object.keys(message.neighbors);
                for(var i = 0; i < key.length; ++i){
                    if (!$cef39ec2dd3784ad$var$$util.key32Re.test(key[i])) return "neighbors: integer key{k:uint32} expected";
                    if (typeof message.neighbors[key[i]] !== "number") return "neighbors: number{k:uint32} expected";
                }
            }
            return null;
        };
        /**
         * Creates a LayerNode message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof index_buffer.LayerNode
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {index_buffer.LayerNode} LayerNode
         */ LayerNode.fromObject = function fromObject(object) {
            if (object instanceof $cef39ec2dd3784ad$var$$root.index_buffer.LayerNode) return object;
            var message = new $cef39ec2dd3784ad$var$$root.index_buffer.LayerNode();
            if (object.level != null) message.level = object.level >>> 0;
            if (object.idx != null) message.idx = object.idx >>> 0;
            if (object.visible != null) message.visible = Boolean(object.visible);
            if (object.neighbors) {
                if (typeof object.neighbors !== "object") throw TypeError(".index_buffer.LayerNode.neighbors: object expected");
                message.neighbors = {};
                for(var keys = Object.keys(object.neighbors), i = 0; i < keys.length; ++i)message.neighbors[keys[i]] = Number(object.neighbors[keys[i]]);
            }
            return message;
        };
        /**
         * Creates a plain object from a LayerNode message. Also converts values to other types if specified.
         * @function toObject
         * @memberof index_buffer.LayerNode
         * @static
         * @param {index_buffer.LayerNode} message LayerNode
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ LayerNode.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.objects || options.defaults) object.neighbors = {};
            if (options.defaults) {
                object.level = 0;
                object.idx = 0;
                object.visible = false;
            }
            if (message.level != null && message.hasOwnProperty("level")) object.level = message.level;
            if (message.idx != null && message.hasOwnProperty("idx")) object.idx = message.idx;
            if (message.visible != null && message.hasOwnProperty("visible")) object.visible = message.visible;
            var keys2;
            if (message.neighbors && (keys2 = Object.keys(message.neighbors)).length) {
                object.neighbors = {};
                for(var j = 0; j < keys2.length; ++j)object.neighbors[keys2[j]] = options.json && !isFinite(message.neighbors[keys2[j]]) ? String(message.neighbors[keys2[j]]) : message.neighbors[keys2[j]];
            }
            return object;
        };
        /**
         * Converts this LayerNode to JSON.
         * @function toJSON
         * @memberof index_buffer.LayerNode
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ LayerNode.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $hIoAt$util.toJSONOptions);
        };
        /**
         * Gets the default type url for LayerNode
         * @function getTypeUrl
         * @memberof index_buffer.LayerNode
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ LayerNode.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) typeUrlPrefix = "type.googleapis.com";
            return typeUrlPrefix + "/index_buffer.LayerNode";
        };
        return LayerNode;
    }();
    index_buffer.Point = function() {
        /**
         * Properties of a Point.
         * @memberof index_buffer
         * @interface IPoint
         * @property {number|null} [idx] Point idx
         * @property {Array.<number>|null} [v] Point v
         */ /**
         * Constructs a new Point.
         * @memberof index_buffer
         * @classdesc Represents a Point.
         * @implements IPoint
         * @constructor
         * @param {index_buffer.IPoint=} [properties] Properties to set
         */ function Point(properties) {
            this.v = [];
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Point idx.
         * @member {number} idx
         * @memberof index_buffer.Point
         * @instance
         */ Point.prototype.idx = 0;
        /**
         * Point v.
         * @member {Array.<number>} v
         * @memberof index_buffer.Point
         * @instance
         */ Point.prototype.v = $cef39ec2dd3784ad$var$$util.emptyArray;
        /**
         * Creates a new Point instance using the specified properties.
         * @function create
         * @memberof index_buffer.Point
         * @static
         * @param {index_buffer.IPoint=} [properties] Properties to set
         * @returns {index_buffer.Point} Point instance
         */ Point.create = function create(properties) {
            return new Point(properties);
        };
        /**
         * Encodes the specified Point message. Does not implicitly {@link index_buffer.Point.verify|verify} messages.
         * @function encode
         * @memberof index_buffer.Point
         * @static
         * @param {index_buffer.IPoint} message Point message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Point.encode = function encode(message, writer) {
            if (!writer) writer = $cef39ec2dd3784ad$var$$Writer.create();
            if (message.idx != null && Object.hasOwnProperty.call(message, "idx")) writer.uint32(/* id 1, wireType 0 =*/ 8).uint32(message.idx);
            if (message.v != null && message.v.length) {
                writer.uint32(/* id 2, wireType 2 =*/ 18).fork();
                for(var i = 0; i < message.v.length; ++i)writer.float(message.v[i]);
                writer.ldelim();
            }
            return writer;
        };
        /**
         * Encodes the specified Point message, length delimited. Does not implicitly {@link index_buffer.Point.verify|verify} messages.
         * @function encodeDelimited
         * @memberof index_buffer.Point
         * @static
         * @param {index_buffer.IPoint} message Point message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Point.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a Point message from the specified reader or buffer.
         * @function decode
         * @memberof index_buffer.Point
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {index_buffer.Point} Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Point.decode = function decode(reader, length) {
            if (!(reader instanceof $cef39ec2dd3784ad$var$$Reader)) reader = $cef39ec2dd3784ad$var$$Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $cef39ec2dd3784ad$var$$root.index_buffer.Point();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        message.idx = reader.uint32();
                        break;
                    case 2:
                        if (!(message.v && message.v.length)) message.v = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while(reader.pos < end2)message.v.push(reader.float());
                        } else message.v.push(reader.float());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a Point message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof index_buffer.Point
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {index_buffer.Point} Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Point.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $cef39ec2dd3784ad$var$$Reader)) reader = new $cef39ec2dd3784ad$var$$Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a Point message.
         * @function verify
         * @memberof index_buffer.Point
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Point.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.idx != null && message.hasOwnProperty("idx")) {
                if (!$cef39ec2dd3784ad$var$$util.isInteger(message.idx)) return "idx: integer expected";
            }
            if (message.v != null && message.hasOwnProperty("v")) {
                if (!Array.isArray(message.v)) return "v: array expected";
                for(var i = 0; i < message.v.length; ++i)if (typeof message.v[i] !== "number") return "v: number[] expected";
            }
            return null;
        };
        /**
         * Creates a Point message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof index_buffer.Point
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {index_buffer.Point} Point
         */ Point.fromObject = function fromObject(object) {
            if (object instanceof $cef39ec2dd3784ad$var$$root.index_buffer.Point) return object;
            var message = new $cef39ec2dd3784ad$var$$root.index_buffer.Point();
            if (object.idx != null) message.idx = object.idx >>> 0;
            if (object.v) {
                if (!Array.isArray(object.v)) throw TypeError(".index_buffer.Point.v: array expected");
                message.v = [];
                for(var i = 0; i < object.v.length; ++i)message.v[i] = Number(object.v[i]);
            }
            return message;
        };
        /**
         * Creates a plain object from a Point message. Also converts values to other types if specified.
         * @function toObject
         * @memberof index_buffer.Point
         * @static
         * @param {index_buffer.Point} message Point
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Point.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.arrays || options.defaults) object.v = [];
            if (options.defaults) object.idx = 0;
            if (message.idx != null && message.hasOwnProperty("idx")) object.idx = message.idx;
            if (message.v && message.v.length) {
                object.v = [];
                for(var j = 0; j < message.v.length; ++j)object.v[j] = options.json && !isFinite(message.v[j]) ? String(message.v[j]) : message.v[j];
            }
            return object;
        };
        /**
         * Converts this Point to JSON.
         * @function toJSON
         * @memberof index_buffer.Point
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Point.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $hIoAt$util.toJSONOptions);
        };
        /**
         * Gets the default type url for Point
         * @function getTypeUrl
         * @memberof index_buffer.Point
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Point.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) typeUrlPrefix = "type.googleapis.com";
            return typeUrlPrefix + "/index_buffer.Point";
        };
        return Point;
    }();
    index_buffer.PointQuant = function() {
        /**
         * Properties of a PointQuant.
         * @memberof index_buffer
         * @interface IPointQuant
         * @property {number|null} [idx] PointQuant idx
         * @property {Array.<number>|null} [v] PointQuant v
         */ /**
         * Constructs a new PointQuant.
         * @memberof index_buffer
         * @classdesc Represents a PointQuant.
         * @implements IPointQuant
         * @constructor
         * @param {index_buffer.IPointQuant=} [properties] Properties to set
         */ function PointQuant(properties) {
            this.v = [];
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * PointQuant idx.
         * @member {number} idx
         * @memberof index_buffer.PointQuant
         * @instance
         */ PointQuant.prototype.idx = 0;
        /**
         * PointQuant v.
         * @member {Array.<number>} v
         * @memberof index_buffer.PointQuant
         * @instance
         */ PointQuant.prototype.v = $cef39ec2dd3784ad$var$$util.emptyArray;
        /**
         * Creates a new PointQuant instance using the specified properties.
         * @function create
         * @memberof index_buffer.PointQuant
         * @static
         * @param {index_buffer.IPointQuant=} [properties] Properties to set
         * @returns {index_buffer.PointQuant} PointQuant instance
         */ PointQuant.create = function create(properties) {
            return new PointQuant(properties);
        };
        /**
         * Encodes the specified PointQuant message. Does not implicitly {@link index_buffer.PointQuant.verify|verify} messages.
         * @function encode
         * @memberof index_buffer.PointQuant
         * @static
         * @param {index_buffer.IPointQuant} message PointQuant message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ PointQuant.encode = function encode(message, writer) {
            if (!writer) writer = $cef39ec2dd3784ad$var$$Writer.create();
            if (message.idx != null && Object.hasOwnProperty.call(message, "idx")) writer.uint32(/* id 1, wireType 0 =*/ 8).uint32(message.idx);
            if (message.v != null && message.v.length) {
                writer.uint32(/* id 2, wireType 2 =*/ 18).fork();
                for(var i = 0; i < message.v.length; ++i)writer.uint32(message.v[i]);
                writer.ldelim();
            }
            return writer;
        };
        /**
         * Encodes the specified PointQuant message, length delimited. Does not implicitly {@link index_buffer.PointQuant.verify|verify} messages.
         * @function encodeDelimited
         * @memberof index_buffer.PointQuant
         * @static
         * @param {index_buffer.IPointQuant} message PointQuant message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ PointQuant.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a PointQuant message from the specified reader or buffer.
         * @function decode
         * @memberof index_buffer.PointQuant
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {index_buffer.PointQuant} PointQuant
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ PointQuant.decode = function decode(reader, length) {
            if (!(reader instanceof $cef39ec2dd3784ad$var$$Reader)) reader = $cef39ec2dd3784ad$var$$Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $cef39ec2dd3784ad$var$$root.index_buffer.PointQuant();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        message.idx = reader.uint32();
                        break;
                    case 2:
                        if (!(message.v && message.v.length)) message.v = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while(reader.pos < end2)message.v.push(reader.uint32());
                        } else message.v.push(reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a PointQuant message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof index_buffer.PointQuant
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {index_buffer.PointQuant} PointQuant
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ PointQuant.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $cef39ec2dd3784ad$var$$Reader)) reader = new $cef39ec2dd3784ad$var$$Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a PointQuant message.
         * @function verify
         * @memberof index_buffer.PointQuant
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ PointQuant.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.idx != null && message.hasOwnProperty("idx")) {
                if (!$cef39ec2dd3784ad$var$$util.isInteger(message.idx)) return "idx: integer expected";
            }
            if (message.v != null && message.hasOwnProperty("v")) {
                if (!Array.isArray(message.v)) return "v: array expected";
                for(var i = 0; i < message.v.length; ++i)if (!$cef39ec2dd3784ad$var$$util.isInteger(message.v[i])) return "v: integer[] expected";
            }
            return null;
        };
        /**
         * Creates a PointQuant message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof index_buffer.PointQuant
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {index_buffer.PointQuant} PointQuant
         */ PointQuant.fromObject = function fromObject(object) {
            if (object instanceof $cef39ec2dd3784ad$var$$root.index_buffer.PointQuant) return object;
            var message = new $cef39ec2dd3784ad$var$$root.index_buffer.PointQuant();
            if (object.idx != null) message.idx = object.idx >>> 0;
            if (object.v) {
                if (!Array.isArray(object.v)) throw TypeError(".index_buffer.PointQuant.v: array expected");
                message.v = [];
                for(var i = 0; i < object.v.length; ++i)message.v[i] = object.v[i] >>> 0;
            }
            return message;
        };
        /**
         * Creates a plain object from a PointQuant message. Also converts values to other types if specified.
         * @function toObject
         * @memberof index_buffer.PointQuant
         * @static
         * @param {index_buffer.PointQuant} message PointQuant
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ PointQuant.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.arrays || options.defaults) object.v = [];
            if (options.defaults) object.idx = 0;
            if (message.idx != null && message.hasOwnProperty("idx")) object.idx = message.idx;
            if (message.v && message.v.length) {
                object.v = [];
                for(var j = 0; j < message.v.length; ++j)object.v[j] = message.v[j];
            }
            return object;
        };
        /**
         * Converts this PointQuant to JSON.
         * @function toJSON
         * @memberof index_buffer.PointQuant
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ PointQuant.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $hIoAt$util.toJSONOptions);
        };
        /**
         * Gets the default type url for PointQuant
         * @function getTypeUrl
         * @memberof index_buffer.PointQuant
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ PointQuant.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) typeUrlPrefix = "type.googleapis.com";
            return typeUrlPrefix + "/index_buffer.PointQuant";
        };
        return PointQuant;
    }();
    return index_buffer;
}();
$cef39ec2dd3784ad$exports = $cef39ec2dd3784ad$var$$root;


function $6b506cc3b59a234d$export$19d9b04acf01a618(q) {
    const qe = (0, $cef39ec2dd3784ad$exports.index_buffer).Point.encode(q).finish();
    return Buffer.from(qe).toString("base64");
}
function $6b506cc3b59a234d$export$48b31e59a75600e9(data) {
    const dec = Buffer.from(data, "base64");
    return (0, $cef39ec2dd3784ad$exports.index_buffer).Point.decode(dec);
}
function $6b506cc3b59a234d$export$a74fc3f6840de7c5(n) {
    const ne = (0, $cef39ec2dd3784ad$exports.index_buffer).LayerNode.encode({
        ...n,
        visible: n.visible || true
    }).finish();
    return Buffer.from(ne).toString("base64");
}
function $6b506cc3b59a234d$export$f7d4ebdd56cd2d02(data) {
    const dec = Buffer.from(data, "base64");
    return (0, $cef39ec2dd3784ad$exports.index_buffer).LayerNode.decode(dec);
}


/** Utilities to get the key in KVdb for a value. */ const $10dc0741c571ffd9$export$ed97f33186d4b816 = {
    layers: "layers",
    ep: "ep",
    points: "points",
    metadata: (idx)=>`m:${idx}`,
    /** Maps a point index to its key in the KVdb. */ point: (idx)=>`${idx}`,
    /** Maps a neighbor (layer & index) to its key in the KVdb. */ neighbor: (layer, idx)=>`${layer}__${idx}`
};
function $10dc0741c571ffd9$export$b48ee232557adc37(data) {
    return data ? JSON.parse(data) : null;
}


class $252d537d100f586e$export$88f737c73cf982cd {
    /**
     * Deploy a HollowDB contract.
     * @param initialState initial state of the contract
     * @param source (optional) source transaction id
     * @returns deployed contract transaction id
     */ async deploy(initialState, source = "") {
        const { contractTxId: contractTxId } = await this.client.warp.deployFromSourceTx({
            wallet: this.client.signer,
            srcTxId: source,
            initState: JSON.stringify(initialState)
        });
        return contractTxId;
    }
    constructor(client){
        this.client = client;
    }
    async get_ep() {
        const ep = await this.client.get((0, $10dc0741c571ffd9$export$ed97f33186d4b816).ep);
        return ep === null ? null : parseInt(ep);
    }
    async set_ep(ep) {
        await this.client.set((0, $10dc0741c571ffd9$export$ed97f33186d4b816).ep, ep.toString());
    }
    async get_point(idx) {
        const data = await this.client.get((0, $10dc0741c571ffd9$export$ed97f33186d4b816).point(idx));
        if (!data) throw new Error(`No point with index ${idx}`);
        const point = (0, $6b506cc3b59a234d$export$48b31e59a75600e9)(data);
        return point.v;
    }
    async get_points(idxs) {
        if (idxs.length === 0) return [];
        const datas = await this.safe_get_many(idxs.map((idx)=>(0, $10dc0741c571ffd9$export$ed97f33186d4b816).point(idx)));
        // see if there is a null value in there
        const nullPos = datas.indexOf(null);
        if (nullPos !== -1) throw new Error(`No point with index ${idxs[nullPos]}`);
        const points = datas.map((data)=>(0, $6b506cc3b59a234d$export$48b31e59a75600e9)(data));
        return points.map((point)=>point.v);
    }
    async new_point(q) {
        const idx = await this.get_datasize();
        const point = (0, $6b506cc3b59a234d$export$19d9b04acf01a618)({
            v: q,
            idx: idx
        });
        await this.client.set((0, $10dc0741c571ffd9$export$ed97f33186d4b816).point(idx), point);
        await this.client.set((0, $10dc0741c571ffd9$export$ed97f33186d4b816).points, (idx + 1).toString());
        return idx;
    }
    async get_num_layers() {
        const numLayers = await this.client.get((0, $10dc0741c571ffd9$export$ed97f33186d4b816).layers);
        return numLayers ? parseInt(numLayers) : 0;
    }
    async get_datasize() {
        const datasize = await this.client.get((0, $10dc0741c571ffd9$export$ed97f33186d4b816).points);
        return datasize ? parseInt(datasize) : 0;
    }
    async get_neighbor(layer, idx) {
        const data = await this.client.get((0, $10dc0741c571ffd9$export$ed97f33186d4b816).neighbor(layer, idx));
        if (!data) throw new Error(`No neighbors at layer ${layer}, index ${idx}"`);
        const node = (0, $6b506cc3b59a234d$export$f7d4ebdd56cd2d02)(data);
        return node.neighbors;
    }
    async get_neighbors(layer, idxs) {
        const datas = await this.safe_get_many(idxs.map((idx)=>(0, $10dc0741c571ffd9$export$ed97f33186d4b816).neighbor(layer, idx)));
        // see if there is a null value in there
        const nullPos = datas.indexOf(null);
        if (nullPos !== -1) throw new Error(`No neighbors at layer ${layer}, index ${idxs[nullPos]}"`);
        const nodes = datas.map((data)=>(0, $6b506cc3b59a234d$export$f7d4ebdd56cd2d02)(data));
        const neighbors = nodes.map((node)=>node.neighbors);
        return Object.fromEntries(idxs.map((idx, i)=>[
                idx,
                neighbors[i]
            ]));
    }
    async upsert_neighbor(layer, idx, node) {
        const data = (0, $6b506cc3b59a234d$export$a74fc3f6840de7c5)({
            idx: idx,
            level: layer,
            neighbors: node
        });
        await this.client.set((0, $10dc0741c571ffd9$export$ed97f33186d4b816).neighbor(layer, idx), data);
    }
    async upsert_neighbors(layer, nodes) {
        await this.safe_set_many(Object.keys(nodes).map((idx)=>{
            const i = parseInt(idx);
            const key = (0, $10dc0741c571ffd9$export$ed97f33186d4b816).neighbor(layer, i);
            const value = (0, $6b506cc3b59a234d$export$a74fc3f6840de7c5)({
                idx: i,
                level: layer,
                neighbors: nodes[i]
            });
            return [
                key,
                value
            ];
        }));
    }
    async new_neighbor(idx) {
        const l = await this.get_num_layers();
        await this.upsert_neighbor(l, idx, {});
        // NOTE: if `new_neighbor` is run in parallel,
        // this might cause a race-condition
        await this.client.set((0, $10dc0741c571ffd9$export$ed97f33186d4b816).layers, (l + 1).toString());
    }
    async get_metadata(idx) {
        const data = await this.client.get((0, $10dc0741c571ffd9$export$ed97f33186d4b816).metadata(idx));
        return (0, $10dc0741c571ffd9$export$b48ee232557adc37)(data);
    }
    async get_metadatas(idxs) {
        // const datas =
        return Promise.all(idxs.map((idx)=>this.get_metadata(idx)));
    }
    async set_metadata(idx, data) {
        await this.client.set((0, $10dc0741c571ffd9$export$ed97f33186d4b816).metadata(idx), JSON.stringify(data));
    }
    /**
     * A `getMany` interaction that automatically splits the request into several
     * transactions so that the transaction body-limit is not exceeded for any of them.
     *
     * For every error, the input is split into two transactions of half the size.
     */ async safe_get_many(keys) {
        try {
            return await this.client.getMany(keys);
        } catch (err) {
            // TODO: check error type
            const half = Math.floor(keys.length >> 1);
            // prettier-ignore
            return await Promise.all([
                this.safe_get_many(keys.slice(0, half)),
                this.safe_get_many(keys.slice(half))
            ]).then((results)=>results.flat());
        }
    }
    /**
     * A `setMany` interaction that automatically splits the request into several
     * transactions so that the transaction body-limit is not exceeded for any of them.
     *
     * For every error, the input is split into two transactions of half the size.
     */ async safe_set_many(entries) {
        try {
            await this.client.setMany(entries.map((e)=>e[0]), entries.map((e)=>e[1]));
        } catch (err) {
            // TODO: check error type
            const half = Math.floor(entries.length >> 1);
            // prettier-ignore
            await Promise.all([
                this.safe_set_many(entries.slice(0, half)),
                this.safe_set_many(entries.slice(half))
            ]).then((results)=>results.flat());
        }
    }
    toString() {
        return "HollowDB Set with Protobufs";
    }
}



class $018bd1f1a4fea352$export$8976759926bdf684 extends (0, $hIoAt$SetSDK) {
    async setMany(keys, values) {
        await this.base.dryWriteInteraction({
            function: "upsertVectorMulti",
            value: {
                keys: keys,
                values: values
            }
        });
    }
    async set(key, value) {
        await this.setMany([
            key
        ], [
            value
        ]);
    }
}
class $018bd1f1a4fea352$export$2e2bcd8739ae039 extends (0, $213f7845fa511a9a$export$179858115d652742) {
    /**
     * A VectorDB over HollowDB using HNSW index.
     *
     * @param hollowdb a hollowdb instance with `set` and `setMany` operations, where values are `string` typed.
     * - Vectors are encoded & decoded with protobuffers, and the base64 of encodings are stored in HollowDB
     * - Metadatas are stored as JSON-stringified values.
     * - Some of the HollowDB contracts (especially those in [Dria](https://dria.co/)) may use a function called
     * `upsertVectorMulti`, which is incompatible with `SetSDK`. For these, you may use `DriaCompatSDK`.
     *
     * @param options Optional HNSW parameters:
     *
     * - `m`:  **Number of established connections.**
     * With higher dimension size, this should also be larger.
     * Defaults to 5.
     *
     * - `efConstruction`: **Size of the dynamic candidate list.**
     * Affects build times, for instance: 400 is slow but powerful, 40 is
     * fast but not that performant.
     * Defaults to 128.
     *
     * - `efSearch`: **Factor for quality of search.** Defaults to 20.
     *
     * @template M type of the metadata
     */ constructor(hollowdb, options){
        const m = (options === null || options === void 0 ? void 0 : options.m) || 5;
        const ef_construction = (options === null || options === void 0 ? void 0 : options.efConstruction) || 128;
        const ef_search = (options === null || options === void 0 ? void 0 : options.efSearch) || 20;
        super(new (0, $252d537d100f586e$export$88f737c73cf982cd)(hollowdb), m, ef_construction, ef_search);
        this.sdk = hollowdb;
    }
    /** Deploy a new HollowDB Vector contract,
     * which is a HollowDB contract with `set` and `setMany` functions in particular.
     *
     * @param wallet your Arweave wallet
     * @param warp a Warp instance on mainnet
     * @returns deployed contract transaction id and source transaction id
     */ static async deploy(wallet, warp) {
        // source transaction id, for the contract to be deployed
        const srcTxId = "lSRrPRiiMYeJsGgT9BdV9OTZTw3hZw_UkGVpEXjD5sY";
        // our source txid is on mainnet, so we must make sure of that
        if (warp.environment !== "mainnet") throw new Error("Warp must be connected to mainnet.");
        // initailly the wallet is whitelisted on everything, and all
        // whitelists are required for the contract
        const addr = await warp.arweave.wallets.jwkToAddress(wallet);
        const initialState = {
            version: "hollowdb-vector@^0.1.0",
            owner: addr,
            verificationKeys: {
                auth: null
            },
            isProofRequired: {
                auth: false
            },
            canEvolve: true,
            whitelists: {
                put: {
                    [addr]: true
                },
                update: {
                    [addr]: true
                },
                set: {
                    [addr]: true
                }
            },
            isWhitelistRequired: {
                put: true,
                update: true,
                set: true
            }
        };
        const { srcTxId: deploymentSrcTxId, contractTxId: contractTxId } = await warp.deployFromSourceTx({
            wallet: new (0, $hIoAt$ArweaveSigner)(wallet),
            initState: JSON.stringify(initialState),
            srcTxId: srcTxId,
            evaluationManifest: {
                evaluationOptions: {
                    allowBigInt: true,
                    useKVStorage: true
                }
            }
        });
        // impossible case, but still we should check for it
        if (deploymentSrcTxId !== srcTxId) {
            console.error("Deployed srcTxId is different than the given source!");
            console.error({
                expected: srcTxId,
                received: deploymentSrcTxId
            });
        }
        return {
            contractTxId: contractTxId,
            srcTxId: srcTxId
        };
    }
}


export {$018bd1f1a4fea352$export$8976759926bdf684 as DriaCompatSDK, $018bd1f1a4fea352$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
