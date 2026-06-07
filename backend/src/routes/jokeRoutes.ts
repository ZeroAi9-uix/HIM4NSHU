import { Router } from 'express';
import {
  generateJokeRoute,
  getTrendingJokes,
  getRandomJoke,
  getDailyJoke,
  toggleLike,
  toggleDislike,
  toggleFavorite,
  getComments,
  addComment,
  generateMemeCaption
} from '../controllers/jokeController';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth';
import { aiLimiter } from '../middlewares/rateLimiter';
import { validateObjectId } from '../middlewares/sanitize';

const router = Router();

// AI-powered endpoints — strict per-minute rate limiting
router.get('/generate', aiLimiter, optionalAuthMiddleware, generateJokeRoute);
router.get('/meme', aiLimiter, generateMemeCaption);

// Standard endpoints
router.get('/trending', getTrendingJokes);
router.get('/random', getRandomJoke);
router.get('/daily', getDailyJoke);

// Authenticated voting actions (with ObjectId validation)
router.post('/like/:id', validateObjectId, authMiddleware, toggleLike);
router.post('/dislike/:id', validateObjectId, authMiddleware, toggleDislike);
router.post('/favorite/:id', validateObjectId, authMiddleware, toggleFavorite);

// Comments
router.get('/comments/:jokeId', validateObjectId, getComments);
router.post('/comments/:jokeId', validateObjectId, authMiddleware, addComment);

export default router;
