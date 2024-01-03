import { ContractState, SetSDK } from "hollowdb";
import { HNSW } from "./hnsw";
import { HollowMemory } from "./db/hollowdb";
import type { JWKInterface, Warp } from "warp-contracts";
import { ArweaveSigner } from "warp-contracts-plugin-deploy";

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

  /** Deploy a new HollowDB Vector contract,
   * which is a HollowDB contract with `set` and `setMany` functions in particular.
   *
   * @param wallet your Arweave wallet
   * @param warp a Warp instance on mainnet
   * @returns deployed contract transaction id and source transaction id
   */
  static async deploy(wallet: JWKInterface, warp: Warp): Promise<{ contractTxId: string; srcTxId: string }> {
    // source transaction id, for the contract to be deployed
    const srcTxId = "lSRrPRiiMYeJsGgT9BdV9OTZTw3hZw_UkGVpEXjD5sY";

    // our source txid is on mainnet, so we must make sure of that
    if (warp.environment !== "mainnet") {
      throw new Error("Warp must be connected to mainnet.");
    }

    // initailly the wallet is whitelisted on everything, and all
    // whitelists are required for the contract
    const addr = await warp.arweave.wallets.jwkToAddress(wallet);
    const initialState: ContractState = {
      version: "hollowdb-vector@^0.1.0",
      owner: addr,
      verificationKeys: { auth: null },
      isProofRequired: { auth: false },
      canEvolve: true,
      whitelists: {
        put: { [addr]: true },
        update: { [addr]: true },
        set: { [addr]: true },
      },
      isWhitelistRequired: { put: true, update: true, set: true },
    };

    const { srcTxId: deploymentSrcTxId, contractTxId } = await warp.deployFromSourceTx({
      wallet: new ArweaveSigner(wallet),
      initState: JSON.stringify(initialState),
      srcTxId: srcTxId,
      evaluationManifest: {
        evaluationOptions: {
          allowBigInt: true,
          useKVStorage: true,
        },
      },
    });

    // impossible case, but still we should check for it
    if (deploymentSrcTxId !== srcTxId) {
      console.error("Deployed srcTxId is different than the given source!");
      console.error({ expected: srcTxId, received: deploymentSrcTxId });
    }

    return { contractTxId, srcTxId };
  }
}
