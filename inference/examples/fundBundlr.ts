import { fundBundlr, estimatedPrice } from '../src';
import fs from 'fs';
import path from 'path';

async function estimate(dir) {
  return await estimatedPrice(path.join(__dirname, dir));
}
async function main(walletPath, fund) {
  const jwk = JSON.parse(fs.readFileSync(path.join(__dirname, walletPath), 'utf-8'));
  return await fundBundlr(jwk, fund);
}

// Estimate price of fund
estimate('../../indexing/shards').then((price) => {
  console.log('Estimated price of fund:', price + ' AR');
});
// Fund is number of fund you want to add Bundlr Wallet
main('wallets/wallet_mainnet.json', '0.1');
