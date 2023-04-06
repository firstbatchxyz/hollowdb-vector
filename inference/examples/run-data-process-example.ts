import { process } from '../src';
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

async function main(manifestID, datasetDirPath, contractTxId) {
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

  // Init your AR Walelt
  const wallet = JSON.parse(fs.readFileSync(path.join(__dirname, '<AR_WALLET_PATH>'), 'utf-8'));

  // Connect your Danny Contract
  const dannyContract = new InferenceContract(contractTxId, warp)
    .connect(wallet)
    .setEvaluationOptions({ useKVStorage: true });

  // Process your data on Smart Contracts with Manifest ID
  await process(dannyContract, manifestID, path.join(__dirname, datasetDirPath));
}

const manifestID = '<MANIFEST_ID_FROM_DATA_UPLOAD>';
const datasetDirPath = '<TRAIN_DIRECTORY_PATH>';
const contractTxId = '<CONTRACT_TX_ID>';
main(manifestID, datasetDirPath, contractTxId);
