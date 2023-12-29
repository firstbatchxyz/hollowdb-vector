import { SetSDK } from "hollowdb";
import { HNSW } from "./hnsw";
import { HollowMemory } from "./db/hollowdb";

export default class HollowDBVector<M = any> extends HNSW<M> {
  /** HollowDB SDK instance as passed in the `constructor`. */
  sdk: SetSDK<string>;

  /**
   * A VectorDB over HollowDB using HNSW index.
   *
   * @param hollowdb a hollowdb instance with `set` and `setMany` operations, where values are `string` typed.
   * - Vectors are encoded & decoded with protobuffers, and the base64 of encodings are stored in HollowDB
   * - Metadatas are stored as JSON-stringified values.
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
  constructor(
    hollowdb: SetSDK<string>,
    options?: {
      m?: number;
      efConstruction?: number;
      efSearch?: number;
    },
  ) {
    const m = options?.m || 5;
    const ef_construction = options?.efConstruction || 128;
    const ef_search = options?.efSearch || 20;

    super(new HollowMemory<M>(hollowdb), m, ef_construction, ef_search);

    this.sdk = hollowdb;
  }
}
