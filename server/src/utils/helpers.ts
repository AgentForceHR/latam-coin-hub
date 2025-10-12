import crypto from 'crypto';

export const generateMockWalletAddress = (): string => {
  return '0x' + crypto.randomBytes(20).toString('hex');
};

export const generateMockTxHash = (): string => {
  return '0x' + crypto.randomBytes(32).toString('hex');
};

export const PEG_RATES = {
  USD: 1,
  BRL: 5.5,
  ARS: 950,
};

export const calculateHealthFactor = (collateral: number, borrowed: number, collateralRatio: number = 1.5): number => {
  if (borrowed === 0) return Infinity;
  return (collateral / borrowed) / collateralRatio;
};

export const calculateVePower = (amount: number, lockMonths: number): number => {
  const lockFactor = lockMonths / 12;
  return amount * (1 + lockFactor);
};

export const isLiquidatable = (healthFactor: number): boolean => {
  return healthFactor < 1.0;
};

export const calculateLiquidationPenalty = (amount: number): number => {
  return amount * 0.05;
};

export const calculateEarlyUnstakeFee = (amount: number): number => {
  return amount * 0.1;
};

export const calculateSwapFee = (amount: number, hasStake: boolean): number => {
  const feeRate = hasStake ? 0.001 : 0.002;
  return amount * feeRate;
};
