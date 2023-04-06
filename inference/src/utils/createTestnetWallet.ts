import fs from 'fs';
import path from 'path';

export async function generateWallet(arweave, target) {
  const wallet = await arweave.wallets.generate();
  fs.writeFileSync(path.join(__dirname, `../../wallets/wallet_${target}.json`), JSON.stringify(wallet));
}
