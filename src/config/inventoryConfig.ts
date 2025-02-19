import { InventoryConfig } from '../interface/Token';

const inventoryConfig: InventoryConfig = {
  tokenConfig: {
    USDC: {
      // Base
      '8453': {
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        threshold: 200000000, // 200 USDC;
        bridgeOption: 'relay', // relay bridge"
      },
      // Arbitrum
      '42161': {
        address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        threshold: 200000000, // 200 USDC;
        bridgeOption: 'relay', // relay bridge"
      },
      // Unichain
      '130': {
        address: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
        threshold: 200000000, // 200 USDC;
        bridgeOption: 'relay', // relay bridge"
      },
      // Optimism
      '10': {
        address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        threshold: 200000000, // 200 USDC;
        bridgeOption: 'relay', // relay bridge"
      },
      // Gnosis
      '100': {
        address: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0', // USDC.e
        threshold: 200000000, // 200 USDC;
        bridgeOption: 'relay', // relay bridge"
      },
      // Artela
      '11820': {
        address: '0x8d9bd7e9ec3cd799a659ee650dff6c799309fa91', // USDC.a
        threshold: 200000000, // 200 USDC;
        bridgeOption: 'hyperlane', // Hyperlane warp route
      },
    },
  },
};

export { inventoryConfig };
