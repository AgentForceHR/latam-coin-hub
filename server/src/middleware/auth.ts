import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase.js';
import { User } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  user?: User;
  header?: (name: string) => string | undefined;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    req.user = user as User;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized access' });
  }
};
