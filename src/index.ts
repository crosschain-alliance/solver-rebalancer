import { getMultiBalance } from './watcher/balanceWatcher';
import { getMultiClient } from './watcher/multiProvider';
import { getRebalanceFromChain } from './utils/utils';
import { runRebalancer } from './rebalancer';
import "dotenv/config";
let isRunning = false;

async function main() {
  
  console.log("Rebalancer start...");

  const multiChainClient = getMultiClient();
  const solverTokenBalance = await getMultiBalance(multiChainClient);
  const rebalanceInput = getRebalanceFromChain(solverTokenBalance);

  try {
    await runRebalancer(rebalanceInput, multiChainClient);
  } catch (err) {
    console.log('Err ', err);
  }

  const intervalMs = parseInt(process.env.WATCH_INTERVAL || "10000", 10);
  console.log(`Wait ${intervalMs/1000}s...`);
  setTimeout(main, intervalMs);
}

main();
