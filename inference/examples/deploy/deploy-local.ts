import { deploy } from '../../src';
import { LoggerFactory, WarpFactory } from 'warp-contracts';
import fs from 'fs';
import path from 'path';
import { ArweaveSigner, DeployPlugin } from 'warp-contracts-plugin-deploy';
import ArLocal from 'arlocal';
LoggerFactory.INST.logLevel('debug', 'WASM:Rust');

async function main() {
  const arlocal = new ArLocal(1820, false);
  await arlocal.start();
  const warp = WarpFactory.forLocal(1820).use(new DeployPlugin());
  const wallet = JSON.parse(fs.readFileSync(path.join(__dirname, '<AR_WALLET_PATH>'), 'utf-8'));
  const contractTxId = await deploy(warp, new ArweaveSigner(wallet));
  return contractTxId;
}
main().then((contractTxId) => {
  console.log('Contract Tx ID:', contractTxId);
});
