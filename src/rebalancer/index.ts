import { rebalanceThroughRelay } from '../adapter/relay';
import { rebalanceThroughHyperlane } from '../adapter/hyperlane';
import { RebalanceOption } from '../interface/RebalanceOption';
import { filterBridgeOption } from '../utils/utils';

export async function runRebalancer(
  rebalanceInput: RebalanceOption[],
  multiChainClient: any
) {
  try {
    const relayArray = filterBridgeOption(rebalanceInput, 'relay');
    const hyperlaneArray = filterBridgeOption(rebalanceInput, 'hyperlane');

    if (relayArray.length > 0) {
      await rebalanceThroughRelay(relayArray, multiChainClient);
    }
    if (hyperlaneArray.length > 0) {
      await rebalanceThroughHyperlane(hyperlaneArray, multiChainClient);
    }
  } catch (err) {
    console.log('Err ', err);
  }
}
