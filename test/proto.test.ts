import { index_buffer } from "../proto/hnsw_comm";

describe("protobuf", () => {
  describe("layer node", () => {
    const node: index_buffer.ILayerNode = {
      idx: 1,
      level: 1,
      neighbors: {
        0: 1,
        1: 2,
      },
    };
    let nodeProto: index_buffer.LayerNode;

    it("should create", () => {
      nodeProto = index_buffer.LayerNode.create(node);
    });

    it("should decode", () => {
      const result: index_buffer.ILayerNode = index_buffer.LayerNode.toObject(nodeProto);
      expect(node.idx).toBe(result.idx!);
      expect(node.level).toBe(result.level!);
      expect(node.neighbors).toEqual(result.neighbors!);
    });
  });
});
