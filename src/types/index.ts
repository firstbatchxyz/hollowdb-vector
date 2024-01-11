/** A point within the embedding space. */
export type Point = number[];

/** A "world" in HNSW. */
export type Graph = Record<number, LayerNode>;

/** Items within the world. */
export type LayerNode = Record<number, number>;

/** A distance and id of a point with respect to another node. */
export type Node = [distance: number, id: number];

/** Result of a KNN query for one vector. */
export type KNNResult<M = unknown> = {
  id: number;
  distance: number;
  metadata: M | null;
};
