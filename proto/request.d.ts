import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace request_buffer. */
export namespace request_buffer {
  /** Properties of a Singleton. */
  interface ISingleton {
    /** Singleton v */
    v?: number[] | null;

    /** Singleton metadata */
    metadata?: { [k: string]: string } | null;
  }

  /** Represents a Singleton. */
  class Singleton implements ISingleton {
    /**
     * Constructs a new Singleton.
     * @param [properties] Properties to set
     */
    constructor(properties?: request_buffer.ISingleton);

    /** Singleton v. */
    public v: number[];

    /** Singleton metadata. */
    public metadata: { [k: string]: string };

    /**
     * Creates a new Singleton instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Singleton instance
     */
    public static create(properties?: request_buffer.ISingleton): request_buffer.Singleton;

    /**
     * Encodes the specified Singleton message. Does not implicitly {@link request_buffer.Singleton.verify|verify} messages.
     * @param message Singleton message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: request_buffer.ISingleton, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Singleton message, length delimited. Does not implicitly {@link request_buffer.Singleton.verify|verify} messages.
     * @param message Singleton message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: request_buffer.ISingleton, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Singleton message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Singleton
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): request_buffer.Singleton;

    /**
     * Decodes a Singleton message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Singleton
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): request_buffer.Singleton;

    /**
     * Verifies a Singleton message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Singleton message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Singleton
     */
    public static fromObject(object: { [k: string]: any }): request_buffer.Singleton;

    /**
     * Creates a plain object from a Singleton message. Also converts values to other types if specified.
     * @param message Singleton
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: request_buffer.Singleton,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Singleton to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Singleton
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }

  /** Properties of a Batch. */
  interface IBatch {
    /** Batch b */
    b?: string[] | null;
  }

  /** Represents a Batch. */
  class Batch implements IBatch {
    /**
     * Constructs a new Batch.
     * @param [properties] Properties to set
     */
    constructor(properties?: request_buffer.IBatch);

    /** Batch b. */
    public b: string[];

    /**
     * Creates a new Batch instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Batch instance
     */
    public static create(properties?: request_buffer.IBatch): request_buffer.Batch;

    /**
     * Encodes the specified Batch message. Does not implicitly {@link request_buffer.Batch.verify|verify} messages.
     * @param message Batch message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: request_buffer.IBatch, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Batch message, length delimited. Does not implicitly {@link request_buffer.Batch.verify|verify} messages.
     * @param message Batch message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: request_buffer.IBatch, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Batch message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Batch
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): request_buffer.Batch;

    /**
     * Decodes a Batch message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Batch
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): request_buffer.Batch;

    /**
     * Verifies a Batch message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Batch message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Batch
     */
    public static fromObject(object: { [k: string]: any }): request_buffer.Batch;

    /**
     * Creates a plain object from a Batch message. Also converts values to other types if specified.
     * @param message Batch
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: request_buffer.Batch, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Batch to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Batch
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
  }
}
