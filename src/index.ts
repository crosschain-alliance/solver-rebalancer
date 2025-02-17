import { getMultiBalance } from './watcher/balanceWatcher';
import { getMultiClient } from './watcher/multiProvider';
import { getRebalanceFromChain } from './utils/utils';
import { runRebalancer } from './rebalancer';

async function main() {
// TODO: interval
  const multiChainClient = getMultiClient(); 
  const solverTokenBalance = await getMultiBalance(multiChainClient);
  const rebalanceInput = getRebalanceFromChain(solverTokenBalance);
  try {
    await runRebalancer(rebalanceInput, multiChainClient);
  } catch (err) {
    console.log('Err ', err);
  }
}

main();
