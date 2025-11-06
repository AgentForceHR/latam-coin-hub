import { Language, TranslationMessages } from '../types/index.js';

export const translations: Record<Language, TranslationMessages> = {
  en: {
    success: {
      mint: 'Stablecoin minted successfully',
      redeem: 'Stablecoin redeemed successfully',
      deposit: 'Deposit successful',
      withdraw: 'Withdrawal successful',
      borrow: 'Borrow position created successfully',
      repay: 'Repayment successful',
      stake: 'Tokens staked successfully',
      unstake: 'Tokens unstaked successfully',
      vote: 'Vote recorded successfully',
    },
    error: {
      invalidCredentials: 'Invalid email or password',
      userExists: 'User already exists',
      insufficientFunds: 'Insufficient funds',
      insufficientCollateral: 'Insufficient collateral (minimum 150% required)',
      invalidAmount: 'Invalid amount',
      invalidSymbol: 'Invalid currency symbol',
      unauthorized: 'Unauthorized access',
      notFound: 'Resource not found',
      serverError: 'Internal server error',
      lockNotExpired: 'Stake lock period has not expired',
      minimumStakeRequired: 'Minimum 100 EST tokens required to vote',
    },
  },
  es: {
    success: {
      mint: 'Stablecoin acuñada exitosamente',
      redeem: 'Stablecoin redimida exitosamente',
      deposit: 'Depósito exitoso',
      withdraw: 'Retiro exitoso',
      borrow: 'Posición de préstamo creada exitosamente',
      repay: 'Pago exitoso',
      stake: 'Tokens apostados exitosamente',
      unstake: 'Tokens desapostados exitosamente',
      vote: 'Voto registrado exitosamente',
    },
    error: {
      invalidCredentials: 'Email o contraseña inválidos',
      userExists: 'El usuario ya existe',
      insufficientFunds: 'Fondos insuficientes',
      insufficientCollateral: 'Colateral insuficiente (se requiere mínimo 150%)',
      invalidAmount: 'Monto inválido',
      invalidSymbol: 'Símbolo de moneda inválido',
      unauthorized: 'Acceso no autorizado',
      notFound: 'Recurso no encontrado',
      serverError: 'Error interno del servidor',
      lockNotExpired: 'El período de bloqueo del stake no ha expirado',
      minimumStakeRequired: 'Se requieren mínimo 100 tokens EST para votar',
    },
  },
  pt: {
    success: {
      mint: 'Stablecoin cunhada com sucesso',
      redeem: 'Stablecoin resgatada com sucesso',
      deposit: 'Depósito bem-sucedido',
      withdraw: 'Retirada bem-sucedida',
      borrow: 'Posição de empréstimo criada com sucesso',
      repay: 'Pagamento bem-sucedido',
      stake: 'Tokens apostados com sucesso',
      unstake: 'Tokens desapostados com sucesso',
      vote: 'Voto registrado com sucesso',
    },
    error: {
      invalidCredentials: 'E-mail ou senha inválidos',
      userExists: 'Usuário já existe',
      insufficientFunds: 'Fundos insuficientes',
      insufficientCollateral: 'Garantia insuficiente (mínimo de 150% necessário)',
      invalidAmount: 'Quantidade inválida',
      invalidSymbol: 'Símbolo de moeda inválido',
      unauthorized: 'Acesso não autorizado',
      notFound: 'Recurso não encontrado',
      serverError: 'Erro interno do servidor',
      lockNotExpired: 'O período de bloqueio do stake não expirou',
      minimumStakeRequired: 'Mínimo de 100 tokens EST necessários para votar',
    },
  },
};

export const getMessage = (language: Language, category: keyof TranslationMessages, key: string): string => {
  const langMessages = translations[language][category] as Record<string, string>;
  const enMessages = translations.en[category] as Record<string, string>;
  return langMessages[key] || enMessages[key] || key;
};
