import { ethers } from 'ethers';
import { supabase } from '../utils/supabase.js';

const MORPHO_ADAPTER_ADDRESS = process.env.MORPHO_ADAPTER_ADDRESS || '';
const BSC_RPC_URL = process.env.BSC_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';

const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);

const MORPHO_ADAPTER_ABI = [
  'function getUserBalance(address user, bytes32 vaultId) view returns (uint256)',
  'function getUserShares(address user, bytes32 vaultId) view returns (uint256)',
  'function depositToVault(bytes32 vaultId, uint256 amount)',
  'function withdrawFromVault(bytes32 vaultId, uint256 shares)',
  'function getVaultInfo(bytes32 vaultId) view returns (tuple(address vaultAddress, address asset, string name, bool active))',
  'event Deposited(address indexed user, bytes32 indexed vaultId, uint256 amount, uint256 shares)',
  'event Withdrawn(address indexed user, bytes32 indexed vaultId, uint256 amount, uint256 shares)'
];

let morphoAdapter: ethers.Contract | null = null;

if (MORPHO_ADAPTER_ADDRESS) {
  morphoAdapter = new ethers.Contract(
    MORPHO_ADAPTER_ADDRESS,
    MORPHO_ADAPTER_ABI,
    provider
  );
}

function vaultIdToBytes32(vaultId: string): string {
  return ethers.id(vaultId);
}

export const morphoService = {
  async getUserVaultBalance(userAddress: string, vaultId: string): Promise<string> {
    if (!morphoAdapter) {
      throw new Error('Morpho adapter not configured');
    }

    const vaultIdBytes = vaultIdToBytes32(vaultId);
    const balance = await morphoAdapter.getUserBalance(userAddress, vaultIdBytes);
    return ethers.formatUnits(balance, 18);
  },

  async getUserVaultShares(userAddress: string, vaultId: string): Promise<string> {
    if (!morphoAdapter) {
      throw new Error('Morpho adapter not configured');
    }

    const vaultIdBytes = vaultIdToBytes32(vaultId);
    const shares = await morphoAdapter.getUserShares(userAddress, vaultIdBytes);
    return ethers.formatUnits(shares, 18);
  },

  async getVaultInfo(vaultId: string) {
    if (!morphoAdapter) {
      throw new Error('Morpho adapter not configured');
    }

    const vaultIdBytes = vaultIdToBytes32(vaultId);
    const vaultInfo = await morphoAdapter.getVaultInfo(vaultIdBytes);
    return {
      vaultAddress: vaultInfo.vaultAddress,
      asset: vaultInfo.asset,
      name: vaultInfo.name,
      active: vaultInfo.active
    };
  },

  async trackDeposit(
    userId: string,
    vaultId: string,
    amount: number,
    shares: number,
    txHash: string
  ) {
    const { data, error } = await supabase
      .from('morpho_positions')
      .insert({
        user_id: userId,
        vault_id: vaultId,
        amount,
        shares,
        tx_hash: txHash,
        type: 'deposit'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to track deposit: ${error.message}`);
    }

    return data;
  },

  async trackWithdrawal(
    userId: string,
    vaultId: string,
    amount: number,
    shares: number,
    txHash: string
  ) {
    const { data, error } = await supabase
      .from('morpho_positions')
      .insert({
        user_id: userId,
        vault_id: vaultId,
        amount,
        shares,
        tx_hash: txHash,
        type: 'withdraw'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to track withdrawal: ${error.message}`);
    }

    return data;
  },

  async getUserPositions(userId: string, vaultId?: string) {
    let query = supabase
      .from('morpho_positions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (vaultId) {
      query = query.eq('vault_id', vaultId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get user positions: ${error.message}`);
    }

    return data;
  },

  async getTotalUserDeposits(userId: string, vaultId: string): Promise<number> {
    const { data, error } = await supabase
      .from('morpho_positions')
      .select('amount, type')
      .eq('user_id', userId)
      .eq('vault_id', vaultId);

    if (error) {
      throw new Error(`Failed to calculate deposits: ${error.message}`);
    }

    const total = data.reduce((sum: number, position: any) => {
      if (position.type === 'deposit') {
        return sum + parseFloat(position.amount);
      } else if (position.type === 'withdraw') {
        return sum - parseFloat(position.amount);
      }
      return sum;
    }, 0);

    return total;
  }
};
