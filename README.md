# solver-rebalancer

Rebalancer for intent solver.

# Dev

Install

```
nvm use
npm i
```

Development

```
npm run start
```

Format

```
npm run format
```

# Configuration

Under `config/` folder:

1. `inventoryConfig.ts`: config for token, address, balance threshold and bridge option (currently support [Relay protocol](https://www.relay.link/bridge/base) and [Hyperlane's warp route](https://docs.hyperlane.xyz/docs/protocol/warp-routes/warp-routes-overview))
2. `warpRoute.ts`: config for warp route source token and it's corresponding routes.
   `collateralToken`: token that is natively on source chain
   `warpRouteToken`: token that warp on top of collateralToken and being bridged by Hyperlane.

## Supported Token & Network

### USDC

1. Arbitrum
2. Base
3. Artela
4. Gnosis
5. Optimism
6. Unichain
