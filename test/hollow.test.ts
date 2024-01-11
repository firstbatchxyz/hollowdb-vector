import HollowDBVector from "../src";
import ArLocal from "arlocal";
import { DeployPlugin } from "warp-contracts-plugin-deploy";
import { testcases } from "./data";
import { SetSDK } from "hollowdb";
import { LoggerFactory, WarpFactory, defaultCacheOptions } from "warp-contracts";
import { readFileSync } from "fs";
import { Redis } from "ioredis";
import { RedisCache } from "warp-contracts-redis";

type Metadata = { id: number };

describe.skip("HollowDB Vector", () => {
  let train: number[][];
  let metadatas: Metadata[];

  let arlocal: ArLocal;
  let vectordb: HollowDBVector<Metadata>;
  const ARWEAVE_PORT = 3169;

  // testing just for 100 because that takes long enough (approx 200 seconds insert)
  const N = 100;
  const K = 10;

  beforeAll(async () => {
    const trainRaw = readFileSync("./test/data/data.json", "utf-8");
    train = JSON.parse(trainRaw);

    expect(Array.isArray(train)).toBe(true);
    expect(train.length).toBe(2000);

    // metadata is simply the id of each data (i.e. their index)
    // for testing purposes of course
    metadatas = train.map((_, i) => ({ id: i }));

    // start arlocal
    arlocal = new ArLocal(ARWEAVE_PORT, false);
    await arlocal.start();

    // connect to redis
    const redis = new Redis();
    expect(await redis.ping()).toBe("PONG");

    // setup warp
    const warp = WarpFactory.forLocal(ARWEAVE_PORT)
      .use(new DeployPlugin())
      .useKVStorageFactory(
        (contractTxId: string) =>
          new RedisCache({ ...defaultCacheOptions, dbLocation: `${contractTxId}` }, { client: redis }),
      );

    // setup wallet
    const wallet = await warp.generateWallet();
    const owner = wallet.jwk;

    // deploy contract
    const { contractTxId } = await warp.deploy(
      {
        wallet: owner,
        initState: readFileSync("./test/data/state.json", "utf-8"),
        src: readFileSync("./test/data/contract.js", "utf-8"),
        evaluationManifest: {
          evaluationOptions: {
            allowBigInt: true,
            useKVStorage: true,
          },
        },
      },
      true, // bundling disabled for local network
    );

    // create sdk
    const sdk = new SetSDK<string>(owner, contractTxId, warp);
    LoggerFactory.INST.logLevel("none");

    // create hollowdb vector
    vectordb = new HollowDBVector(sdk);

    LoggerFactory.INST.logLevel("none");
  });

  test("deployment", async () => {
    const contractTxId = await vectordb.sdk.warp.arweave.transactions.get(vectordb.sdk.contract.txId());
    expect(contractTxId).not.toBeNull();
  });

  test("insert", async () => {
    for (let i = 0; i < N; i++) {
      const msg = `inserting point [${i + 1}/${N}]`;
      console.time(msg);
      await vectordb.insert(train[i], metadatas[i]);
      console.timeEnd(msg);
    }
    expect(await vectordb.db.get_datasize()).toBe(N);
  });

  test("KNN search", async () => {
    const res = await vectordb.knn_search(train[0], K);
    expect(res.length).toBe(K);

    const testcase = testcases[`${N}.${K}`];
    expect(testcase.length).toBe(K);
    for (let i = 0; i < K; i++) {
      expect(testcase[i][0]).toBeCloseTo(1 - res[i].distance);
      expect(testcase[i][1]).toBe(res[i].id);
      expect(testcase[i][1]).toBe(res[i].metadata?.id);
    }
  });

  test("get vector", async () => {});

  afterAll(async () => {
    const redis = vectordb.sdk.warp.kvStorageFactory(vectordb.sdk.contractTxId).storage<Redis>();
    await redis.flushdb();
    await redis.quit();

    await arlocal.stop().then(() => console.log("arlocal stopped"));
  });
});
