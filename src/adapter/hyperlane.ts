import { parseAbiItem, PrivateKeyAccount, pad } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import logger from '../logger';
import warpRouteConfig from '../config/warpRoute';
import { RebalanceOption } from '../interface/RebalanceOption';

export async function rebalanceThroughHyperlane(
  rebalanceInput: RebalanceOption[],
  multiChainClient: any
) {
  const account: PrivateKeyAccount = privateKeyToAccount(
    process.env.SOLVER_PRIVATE_KEY as `0x${string}`
  );
  // if rebalanceOption is through hyperlane

  // check warpRoute config
  rebalanceInput.forEach(async (route) => {
    const sourceClient = multiChainClient.find(
      (client: any) => client.chain.id.toString() === route.fromChainId
    );

    const gasFee = await sourceClient.readContract({
      // address is warpRoute token, which is not route.fromAddress (this is the collateralToken)
      address: warpRouteConfig.USDC.source.warpRouteToken,
      abi: [
        parseAbiItem(
          'function quoteGasPayment(uint32 destinationDomain) external returns(uint256)'
        ),
      ],
      functionName: 'quoteGasPayment',
      args: [route.toChainId],
    });

    if (process.env.MODE == 'PROD') {
      const { request: approveRequest } = await sourceClient.simulateContract({
        address: warpRouteConfig.USDC.source.collateralToken,
        abi: [
          parseAbiItem(
            'function approve(address spender, uint256 value) external'
          ),
        ],
        functionName: 'approve',
        account,
        args: [warpRouteConfig.USDC.source.warpRouteToken, route.deficit],
      });

      const approveRequestTx = await sourceClient.writeContract({
        approveRequest,
      });
      logger.info('Hyperlane: Approve tx ', approveRequestTx);

      // Example: https://www.tdly.co/shared/simulation/ba86c280-0029-4184-bd9c-84618c0ed8e5
      const { request: transferRemoteRequest } =
        await sourceClient.simulateContract({
          address: warpRouteConfig.USDC.source.warpRouteToken,
          abi: [
            parseAbiItem(
              'function transferRemote(uint32 _destination,bytes32 _recipient,uint256 _amountOrId) external payable returns (bytes32 messageId)'
            ),
          ],
          functionName: 'transferRemote',
          account,
          args: [route.toChainId, pad(account.address), route.deficit],
          value: gasFee,
        });
      const transferRemoteTx = await sourceClient.writeContract({
        transferRemoteRequest,
      });

      logger.info('Hyperlane: TransferRemote tx ', transferRemoteTx);
    } else {
      logger.info('Hyperlane: Not in production mode, skipping rebalancing...');
    }
  });
}
