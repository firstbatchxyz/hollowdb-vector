const Bundlr = require('@bundlr-network/client').default;
const Arweave = require('arweave');

export async function fundBundlr(jwk, fund) {
  const bundlr = new Bundlr('https://node1.bundlr.network', 'arweave', jwk);

  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });
  const wins = arweave.ar.arToWinston(fund);
  await bundlr.fund(wins);
}
