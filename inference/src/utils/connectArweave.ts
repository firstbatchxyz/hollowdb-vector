import Arweave from 'arweave';

export function connectArweave(host, port, protocol) {
  return Arweave.init({
    host: host,
    port: port,
    protocol: protocol
  });
}
