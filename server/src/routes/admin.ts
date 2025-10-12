import { Router, Response } from 'express';
import { supabase } from '../utils/supabase.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/users', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { data: users, error, count } = await supabase
      .from('users')
      .select('id, email, wallet_address, language, created_at', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/metrics', auth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data: stablecoins } = await supabase
      .from('stablecoins')
      .select('balance, symbol');

    const tvl = stablecoins?.reduce((sum, coin) => sum + coin.balance, 0) || 0;

    const { data: revenue } = await supabase
      .from('revenue')
      .select('amount, type');

    const totalRevenue = revenue?.reduce((sum, rev) => sum + rev.amount, 0) || 0;

    const revenueByType = revenue?.reduce((acc, rev) => {
      acc[rev.type] = (acc[rev.type] || 0) + rev.amount;
      return acc;
    }, {} as Record<string, number>);

    const { count: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    const { count: activePositions } = await supabase
      .from('positions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    const { data: yields } = await supabase
      .from('yields')
      .select('amount');

    const totalYieldsDistributed = yields?.reduce((sum, y) => sum + y.amount, 0) || 0;

    logger.info('Metrics retrieved');

    res.json({
      tvl,
      total_revenue: totalRevenue,
      revenue_by_type: revenueByType,
      user_count: userCount || 0,
      active_positions: activePositions || 0,
      total_yields_distributed: totalYieldsDistributed,
    });
  } catch (error) {
    logger.error('Get metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/revenue/dashboard', auth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data: monthlyRevenue } = await supabase.rpc('get_monthly_revenue');

    const { data: recentRevenue } = await supabase
      .from('revenue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    res.json({
      monthly_revenue: monthlyRevenue || [],
      recent_revenue: recentRevenue || [],
    });
  } catch (error) {
    logger.error('Get revenue dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
