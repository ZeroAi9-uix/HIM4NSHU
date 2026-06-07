import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — 100 requests per 15 minutes per IP
 * Applied to all API routes as a baseline
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please wait 15 minutes before retrying.',
    retryAfter: 15
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

/**
 * Auth rate limiter — 10 requests per 15 minutes per IP
 * Strict protection against brute-force login attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed/non-2xx attempts
  message: {
    error: 'Too many authentication attempts. Account protection enabled. Try again in 15 minutes.',
    retryAfter: 15
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

/**
 * AI endpoint rate limiter — 20 requests per minute per IP
 * Gemini API calls are expensive — protect against abuse
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI generation limit reached. Our neural nets need 60 seconds to cool down. Please wait.',
    retryAfter: 1
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});
