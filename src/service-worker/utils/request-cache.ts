const withCache = async <T>(fn: (cache: Cache) => T): Promise<T> => {
  return caches.open('app-cache').then(fn);
};

export const getFromCache = (request: RequestInfo | URL) => {
  return withCache(c => c.match(request));
};

/*
  Adds build assets to cache without deleting existing items in cache
  Call `cleanUpCache` separately to delete unused items
*/
export const addToCache = async (buildAssets: string[]) => {
  const assetsInCache = await Promise.all(
    buildAssets.map(async asset => {
      return {
        asset,
        response: await caches.match(asset),
      };
    }),
  );

  const missingAssets = assetsInCache
    .filter(x => !x.response)
    .map(x => x.asset);

  return withCache(c => c.addAll(missingAssets));
};

export const cleanUpCache = async (buildAssets: string[]) => {
  return withCache(async c => {
    const cachedRequests = await c.keys();

    const deletable = cachedRequests.filter(request => {
      const buildAssetName = new URL(request.url).pathname.slice(1);
      return !buildAssets.includes(buildAssetName);
    });

    return Promise.all(deletable.map(d => c.delete(d)));
  });
};
