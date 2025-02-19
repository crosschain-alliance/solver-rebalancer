import { erc20Abi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';
import { ChainBalance, TokenChainBalance } from '../interface/Token';
import { inventoryConfig } from '../config/inventoryConfig';
import logger from '../logger';

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
      if (inventoryConfig.tokenConfig[process.env.TOKEN || "USDC"][chainIdStr]) {
        const tokenConfig = inventoryConfig.tokenConfig[process.env.TOKEN || "USDC"][chainIdStr];
        try {
          const balance = await client.readContract({
            address: tokenConfig.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [solverAddress],
          });

          logger.info(`${process.env.TOKEN} balance on chainId ${chainIdStr} : ${balance} `)

          return { chainId: chainIdStr, balance };
        } catch (error) {
          console.error(
            `Error fetching balance on chain ${chainIdStr}:`,
            error
          );
          return { chainId: chainIdStr, balance: null, error };
        }
      } else {
        console.log(`Chain ID ${chainIdStr} is not supported for ${process.env.TOKEN}.`);
        return { chainId: chainIdStr, balance: null };
      }
    })
  );

  const solverTokenBalance: TokenChainBalance = {
    USDC: solverBalances,
  };


  return solverTokenBalance;
}
