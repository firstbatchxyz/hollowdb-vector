import type { Graph, LayerNode, Point } from "../../src/types";
import type { DBInterface } from "../../src/db/interfaces";
import { decodeLayerNode, decodePoint, encodeLayerNode, encodePoint } from "../../src/proto";
import { keys, safeParse } from "../../src/db/common";

/** A mock DB that stores everything in JS memory; but,
 * - uses a KV interface
 * - uses protobufs to store values as serialized & base64-encoded values */
export class KVMemory<M = any> implements DBInterface<M> {
  private kvdb: Record<string, string | undefined> = {};

  async get_ep(): Promise<number | null> {
    const ep = this.kvdb[keys.ep];
    return ep ? parseInt(ep) : null;
  }

  async set_ep(ep: number): Promise<void> {
    this.kvdb[keys.ep] = ep.toString();
  }

  async get_point(idx: number): Promise<Point> {
    const data = this.kvdb[keys.point(idx)];
    if (!data) {
      throw new Error(`No point with index ${idx}`);
    }
    const point = decodePoint(data);
    return point.v!;
  }

  async get_points(idxs: number[]): Promise<Point[]> {
    return Promise.all(idxs.map((idx) => this.get_point(idx)));
  }

  async new_point(q: Point): Promise<number> {
    const idx = await this.get_datasize();
    const point = encodePoint({ v: q, idx });
    this.kvdb[keys.point(idx)] = point;
    this.kvdb[keys.points] = (idx + 1).toString();
    return idx;
  }

  async get_num_layers(): Promise<number> {
    const data = this.kvdb[keys.layers];
    return data ? parseInt(data) : 0;
  }

  async get_datasize(): Promise<number> {
    const data = this.kvdb[keys.points];
    return data ? parseInt(data) : 0;
  }

  async get_neighbor(layer: number, idx: number): Promise<LayerNode> {
    const data = this.kvdb[keys.neighbor(layer, idx)];
    if (!data) {
      throw new Error(`No neighbors at layer ${layer}, index ${idx}"`);
    }
    const node = decodeLayerNode(data);
    return node.neighbors!;
  }

  async get_neighbors(layer: number, idxs: number[]): Promise<Graph> {
    const nodes = await Promise.all(idxs.map((idx) => this.get_neighbor(layer, idx)));
    return Object.fromEntries(idxs.map((idx, i) => [idx, nodes[i]]));
  }

  async upsert_neighbor(layer: number, idx: number, node: LayerNode): Promise<void> {
    const data = encodeLayerNode({
      idx,
      level: layer,
      neighbors: node,
    });
    this.kvdb[keys.neighbor(layer, idx)] = data;
  }

  async upsert_neighbors(layer: number, nodes: Graph): Promise<void> {
    await Promise.all(
      Object.keys(nodes).map((idx) => {
        const i = parseInt(idx);
        return this.upsert_neighbor(layer, i, nodes[i]);
      }),
    );
  }

  async new_neighbor(idx: number): Promise<void> {
    const l = await this.get_num_layers();
    await this.upsert_neighbor(l, idx, {});

    // NOTE: if `new_neighbor` is run in parallel,
    // this might cause a race-condition
    this.kvdb[keys.layers] = (l + 1).toString();
  }

  async get_metadata(idx: number): Promise<M | null> {
    const data = this.kvdb[keys.metadata(idx)];
    return safeParse<M>(data);
  }

  async get_metadatas(idxs: number[]): Promise<(M | null)[]> {
    const datas = idxs.map((idx) => this.kvdb[keys.metadata(idx)]);
    const parsed = datas.map((data) => safeParse<M>(data));
    return parsed;
  }

  async set_metadata(idx: number, data: M): Promise<void> {
    this.kvdb[keys.metadata(idx)] = JSON.stringify(data);
  }

  toString() {
    return "Mock KV Memory with Protobufs";
  }
}
