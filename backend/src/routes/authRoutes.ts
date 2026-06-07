import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { signup, login, googleLogin, getProfile } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Validation middleware runner
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg
    });
  }
  next();
};

// Input validation chains
const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3–30 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.'),
  body('email')
    .isEmail()
    .withMessage('Valid email address required.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email address required.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
];

// ─── AUTH ROUTES (with strict rate limiting) ──────────────────────────────────
router.post('/signup', authLimiter, signupValidation, validate, signup);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/google', authLimiter, googleLogin);
router.get('/profile', authMiddleware, getProfile);

export default router;
