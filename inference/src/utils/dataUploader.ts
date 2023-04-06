import path from 'path';
const Bundlr = require('@bundlr-network/client').default;
import fs from 'fs';

export async function dataUploader(jwk, dirPath) {
  try {
    const bundlr = new Bundlr('https://node1.bundlr.network', 'arweave', jwk);

    const response = await bundlr.uploadFolder(path.join(__dirname, dirPath), {
      indexFile: '',
      batchSize: 50,
      keepDeleted: false
    });
    console.log(`Files uploaded. Manifest Id ${response.id}`);
    return response.id;
  } catch (e) {
    console.log('Error uploading file ', e);
  }
}
export async function estimatedPrice(dirPath) {
  const bundlr = new Bundlr('https://node1.bundlr.network', 'arweave');
  const size: number = await getDirectorySize(dirPath)
    .then((size) => {
      return size / (1024 * 1024);
    })
    .catch((err) => {
      console.error(err);
      return 0;
    });
  const dataSizeToCheck = 1048576;
  const price1MBAtomic = await bundlr.getPrice(dataSizeToCheck);
  const price1MBConverted = bundlr.utils.unitConverter(price1MBAtomic);
  return price1MBConverted * size;
}

function getDirectorySize(path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let totalSize = 0;

    fs.readdir(path, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const promises = files.map((file) => {
        const filePath = `${path}/${file.name}`;
        return new Promise<void>((resolve, reject) => {
          fs.stat(filePath, (err, stats) => {
            if (err) {
              reject(err);
              return;
            }
            totalSize += stats.size;
            resolve();
          });
        });
      });
      Promise.all(promises)
        .then(() => {
          resolve(totalSize);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}
