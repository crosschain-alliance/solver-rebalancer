import 'dotenv/config';
import { privateKeyToAddress } from 'viem/accounts';
import logger from './logger';
import { getMultiBalance } from './watcher/balanceWatcher';
import { getMultiClient } from './watcher/multiProvider';
import { getRebalanceFromChain } from './utils/utils';
import { runRebalancer } from './rebalancer';

const intervalMs = parseInt(process.env.WATCH_INTERVAL || '10000', 10);
logger.info(`Polling interval: ${intervalMs / 1000}s...`);
logger.info(
  `Staring rebalancer for solver ${privateKeyToAddress((process.env.SOLVER_PRIVATE_KEY as `0x${string}`) || '')}`
);

logger.info(`Supporting on chain: ${process.env.CHAIN_IDS}`);
logger.info(`Supporting token: ${process.env.TOKEN}`);
const multiChainClient = getMultiClient();

async function main() {
  const solverTokenBalance = await getMultiBalance(multiChainClient);
  const rebalanceInput = getRebalanceFromChain(solverTokenBalance);

  try {
    await runRebalancer(rebalanceInput, multiChainClient);
  } catch (err) {
    console.log('Err ', err);
  }

  setTimeout(main, intervalMs);
}

main();
