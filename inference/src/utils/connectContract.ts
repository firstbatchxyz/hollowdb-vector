import { getWarpInstance } from './getWarpInstance';

module.exports.connectContract = async function (arweave, wallet, contractTxId, target) {
  const warp = getWarpInstance( target, '', null);
  return warp.contract(contractTxId).connect(wallet);
};
