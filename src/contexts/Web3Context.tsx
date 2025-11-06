import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connectWallet, WalletState, BASE_SEPOLIA_CHAIN_ID } from '@/lib/web3';
import { toast } from 'sonner';

interface Web3ContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    provider: null,
    signer: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    setupListeners();

    return () => {
      removeListeners();
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);

      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        const signer = await provider.getSigner();

        setWalletState({
          address: accounts[0],
          chainId: Number(network.chainId),
          isConnected: true,
          provider,
          signer,
        });
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const setupListeners = () => {
    if (typeof window.ethereum === 'undefined') return;

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  };

  const removeListeners = () => {
    if (typeof window.ethereum === 'undefined') return;

    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setWalletState((prev) => ({
        ...prev,
        address: accounts[0],
      }));
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      const state = await connectWallet();
      setWalletState(state);
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWalletState({
      address: null,
      chainId: null,
      isConnected: false,
      provider: null,
      signer: null,
    });
    toast.info('Wallet disconnected');
  };

  return (
    <Web3Context.Provider
      value={{
        ...walletState,
        connect,
        disconnect,
        isConnecting,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
