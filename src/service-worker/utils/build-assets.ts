let internalBuildAssets: string[] = [];

export const setBuildAssets = (assets: string[]) => {
  internalBuildAssets = assets;
};

export const getBuildAssets = () => internalBuildAssets;
