export interface ContractAddresses {
  chainId: number;
  estableToken: string;
  usdStablecoin: string;
  brlStablecoin: string;
  arsStablecoin: string;
  mxnStablecoin: string;
  copStablecoin: string;
  staking: string;
  morphoAdapter: string;
  rpcUrl: string;
}

export const SEPOLIA_CONTRACTS: ContractAddresses = {
  chainId: 11155111,
  estableToken: process.env.VITE_ESTABLE_TOKEN_ADDRESS || '',
  usdStablecoin: process.env.VITE_USD_STABLECOIN_ADDRESS || '',
  brlStablecoin: process.env.VITE_BRL_STABLECOIN_ADDRESS || '',
  arsStablecoin: process.env.VITE_ARS_STABLECOIN_ADDRESS || '',
  mxnStablecoin: process.env.VITE_MXN_STABLECOIN_ADDRESS || '',
  copStablecoin: process.env.VITE_COP_STABLECOIN_ADDRESS || '',
  staking: process.env.VITE_STAKING_ADDRESS || '',
  morphoAdapter: process.env.VITE_MORPHO_ADAPTER_ADDRESS || '',
  rpcUrl: process.env.VITE_RPC_URL || 'https://rpc.sepolia.org'
};

export const getContracts = (): ContractAddresses => {
  const chainId = process.env.VITE_CHAIN_ID
    ? parseInt(process.env.VITE_CHAIN_ID)
    : 11155111;

  if (chainId === 11155111) {
    return SEPOLIA_CONTRACTS;
  }

  return SEPOLIA_CONTRACTS;
};

export const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 11155111:
      return 'Sepolia';
    case 1:
      return 'Ethereum';
    case 97:
      return 'BSC Testnet';
    case 56:
      return 'BSC Mainnet';
    default:
      return 'Unknown';
  }
};

export const SUPPORTED_CHAINS = [11155111];

export const isChainSupported = (chainId: number): boolean => {
  return SUPPORTED_CHAINS.includes(chainId);
};
