/* eslint-disable @typescript-eslint/no-unused-vars */

import { HNSW } from "../src/hnsw";
import { Memory } from "./db/memory";
import { KVMemory } from "./db/kvMemory";
import { RedisMemory } from "./db/redis";
import { testcases } from "./data";
import { readFileSync } from "fs";
import { Redis } from "ioredis";

type Metadata = { id: number };

describe("HNSW", () => {
  let train: number[][];
  let metadatas: Metadata[];

  beforeAll(async () => {
    const trainRaw = readFileSync("./test/data/data.json", "utf-8");
    train = JSON.parse(trainRaw);

    expect(Array.isArray(train)).toBe(true);
    expect(train.length).toBe(2000);

    // metadata is simply the id of each data (i.e. their index)
    // for testing purposes of course
    metadatas = train.map((_, i) => ({ id: i }));
  });

  [
    { N: 2000, K: 10 },
    { N: 1000, K: 10 },
    { N: 500, K: 10 },
    { N: 100, K: 10 },
  ].map(({ K, N }) =>
    describe(`K = ${K}\tN = ${N}`, () => {
      // const db = new Memory<Metadata>();
      const db = new KVMemory<Metadata>();
      // const db = new RedisMemory<Metadata>(new Redis());
      console.log(`Using ${db}`);

      const hnsw = new HNSW<Metadata>(db, 5, 128, 20);

      test("insert", async () => {
        for (let i = 0; i < N; i++) {
          await hnsw.insert(train[i], metadatas[i]);
        }
        expect(await hnsw.db.get_datasize()).toBe(N);
      });

      test("KNN search", async () => {
        const res = await hnsw.knn_search(train[0], K);
        expect(res.length).toBe(K);

        const testcase = testcases[`${N}.${K}`];
        expect(testcase.length).toBe(K);

        for (let i = 0; i < K; i++) {
          expect(testcase[i][0]).toBeCloseTo(1 - res[i].distance);
          expect(testcase[i][1]).toBe(res[i].id);
          expect(testcase[i][1]).toBe(res[i].metadata?.id);
        }
      });

      afterAll(async () => {
        if (db instanceof RedisMemory) {
          await db.client.flushdb();
          await db.client.quit();
        }
      });
    }),
  );
});
