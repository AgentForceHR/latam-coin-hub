export interface User {
  id: string;
  email: string;
  wallet_address?: string;
  language: 'en' | 'es' | 'pt';
  created_at: string;
}

export interface Stablecoin {
  id: string;
  user_id: string;
  symbol: 'USD' | 'BRL' | 'ARS';
  balance: number;
  pegged_to: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'mint' | 'redeem' | 'deposit' | 'withdraw' | 'borrow' | 'repay' | 'stake' | 'unstake';
  amount: number;
  symbol?: string;
  tx_hash: string;
  created_at: string;
}

export interface Vault {
  id: string;
  pair: string;
  apy: number;
  tvl: number;
  risk_level: 'low' | 'medium' | 'high';
  type: 'earn' | 'borrow';
}

export interface Position {
  id: string;
  user_id: string;
  vault_id: string;
  borrowed_amount: number;
  collateral: number;
  health_factor: number;
  created_at: string;
}

export interface Yield {
  id: string;
  user_id: string;
  vault_id: string;
  amount: number;
  accrued_at: string;
}

export interface Stake {
  id: string;
  user_id: string;
  amount: number;
  locked_until: string;
  ve_power: number;
  created_at: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  votes_for: number;
  votes_against: number;
  deadline: string;
  status: 'active' | 'passed' | 'rejected';
  created_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  proposal_id: string;
  vote: 'for' | 'against';
  weight: number;
  created_at: string;
}

export interface Revenue {
  id: string;
  type: 'swap_fee' | 'borrow_interest' | 'liquidation_penalty' | 'early_unstake_fee';
  amount: number;
  created_at: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export type Language = 'en' | 'es' | 'pt';

export interface TranslationMessages {
  success: {
    mint: string;
    redeem: string;
    deposit: string;
    withdraw: string;
    borrow: string;
    repay: string;
    stake: string;
    unstake: string;
    vote: string;
  };
  error: {
    invalidCredentials: string;
    userExists: string;
    insufficientFunds: string;
    insufficientCollateral: string;
    invalidAmount: string;
    invalidSymbol: string;
    unauthorized: string;
    notFound: string;
    serverError: string;
    lockNotExpired: string;
    minimumStakeRequired: string;
  };
}
