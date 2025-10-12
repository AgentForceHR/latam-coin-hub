import { Router, Response } from 'express';
import Joi from 'joi';
import { supabase } from '../utils/supabase.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { calculateHealthFactor, generateMockTxHash, isLiquidatable, calculateLiquidationPenalty } from '../utils/helpers.js';
import { getMessage } from '../utils/translations.js';
import { logger } from '../utils/logger.js';
import { morphoService } from '../services/morpho.js';
import type { Language } from '../types/index.js';

const router = Router();

const depositSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

const borrowSchema = Joi.object({
  amount: Joi.number().positive().required(),
  collateral: Joi.number().positive().required(),
});

router.get('/', auth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data: vaults, error } = await supabase.from('vaults').select('*');

    if (error) throw error;

    res.json({ vaults });
  } catch (error) {
    logger.error('Get vaults error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/deposit', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error: validationError } = depositSchema.validate(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const { id: vaultId } = req.params;
    const { amount } = req.body;
    const userId = req.user!.id;
    const language = req.user!.language as Language;

    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .single();

    if (vaultError || !vault) {
      res.status(404).json({ error: getMessage(language, 'error', 'notFound') });
      return;
    }

    const { data: usdcBalance } = await supabase
      .from('stablecoins')
      .select('balance')
      .eq('user_id', userId)
      .eq('symbol', 'USD')
      .single();

    if (!usdcBalance || usdcBalance.balance < amount) {
      res.status(400).json({ error: getMessage(language, 'error', 'insufficientFunds') });
      return;
    }

    const { error: updateError } = await supabase
      .from('stablecoins')
      .update({ balance: usdcBalance.balance - amount })
      .eq('user_id', userId)
      .eq('symbol', 'USD');

    if (updateError) throw updateError;

    const yieldAmount = amount * 0.0001;
    await supabase.from('yields').insert([
      {
        user_id: userId,
        vault_id: vaultId,
        amount: yieldAmount,
      },
    ]);

    const txHash = generateMockTxHash();
    await supabase.from('transactions').insert([
      {
        user_id: userId,
        type: 'deposit',
        amount,
        tx_hash: txHash,
      },
    ]);

    logger.info('Deposit to vault:', { userId, vaultId, amount });

    res.json({
      message: getMessage(language, 'success', 'deposit'),
      tx_hash: txHash,
      vault: vault.pair,
      deposited_amount: amount,
      yield_accrued: yieldAmount,
    });
  } catch (error) {
    logger.error('Deposit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/borrow', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error: validationError } = borrowSchema.validate(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const { id: vaultId } = req.params;
    const { amount, collateral } = req.body;
    const userId = req.user!.id;
    const language = req.user!.language as Language;

    const collateralRatio = collateral / amount;
    if (collateralRatio < 1.5) {
      res.status(400).json({ error: getMessage(language, 'error', 'insufficientCollateral') });
      return;
    }

    const healthFactor = calculateHealthFactor(collateral, amount);

    const { data: position, error: insertError } = await supabase
      .from('positions')
      .insert([
        {
          user_id: userId,
          vault_id: vaultId,
          borrowed_amount: amount,
          collateral,
          health_factor: healthFactor,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    const { data: usdcBalance } = await supabase
      .from('stablecoins')
      .select('balance')
      .eq('user_id', userId)
      .eq('symbol', 'USD')
      .single();

    await supabase
      .from('stablecoins')
      .update({ balance: (usdcBalance?.balance || 0) + amount })
      .eq('user_id', userId)
      .eq('symbol', 'USD');

    const txHash = generateMockTxHash();
    await supabase.from('transactions').insert([
      {
        user_id: userId,
        type: 'borrow',
        amount,
        tx_hash: txHash,
      },
    ]);

    logger.info('Borrow position created:', { userId, vaultId, amount, healthFactor });

    res.json({
      message: getMessage(language, 'success', 'borrow'),
      position_id: position.id,
      borrowed_amount: amount,
      collateral,
      health_factor: healthFactor,
      tx_hash: txHash,
    });
  } catch (error) {
    logger.error('Borrow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/positions', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: positions, error } = await supabase
      .from('positions')
      .select('*, vaults(*)')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    const positionsWithStatus = positions?.map((position) => ({
      ...position,
      health_status:
        position.health_factor > 1.5 ? 'green' : position.health_factor > 1.0 ? 'yellow' : 'red',
      is_liquidatable: isLiquidatable(position.health_factor),
    }));

    res.json({ positions: positionsWithStatus });
  } catch (error) {
    logger.error('Get positions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/liquidate/:positionId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { positionId } = req.params;

    const { data: position, error: fetchError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', positionId)
      .single();

    if (fetchError || !position) {
      res.status(404).json({ error: 'Position not found' });
      return;
    }

    if (!isLiquidatable(position.health_factor)) {
      res.status(400).json({ error: 'Position is not liquidatable' });
      return;
    }

    const penalty = calculateLiquidationPenalty(position.borrowed_amount);

    await supabase
      .from('positions')
      .update({ status: 'liquidated' })
      .eq('id', positionId);

    await supabase.from('revenue').insert([
      {
        type: 'liquidation_penalty',
        amount: penalty,
      },
    ]);

    logger.info('Position liquidated:', { positionId, penalty });

    res.json({
      message: 'Position liquidated',
      position_id: positionId,
      penalty_amount: penalty,
    });
  } catch (error) {
    logger.error('Liquidation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/morpho/positions', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { vaultId } = req.query;

    const positions = await morphoService.getUserPositions(
      userId,
      vaultId as string | undefined
    );

    res.json({ positions });
  } catch (error) {
    logger.error('Get Morpho positions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/morpho/track-deposit', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { vaultId, amount, shares, txHash } = req.body;

    if (!vaultId || !amount || !txHash) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const position = await morphoService.trackDeposit(
      userId,
      vaultId,
      parseFloat(amount),
      parseFloat(shares || '0'),
      txHash
    );

    logger.info('Morpho deposit tracked:', { userId, vaultId, amount, txHash });

    res.json({
      message: 'Deposit tracked successfully',
      position
    });
  } catch (error) {
    logger.error('Track Morpho deposit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/morpho/track-withdrawal', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { vaultId, amount, shares, txHash } = req.body;

    if (!vaultId || !amount || !txHash) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const position = await morphoService.trackWithdrawal(
      userId,
      vaultId,
      parseFloat(amount),
      parseFloat(shares || '0'),
      txHash
    );

    logger.info('Morpho withdrawal tracked:', { userId, vaultId, amount, txHash });

    res.json({
      message: 'Withdrawal tracked successfully',
      position
    });
  } catch (error) {
    logger.error('Track Morpho withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
