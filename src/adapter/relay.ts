import {
  createClient,
  getClient,
  convertViemChainToRelayChain,
  adaptViemWallet,
} from '@reservoir0x/relay-sdk';
import * as viemChains from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';
import { type Chain, PrivateKeyAccount } from 'viem';
import { RebalanceOption } from '../interface/RebalanceOption';
import logger from '../logger';

function convertRelayChainToViemChain(chainName: string): Chain {
  const chain = Object.values(viemChains).find(
    ({ name }) => name === (chainName as string)
  );
  if (!(chain && typeof chain === 'object' && 'name' in chain)) {
    throw new Error(`Chain with name "${chainName}" not found.`);
  }
  return chain;
}

async function rebalance(
  rebalanceInput: RebalanceOption[],
  viemtClients: any,
  account: PrivateKeyAccount
) {
  for (const input of rebalanceInput) {
    try {
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: `{"user": "${account.address}","recipient":"${account.address}","originChainId":${
          input.fromChainId
        },"destinationChainId":${input.toChainId},"originCurrency":"${
          input.fromTokenAddress
        }","destinationCurrency": "${
          input.toTokenAddress
        }","amount": "${input.deficit.toString()}","tradeType":"EXACT_INPUT", "refundTo":"${account.address}"}`,
      };

      const response = await fetch('https://api.relay.link/quote', options);

      if (!response.ok) {
        throw new Error(`Failed to get quote: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (process.env.MODE == 'PROD') {
        await getClient().actions.execute({
          quote: responseData,
          wallet: adaptViemWallet(
            viemtClients.find(
              (client: any) => client.chain.id.toString() === input.fromChainId
            )
          ),
          onProgress: ({ currentStep, txHashes }) => {
            try {
              logger.info(
                `Step: ${currentStep?.action}, TxHashes: ${txHashes}`
              );
            } catch (err: any) {
              throw new Error (`Progress callback error: ${err.message}`);
            }
          },
        });
      } else {
        logger.info('Relay: Not in production mode, skipping rebalancing...');
      }
    } catch (err) {
      throw new Error(`Rebalance error in Relay ${err}`);
    }
  }
}

function setupRelay( multiClient: any) {
  const relayChains = multiClient
    .filter((client: any) => client !== undefined)
    .map((client: any) => {
      try {
        return convertViemChainToRelayChain(
          convertRelayChainToViemChain(client.chain.name as string)
        );
      } catch (error) {
        logger.info(`Skipping chain "${client.chain.name}": ${error}`);
        return undefined;
      }
    })
    .filter((chain: any) => chain !== undefined);

  // Initialize Relay SDK client
  createClient({
    baseApiUrl: 'https://api.reservoir.tools', // MAINNET_RELAY_API
    chains: relayChains,
  });
}

export async function rebalanceThroughRelay(
  rebalanceInput: RebalanceOption[],
  multiChainClient: any
) {
  const account: PrivateKeyAccount = privateKeyToAccount(
    process.env.SOLVER_PRIVATE_KEY as `0x${string}`
  );

  try {
    setupRelay(multiChainClient);
    await rebalance(rebalanceInput, multiChainClient, account);
  } catch (err) {
    throw new Error(`Relay: Error in Relay rebalancing  ${err}`);
  }
}
