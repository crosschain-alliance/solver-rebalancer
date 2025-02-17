export type TokenConfig = {
  address: `0x${string}`;
  threshold: number;
  bridgeOption: string;
};

export type ChainTokenConfig = {
  [chainId: string]: TokenConfig;
};

export type ChainBalance = {
  chainId: string;
  balance: bigint | 0n;
};

export type TokenChainBalance = {
  [token: string]: ChainBalance[];
};

export interface InventoryConfig {
  tokenConfig: {
    [tokenSymbol: string]: ChainTokenConfig;
  };
}
