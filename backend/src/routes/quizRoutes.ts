import { Router } from 'express';
import { getQuizQuestion, verifyQuizAnswer, getLeaderboard } from '../controllers/quizController';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth';
import { aiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Quiz question generation calls Gemini — rate limit it
router.get('/question', aiLimiter, getQuizQuestion);
// Answer verification also calls Gemini for semantic evaluation
router.post('/verify', aiLimiter, optionalAuthMiddleware, verifyQuizAnswer);
// Leaderboard is just a DB read — no AI cost, standard rate limit from global
router.get('/leaderboard', getLeaderboard);

export default router;
