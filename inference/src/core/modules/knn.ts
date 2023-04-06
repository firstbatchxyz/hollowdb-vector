import { KnnResult } from '../../contract/definition/bindings/ts/View';

export async function knn(dannyContract, vector, n, searchK): Promise<KnnResult> {
  return await dannyContract.knn({
    vec: vector,
    n: n,
    searchK: searchK
  });
}
