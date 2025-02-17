// Warp Route config
import { warpRouteConfigSchema } from '../interface/warpRoute';

const warpRouteConfig: warpRouteConfigSchema = {
  USDC: {
    source: {
      collateralToken: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      warpRouteToken: '0x01348f639d6e418a5a9673c08c0ddf6eccb80f37',
      chainId: '8453',
    },
    routers: [
      {
        warpRouteToken: '0x8d9Bd7E9ec3cd799a659EE650DfF6C799309fA91',
        chainId: '11820',
      },
    ],
  },
};
export default warpRouteConfig;
