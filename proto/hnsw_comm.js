/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.index_buffer = (function() {

    /**
     * Namespace index_buffer.
     * @exports index_buffer
     * @namespace
     */
    var index_buffer = {};

    index_buffer.LayerNode = (function() {

        /**
         * Properties of a LayerNode.
         * @memberof index_buffer
         * @interface ILayerNode
         * @property {number|null} [level] LayerNode level
         * @property {number|null} [idx] LayerNode idx
         * @property {boolean|null} [visible] LayerNode visible
         * @property {Object.<string,number>|null} [neighbors] LayerNode neighbors
         */

        /**
         * Constructs a new LayerNode.
         * @memberof index_buffer
         * @classdesc Represents a LayerNode.
         * @implements ILayerNode
         * @constructor
         * @param {index_buffer.ILayerNode=} [properties] Properties to set
         */
        function LayerNode(properties) {
            this.neighbors = {};
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LayerNode level.
         * @member {number} level
         * @memberof index_buffer.LayerNode
         * @instance
         */
        LayerNode.prototype.level = 0;

        /**
         * LayerNode idx.
         * @member {number} idx
         * @memberof index_buffer.LayerNode
         * @instance
         */
        LayerNode.prototype.idx = 0;

        /**
         * LayerNode visible.
         * @member {boolean} visible
         * @memberof index_buffer.LayerNode
         * @instance
         */
        LayerNode.prototype.visible = false;

        /**
         * LayerNode neighbors.
         * @member {Object.<string,number>} neighbors
         * @memberof index_buffer.LayerNode
         * @instance
         */
        LayerNode.prototype.neighbors = $util.emptyObject;

        /**
         * Creates a new LayerNode instance using the specified properties.
         * @function create
         * @memberof index_buffer.LayerNode
         * @static
         * @param {index_buffer.ILayerNode=} [properties] Properties to set
         * @returns {index_buffer.LayerNode} LayerNode instance
         */
        LayerNode.create = function create(properties) {
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
         */
        LayerNode.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.level != null && Object.hasOwnProperty.call(message, "level"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.level);
            if (message.idx != null && Object.hasOwnProperty.call(message, "idx"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.idx);
            if (message.visible != null && Object.hasOwnProperty.call(message, "visible"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.visible);
            if (message.neighbors != null && Object.hasOwnProperty.call(message, "neighbors"))
                for (var keys = Object.keys(message.neighbors), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 0 =*/8).uint32(keys[i]).uint32(/* id 2, wireType 5 =*/21).float(message.neighbors[keys[i]]).ldelim();
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
         */
        LayerNode.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        LayerNode.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.index_buffer.LayerNode(), key, value;
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.level = reader.uint32();
                        break;
                    }
                case 2: {
                        message.idx = reader.uint32();
                        break;
                    }
                case 3: {
                        message.visible = reader.bool();
                        break;
                    }
                case 4: {
                        if (message.neighbors === $util.emptyObject)
                            message.neighbors = {};
                        var end2 = reader.uint32() + reader.pos;
                        key = 0;
                        value = 0;
                        while (reader.pos < end2) {
                            var tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
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
                    }
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
         */
        LayerNode.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LayerNode message.
         * @function verify
         * @memberof index_buffer.LayerNode
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LayerNode.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.level != null && message.hasOwnProperty("level"))
                if (!$util.isInteger(message.level))
                    return "level: integer expected";
            if (message.idx != null && message.hasOwnProperty("idx"))
                if (!$util.isInteger(message.idx))
                    return "idx: integer expected";
            if (message.visible != null && message.hasOwnProperty("visible"))
                if (typeof message.visible !== "boolean")
                    return "visible: boolean expected";
            if (message.neighbors != null && message.hasOwnProperty("neighbors")) {
                if (!$util.isObject(message.neighbors))
                    return "neighbors: object expected";
                var key = Object.keys(message.neighbors);
                for (var i = 0; i < key.length; ++i) {
                    if (!$util.key32Re.test(key[i]))
                        return "neighbors: integer key{k:uint32} expected";
                    if (typeof message.neighbors[key[i]] !== "number")
                        return "neighbors: number{k:uint32} expected";
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
         */
        LayerNode.fromObject = function fromObject(object) {
            if (object instanceof $root.index_buffer.LayerNode)
                return object;
            var message = new $root.index_buffer.LayerNode();
            if (object.level != null)
                message.level = object.level >>> 0;
            if (object.idx != null)
                message.idx = object.idx >>> 0;
            if (object.visible != null)
                message.visible = Boolean(object.visible);
            if (object.neighbors) {
                if (typeof object.neighbors !== "object")
                    throw TypeError(".index_buffer.LayerNode.neighbors: object expected");
                message.neighbors = {};
                for (var keys = Object.keys(object.neighbors), i = 0; i < keys.length; ++i)
                    message.neighbors[keys[i]] = Number(object.neighbors[keys[i]]);
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
         */
        LayerNode.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.objects || options.defaults)
                object.neighbors = {};
            if (options.defaults) {
                object.level = 0;
                object.idx = 0;
                object.visible = false;
            }
            if (message.level != null && message.hasOwnProperty("level"))
                object.level = message.level;
            if (message.idx != null && message.hasOwnProperty("idx"))
                object.idx = message.idx;
            if (message.visible != null && message.hasOwnProperty("visible"))
                object.visible = message.visible;
            var keys2;
            if (message.neighbors && (keys2 = Object.keys(message.neighbors)).length) {
                object.neighbors = {};
                for (var j = 0; j < keys2.length; ++j)
                    object.neighbors[keys2[j]] = options.json && !isFinite(message.neighbors[keys2[j]]) ? String(message.neighbors[keys2[j]]) : message.neighbors[keys2[j]];
            }
            return object;
        };

        /**
         * Converts this LayerNode to JSON.
         * @function toJSON
         * @memberof index_buffer.LayerNode
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LayerNode.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LayerNode
         * @function getTypeUrl
         * @memberof index_buffer.LayerNode
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LayerNode.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/index_buffer.LayerNode";
        };

        return LayerNode;
    })();

    index_buffer.Point = (function() {

        /**
         * Properties of a Point.
         * @memberof index_buffer
         * @interface IPoint
         * @property {number|null} [idx] Point idx
         * @property {Array.<number>|null} [v] Point v
         */

        /**
         * Constructs a new Point.
         * @memberof index_buffer
         * @classdesc Represents a Point.
         * @implements IPoint
         * @constructor
         * @param {index_buffer.IPoint=} [properties] Properties to set
         */
        function Point(properties) {
            this.v = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Point idx.
         * @member {number} idx
         * @memberof index_buffer.Point
         * @instance
         */
        Point.prototype.idx = 0;

        /**
         * Point v.
         * @member {Array.<number>} v
         * @memberof index_buffer.Point
         * @instance
         */
        Point.prototype.v = $util.emptyArray;

        /**
         * Creates a new Point instance using the specified properties.
         * @function create
         * @memberof index_buffer.Point
         * @static
         * @param {index_buffer.IPoint=} [properties] Properties to set
         * @returns {index_buffer.Point} Point instance
         */
        Point.create = function create(properties) {
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
         */
        Point.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.idx != null && Object.hasOwnProperty.call(message, "idx"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.idx);
            if (message.v != null && message.v.length) {
                writer.uint32(/* id 2, wireType 2 =*/18).fork();
                for (var i = 0; i < message.v.length; ++i)
                    writer.float(message.v[i]);
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
         */
        Point.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Point.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.index_buffer.Point();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.idx = reader.uint32();
                        break;
                    }
                case 2: {
                        if (!(message.v && message.v.length))
                            message.v = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.v.push(reader.float());
                        } else
                            message.v.push(reader.float());
                        break;
                    }
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
         */
        Point.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Point message.
         * @function verify
         * @memberof index_buffer.Point
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Point.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.idx != null && message.hasOwnProperty("idx"))
                if (!$util.isInteger(message.idx))
                    return "idx: integer expected";
            if (message.v != null && message.hasOwnProperty("v")) {
                if (!Array.isArray(message.v))
                    return "v: array expected";
                for (var i = 0; i < message.v.length; ++i)
                    if (typeof message.v[i] !== "number")
                        return "v: number[] expected";
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
         */
        Point.fromObject = function fromObject(object) {
            if (object instanceof $root.index_buffer.Point)
                return object;
            var message = new $root.index_buffer.Point();
            if (object.idx != null)
                message.idx = object.idx >>> 0;
            if (object.v) {
                if (!Array.isArray(object.v))
                    throw TypeError(".index_buffer.Point.v: array expected");
                message.v = [];
                for (var i = 0; i < object.v.length; ++i)
                    message.v[i] = Number(object.v[i]);
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
         */
        Point.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.v = [];
            if (options.defaults)
                object.idx = 0;
            if (message.idx != null && message.hasOwnProperty("idx"))
                object.idx = message.idx;
            if (message.v && message.v.length) {
                object.v = [];
                for (var j = 0; j < message.v.length; ++j)
                    object.v[j] = options.json && !isFinite(message.v[j]) ? String(message.v[j]) : message.v[j];
            }
            return object;
        };

        /**
         * Converts this Point to JSON.
         * @function toJSON
         * @memberof index_buffer.Point
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Point.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Point
         * @function getTypeUrl
         * @memberof index_buffer.Point
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Point.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/index_buffer.Point";
        };

        return Point;
    })();

    index_buffer.PointQuant = (function() {

        /**
         * Properties of a PointQuant.
         * @memberof index_buffer
         * @interface IPointQuant
         * @property {number|null} [idx] PointQuant idx
         * @property {Array.<number>|null} [v] PointQuant v
         */

        /**
         * Constructs a new PointQuant.
         * @memberof index_buffer
         * @classdesc Represents a PointQuant.
         * @implements IPointQuant
         * @constructor
         * @param {index_buffer.IPointQuant=} [properties] Properties to set
         */
        function PointQuant(properties) {
            this.v = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PointQuant idx.
         * @member {number} idx
         * @memberof index_buffer.PointQuant
         * @instance
         */
        PointQuant.prototype.idx = 0;

        /**
         * PointQuant v.
         * @member {Array.<number>} v
         * @memberof index_buffer.PointQuant
         * @instance
         */
        PointQuant.prototype.v = $util.emptyArray;

        /**
         * Creates a new PointQuant instance using the specified properties.
         * @function create
         * @memberof index_buffer.PointQuant
         * @static
         * @param {index_buffer.IPointQuant=} [properties] Properties to set
         * @returns {index_buffer.PointQuant} PointQuant instance
         */
        PointQuant.create = function create(properties) {
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
         */
        PointQuant.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.idx != null && Object.hasOwnProperty.call(message, "idx"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.idx);
            if (message.v != null && message.v.length) {
                writer.uint32(/* id 2, wireType 2 =*/18).fork();
                for (var i = 0; i < message.v.length; ++i)
                    writer.uint32(message.v[i]);
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
         */
        PointQuant.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        PointQuant.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.index_buffer.PointQuant();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.idx = reader.uint32();
                        break;
                    }
                case 2: {
                        if (!(message.v && message.v.length))
                            message.v = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.v.push(reader.uint32());
                        } else
                            message.v.push(reader.uint32());
                        break;
                    }
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
         */
        PointQuant.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PointQuant message.
         * @function verify
         * @memberof index_buffer.PointQuant
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PointQuant.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.idx != null && message.hasOwnProperty("idx"))
                if (!$util.isInteger(message.idx))
                    return "idx: integer expected";
            if (message.v != null && message.hasOwnProperty("v")) {
                if (!Array.isArray(message.v))
                    return "v: array expected";
                for (var i = 0; i < message.v.length; ++i)
                    if (!$util.isInteger(message.v[i]))
                        return "v: integer[] expected";
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
         */
        PointQuant.fromObject = function fromObject(object) {
            if (object instanceof $root.index_buffer.PointQuant)
                return object;
            var message = new $root.index_buffer.PointQuant();
            if (object.idx != null)
                message.idx = object.idx >>> 0;
            if (object.v) {
                if (!Array.isArray(object.v))
                    throw TypeError(".index_buffer.PointQuant.v: array expected");
                message.v = [];
                for (var i = 0; i < object.v.length; ++i)
                    message.v[i] = object.v[i] >>> 0;
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
         */
        PointQuant.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.v = [];
            if (options.defaults)
                object.idx = 0;
            if (message.idx != null && message.hasOwnProperty("idx"))
                object.idx = message.idx;
            if (message.v && message.v.length) {
                object.v = [];
                for (var j = 0; j < message.v.length; ++j)
                    object.v[j] = message.v[j];
            }
            return object;
        };

        /**
         * Converts this PointQuant to JSON.
         * @function toJSON
         * @memberof index_buffer.PointQuant
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PointQuant.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PointQuant
         * @function getTypeUrl
         * @memberof index_buffer.PointQuant
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PointQuant.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/index_buffer.PointQuant";
        };

        return PointQuant;
    })();

    return index_buffer;
})();

module.exports = $root;
