import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { supabase } from '../utils/supabase.js';
import { generateMockWalletAddress } from '../utils/helpers.js';
import { getMessage } from '../utils/translations.js';
import { logger } from '../utils/logger.js';
import type { Language } from '../types/index.js';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('language').optional().isIn(['en', 'es', 'pt']).withMessage('Invalid language'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, language = 'en' } = req.body;

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        res.status(400).json({ error: getMessage(language, 'error', 'userExists') });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const walletAddress = generateMockWalletAddress();

      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: passwordHash,
            wallet_address: walletAddress,
            language,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await supabase.from('stablecoins').insert([
        { user_id: user.id, symbol: 'USD', balance: 0, pegged_to: 'USD' },
        { user_id: user.id, symbol: 'BRL', balance: 0, pegged_to: 'BRL' },
        { user_id: user.id, symbol: 'ARS', balance: 0, pegged_to: 'ARS' },
      ]);

      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
      const token = jwt.sign({ userId: user.id }, jwtSecret);

      logger.info('User registered:', { userId: user.id, email });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          wallet_address: user.wallet_address,
          language: user.language,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        const language = user.language as Language;
        res.status(401).json({ error: getMessage(language, 'error', 'invalidCredentials') });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
      const token = jwt.sign({ userId: user.id }, jwtSecret);

      logger.info('User logged in:', { userId: user.id, email });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          wallet_address: user.wallet_address,
          language: user.language,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post('/wallet-connect', async (_req: Request, res: Response): Promise<void> => {
  try {
    const walletAddress = generateMockWalletAddress();

    logger.info('Mock wallet connected:', { walletAddress });

    res.json({
      wallet_address: walletAddress,
      message: 'Wallet connected successfully (mock)',
    });
  } catch (error) {
    logger.error('Wallet connect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
