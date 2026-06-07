import { Router } from 'express';
import { chatRoute } from '../controllers/chatController';
import { optionalAuthMiddleware } from '../middlewares/auth';
import { aiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Chat calls Gemini AI on every message — apply strict rate limiting
router.post('/message', aiLimiter, optionalAuthMiddleware, chatRoute);

export default router;
