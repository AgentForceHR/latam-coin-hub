import { ethers } from 'ethers';

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

export const BASE_SEPOLIA_NETWORK = {
  chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [BASE_SEPOLIA_RPC],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}

export async function connectWallet(): Promise<WalletState> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install MetaMask or Rabby wallet');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];

    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
      await switchToBaseSepolia();
    }

    const signer = await provider.getSigner();

    return {
      address,
      chainId: BASE_SEPOLIA_CHAIN_ID,
      isConnected: true,
      provider,
      signer,
    };
  } catch (error: any) {
    console.error('Wallet connection error:', error);
    throw new Error(error.message || 'Failed to connect wallet');
  }
}

export async function switchToBaseSepolia(): Promise<void> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('No wallet detected');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_SEPOLIA_NETWORK.chainId }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BASE_SEPOLIA_NETWORK],
        });
      } catch (addError) {
        throw new Error('Failed to add Base Sepolia network');
      }
    } else {
      throw new Error('Failed to switch to Base Sepolia');
    }
  }
}

export async function getBalance(provider: ethers.BrowserProvider, address: string): Promise<string> {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

export async function disconnectWallet(): Promise<void> {
  return;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
