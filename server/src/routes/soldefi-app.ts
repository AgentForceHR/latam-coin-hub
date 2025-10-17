import { Router, Response } from 'express';
import { supabase } from '../utils/supabase.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(limiter);

const buySchema = Joi.object({
  bnb_amount: Joi.number().positive().required(),
  tx_hash: Joi.string().required()
});

function calculateLBPPrice(date: Date): number {
  const lbpStart = new Date('2025-10-30T00:00:00Z');
  const lbpEnd = new Date('2025-11-03T23:59:59Z');

  if (date < lbpStart) {
    return 0.06;
  }

  if (date > lbpEnd) {
    return 0.02;
  }

  const totalDuration = lbpEnd.getTime() - lbpStart.getTime();
  const elapsed = date.getTime() - lbpStart.getTime();
  const progress = elapsed / totalDuration;

  const startPrice = 0.06;
  const endPrice = 0.02;
  const currentPrice = startPrice - (startPrice - endPrice) * progress;

  return parseFloat(currentPrice.toFixed(4));
}

router.get('/price', async (req: Request, res: Response): Promise<void> => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const currentDate = new Date();
    const price = calculateLBPPrice(currentDate);

    const lbpStart = new Date('2025-10-30T00:00:00Z');
    const lbpEnd = new Date('2025-11-03T23:59:59Z');

    const messages = {
      en: {
        active: 'LBP is active',
        upcoming: 'LBP starts Oct 30, 2025',
        ended: 'LBP has ended'
      },
      es: {
        active: 'LBP está activo',
        upcoming: 'LBP comienza el 30 de octubre, 2025',
        ended: 'LBP ha terminado'
      },
      pt: {
        active: 'LBP está ativo',
        upcoming: 'LBP começa em 30 de outubro, 2025',
        ended: 'LBP terminou'
      }
    };

    const langMessages = messages[lang as keyof typeof messages] || messages.en;

    let status = '';
    if (currentDate < lbpStart) {
      status = langMessages.upcoming;
    } else if (currentDate > lbpEnd) {
      status = langMessages.ended;
    } else {
      status = langMessages.active;
    }

    res.json({
      price,
      currency: 'USD',
      lbp_period: {
        start: '2025-10-30',
        end: '2025-11-03'
      },
      status
    });
  } catch (error) {
    logger.error('Get price error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/buy', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error: validationError } = buySchema.validate(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const { bnb_amount, tx_hash } = req.body;
    const userId = req.user!.id;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('kyc_status, sdf_balance')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.kyc_status !== 'approved') {
      res.status(403).json({
        error: 'KYC verification required',
        kyc_status: user.kyc_status
      });
      return;
    }

    const currentPrice = calculateLBPPrice(new Date());
    const sdfTokens = bnb_amount / currentPrice;

    const { error: txError } = await supabase
      .from('app_transactions')
      .insert({
        user_id: userId,
        bnb_amount,
        sdf_tokens: sdfTokens,
        price: currentPrice,
        tx_hash
      });

    if (txError) {
      logger.error('Transaction insert error:', txError);
      res.status(500).json({ error: 'Failed to record transaction' });
      return;
    }

    const newBalance = (user.sdf_balance || 0) + sdfTokens;
    await supabase
      .from('users')
      .update({
        sdf_balance: newBalance,
        vesting_start: new Date()
      })
      .eq('id', userId);

    logger.info('SDF purchase completed:', { userId, bnb_amount, sdf_tokens: sdfTokens });

    res.json({
      success: true,
      bnb_amount,
      sdf_tokens: sdfTokens,
      price: currentPrice,
      new_balance: newBalance,
      tx_hash
    });
  } catch (error) {
    logger.error('Buy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dashboard', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('sdf_balance, vesting_start, kyc_status')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { data: transactions, error: txError } = await supabase
      .from('app_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (txError) {
      logger.error('Transactions fetch error:', txError);
    }

    const totalInvested = transactions?.reduce((sum: number, tx: any) => sum + parseFloat(tx.bnb_amount), 0) || 0;

    const vestingMonths = 12;
    const vestingProgress = user.vesting_start
      ? Math.min(100, (new Date().getTime() - new Date(user.vesting_start).getTime()) / (vestingMonths * 30 * 24 * 60 * 60 * 1000) * 100)
      : 0;

    res.json({
      sdf_balance: user.sdf_balance || 0,
      kyc_status: user.kyc_status,
      vesting: {
        start_date: user.vesting_start,
        progress: parseFloat(vestingProgress.toFixed(2)),
        months_total: vestingMonths
      },
      total_invested: totalInvested,
      transactions: transactions || []
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
