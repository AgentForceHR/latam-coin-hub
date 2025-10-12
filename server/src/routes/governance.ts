import { Router, Response } from 'express';
import Joi from 'joi';
import { supabase } from '../utils/supabase.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { calculateVePower, calculateEarlyUnstakeFee, generateMockTxHash } from '../utils/helpers.js';
import { getMessage } from '../utils/translations.js';
import { logger } from '../utils/logger.js';
import type { Language } from '../types/index.js';

const router = Router();

const stakeSchema = Joi.object({
  amount: Joi.number().positive().required(),
  lock_months: Joi.number().integer().min(3).max(12).required(),
});

const voteSchema = Joi.object({
  vote: Joi.string().valid('for', 'against').required(),
});

router.post('/stake', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error: validationError } = stakeSchema.validate(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const { amount, lock_months } = req.body;
    const userId = req.user!.id;
    const language = req.user!.language as Language;

    const vePower = calculateVePower(amount, lock_months);
    const lockedUntil = new Date();
    lockedUntil.setMonth(lockedUntil.getMonth() + lock_months);

    const { data: stake, error: insertError } = await supabase
      .from('stakes')
      .insert([
        {
          user_id: userId,
          amount,
          locked_until: lockedUntil.toISOString(),
          ve_power: vePower,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    const txHash = generateMockTxHash();
    await supabase.from('transactions').insert([
      {
        user_id: userId,
        type: 'stake',
        amount,
        tx_hash: txHash,
      },
    ]);

    logger.info('Tokens staked:', { userId, amount, lockMonths: lock_months, vePower });

    res.json({
      message: getMessage(language, 'success', 'stake'),
      stake_id: stake.id,
      amount,
      ve_power: vePower,
      locked_until: lockedUntil.toISOString(),
      tx_hash: txHash,
    });
  } catch (error) {
    logger.error('Stake error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/unstake/:stakeId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stakeId } = req.params;
    const userId = req.user!.id;
    const language = req.user!.language as Language;

    const { data: stake, error: fetchError } = await supabase
      .from('stakes')
      .select('*')
      .eq('id', stakeId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !stake) {
      res.status(404).json({ error: getMessage(language, 'error', 'notFound') });
      return;
    }

    const now = new Date();
    const lockedUntil = new Date(stake.locked_until);
    const isEarly = now < lockedUntil;

    let returnAmount = stake.amount;
    let fee = 0;

    if (isEarly) {
      fee = calculateEarlyUnstakeFee(stake.amount);
      returnAmount = stake.amount - fee;

      await supabase.from('revenue').insert([
        {
          type: 'early_unstake_fee',
          amount: fee,
        },
      ]);
    }

    const { error: deleteError } = await supabase.from('stakes').delete().eq('id', stakeId);

    if (deleteError) throw deleteError;

    const txHash = generateMockTxHash();
    await supabase.from('transactions').insert([
      {
        user_id: userId,
        type: 'unstake',
        amount: returnAmount,
        tx_hash: txHash,
      },
    ]);

    logger.info('Tokens unstaked:', { userId, stakeId, isEarly, fee });

    res.json({
      message: getMessage(language, 'success', 'unstake'),
      returned_amount: returnAmount,
      early_unstake_fee: fee,
      tx_hash: txHash,
    });
  } catch (error) {
    logger.error('Unstake error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/proposals', auth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ proposals });
  } catch (error) {
    logger.error('Get proposals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/proposals/:proposalId/vote', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error: validationError } = voteSchema.validate(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const { proposalId } = req.params;
    const { vote } = req.body;
    const userId = req.user!.id;
    const language = req.user!.language as Language;

    const { data: stakes } = await supabase
      .from('stakes')
      .select('ve_power')
      .eq('user_id', userId);

    const totalVePower = stakes?.reduce((sum, stake) => sum + stake.ve_power, 0) || 0;

    if (totalVePower < 100) {
      res.status(400).json({ error: getMessage(language, 'error', 'minimumStakeRequired') });
      return;
    }

    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('proposal_id', proposalId)
      .single();

    if (existingVote) {
      res.status(400).json({ error: 'You have already voted on this proposal' });
      return;
    }

    await supabase.from('votes').insert([
      {
        user_id: userId,
        proposal_id: proposalId,
        vote,
        weight: totalVePower,
      },
    ]);

    const field = vote === 'for' ? 'votes_for' : 'votes_against';
    const { data: proposal } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (proposal) {
      const currentVotes = vote === 'for' ? proposal.votes_for : proposal.votes_against;
      await supabase
        .from('proposals')
        .update({ [field]: currentVotes + Math.floor(totalVePower) })
        .eq('id', proposalId);
    }

    logger.info('Vote recorded:', { userId, proposalId, vote, weight: totalVePower });

    res.json({
      message: getMessage(language, 'success', 'vote'),
      proposal_id: proposalId,
      vote,
      weight: totalVePower,
    });
  } catch (error) {
    logger.error('Vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/rewards/claim', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: stakes } = await supabase
      .from('stakes')
      .select('amount, locked_until, created_at')
      .eq('user_id', userId);

    if (!stakes || stakes.length === 0) {
      res.json({ total_rewards: 0, stakes: [] });
      return;
    }

    const rewards = stakes.map((stake) => {
      const createdAt = new Date(stake.created_at);
      const lockedUntil = new Date(stake.locked_until);
      const daysStaked = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const lockDuration = Math.floor((lockedUntil.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      let apy = 0.05;
      if (lockDuration >= 180) apy = 0.15;
      else if (lockDuration >= 90) apy = 0.1;

      const reward = (stake.amount * apy * daysStaked) / 365;

      return {
        amount: stake.amount,
        reward,
        apy: apy * 100,
      };
    });

    const totalRewards = rewards.reduce((sum, r) => sum + r.reward, 0);

    logger.info('Rewards calculated:', { userId, totalRewards });

    res.json({
      total_rewards: totalRewards,
      stakes: rewards,
    });
  } catch (error) {
    logger.error('Rewards claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
