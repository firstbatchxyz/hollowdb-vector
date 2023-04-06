# DANNY Inference


- [Installation](#installation)
- [Build](#build)
- [Typescript bindings](#typescript-bindings)
- [Deploy](#deploy)
- [Usage](#-get-started)
- [Examples](#-examples)
- [License](#license)
- [Contributing](#contributing)


## ⚙️ Installation

You will need:

- Rust: (https://doc.rust-lang.org/cargo/getting-started/installation.html)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) (on Apple's M1s you may need Rosetta `softwareupdate --install-rosetta` for wasm-pack to run)
- [Node.js](https://nodejs.org/en/download/) version 16.5 or above
- [yarn](https://yarnpkg.com/getting-started/install) installed

To install all Node.js dependencies run the following command:

```bash
yarn install
or
npm install
```

## 📐 Build

Compile your contract to WASM binary by running following command:

```bash
yarn build
```

## 🔱 Typescript bindings

Rust contract definitions can be compiled to Typescript:

1. Firstly JSON schemas are generated from Rust contract definitions using [schemars](https://github.com/GREsau/schemars).
2. Then, JSON schemas are compiled to Typescript using [json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript).
3. Lastly, a helper class is generated from typescript bindings which allows to easily interact with the contract. Instead of using `writeInteraction` method each time, specific functions can be called within the contract, e.g.:

```typescript
  async fetcher(fetcher: Fetcher, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null> {
    return await this.contract.writeInteraction<BaseInput & Transfer>({ function: 'fetcher', ...transfer }, options);
}
```

Generate JSON:

```bash
yarn gen-json
```

Compile JSON to Typescript:

```bash
yarn gen-ts
```

Generate JSON and compile to Typescript:

```bash
yarn gen-bindings
```

Files will be generated in [contract/definition/bindings](contract/definition/bindings).

## 🔄 Deploy

You must have an Arweave wallet to deploy contracts. To create an Arweave wallet, go to https://arweave.app/
- Click the plus button on the left bottom.
- Click the "Create new wallet" button.
- Enter a strong passphrase for your wallet. This passphrase will be used to encrypt your private key, so it's important to choose a passphrase that's difficult to guess and not used anywhere else.
- Your new wallet will be created, and you'll be presented with your wallet address, public key, and private key. 

**Make sure to copy your private key and keep it in a safe place, as it's required to access your wallet and make transactions.**

Deploy your contract to one of the networks by running following command:

```
yarn deploy:[network]
```
Network types are ```mainnet | testnet | local```, so in order to deploy on mainnet, use:
```yarn deploy:mainnet```
If you want to deploy your contract locally you need to run Arlocal by typing following command:

```
npx arlocal
```

You can also deploy your contract using snippet below:

```typescript
import { deploy } from '../src';
import { LoggerFactory, WarpFactory } from 'warp-contracts';
import fs from 'fs';
import path from 'path';
import { ArweaveSigner, DeployPlugin } from 'warp-contracts-plugin-deploy';
LoggerFactory.INST.logLevel('debug', 'WASM:Rust');

async function main() {
    const warp = WarpFactory.forMainnet()
        .use(new DeployPlugin())
    const wallet = JSON.parse(fs.readFileSync(path.join(__dirname, '<AR_WALLET_PATH>'), 'utf-8'));
    const contractTxId = await deploy(warp, new ArweaveSigner(wallet));
    return contractTxId
}
main();
```

When using mainnet put your wallet key in examples/wallets folder.

## 🛠️ Get Started
After successfully deploying the contract, you need to:
1. Fund Bundlr
2. Upload [Shards](../indexing/README.md) produced by "indexing" repo to Arweave.
3. Fetch shards and sync the contract state
4. Start querying DANNY

#### **Funding Bundlr**
To fund Bundlr, you can use the snippet below. The maximum amount of funding is up to you but the minimum should be sufficient enough for uploading shards to Bundlr network. 
```typescript
import { fundBundlr } from '../src'

// Initialize Danny Contract
const inferenceContract = new InferenceContract(contractTxId, warp).connect(wallet);

// How to fund wallet
await fundBundlr(jwk, fund)
```
Before uploading shards on Arweave, it's good to have an estimate price for the upload. You can do this with:
```typescript
import { estimatedPrice } from '../src'

// Estimate shards directory size
await estimatedPrice("../indexing/shards")
```

#### **Uploading Shards**

After successfully creating index files inside `indexing/shards` you can upload them with

```typescript
import { dataUploader } from '../src';
import fs from 'fs';
import path from 'path';

async function main(walletPath, dir) {
    const jwk = JSON.parse(fs.readFileSync(path.join(__dirname, walletPath), 'utf-8'));
    // Returns Data Manifest ID
    return await dataUploader(jwk, dir);
}
main('<AR_WALLET_PATH>', '<SHARD_DIRECTORY_PATH>');
```
Shards can be saved anywhere, `indexing/shards` is demo purposes. 

**Load DANNY model into contract state**

DANNY works by fetching model shards from blockchain or off-chain sources and writes it to contracts key-value state.

![DANNY KV States & Shards](https://imagedelivery.net/kbUqkpOIvA4TJOyi-hNQfQ/42c3789c-ba75-4145-4281-b85dce728600/public)

To load DANNY model to contract state, run:

```typescript
import { process } from '../src';
import fs from 'fs';
import path from 'path';
import { InferenceContract } from '../src/contract';

  // Init your AR Walelt
const wallet = JSON.parse(fs.readFileSync(path.join(__dirname, '<AR_WALLET_PATH>'), 'utf-8'));

// Connect your Danny Contract
const dannyContract = new InferenceContract(contractTxId, warp)
    .connect(wallet)
    .setEvaluationOptions({ useKVStorage: true });

// Load DANNY model to Smart Contracts with Manifest ID
await process(dannyContract, manifestID, path.join(__dirname, datasetDirPath));
```

**Decentralized Vector Search**

State is cached to local device (on callers device) after first query. This process nay take time depending on your model size. After the first query, DANNY instantly retrieves `top_n`results based on angular distance. You can query DANNY with:

```typescript
import { knn } from '../src';
import fs from 'fs';
import path from 'path';
import { InferenceContract } from '../src/contract';

// Init your AR Walelt
const wallet = JSON.parse(fs.readFileSync(path.join(__dirname, '<AR_WALLET_PATH>'), 'utf-8'));

// Connect your Danny Contract
const dannyContract = new InferenceContract(contractTxId, warp)
    .connect(wallet)
    .setEvaluationOptions({ useKVStorage: true });

// Run KNN on Danny Contract
await knn(dannyContract, vec, 100, 2000);
```


## 📜 License
DANNY is licensed under the MIT License. See [LICENSE](./LICENSE) for more information.

## 🤝 Contributing

We welcome contributions from other developers! To contribute to DANNY, please follow these guidelines:

* Create a new branch.
* Make your changes and test them thoroughly.
* Submit a pull request with a clear description of your changes and why they are necessary.