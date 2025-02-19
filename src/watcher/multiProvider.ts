import { createClient, createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as chains from 'viem/chains';
import 'dotenv/config';
import { type Chain } from 'viem/chains';

function getCustomClient(chainId: string, account: any) {
  switch (chainId) {
    case '11820':
      return createClient({
        account,
        chain: {
          id: parseInt(chainId, 10),
          name: 'Artela',
          nativeCurrency: {
            name: 'ART',
            symbol: 'ART',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: [process.env[`RPC_URL_${chainId}`] || ''],
            },
          },
        },
        transport: http(process.env[`RPC_URL_${chainId}`] || ''),
      }).extend(publicActions);
  }
}

export function getMultiClient() {
  const privateKey: `0x${string}` =
    (process.env.SOLVER_PRIVATE_KEY as `0x${string}`) || '';
  const account = privateKeyToAccount(privateKey);
  const chainIDs: string = process.env.CHAIN_IDS || '';

  let supportedChainIds: string[] = chainIDs
    .split(',')
    .map((item) => item.trim());

  const multiChainClient = supportedChainIds.map((chainId) => {
    const chain: Chain | undefined = Object.values(chains).find(
      ({ id }) => id.toString() === chainId
    );
    if (chain == undefined) {
      return getCustomClient(chainId, account);
    }
    return createWalletClient({
      account,
      chain,
      transport: http(process.env[`RPC_URL_${chainId}`] || ''),
    }).extend(publicActions);
  });

  return multiChainClient;
}
