import { InferenceContract } from '../../contract/definition/bindings/ts/InferenceContract';
import fs from 'fs';

export async function process(dannyContract: InferenceContract, manifestID, datasetDirPath): Promise<void> {
  const filenames = fs.readdirSync(datasetDirPath);
  await dannyContract.fetcher({
    manifestId: manifestID,
    files: filenames
  });

  console.log('Links successfully deployed to Danny Contract');
}
