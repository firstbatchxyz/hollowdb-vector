import { knn } from '../src';
import { createClient } from 'redis';
import { LoggerFactory, WarpFactory } from 'warp-contracts';
import { RedisCache } from 'warp-contracts-redis';
import fs from 'fs';
import path from 'path';
import { FetchExtension } from 'warp-contracts-plugin-fetch';
import { InferenceContract } from '../src/contract/definition/bindings/ts/InferenceContract';

LoggerFactory.INST.logLevel('debug', 'WASM:Rust');

// Connect Redis Cache with your Redis Client
const redisClient = createClient({
  url: 'redis://default:redispw@localhost:6379'
});

async function main(vec, contractTxId) {
  // Init Warp Instance
  const warp = WarpFactory.forMainnet()
    .use(new FetchExtension())
    .useKVStorageFactory(
      () =>
        new RedisCache({
          client: redisClient,
          prefix: `example-contract.example-contract`
        })
    );

  // Init your AR Wallet
  const wallet = JSON.parse(fs.readFileSync(path.join(__dirname, '<AR_WALLET_PATH>'), 'utf-8'));

  // Connect your Danny Contract
  const dannyContract = new InferenceContract(contractTxId, warp)
    .connect(wallet)
    .setEvaluationOptions({ useKVStorage: true });

  // Run KNN on Danny Contract
  await knn(dannyContract, vec, 100, 2000);
}

const vec = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const contractTxId = '<CONTRACT_TX_ID>';
main(vec, contractTxId).then(() => {
  console.log('Done');
});
