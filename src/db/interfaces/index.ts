import type { Graph, LayerNode, Point } from "../../types";

/**
 * The `graphs` and `points` of HNSW can be stored in any interface supported by this interface.
 */
export interface DBInterface<M = unknown> {
  /////////////// NEIGHBORS ///////////////

  /** Adds a new empty layer.
   * @param idx index of the point, which will allow us to
   * initalize the new later as `{[idx]: {}}`
   */
  new_neighbor(idx: number): Promise<void>;

  /** Return neighbors of a node at some index within a given layer. */
  get_neighbor(layer: number, idx: number): Promise<LayerNode>;
  /** Return neighbors of nodes at some indices within a given layer. */
  get_neighbors(layer: number, idxs: number[]): Promise<Graph>;
  /** Set neighbors of a node at some index within a given layer. */
  upsert_neighbor(layer: number, idx: number, node: LayerNode): Promise<void>;
  /** Set neighbors of nodes at some indices within a given layer. */
  upsert_neighbors(layer: number, nodes: Graph): Promise<void>;
  /** Number of layers, equivalent to number of graphs.
   * @returns number of layers
   */
  get_num_layers(): Promise<number>;

  /////////////// POINTS ///////////////

  /** **Adds a new point.**
   * @param q a new point
   * @returns the index of the added point, equivalent to result of
   * `get_datasize()` before adding this point.
   */
  new_point(q: Point): Promise<number>;

  /** **Return a specific point.**
   * @param idx index of the point
   */
  get_point(idx: number): Promise<Point>;

  /** **Return a list of points.**
   * @param idxs a list of indices of the points
   * @throws if point does not exist at the given index
   * @returns a point object
   */
  get_points(idxs: number[]): Promise<Point[]>;

  /** **Number of points inserted.**
   * @returns number of points inserted
   * @throws if a point does not exist at any of the given indices
   * @returns a list of point objects
   */
  get_datasize(): Promise<number>;

  /////////////// ENTRY POINT ///////////////

  /** Get entry point index.
   * @returns entry point, when no points are added yet it returns `null`
   */
  get_ep(): Promise<number | null>;

  /** Set entry point index
   * @param ep new entry point
   */
  set_ep(ep: number): Promise<void>;

  /////////////// METADATA ///////////////

  /** Get metadata of some point.
   * @param idx index of the point
   * @returns metadata, or `null` if there isnt any
   */
  get_metadata(idx: number): Promise<M | null>;

  /** Get metadatas of several points.
   * @param idxs a list of indices of the points
   * @returns a list of metadatas, or `null`s if there is no metadata for an index
   */
  get_metadatas(idxs: number[]): Promise<(M | null)[]>;

  /** Set metadata of some point.
   * @param idx index of the point
   * @param data metadata
   */
  set_metadata(idx: number, data: M): Promise<void>;
}
