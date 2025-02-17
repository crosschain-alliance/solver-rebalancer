export type warpRouteBase = {
  collateralToken?: string;
  warpRouteToken: string;
  chainId: string;
};

export type warpRouteConfigSchema = {
  [token: string]: {
    source: warpRouteBase;
    routers: warpRouteBase[];
  };
};
