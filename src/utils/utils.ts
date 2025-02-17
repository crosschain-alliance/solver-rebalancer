// check if the balance of solver fall below balance
import { inventoryConfig } from '../config/inventoryConfig';
import { TokenChainBalance } from '../interface/Token';
import { RebalanceOption } from '../interface/RebalanceOption';
import warpRouteConfig from '../config/warpRoute';
import { zeroAddress } from 'viem';

// Calculate the chain(s) that is below threshold
export function getDeficitChains(
  solverTokenBalance: TokenChainBalance
): RebalanceOption[] {
  const rebalanceConfig: RebalanceOption[] = solverTokenBalance.USDC.map(
    ({ chainId, balance }) => {
      console.log('Chain Id ', chainId);
      if (inventoryConfig.tokenConfig.USDC[chainId]) {
        console.log('Checking threshold is below for chain id ', chainId);
        if (
          balance < BigInt(inventoryConfig.tokenConfig.USDC[chainId].threshold)
        ) {
          console.log(
            'Deficit found ',
            BigInt(inventoryConfig.tokenConfig.USDC[chainId].threshold) -
              balance
          );
          return {
            fromTokenAddress: zeroAddress,
            toTokenAddress: inventoryConfig.tokenConfig.USDC[chainId].address,
            deficit:
              BigInt(inventoryConfig.tokenConfig.USDC[chainId].threshold) -
              balance,
            bridgeOption:
              inventoryConfig.tokenConfig.USDC[chainId].bridgeOption,
            fromChainId: '0', // default to 0, but subject to change in getRebalanceFromCHain
            toChainId: chainId,
          };
        }
      }
      return null;
    }
  ).filter((item) => item !== null);

  return rebalanceConfig;
}

// Calculate which chain to bridge from, based on the current balance of each chain
// For normal case, bridge from the highest available balance chain
// For warp route, has to bridge from the source chain
export function getRebalanceFromChain(solverTokenBalance: TokenChainBalance) {
  const rebalanceConfig: RebalanceOption[] =
    getDeficitChains(solverTokenBalance);

  // check the surplus chain with highest balance
  solverTokenBalance.USDC.sort((a, b) => {
    if (a.balance > b.balance) return -1;
    if (a.balance < b.balance) return 1;
    return 0;
  });

  console.log('Sorted token balance ', solverTokenBalance);

  // simulate if the balance of the chain is still enough after deficit
  // the index 0 in solverTokenBalance has the highest balance, then check if balance - deficit of rebalanceConfig[0] has still > threshold from  inventoryConfig.tokenConfig.USDC[chainId].threshold
  // update the solverTokenBalance.USDC.balance of index 0 to the original balance - deficit
  // update that chainId in rebalanceConfig[0].fromChainId to solverTokenBalance.USDC.chainId
  // if yes, continue the index 0 solverTokenBalance to the next rebalanceConfig[1] and go through the  element of rebalanceConfig until it is done

  // Iterate through each deficit chain and try to cover the deficit from the highest surplus chain
  for (let i = 0; i < rebalanceConfig.length; i++) {
    const deficitOption = rebalanceConfig[i];
    let surplusChain = solverTokenBalance.USDC[0]; // Highest surplus chain

    if (deficitOption.bridgeOption == 'hyperlane') {
      const router = warpRouteConfig.USDC.routers.find(
        (router: any) => router.chainId === deficitOption.toChainId
      );
      const sourceRouteWithBalanace = solverTokenBalance.USDC.find(
        (chainTokenBalance) =>
          chainTokenBalance.chainId == warpRouteConfig.USDC.source.chainId
      );

      const hasMatchingRoute =
        router != undefined && sourceRouteWithBalanace != undefined;
      if (hasMatchingRoute) {
        surplusChain = sourceRouteWithBalanace;
      } else {
        new Error('No warp route path found, please check configuration');
      }
    }

    // Check if the surplus chain can cover the deficit without falling below its threshold
    const surplusThreshold = BigInt(
      inventoryConfig.tokenConfig.USDC[surplusChain.chainId].threshold
    );
    const remainingBalance = surplusChain.balance - deficitOption.deficit;

    if (remainingBalance >= surplusThreshold) {
      // Update the surplus chain's balance
      surplusChain.balance = remainingBalance;

      // Update the fromChainId in the rebalance option
      deficitOption.fromChainId = surplusChain.chainId;
      deficitOption.fromTokenAddress =
        inventoryConfig.tokenConfig.USDC[surplusChain.chainId].address;

      console.log(
        `Deficit covered from chain ${surplusChain.chainId} to chain ${deficitOption.toChainId}`
      );
    } else {
      console.log(
        `Cannot cover deficit for chain ${deficitOption.toChainId} from chain ${surplusChain.chainId}`
      );
      // If the surplus chain cannot cover the deficit, we might need to look for another chain or handle it differently
    }
  }

  return rebalanceConfig;
}

export function filterBridgeOption(
  rebalanceInput: RebalanceOption[],
  bridgeOption: string
): RebalanceOption[] {
  const filteredRebalanceInput = rebalanceInput.filter((input) => {
    if (input.bridgeOption === bridgeOption) {
      return true;
    }
    return false;
  });

  return filteredRebalanceInput;
}
