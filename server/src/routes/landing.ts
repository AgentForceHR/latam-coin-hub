import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase.js';
import { logger } from '../utils/logger.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(limiter);

router.get('/info', async (req: Request, res: Response): Promise<void> => {
  try {
    const lang = (req.query.lang as string) || 'en';

    if (!['en', 'es', 'pt'].includes(lang)) {
      res.status(400).json({ error: 'Invalid language. Supported: en, es, pt' });
      return;
    }

    const { data, error } = await supabase
      .from('landing_content')
      .select('content')
      .eq('lang', lang)
      .single();

    if (error || !data) {
      logger.error('Landing info error:', error);
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json({
      lang,
      data: data.content
    });
  } catch (error) {
    logger.error('Landing info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/languages', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      languages: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'pt', name: 'Português' }
      ]
    });
  } catch (error) {
    logger.error('Landing languages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/redirect', (_req: Request, res: Response): void => {
  res.redirect('https://app.soldefi.latam');
});

export default router;
