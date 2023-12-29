import { NodeHeap, compareNode, cosine_distance } from "./utils";
import type { Point, Node, LayerNode, KNNResult } from "./types";
import type { DBInterface } from "./db/interfaces";

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
export class HNSW<M = any> {
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

  constructor(db: DBInterface, M: number, ef_construction: number, ef_search: number) {
    this.db = db;

    this.m = M; // paper proposes [5,48] is a good range for m (Weavite uses 64)
    this.m_max0 = M * 2; // paper proposes max0 is 2 times m
    this.ml = 1 / Math.log(M); // papers heuristic to select ml, maximum layers

    this.ef_construction = ef_construction;
    this.ef = ef_search;
  }

  /** Returns the vector & its metadata at given index. */
  async get_vector(idx: number): Promise<{
    point: Point;
    metadata: M | null;
  }> {
    const point = await this.db.get_point(idx);
    const metadata = await this.db.get_metadata(idx);
    return { point, metadata };
  }

  /** Paper proposes this heuristic for layer selection for insertion of `q`. */
  select_layer() {
    return Math.floor(-Math.log(Math.random()) * this.ml);
  }

  /** Insert a query point.
   * @see https://arxiv.org/pdf/1603.09320.pdf Algorithm 1
   */
  async insert(q: Point, metadata?: M) {
    const ep_index = await this.db.get_ep();
    const L = (await this.db.get_num_layers()) - 1;
    const l = this.select_layer();

    // a point is added and we get its index
    const idx = await this.db.new_point(q);
    if (metadata) {
      await this.db.set_metadata(idx, metadata);
    }

    if (ep_index !== null) {
      const dist = cosine_distance(q, await this.db.get_point(ep_index));
      // iterate for each layer from L to l+1 and find entry point
      let ep = [[dist, ep_index] as Node];
      for (let i = L; i > l; i--) {
        const ep_copy: Node[] = ep.map((e) => [e[0], e[1]]);

        // search with ef = 1, returning only one neighbor
        const W = await this.search_layer(q, ep_copy, 1, i);

        // if nearest neighbor found in layer i is closer than ep, then ep = nearest neighbor
        if (W.length > 0 && ep[0][0] > W[0][0]) {
          ep = W;
        }
      }

      // search all layers
      for (let l_c = Math.min(L, l); l_c >= 0; l_c--) {
        const W = await this.search_layer(q, ep, this.ef_construction, l_c);
        const newNode: LayerNode = {}; // this is for `this.graphs[l_c][idx] = {}`

        ep = W.map((e) => [e[0], e[1]] as Node); // copy W to ep
        const neighbors = this.select_neighbors(q, W, l_c);
        const indices = neighbors.map(([_, idx]) => idx);
        const nodes = await this.db.get_neighbors(l_c, indices);

        // add bidirectional connections from neighbors to q at layer l_c
        const M = l_c === 0 ? this.m_max0 : this.m;

        for (const e of neighbors) {
          newNode[e[1]] = e[0];
          nodes[e[1]][idx] = e[0];
        }

        for (const e of neighbors) {
          const eConn = Object.entries(nodes[e[1]]).map(([k, v]) => [v, parseInt(k)] as Node);
          if (eConn.length > M) {
            // shrink connections
            const eNewConn = this.select_neighbors(await this.db.get_point(e[1]), eConn, l_c);
            // loop below equivalent to: self.graphs[l_c][e[1]] = {ind: dist for dist, ind in eNewConn}
            let dict: Record<number, number> = {};
            for (const eNew of eNewConn) {
              dict[eNew[1]] = eNew[0];
            }

            nodes[e[1]] = dict; // equiv: this.graphs[l_c][e[1]] = dict;
          }
        }

        await this.db.upsert_neighbor(l_c, idx, newNode);
        await this.db.upsert_neighbors(l_c, nodes);
      }
    }

    // add a new small world for each new layer
    const LL = await this.db.get_num_layers();
    if (LL < l + 1) {
      await this.db.set_ep(idx);
    }

    // TODO: can make this in parallel via a new function that adds N to num_layers
    for (let i = LL; i < l + 1; i++) {
      await this.db.new_neighbor(idx);
    }
  }

  /** Search a query point.
   * @see https://arxiv.org/pdf/1603.09320.pdf Algorithm 2
   */
  async search_layer(q: Point, ep: Node[], ef: number, l_c: number) {
    // set of visited elements | v = set(p for _, p in ep)
    const V = new Set<number>(ep.map(([_, id]) => id));

    // set of candidates, min-heapified
    const C = new NodeHeap(ep);

    // dynamic list of found neighbors, max-heapified | W = [(-mdist, p) for mdist, p in ep]
    // due to negation of `dist` value, this actually becomes a max-heap
    const W = new NodeHeap(ep.map(([mdist, p]) => [-mdist, p]));

    while (!C.isEmpty()) {
      const c = C.pop()!; // extract nearest element from C
      const c_v: number = c[0]; // get distance of c
      const f_dist = -W.top(1)[0][0]; // get furthest distance from q, multiply by -1 to make get real distance

      if (c_v > f_dist) {
        break;
      }

      // un-visited nodes
      const neighbors = Object.keys(await this.db.get_neighbor(l_c, c[1]))
        .map((k) => parseInt(k))
        .filter((k) => !V.has(k));

      // distances to `q`
      const points = await this.db.get_points(neighbors);
      const dists = points.map((p) => cosine_distance(p, q));

      // visit neighbors w.r.t distances
      dists.forEach((dist, i) => {
        const e = neighbors[i];
        V.add(e); // mark `e` as visited

        if (dist < f_dist || W.length < ef) {
          C.push([dist, e]);
          W.push([-dist, e]);

          // possible if `dist < f_dist`
          if (W.length > ef) {
            W.pop();
          }
        }
      });
    }

    if (ef === 1) {
      if (W.length !== 0) {
        // TODO: is there a faster way to do this code block?
        const dd = new NodeHeap(W.heapArray.map((W_i) => [-W_i[0], W_i[1]]));
        return [dd.pop()!];
      } else {
        return [];
      }
    }

    return W.heapArray.map((W_i) => [-W_i[0], W_i[1]]) as Node[];
  }

  /** Selects and adds neighbors to the graph.
   * @see https://arxiv.org/pdf/1603.09320.pdf Algorithm 4
   */
  select_neighbors(q: Point, C: Node[], l_c: number, keepPrunedConnections: boolean = true) {
    const R = new NodeHeap();
    const W = new NodeHeap(C);
    const M = l_c > 0 ? this.m : this.m_max0; // number of neighbors to return

    const W_d = new NodeHeap(); // queue for discarded candidates
    while (W.length > 0 && R.length < M) {
      const e = W.pop()!; // extract nearest element from W to q
      const r_top = R.top(1)[0] as Node | undefined; // point with minimum distance to q in all R

      // it is possible that `r_top` is undefined, that is okay & is handled below
      if (R.length === 0 || (r_top && e[0] < r_top[0])) {
        R.push([e[0], e[1]]);
      } else {
        W_d.push([e[0], e[1]]);
      }
    }

    if (keepPrunedConnections) {
      while (W_d.length > 0 && R.length < M) {
        R.push(W_d.pop()!);
      }
    }

    return R.heapArray;
  }

  /** K-nearest Neighbor search. */
  async knn_search(q: Point, K: number): Promise<KNNResult<M>[]> {
    let W: Node[] = [];
    const ep_index = await this.db.get_ep();

    // edge case: no points were added at all
    if (ep_index === null) return [];

    const L = (await this.db.get_num_layers()) - 1;
    const dist = cosine_distance(q, await this.db.get_point(ep_index));

    // search from top layer to layer 1
    let ep: Node[] = [[dist, ep_index]];
    for (let l_c = L; l_c > 0; l_c--) {
      ep = await this.search_layer(q, ep, 1, l_c);
    }
    ep = await this.search_layer(q, ep, this.ef, 0);

    // sort the results & get top K
    ep.sort(compareNode);
    const ep_topk = ep.slice(0, K);

    // retrieve metadatas
    const metadatas = await this.db.get_metadatas(ep_topk.map((ep) => ep[1]));

    return ep_topk.map((ep, i) => ({
      id: ep[1],
      distance: ep[0],
      metadata: metadatas[i],
    }));
  }
}
