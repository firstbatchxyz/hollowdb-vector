import fs from 'fs';
import path from 'path';
import { State } from '../contract/definition/bindings/ts/ContractState';

export async function deploy(warp, wallet): Promise<string> {
  const contractSrc: Buffer = fs.readFileSync(
    path.join(__dirname, '../contract/implementation/pkg/rust-contract_bg.wasm')
  );
  const stateFromFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/initialState.json'), 'utf-8'));

  const initialState: State = {
    ...stateFromFile
  };
  const { contractTxId } = await warp.createContract.deploy({
    wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
    wasmSrcCodeDir: path.join(__dirname, '../contract/implementation/src'),
    wasmGlueCode: path.join(__dirname, '../contract/implementation/pkg/rust-contract.js')
  });
  fs.writeFileSync(path.join(__dirname, `../contract-tx-id.txt`), contractTxId);
  return contractTxId;
}
