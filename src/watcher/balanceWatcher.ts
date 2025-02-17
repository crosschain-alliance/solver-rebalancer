import { inventoryConfig } from '../config/inventoryConfig';
// create the wallet client for chain
import {
  createWalletClient,
  http,
  Chain,
  publicActions,
  Log,
  erc20Abi,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as chains from 'viem/chains';
import 'dotenv/config';
import { getMultiClient } from './multiProvider';
import { ChainBalance, TokenChainBalance } from '../interface/Token';

// Function to fetch multi-chain USDC balances
export async function getMultiBalance(multiChainClient: any) {
  const privateKey: `0x${string}` =
    (process.env.SOLVER_PRIVATE_KEY as `0x${string}`) || '';
  const account = privateKeyToAccount(privateKey);
  const solverAddress = account.address;

  // Use Promise.all to handle asynchronous operations in map
  const solverBalances: ChainBalance[] | any = await Promise.all(
    multiChainClient.map(async (client: any) => {
      const chainIdStr = client.chain?.id.toString() || '1';

      // TODO: add dynamic token symbol check
      if (inventoryConfig.tokenConfig.USDC[chainIdStr]) {
        const usdcConfig = inventoryConfig.tokenConfig.USDC[chainIdStr];
        try {
          const balance = await client.readContract({
            address: usdcConfig.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [solverAddress],
          });

          return { chainId: chainIdStr, balance };
        } catch (error) {
          console.error(
            `Error fetching balance on chain ${chainIdStr}:`,
            error
          );
          return { chainId: chainIdStr, balance: null, error };
        }
      } else {
        console.log(`Chain ID ${chainIdStr} is not supported for USDC.`);
        return { chainId: chainIdStr, balance: null };
      }
    })
  );

  const solverTokenBalance: TokenChainBalance = {
    USDC: solverBalances,
  };

  return solverTokenBalance;
}
