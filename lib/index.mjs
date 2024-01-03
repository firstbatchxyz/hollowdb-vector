// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"kdrGj":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _hnsw = require("./hnsw");
var _hollowdb = require("./db/hollowdb");
var _warpContractsPluginDeploy = require("warp-contracts-plugin-deploy");
class HollowDBVector extends (0, _hnsw.HNSW) {
    /**
     * A VectorDB over HollowDB using HNSW index.
     *
     * @param hollowdb a hollowdb instance with `set` and `setMany` operations, where values are `string` typed.
     * - Vectors are encoded & decoded with protobuffers, and the base64 of encodings are stored in HollowDB
     * - Metadatas are stored as JSON-stringified values.
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
        const m = options?.m || 5;
        const ef_construction = options?.efConstruction || 128;
        const ef_search = options?.efSearch || 20;
        super(new (0, _hollowdb.HollowMemory)(hollowdb), m, ef_construction, ef_search);
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
        const { srcTxId: deploymentSrcTxId, contractTxId } = await warp.deployFromSourceTx({
            wallet: new (0, _warpContractsPluginDeploy.ArweaveSigner)(wallet),
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
            contractTxId,
            srcTxId
        };
    }
}
exports.default = HollowDBVector;

},{"./hnsw":"7sHuS","./db/hollowdb":"kPqtL","warp-contracts-plugin-deploy":"warp-contracts-plugin-deploy","@parcel/transformer-js/src/esmodule-helpers.js":"k8vWW"}],"7sHuS":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * An implementation of Hierarchical Navigable Small Worlds
 * that works over a key-value database.
 *
 * In particular, we provide a HollowDB interface that allows you to
 * store data on Arweave.
 *
 * @template M type of the metadata, which is extra information
 * stored along with each point, a common practice in vectorDBs.
 */ parcelHelpers.export(exports, "HNSW", ()=>HNSW);
var _utils = require("./utils");
class HNSW {
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
            point,
            metadata
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
            const dist = (0, _utils.cosine_distance)(q, await this.db.get_point(ep_index));
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
                const indices = neighbors.map(([_, idx])=>idx);
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
                        let dict = {};
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
        const V = new Set(ep.map(([_, id])=>id));
        // set of candidates, min-heapified
        const C = new (0, _utils.NodeHeap)(ep);
        // dynamic list of found neighbors, max-heapified | W = [(-mdist, p) for mdist, p in ep]
        // due to negation of `dist` value, this actually becomes a max-heap
        const W = new (0, _utils.NodeHeap)(ep.map(([mdist, p])=>[
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
            const dists = points.map((p)=>(0, _utils.cosine_distance)(p, q));
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
                const dd = new (0, _utils.NodeHeap)(W.heapArray.map((W_i)=>[
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
        const R = new (0, _utils.NodeHeap)();
        const W = new (0, _utils.NodeHeap)(C);
        const M = l_c > 0 ? this.m : this.m_max0; // number of neighbors to return
        const W_d = new (0, _utils.NodeHeap)(); // queue for discarded candidates
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
        let W = [];
        const ep_index = await this.db.get_ep();
        // edge case: no points were added at all
        if (ep_index === null) return [];
        const L = await this.db.get_num_layers() - 1;
        const dist = (0, _utils.cosine_distance)(q, await this.db.get_point(ep_index));
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
        ep.sort((0, _utils.compareNode));
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

},{"./utils":"kMZcP","@parcel/transformer-js/src/esmodule-helpers.js":"k8vWW"}],"kMZcP":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/** A min-heap of {@link Node} types with custom comparator. */ parcelHelpers.export(exports, "NodeHeap", ()=>NodeHeap);
/** Comparator for {@link Node} type, compares their distances. */ parcelHelpers.export(exports, "compareNode", ()=>compareNode);
/** Dot-product of two vectors. */ parcelHelpers.export(exports, "dot_product", ()=>dot_product);
/** Norm a vector. */ parcelHelpers.export(exports, "norm", ()=>norm);
/** Cosine distance between two vectors, as 1 - cosine similarity. */ parcelHelpers.export(exports, "cosine_distance", ()=>cosine_distance);
/** Inner product (alias dot product) of two vectors. */ parcelHelpers.export(exports, "inner_product", ()=>inner_product);
/** Euclidean distance between two vectors. */ parcelHelpers.export(exports, "l2_distance", ()=>l2_distance);
var _heapJs = require("heap-js");
class NodeHeap extends (0, _heapJs.Heap) {
    constructor(elems = []){
        super(compareNode);
        if (elems.length !== 0) super.addAll(elems);
    }
}
function compareNode(a, b) {
    return a[0] - b[0];
}
function dot_product(a, b) {
    return a.reduce((sum, val, idx)=>sum + val * b[idx], 0);
}
function norm(a) {
    return Math.sqrt(a.reduce((sum, val)=>sum + val * val, 0));
}
function cosine_distance(a, b) {
    return 1 - dot_product(a, b) / (norm(a) * norm(b));
}
function inner_product(a, b) {
    return dot_product(a, b);
}
function l2_distance(a, b) {
    return Math.sqrt(a.reduce((sum, val, idx)=>sum + Math.pow(val - b[idx], 2), 0));
}

},{"heap-js":"heap-js","@parcel/transformer-js/src/esmodule-helpers.js":"k8vWW"}],"k8vWW":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"kPqtL":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "HollowMemory", ()=>HollowMemory);
var _proto = require("../proto");
var _common = require("./common");
class HollowMemory {
    /**
     * Deploy a HollowDB contract.
     * @param initialState initial state of the contract
     * @param source (optional) source transaction id
     * @returns deployed contract transaction id
     */ async deploy(initialState, source = "") {
        const { contractTxId } = await this.client.warp.deployFromSourceTx({
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
        const ep = await this.client.get((0, _common.keys).ep);
        return ep === null ? null : parseInt(ep);
    }
    async set_ep(ep) {
        await this.client.set((0, _common.keys).ep, ep.toString());
    }
    async get_point(idx) {
        const data = await this.client.get((0, _common.keys).point(idx));
        if (!data) throw new Error(`No point with index ${idx}`);
        const point = (0, _proto.decodePoint)(data);
        return point.v;
    }
    async get_points(idxs) {
        if (idxs.length === 0) return [];
        const datas = await this.safe_get_many(idxs.map((idx)=>(0, _common.keys).point(idx)));
        // see if there is a null value in there
        const nullPos = datas.indexOf(null);
        if (nullPos !== -1) throw new Error(`No point with index ${idxs[nullPos]}`);
        const points = datas.map((data)=>(0, _proto.decodePoint)(data));
        return points.map((point)=>point.v);
    }
    async new_point(q) {
        const idx = await this.get_datasize();
        const point = (0, _proto.encodePoint)({
            v: q,
            idx
        });
        await this.client.set((0, _common.keys).point(idx), point);
        await this.client.set((0, _common.keys).points, (idx + 1).toString());
        return idx;
    }
    async get_num_layers() {
        const numLayers = await this.client.get((0, _common.keys).layers);
        return numLayers ? parseInt(numLayers) : 0;
    }
    async get_datasize() {
        const datasize = await this.client.get((0, _common.keys).points);
        return datasize ? parseInt(datasize) : 0;
    }
    async get_neighbor(layer, idx) {
        const data = await this.client.get((0, _common.keys).neighbor(layer, idx));
        if (!data) throw new Error(`No neighbors at layer ${layer}, index ${idx}"`);
        const node = (0, _proto.decodeLayerNode)(data);
        return node.neighbors;
    }
    async get_neighbors(layer, idxs) {
        const datas = await this.safe_get_many(idxs.map((idx)=>(0, _common.keys).neighbor(layer, idx)));
        // see if there is a null value in there
        const nullPos = datas.indexOf(null);
        if (nullPos !== -1) throw new Error(`No neighbors at layer ${layer}, index ${idxs[nullPos]}"`);
        const nodes = datas.map((data)=>(0, _proto.decodeLayerNode)(data));
        const neighbors = nodes.map((node)=>node.neighbors);
        return Object.fromEntries(idxs.map((idx, i)=>[
                idx,
                neighbors[i]
            ]));
    }
    async upsert_neighbor(layer, idx, node) {
        const data = (0, _proto.encodeLayerNode)({
            idx,
            level: layer,
            neighbors: node
        });
        await this.client.set((0, _common.keys).neighbor(layer, idx), data);
    }
    async upsert_neighbors(layer, nodes) {
        await this.safe_set_many(Object.keys(nodes).map((idx)=>{
            const i = parseInt(idx);
            const key = (0, _common.keys).neighbor(layer, i);
            const value = (0, _proto.encodeLayerNode)({
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
        await this.client.set((0, _common.keys).layers, (l + 1).toString());
    }
    async get_metadata(idx) {
        const data = await this.client.get((0, _common.keys).metadata(idx));
        return (0, _common.safeParse)(data);
    }
    async get_metadatas(idxs) {
        // const datas =
        return Promise.all(idxs.map((idx)=>this.get_metadata(idx)));
    }
    async set_metadata(idx, data) {
        await this.client.set((0, _common.keys).metadata(idx), JSON.stringify(data));
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

},{"../proto":"3mgIA","./common":"3uiDG","@parcel/transformer-js/src/esmodule-helpers.js":"k8vWW"}],"3mgIA":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/** Encodes a point to protobuf & base64's it. */ parcelHelpers.export(exports, "encodePoint", ()=>encodePoint);
/** Decodes a point from base64 encoded protobuf. */ parcelHelpers.export(exports, "decodePoint", ()=>decodePoint);
/** Encodes a point to protobuf & base64's it. */ parcelHelpers.export(exports, "encodeLayerNode", ()=>encodeLayerNode);
/** Decodes a point from base64 encoded protobuf. */ parcelHelpers.export(exports, "decodeLayerNode", ()=>decodeLayerNode);
var _hnswComm = require("../../proto/hnsw_comm");
function encodePoint(q) {
    const qe = (0, _hnswComm.index_buffer).Point.encode(q).finish();
    return Buffer.from(qe).toString("base64");
}
function decodePoint(data) {
    const dec = Buffer.from(data, "base64");
    return (0, _hnswComm.index_buffer).Point.decode(dec);
}
function encodeLayerNode(n) {
    const ne = (0, _hnswComm.index_buffer).LayerNode.encode({
        ...n,
        visible: n.visible || true
    }).finish();
    return Buffer.from(ne).toString("base64");
}
function decodeLayerNode(data) {
    const dec = Buffer.from(data, "base64");
    return (0, _hnswComm.index_buffer).LayerNode.decode(dec);
}

},{"../../proto/hnsw_comm":"c7EWc","@parcel/transformer-js/src/esmodule-helpers.js":"k8vWW"}],"c7EWc":[function(require,module,exports) {
/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/ "use strict";
var $protobuf = require("d3d6c5f7facd1bba");
// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
$root.index_buffer = function() {
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
         */ LayerNode.prototype.neighbors = $util.emptyObject;
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
            if (!writer) writer = $Writer.create();
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
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.index_buffer.LayerNode(), key, value;
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
                        if (message.neighbors === $util.emptyObject) message.neighbors = {};
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
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
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
                if (!$util.isInteger(message.level)) return "level: integer expected";
            }
            if (message.idx != null && message.hasOwnProperty("idx")) {
                if (!$util.isInteger(message.idx)) return "idx: integer expected";
            }
            if (message.visible != null && message.hasOwnProperty("visible")) {
                if (typeof message.visible !== "boolean") return "visible: boolean expected";
            }
            if (message.neighbors != null && message.hasOwnProperty("neighbors")) {
                if (!$util.isObject(message.neighbors)) return "neighbors: object expected";
                var key = Object.keys(message.neighbors);
                for(var i = 0; i < key.length; ++i){
                    if (!$util.key32Re.test(key[i])) return "neighbors: integer key{k:uint32} expected";
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
            if (object instanceof $root.index_buffer.LayerNode) return object;
            var message = new $root.index_buffer.LayerNode();
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
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
         */ Point.prototype.v = $util.emptyArray;
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
            if (!writer) writer = $Writer.create();
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
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.index_buffer.Point();
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
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
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
                if (!$util.isInteger(message.idx)) return "idx: integer expected";
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
            if (object instanceof $root.index_buffer.Point) return object;
            var message = new $root.index_buffer.Point();
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
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
         */ PointQuant.prototype.v = $util.emptyArray;
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
            if (!writer) writer = $Writer.create();
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
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.index_buffer.PointQuant();
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
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
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
                if (!$util.isInteger(message.idx)) return "idx: integer expected";
            }
            if (message.v != null && message.hasOwnProperty("v")) {
                if (!Array.isArray(message.v)) return "v: array expected";
                for(var i = 0; i < message.v.length; ++i)if (!$util.isInteger(message.v[i])) return "v: integer[] expected";
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
            if (object instanceof $root.index_buffer.PointQuant) return object;
            var message = new $root.index_buffer.PointQuant();
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
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
module.exports = $root;

},{"d3d6c5f7facd1bba":"protobufjs/minimal"}],"3uiDG":[function(require,module,exports) {
/** Utilities to get the key in KVdb for a value. */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "keys", ()=>keys);
/** Safely parses a data, returning `null` if its falsy. */ parcelHelpers.export(exports, "safeParse", ()=>safeParse);
const keys = {
    layers: "layers",
    ep: "ep",
    points: "points",
    metadata: (idx)=>`m:${idx}`,
    /** Maps a point index to its key in the KVdb. */ point: (idx)=>`${idx}`,
    /** Maps a neighbor (layer & index) to its key in the KVdb. */ neighbor: (layer, idx)=>`${layer}__${idx}`
};
function safeParse(data) {
    return data ? JSON.parse(data) : null;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"k8vWW"}]},["kdrGj"], "kdrGj", "parcelRequire0406")

//# sourceMappingURL=index.mjs.map
