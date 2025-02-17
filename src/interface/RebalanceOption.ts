export type RebalanceOption = {
  fromTokenAddress: `0x${string}`;
  toTokenAddress: `0x${string}`;
  deficit: bigint;
  bridgeOption: string;
  fromChainId: string;
  toChainId: string;
};
