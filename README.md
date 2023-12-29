<p align="center">
  <h1 align="center">
    HollowDB Vector
  </h1>

  <div align="center">
    <a href="https://www.npmjs.com/package/hollowdb-vector" target="_blank">
      <img alt="NPM" src="https://img.shields.io/npm/v/hollowdb-vector?logo=npm&color=CB3837">
    </a>
    <a href="./.github/workflows/tests.yml" target="_blank">
        <img alt="Workflow: Tests" src="https://github.com/firstbatchxyz/hollowdb-vector/actions/workflows/tests.yml/badge.svg?branch=main">
    </a>
    <a href="https://opensource.org/license/apache-2-0/" target="_blank">
        <img alt="License: Apache 2.0" src="https://img.shields.io/badge/license-Apache%202.0-7CB9E8.svg">
    </a>
  </div>
  
  <p align="center">
    <i>Implementation of Hierarchical Navigable Small Worlds (HNSW) index over <a href="https://hollowdb.xyz/" target="_blank">HollowDB</a>.</i>
  </p>
</p>

## Usage

Install the package:

```sh
yarn add hollowdb-vector
pnpm add hollowdb-vector
npm install hollowdb-vector
```

You can create the VectorDB as follows:

```ts
import HollowDBVector from "hollowdb-vector";
import { WarpFactory, defaultCacheOptions } from "warp-contracts";
import { SetSDK } from "hollowdb";
import { Redis } from "ioredis";
import { RedisCache } from "warp-contracts-redis";

// connect to Redis
const redis = new Redis();

// create Warp instance with Redis cache
const warp = WarpFactory.forMainnet().useKVStorageFactory(
  (contractTxId: string) =>
    new RedisCache({ ...defaultCacheOptions, dbLocation: `${contractTxId}` }, { client: redis }),
);

// create HollowDB SDK
const wallet = JSON.parse(readFileSync("./path/to/wallet.json", "utf-8"));
const contractTxId = "your-contract-tx-id";
const hollowdb = new SetSDK<string>(wallet, contractTxId, warp);

// create HollowDB Vector
const vectordb = new HollowDBVector(hollowdb);
```

### Inserting a Vector

With this, you can insert a new point:

```ts
// an array of floats
const point = [-0.28571999073028564 /* and many more... */, 0.13964000344276428];

// any object
const metadata = {
  name: "My favorite vector!",
};

// insert a point
await vectordb.insert(point, metadata);
```

Metadata is optional, and you can leave it out during `insert`. If you would like to set it a later time, you can always do:

```ts
vectordb.db.set_metadata(index, metadata);
```

> [!NOTE]
>
> The complexity of inserting a point may increase with more points in the DB.

### Fetching a Vector

You can get a vector by its index, which returns its point value and metadata:

```ts
const { point, metadata } = await vectordb.get_vector(index);
```

### Querying a Vector

You can make a query and return top K relevant results:

```ts
// a query point
const query = [-0.28571999073028564 /* and many more... */, 0.13964000344276428];

// number of top results to return
const K = 10;

// make a KNN search
const results = await vectordb.knn_search(query, K);

// each result contains the vector id, its distance to query, and metadata
const { id, distance, metadata } = results[0];
```

## Setup

For local setup of this repo, first clone it.

```sh
git clone https://github.com/firstbatchxyz/hollowdb-vector
```

Then, install packages:

```sh
pnpm install
```

Peer dependencies should be installed automatically.

### Protobuffers

We include the pre-compiled protobuf within the repo, but if you were to change the protobuf later, you can generate the compiled code as follows:

```sh
# HNSW protobufs
pnpm proto:code:hnsw # generate js code
pnpm proto:type:hnsw # generate types

# Request protobufs
pnpm proto:code:req # generate js code
pnpm proto:type:req # generate types
```

## Testing

Tests are ran over a few cases for a fixed set of $N, K$ parameters that are prepared in [Python](./test/python/main.py), and are compared in Typescript. Run the tests via:

```sh
pnpm test
```

> [!WARNING]
>
> You need a live Redis server for the HollowDB test to work. Furthermore, the HollowDB tests may take some time.

## Styling

Check the formatting with:

```sh
pnpm check
```

## Legacy

HollowDB Vector replaces DANNY, for the legacy code please [refer to this branch](https://github.com/firstbatchxyz/danny/tree/legacy).

## License

Dria Docker is licensed under [Apache 2.0](./LICENSE).
