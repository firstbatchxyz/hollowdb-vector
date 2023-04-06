import fs from 'fs';
import { addFunds } from './addFunds';
import { generateWallet } from './createTestnetWallet';
import path from 'path';

export async function loadWallet(arweave, walletJwk, target, generated) {
  let wallet;
  if (!generated) {
    await generateWallet(arweave, target);
  }

  try {
    wallet = JSON.parse(fs.readFileSync(path.join(walletJwk), 'utf-8'));
  } catch (e) {
    throw new Error('Wallet file not found! Please run deploy script first.');
  }

  if (target == 'testnet' || target == 'local') {
    await addFunds(arweave, wallet);
  }

  return wallet;
}

export async function walletAddress(arweave, wallet) {
  return arweave.wallets.getAddress(wallet);
}
