import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace index_buffer. */
export namespace index_buffer {
  /** Properties of a LayerNode. */
  interface ILayerNode {
    /** LayerNode level */
    level?: number | null;

    /** LayerNode idx */
    idx?: number | null;

    /** LayerNode visible */
    visible?: boolean | null;

    /** LayerNode neighbors */
    neighbors?: { [k: string]: number } | null;
  }

  /** Represents a LayerNode. */
  class LayerNode implements ILayerNode {
    /**
     * Constructs a new LayerNode.
     * @param [properties] Properties to set
     */
    constructor(properties?: index_buffer.ILayerNode);

    /** LayerNode level. */
    public level: number;

    /** LayerNode idx. */
    public idx: number;

    /** LayerNode visible. */
    public visible: boolean;

    /** LayerNode neighbors. */
    public neighbors: { [k: string]: number };

    /**
     * Creates a new LayerNode instance using the specified properties.
     * @param [properties] Properties to set
     * @returns LayerNode instance
     */
    public static create(properties?: index_buffer.ILayerNode): index_buffer.LayerNode;

    /**
     * Encodes the specified LayerNode message. Does not implicitly {@link index_buffer.LayerNode.verify|verify} messages.
     * @param message LayerNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: index_buffer.ILayerNode, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified LayerNode message, length delimited. Does not implicitly {@link index_buffer.LayerNode.verify|verify} messages.
     * @param message LayerNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: index_buffer.ILayerNode, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a LayerNode message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns LayerNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): index_buffer.LayerNode;

    /**
     * Decodes a LayerNode message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns LayerNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): index_buffer.LayerNode;

    /**
     * Verifies a LayerNode message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a LayerNode message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns LayerNode
     */
    public static fromObject(object: { [k: string]: any }): index_buffer.LayerNode;

    /**
     * Creates a plain object from a LayerNode message. Also converts values to other types if specified.
     * @param message LayerNode
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: index_buffer.LayerNode,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this LayerNode to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for LayerNode
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }

  /** Properties of a Point. */
  interface IPoint {
    /** Point idx */
    idx?: number | null;

    /** Point v */
    v?: number[] | null;
  }

  /** Represents a Point. */
  class Point implements IPoint {
    /**
     * Constructs a new Point.
     * @param [properties] Properties to set
     */
    constructor(properties?: index_buffer.IPoint);

    /** Point idx. */
    public idx: number;

    /** Point v. */
    public v: number[];

    /**
     * Creates a new Point instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Point instance
     */
    public static create(properties?: index_buffer.IPoint): index_buffer.Point;

    /**
     * Encodes the specified Point message. Does not implicitly {@link index_buffer.Point.verify|verify} messages.
     * @param message Point message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: index_buffer.IPoint, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Point message, length delimited. Does not implicitly {@link index_buffer.Point.verify|verify} messages.
     * @param message Point message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: index_buffer.IPoint, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Point message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Point
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): index_buffer.Point;

    /**
     * Decodes a Point message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Point
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): index_buffer.Point;

    /**
     * Verifies a Point message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Point message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Point
     */
    public static fromObject(object: { [k: string]: any }): index_buffer.Point;

    /**
     * Creates a plain object from a Point message. Also converts values to other types if specified.
     * @param message Point
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: index_buffer.Point, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Point to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Point
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }

  /** Properties of a PointQuant. */
  interface IPointQuant {
    /** PointQuant idx */
    idx?: number | null;

    /** PointQuant v */
    v?: number[] | null;
  }

  /** Represents a PointQuant. */
  class PointQuant implements IPointQuant {
    /**
     * Constructs a new PointQuant.
     * @param [properties] Properties to set
     */
    constructor(properties?: index_buffer.IPointQuant);

    /** PointQuant idx. */
    public idx: number;

    /** PointQuant v. */
    public v: number[];

    /**
     * Creates a new PointQuant instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PointQuant instance
     */
    public static create(properties?: index_buffer.IPointQuant): index_buffer.PointQuant;

    /**
     * Encodes the specified PointQuant message. Does not implicitly {@link index_buffer.PointQuant.verify|verify} messages.
     * @param message PointQuant message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: index_buffer.IPointQuant, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PointQuant message, length delimited. Does not implicitly {@link index_buffer.PointQuant.verify|verify} messages.
     * @param message PointQuant message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: index_buffer.IPointQuant, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PointQuant message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PointQuant
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): index_buffer.PointQuant;

    /**
     * Decodes a PointQuant message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PointQuant
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): index_buffer.PointQuant;

    /**
     * Verifies a PointQuant message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a PointQuant message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PointQuant
     */
    public static fromObject(object: { [k: string]: any }): index_buffer.PointQuant;

    /**
     * Creates a plain object from a PointQuant message. Also converts values to other types if specified.
     * @param message PointQuant
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: index_buffer.PointQuant,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this PointQuant to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PointQuant
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}
