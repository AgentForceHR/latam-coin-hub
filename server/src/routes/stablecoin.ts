import { Router, Response } from 'express';
import Joi from 'joi';
import { supabase } from '../utils/supabase.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { PEG_RATES, generateMockTxHash } from '../utils/helpers.js';
import { getMessage } from '../utils/translations.js';
import { logger } from '../utils/logger.js';
import type { Language } from '../types/index.js';

const router = Router();

const mintSchema = Joi.object({
  amount: Joi.number().positive().required(),
  symbol: Joi.string().valid('USD', 'BRL', 'ARS').required(),
  collateral_amount: Joi.number().positive().required(),
});

const redeemSchema = Joi.object({
  amount: Joi.number().positive().required(),
  symbol: Joi.string().valid('USD', 'BRL', 'ARS').required(),
});

router.post('/mint', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error: validationError } = mintSchema.validate(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const { amount, symbol, collateral_amount } = req.body;
    const userId = req.user!.id;
    const language = req.user!.language as Language;

    const pegRate = PEG_RATES[symbol as keyof typeof PEG_RATES];
    const requiredCollateral = amount * pegRate * 1.5;

    if (collateral_amount < requiredCollateral) {
      res.status(400).json({ error: getMessage(language, 'error', 'insufficientCollateral') });
      return;
    }

    const { data: stablecoin, error: fetchError } = await supabase
      .from('stablecoins')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const mintedAmount = amount * pegRate;
    const newBalance = (stablecoin?.balance || 0) + mintedAmount;

    if (stablecoin) {
      const { error: updateError } = await supabase
        .from('stablecoins')
        .update({ balance: newBalance })
        .eq('id', stablecoin.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from('stablecoins').insert([
        {
          user_id: userId,
          symbol,
          balance: newBalance,
          pegged_to: symbol,
        },
      ]);

      if (insertError) throw insertError;
    }

    const txHash = generateMockTxHash();
    await supabase.from('transactions').insert([
      {
        user_id: userId,
        type: 'mint',
        amount: mintedAmount,
        symbol,
        tx_hash: txHash,
      },
    ]);

    logger.info('Stablecoin minted:', { userId, symbol, amount: mintedAmount });

    res.json({
      message: getMessage(language, 'success', 'mint'),
      tx_hash: txHash,
      new_balance: newBalance,
      symbol,
    });
  } catch (error) {
    logger.error('Mint error:', error);
    res.status(500).json({ error: getMessage(req.user!.language as Language, 'error', 'serverError') });
  }
});

router.post('/redeem', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error: validationError } = redeemSchema.validate(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const { amount, symbol } = req.body;
    const userId = req.user!.id;
    const language = req.user!.language as Language;

    const { data: stablecoin, error: fetchError } = await supabase
      .from('stablecoins')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single();

    if (fetchError || !stablecoin) {
      res.status(404).json({ error: getMessage(language, 'error', 'notFound') });
      return;
    }

    if (stablecoin.balance < amount) {
      res.status(400).json({ error: getMessage(language, 'error', 'insufficientFunds') });
      return;
    }

    const newBalance = stablecoin.balance - amount;

    const { error: updateError } = await supabase
      .from('stablecoins')
      .update({ balance: newBalance })
      .eq('id', stablecoin.id);

    if (updateError) throw updateError;

    const txHash = generateMockTxHash();
    await supabase.from('transactions').insert([
      {
        user_id: userId,
        type: 'redeem',
        amount,
        symbol,
        tx_hash: txHash,
      },
    ]);

    logger.info('Stablecoin redeemed:', { userId, symbol, amount });

    res.json({
      message: getMessage(language, 'success', 'redeem'),
      tx_hash: txHash,
      new_balance: newBalance,
      symbol,
    });
  } catch (error) {
    logger.error('Redeem error:', error);
    res.status(500).json({ error: getMessage(req.user!.language as Language, 'error', 'serverError') });
  }
});

export default router;
