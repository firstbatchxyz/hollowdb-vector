import { index_buffer } from "../../proto/hnsw_comm";

/** Encodes a point to protobuf & base64's it. */
export function encodePoint(q: index_buffer.IPoint): string {
  const qe = index_buffer.Point.encode(q).finish();
  return Buffer.from(qe).toString("base64");
}

/** Decodes a point from base64 encoded protobuf. */
export function decodePoint(data: string): index_buffer.IPoint {
  const dec = Buffer.from(data, "base64");
  return index_buffer.Point.decode(dec);
}

/** Encodes a point to protobuf & base64's it. */
export function encodeLayerNode(n: index_buffer.ILayerNode): string {
  const ne = index_buffer.LayerNode.encode({
    ...n,
    visible: n.visible || true, // is visible unless otherwise specified
  }).finish();
  return Buffer.from(ne).toString("base64");
}

/** Decodes a point from base64 encoded protobuf. */
export function decodeLayerNode(data: string): index_buffer.ILayerNode {
  const dec = Buffer.from(data, "base64");
  return index_buffer.LayerNode.decode(dec);
}
