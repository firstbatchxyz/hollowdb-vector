import { SetSDK } from "hollowdb";
import { JWKInterface, Warp } from "warp-contracts";
/** A point within the embedding space. */
type Point = number[];
/** A "world" in HNSW. */
type Graph = Record<number, LayerNode>;
/** Items within the world. */
type LayerNode = Record<number, number>;
/** A distance and id of a point with respect to another node. */
type Node = [distance: number, id: number];
/** Result of a KNN query for one vector. */
type KNNResult<M = any> = {
    id: number;
    distance: number;
    metadata: M | null;
};
/**
 * The `graphs` and `points` of HNSW can be stored in any interface supported by this interface.
 */
interface DBInterface<M = any> {
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
    /** Get entry point index.
     * @returns entry point, when no points are added yet it returns `null`
     */
    get_ep(): Promise<number | null>;
    /** Set entry point index
     * @param ep new entry point
     */
    set_ep(ep: number): Promise<void>;
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
/**
 * An implementation of Hierarchical Navigable Small Worlds
 * that works over a key-value database.
 *
 * In particular, we provide a HollowDB interface that allows you to
 * store data on Arweave.
 *
 * @template M type of the metadata, which is extra information
 * stored along with each point, a common practice in vectorDBs.
 */
declare class HNSW<M = any> {
    /** A database that supports `DBInterface`. */
    db: DBInterface<M>;
    /** Number of established connections; should increase as dimension size increases. */
    m: number;
    /** Maximum number of connections for each element per layer. */
    m_max0: number;
    /** Normalization factor for level generation. */
    ml: number;
    /** Size of the dynamic candidate list. Affects build times, 400 is very powerful, 40 is fast. */
    ef_construction: number;
    /** Factor for quality of search. */
    ef: number;
    constructor(db: DBInterface, M: number, ef_construction: number, ef_search: number);
    /** Returns the vector & its metadata at given index. */
    get_vector(idx: number): Promise<{
        point: Point;
        metadata: M | null;
    }>;
    /** Paper proposes this heuristic for layer selection for insertion of `q`. */
    select_layer(): number;
    /** Insert a query point.
     * @see https://arxiv.org/pdf/1603.09320.pdf Algorithm 1
     */
    insert(q: Point, metadata?: M): Promise<void>;
    /** Search a query point.
     * @see https://arxiv.org/pdf/1603.09320.pdf Algorithm 2
     */
    search_layer(q: Point, ep: Node[], ef: number, l_c: number): Promise<Node[]>;
    /** Selects and adds neighbors to the graph.
     * @see https://arxiv.org/pdf/1603.09320.pdf Algorithm 4
     */
    select_neighbors(q: Point, C: Node[], l_c: number, keepPrunedConnections?: boolean): Node[];
    /** K-nearest Neighbor search. */
    knn_search(q: Point, K: number): Promise<KNNResult<M>[]>;
}
export default class HollowDBVector<M = any> extends HNSW<M> {
    /** HollowDB SDK instance as passed in the `constructor`. */
    sdk: SetSDK<string>;
    /**
     * A VectorDB over HollowDB using HNSW index.
     *
     * @param hollowdb a hollowdb instance with `set` and `setMany` operations, where values are `string` typed.
     * - Vectors are encoded & decoded with protobuffers, and the base64 of encodings are stored in HollowDB
     * - Metadatas are stored as JSON-stringified values.
     *
     * @param options Optional HNSW parameters:
     *
     * - `m`:  **Number of established connections.**
     * With higher dimension size, this should also be larger.
     * Defaults to 5.
     *
     * - `efConstruction`: **Size of the dynamic candidate list.**
     * Affects build times, for instance: 400 is slow but powerful, 40 is
     * fast but not that performant.
     * Defaults to 128.
     *
     * - `efSearch`: **Factor for quality of search.** Defaults to 20.
     *
     * @template M type of the metadata
     */
    constructor(hollowdb: SetSDK<string>, options?: {
        m?: number;
        efConstruction?: number;
        efSearch?: number;
    });
    /** Deploy a new HollowDB Vector contract,
     * which is a HollowDB contract with `set` and `setMany` functions in particular.
     *
     * @param wallet your Arweave wallet
     * @param warp a Warp instance on mainnet
     * @returns deployed contract transaction id and source transaction id
     */
    static deploy(wallet: JWKInterface, warp: Warp): Promise<{
        contractTxId: string;
        srcTxId: string;
    }>;
}

//# sourceMappingURL=index.d.ts.map
