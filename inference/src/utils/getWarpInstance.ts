import { defaultCacheOptions, WarpFactory } from 'warp-contracts';
import { RedisCache } from 'warp-contracts-redis';

export function getWarpInstance(target, contractID, redisClient) {
  if (target === 'local') {
    return WarpFactory.forLocal(1984);
  } else if (target === 'testnet') {
    return WarpFactory.forTestnet()
      .useStateCache(
        new RedisCache({
          client: redisClient,
          prefix: `${contractID}.contract`
        })
      )
      .useContractCache(
        new RedisCache({
          client: redisClient,
          prefix: `${contractID}.contract`
        }),
        new RedisCache({
          client: redisClient,
          prefix: `${contractID}.src`
        })
      )
      .useKVStorageFactory(
        {
          redis: () =>
            new RedisCache({
              client: redisClient,
              prefix: `${contractID}.${contractID}`
            })
        }['redis']
      );
  } else {
    return WarpFactory.forMainnet({ ...defaultCacheOptions })
      .useStateCache(
        new RedisCache({
          client: redisClient,
          prefix: `${contractID}.contract`
        })
      )
      .useContractCache(
        new RedisCache({
          client: redisClient,
          prefix: `${contractID}.contract`
        }),
        new RedisCache({
          client: redisClient,
          prefix: `${contractID}.src`
        })
      )
      .useKVStorageFactory(
        {
          redis: () =>
            new RedisCache({
              client: redisClient,
              prefix: `${contractID}.${contractID}`
            })
        }['redis']
      );
  }
}
