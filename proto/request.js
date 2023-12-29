/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.request_buffer = (function() {

    /**
     * Namespace request_buffer.
     * @exports request_buffer
     * @namespace
     */
    var request_buffer = {};

    request_buffer.Singleton = (function() {

        /**
         * Properties of a Singleton.
         * @memberof request_buffer
         * @interface ISingleton
         * @property {Array.<number>|null} [v] Singleton v
         * @property {Object.<string,string>|null} [metadata] Singleton metadata
         */

        /**
         * Constructs a new Singleton.
         * @memberof request_buffer
         * @classdesc Represents a Singleton.
         * @implements ISingleton
         * @constructor
         * @param {request_buffer.ISingleton=} [properties] Properties to set
         */
        function Singleton(properties) {
            this.v = [];
            this.metadata = {};
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Singleton v.
         * @member {Array.<number>} v
         * @memberof request_buffer.Singleton
         * @instance
         */
        Singleton.prototype.v = $util.emptyArray;

        /**
         * Singleton metadata.
         * @member {Object.<string,string>} metadata
         * @memberof request_buffer.Singleton
         * @instance
         */
        Singleton.prototype.metadata = $util.emptyObject;

        /**
         * Creates a new Singleton instance using the specified properties.
         * @function create
         * @memberof request_buffer.Singleton
         * @static
         * @param {request_buffer.ISingleton=} [properties] Properties to set
         * @returns {request_buffer.Singleton} Singleton instance
         */
        Singleton.create = function create(properties) {
            return new Singleton(properties);
        };

        /**
         * Encodes the specified Singleton message. Does not implicitly {@link request_buffer.Singleton.verify|verify} messages.
         * @function encode
         * @memberof request_buffer.Singleton
         * @static
         * @param {request_buffer.ISingleton} message Singleton message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Singleton.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.v != null && message.v.length) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (var i = 0; i < message.v.length; ++i)
                    writer.float(message.v[i]);
                writer.ldelim();
            }
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                for (var keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Singleton message, length delimited. Does not implicitly {@link request_buffer.Singleton.verify|verify} messages.
         * @function encodeDelimited
         * @memberof request_buffer.Singleton
         * @static
         * @param {request_buffer.ISingleton} message Singleton message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Singleton.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Singleton message from the specified reader or buffer.
         * @function decode
         * @memberof request_buffer.Singleton
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {request_buffer.Singleton} Singleton
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Singleton.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.request_buffer.Singleton(), key, value;
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
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
                case 2: {
                        if (message.metadata === $util.emptyObject)
                            message.metadata = {};
                        var end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            var tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.metadata[key] = value;
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
         * Decodes a Singleton message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof request_buffer.Singleton
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {request_buffer.Singleton} Singleton
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Singleton.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Singleton message.
         * @function verify
         * @memberof request_buffer.Singleton
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Singleton.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.v != null && message.hasOwnProperty("v")) {
                if (!Array.isArray(message.v))
                    return "v: array expected";
                for (var i = 0; i < message.v.length; ++i)
                    if (typeof message.v[i] !== "number")
                        return "v: number[] expected";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isObject(message.metadata))
                    return "metadata: object expected";
                var key = Object.keys(message.metadata);
                for (var i = 0; i < key.length; ++i)
                    if (!$util.isString(message.metadata[key[i]]))
                        return "metadata: string{k:string} expected";
            }
            return null;
        };

        /**
         * Creates a Singleton message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof request_buffer.Singleton
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {request_buffer.Singleton} Singleton
         */
        Singleton.fromObject = function fromObject(object) {
            if (object instanceof $root.request_buffer.Singleton)
                return object;
            var message = new $root.request_buffer.Singleton();
            if (object.v) {
                if (!Array.isArray(object.v))
                    throw TypeError(".request_buffer.Singleton.v: array expected");
                message.v = [];
                for (var i = 0; i < object.v.length; ++i)
                    message.v[i] = Number(object.v[i]);
            }
            if (object.metadata) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".request_buffer.Singleton.metadata: object expected");
                message.metadata = {};
                for (var keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                    message.metadata[keys[i]] = String(object.metadata[keys[i]]);
            }
            return message;
        };

        /**
         * Creates a plain object from a Singleton message. Also converts values to other types if specified.
         * @function toObject
         * @memberof request_buffer.Singleton
         * @static
         * @param {request_buffer.Singleton} message Singleton
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Singleton.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.v = [];
            if (options.objects || options.defaults)
                object.metadata = {};
            if (message.v && message.v.length) {
                object.v = [];
                for (var j = 0; j < message.v.length; ++j)
                    object.v[j] = options.json && !isFinite(message.v[j]) ? String(message.v[j]) : message.v[j];
            }
            var keys2;
            if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                object.metadata = {};
                for (var j = 0; j < keys2.length; ++j)
                    object.metadata[keys2[j]] = message.metadata[keys2[j]];
            }
            return object;
        };

        /**
         * Converts this Singleton to JSON.
         * @function toJSON
         * @memberof request_buffer.Singleton
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Singleton.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Singleton
         * @function getTypeUrl
         * @memberof request_buffer.Singleton
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Singleton.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/request_buffer.Singleton";
        };

        return Singleton;
    })();

    request_buffer.Batch = (function() {

        /**
         * Properties of a Batch.
         * @memberof request_buffer
         * @interface IBatch
         * @property {Array.<string>|null} [b] Batch b
         */

        /**
         * Constructs a new Batch.
         * @memberof request_buffer
         * @classdesc Represents a Batch.
         * @implements IBatch
         * @constructor
         * @param {request_buffer.IBatch=} [properties] Properties to set
         */
        function Batch(properties) {
            this.b = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Batch b.
         * @member {Array.<string>} b
         * @memberof request_buffer.Batch
         * @instance
         */
        Batch.prototype.b = $util.emptyArray;

        /**
         * Creates a new Batch instance using the specified properties.
         * @function create
         * @memberof request_buffer.Batch
         * @static
         * @param {request_buffer.IBatch=} [properties] Properties to set
         * @returns {request_buffer.Batch} Batch instance
         */
        Batch.create = function create(properties) {
            return new Batch(properties);
        };

        /**
         * Encodes the specified Batch message. Does not implicitly {@link request_buffer.Batch.verify|verify} messages.
         * @function encode
         * @memberof request_buffer.Batch
         * @static
         * @param {request_buffer.IBatch} message Batch message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Batch.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.b != null && message.b.length)
                for (var i = 0; i < message.b.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.b[i]);
            return writer;
        };

        /**
         * Encodes the specified Batch message, length delimited. Does not implicitly {@link request_buffer.Batch.verify|verify} messages.
         * @function encodeDelimited
         * @memberof request_buffer.Batch
         * @static
         * @param {request_buffer.IBatch} message Batch message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Batch.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Batch message from the specified reader or buffer.
         * @function decode
         * @memberof request_buffer.Batch
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {request_buffer.Batch} Batch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Batch.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.request_buffer.Batch();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.b && message.b.length))
                            message.b = [];
                        message.b.push(reader.string());
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
         * Decodes a Batch message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof request_buffer.Batch
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {request_buffer.Batch} Batch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Batch.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Batch message.
         * @function verify
         * @memberof request_buffer.Batch
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Batch.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.b != null && message.hasOwnProperty("b")) {
                if (!Array.isArray(message.b))
                    return "b: array expected";
                for (var i = 0; i < message.b.length; ++i)
                    if (!$util.isString(message.b[i]))
                        return "b: string[] expected";
            }
            return null;
        };

        /**
         * Creates a Batch message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof request_buffer.Batch
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {request_buffer.Batch} Batch
         */
        Batch.fromObject = function fromObject(object) {
            if (object instanceof $root.request_buffer.Batch)
                return object;
            var message = new $root.request_buffer.Batch();
            if (object.b) {
                if (!Array.isArray(object.b))
                    throw TypeError(".request_buffer.Batch.b: array expected");
                message.b = [];
                for (var i = 0; i < object.b.length; ++i)
                    message.b[i] = String(object.b[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a Batch message. Also converts values to other types if specified.
         * @function toObject
         * @memberof request_buffer.Batch
         * @static
         * @param {request_buffer.Batch} message Batch
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Batch.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.b = [];
            if (message.b && message.b.length) {
                object.b = [];
                for (var j = 0; j < message.b.length; ++j)
                    object.b[j] = message.b[j];
            }
            return object;
        };

        /**
         * Converts this Batch to JSON.
         * @function toJSON
         * @memberof request_buffer.Batch
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Batch.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Batch
         * @function getTypeUrl
         * @memberof request_buffer.Batch
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Batch.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/request_buffer.Batch";
        };

        return Batch;
    })();

    return request_buffer;
})();

module.exports = $root;
