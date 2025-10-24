import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { supabase } from '../utils/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

const MAX_BETA_TESTERS = 100;
const DEADLINE = new Date('2025-10-29T23:59:59-03:00');

const signupLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas solicitudes. Por favor, intenta de nuevo en un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const messages = {
  es: {
    success: '¡Registro exitoso para beta del 30 de oct!',
    alreadyRegistered: 'Este email ya está registrado.',
    limitReached: 'Límite de 100 beta testers alcanzado.',
    deadlinePassed: 'El periodo de registro ha cerrado (hasta el 29 de oct).',
    thankYou: '¡Gracias por registrarte!',
    followRequired: 'Debes seguir @StablecoinDeFiLATAM en X para registrarte.',
  },
  en: {
    success: 'Successfully registered for Oct 30 beta!',
    alreadyRegistered: 'This email is already registered.',
    limitReached: 'Limit of 100 beta testers reached.',
    deadlinePassed: 'Registration period has closed (until Oct 29).',
    thankYou: 'Thanks for signing up!',
    followRequired: 'You must follow @StablecoinDeFiLATAM on X to register.',
  },
  pt: {
    success: 'Registrado com sucesso para o beta de 30 de out!',
    alreadyRegistered: 'Este email já está registrado.',
    limitReached: 'Limite de 100 beta testers alcançado.',
    deadlinePassed: 'O período de registro foi encerrado (até 29 de out).',
    thankYou: 'Obrigado por se inscrever!',
    followRequired: 'Você deve seguir @StablecoinDeFiLATAM no X para se registrar.',
  },
};

async function checkXFollowStatus(username: string): Promise<boolean> {
  try {
    const bearerToken = process.env.X_BEARER_TOKEN;

    if (!bearerToken) {
      logger.warn('X_BEARER_TOKEN not configured, skipping follow check');
      return true;
    }

    const targetUsername = 'StablecoinDeFiLATAM';

    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      logger.warn('Failed to fetch user from X API:', await userResponse.text());
      return false;
    }

    const userData = await userResponse.json();
    const userId = userData.data?.id;

    if (!userId) {
      return false;
    }

    const targetResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${targetUsername}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!targetResponse.ok) {
      logger.warn('Failed to fetch target user from X API');
      return false;
    }

    const targetData = await targetResponse.json();
    const targetUserId = targetData.data?.id;

    if (!targetUserId) {
      return false;
    }

    const followingResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/following/${targetUserId}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (followingResponse.status === 200) {
      const followingData = await followingResponse.json();
      return followingData.data?.following === true;
    }

    return false;
  } catch (error) {
    logger.error('Error checking X follow status:', error);
    return false;
  }
}

router.post(
  '/signup',
  signupLimiter,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('nickname').trim().notEmpty().withMessage('Nickname es requerido'),
    body('language').optional().isIn(['es', 'en', 'pt']).withMessage('Idioma inválido'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, nickname, language = 'es' } = req.body;
      const lang = messages[language as keyof typeof messages] || messages.es;

      if (new Date() > DEADLINE) {
        res.status(400).json({ error: lang.deadlinePassed });
        return;
      }

      const { count, error: countError } = await supabase
        .from('beta_testers')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      if (count && count >= MAX_BETA_TESTERS) {
        res.status(400).json({ error: lang.limitReached });
        return;
      }

      const { data: existingUser } = await supabase
        .from('beta_testers')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        res.status(400).json({ error: lang.alreadyRegistered });
        return;
      }

      const xFollowed = await checkXFollowStatus(nickname);

      const { error: insertError } = await supabase
        .from('beta_testers')
        .insert([
          {
            email,
            nickname,
            x_followed: xFollowed,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      logger.info('Beta tester registered:', { email, nickname, xFollowed });

      res.status(201).json({
        message: lang.success,
        thankYou: lang.thankYou,
        x_followed: xFollowed,
      });
    } catch (error) {
      logger.error('Beta signup error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

router.get('/count', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { count, error } = await supabase
      .from('beta_testers')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    res.json({
      count: count || 0,
      remaining: MAX_BETA_TESTERS - (count || 0),
      deadline: DEADLINE.toISOString(),
    });
  } catch (error) {
    logger.error('Beta count error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
