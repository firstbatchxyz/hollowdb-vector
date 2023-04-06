import { dataUploader } from '../src';
import fs from 'fs';
import path from 'path';

async function main(walletPath, dir) {
  const jwk = JSON.parse(fs.readFileSync(path.join(__dirname, walletPath), 'utf-8'));
  // Returns Data Manifest ID
  return await dataUploader(jwk, dir);
}
main('<AR_WALLET_PATH>', '<TRAIN_DIRECTORY_PATH>').then((manifestID) => {
  console.log('Data Manifest ID:', manifestID);
});
