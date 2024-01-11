import type { DBInterface } from "./interfaces";
import type { Graph, LayerNode, Point } from "../types";
import { decodeLayerNode, decodePoint, encodeLayerNode, encodePoint } from "../proto";
import { SetSDK } from "hollowdb";
import { keys, safeParse } from "./common";

export class HollowMemory<M = unknown> implements DBInterface<M> {
  client: SetSDK<string>;

  /**
   * Deploy a HollowDB contract.
   * @param initialState initial state of the contract
   * @param source (optional) source transaction id
   * @returns deployed contract transaction id
   */
  async deploy(initialState: Awaited<ReturnType<typeof this.client.getState>>, source: string = "") {
    const { contractTxId } = await this.client.warp.deployFromSourceTx({
      wallet: this.client.signer,
      srcTxId: source,
      initState: JSON.stringify(initialState),
    });

    return contractTxId;
  }

  constructor(client: SetSDK<string>) {
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
    const datas = await this.safe_get_many(idxs.map((idx) => keys.point(idx)));

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
    const datas = await this.safe_get_many(idxs.map((idx) => keys.neighbor(layer, idx)));

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
    await this.safe_set_many(
      Object.keys(nodes).map((idx) => {
        const i = parseInt(idx);
        const key = keys.neighbor(layer, i);
        const value = encodeLayerNode({
          idx: i,
          level: layer,
          neighbors: nodes[i],
        });

        return [key, value];
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
    // const datas =
    return Promise.all(idxs.map((idx) => this.get_metadata(idx)));
  }

  async set_metadata(idx: number, data: M): Promise<void> {
    await this.client.set(keys.metadata(idx), JSON.stringify(data));
  }

  /**
   * A `getMany` interaction that automatically splits the request into several
   * transactions so that the transaction body-limit is not exceeded for any of them.
   *
   * For every error, the input is split into two transactions of half the size.
   */
  private async safe_get_many(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.getMany(keys);
    } catch (err) {
      // TODO: check error type
      const half = Math.floor(keys.length >> 1);

      // prettier-ignore
      return await Promise.all([
        this.safe_get_many(keys.slice(0, half)),
        this.safe_get_many(keys.slice(half))]
      ).then((results) => results.flat());
    }
  }

  /**
   * A `setMany` interaction that automatically splits the request into several
   * transactions so that the transaction body-limit is not exceeded for any of them.
   *
   * For every error, the input is split into two transactions of half the size.
   */
  private async safe_set_many(entries: [key: string, value: string][]): Promise<void> {
    try {
      await this.client.setMany(
        entries.map((e) => e[0]),
        entries.map((e) => e[1]),
      );
    } catch (err) {
      // TODO: check error type
      const half = Math.floor(entries.length >> 1);

      // prettier-ignore
      await Promise.all([
        this.safe_set_many(entries.slice(0, half)),
        this.safe_set_many(entries.slice(half))]
      ).then((results) => results.flat());
    }
  }

  toString() {
    return "HollowDB Set with Protobufs";
  }
}
