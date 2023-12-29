import type { DBInterface } from "../../src/db/interfaces";
import type { Graph, LayerNode, Point } from "../../src/types";
import type { Redis } from "ioredis";
import { decodeLayerNode, decodePoint, encodeLayerNode, encodePoint } from "../../src/proto";
import { keys, safeParse } from "../../src/db/common";

export class RedisMemory<M = any> implements DBInterface<M> {
  client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async get_ep(): Promise<number | null> {
    const ep = await this.client.get(keys.ep);
    return ep === null ? null : parseInt(ep);
  }

  async set_ep(ep: number): Promise<void> {
    await this.client.set(keys.ep, ep.toString());
  }

  async get_point(idx: number): Promise<Point> {
    const data = await this.client.get(keys.point(idx));
    if (!data) {
      throw new Error(`No point with index ${idx}`);
    }
    const point = decodePoint(data);
    return point.v!;
  }

  async get_points(idxs: number[]): Promise<Point[]> {
    if (idxs.length === 0) return [];
    const datas = await this.client.mget(idxs.map((idx) => keys.point(idx)));

    // see if there is a null value in there
    const nullPos = datas.indexOf(null);
    if (nullPos !== -1) {
      throw new Error(`No point with index ${idxs[nullPos]}`);
    }

    const points = datas.map((data) => decodePoint(data!));
    return points.map((point) => point.v!);
  }

  async new_point(q: Point): Promise<number> {
    const idx = await this.get_datasize();
    const point = encodePoint({ v: q, idx });
    await this.client.set(keys.point(idx), point);
    await this.client.set(keys.points, (idx + 1).toString());
    return idx;
  }

  async get_num_layers(): Promise<number> {
    const numLayers = await this.client.get(keys.layers);
    return numLayers ? parseInt(numLayers) : 0;
  }

  async get_datasize(): Promise<number> {
    const datasize = await this.client.get(keys.points);
    return datasize ? parseInt(datasize) : 0;
  }

  async get_neighbor(layer: number, idx: number): Promise<LayerNode> {
    const data = await this.client.get(keys.neighbor(layer, idx));
    if (!data) {
      throw new Error(`No neighbors at layer ${layer}, index ${idx}"`);
    }
    const node = decodeLayerNode(data);
    return node.neighbors!;
  }

  async get_neighbors(layer: number, idxs: number[]): Promise<Graph> {
    const datas = await this.client.mget(idxs.map((idx) => keys.neighbor(layer, idx)));

    // see if there is a null value in there
    const nullPos = datas.indexOf(null);
    if (nullPos !== -1) {
      throw new Error(`No neighbors at layer ${layer}, index ${idxs[nullPos]}"`);
    }

    const nodes = datas.map((data) => decodeLayerNode(data!));
    const neighbors = nodes.map((node) => node.neighbors!);
    return Object.fromEntries(idxs.map((idx, i) => [idx, neighbors[i]]));
  }

  async upsert_neighbor(layer: number, idx: number, node: LayerNode): Promise<void> {
    const data = encodeLayerNode({
      idx,
      level: layer,
      neighbors: node,
    });
    await this.client.set(keys.neighbor(layer, idx), data);
  }

  async upsert_neighbors(layer: number, nodes: Graph): Promise<void> {
    await this.client.mset(
      Object.keys(nodes)
        .map((idx) => {
          const i = parseInt(idx);
          const key = keys.neighbor(layer, i);
          const value = encodeLayerNode({
            idx: i,
            level: layer,
            neighbors: nodes[i],
          });

          return [key, value];
        })
        .flat(),
    );

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
    await this.client.set(keys.layers, (l + 1).toString());
  }

  async get_metadata(idx: number): Promise<M | null> {
    const data = await this.client.get(keys.metadata(idx));
    return safeParse<M>(data);
  }

  async get_metadatas(idxs: number[]): Promise<(M | null)[]> {
    const datas = await this.client.mget(idxs.map((idx) => keys.metadata(idx)));
    const parsed = datas.map((data) => safeParse<M>(data));
    return parsed;
  }

  async set_metadata(idx: number, data: M): Promise<void> {
    await this.client.set(keys.metadata(idx), JSON.stringify(data));
  }

  toString() {
    return "Redis with Protobufs";
  }
}
