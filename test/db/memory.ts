import type { Graph, LayerNode, Node, Point } from "../../src/types";
import type { DBInterface } from "../../src/db/interfaces";

/**
 * A mock DB that stores everything in JS memory.
 * @template M metadata type
 */
export class Memory<M = any> implements DBInterface<M> {
  private points: Point[] = [];
  private metadatas: (M | null)[] = [];
  private graphs: Graph[] = [];
  private ep: number | null = null;

  async get_ep(): Promise<number | null> {
    return this.ep;
  }

  async set_ep(ep: number): Promise<void> {
    this.ep = ep;
  }

  async get_point(idx: number): Promise<Point> {
    return this.points[idx];
  }

  async get_points(idxs: number[]): Promise<Point[]> {
    return idxs.map((idx) => this.points[idx]);
  }

  async new_point(q: Point): Promise<number> {
    this.points.push(q);
    return this.points.length - 1;
  }

  async get_num_layers(): Promise<number> {
    return this.graphs.length;
  }

  async get_datasize(): Promise<number> {
    return this.points.length;
  }

  async get_neighbor(layer: number, idx: number): Promise<LayerNode> {
    return this.graphs[layer][idx];
  }

  async get_neighbors(layer: number, idxs: number[]): Promise<Graph> {
    return Object.fromEntries(idxs.map((idx) => [idx, this.graphs[layer][idx]]));
  }

  async upsert_neighbor(layer: number, idx: number, node: LayerNode): Promise<void> {
    this.graphs[layer][idx] = node;
  }

  async upsert_neighbors(layer: number, nodes: Graph): Promise<void> {
    Object.keys(nodes).forEach((idx) => {
      const i = parseInt(idx);
      this.graphs[layer][i] = nodes[i];
    });
  }

  async new_neighbor(idx: number): Promise<void> {
    this.graphs.push({ [idx]: {} });
  }

  async get_metadata(idx: number): Promise<M | null> {
    return this.metadatas[idx];
  }

  async get_metadatas(idxs: number[]): Promise<(M | null)[]> {
    return idxs.map((idx) => this.metadatas[idx]);
  }

  async set_metadata(idx: number, data: M): Promise<void> {
    this.metadatas[idx] = data;
  }

  toString() {
    return "Mock Memory";
  }
}
