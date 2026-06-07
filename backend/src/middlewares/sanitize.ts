import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

/**
 * Recursively sanitize all string values in an object
 * Strips all HTML tags to prevent XSS injection via request bodies
 */
function deepSanitize(value: any): any {
  if (typeof value === 'string') {
    // Strip all HTML tags — no tags allowed in API inputs
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {}
    });
  }

  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      sanitized[key] = deepSanitize(value[key]);
    }
    return sanitized;
  }

  return value;
}

/**
 * XSS Sanitization Middleware
 * Recursively strips all HTML from req.body, req.query, and req.params
 * Must be applied AFTER express.json() but BEFORE route handlers
 */
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = deepSanitize(req.body);
  }

  if (req.query) {
    req.query = deepSanitize(req.query);
  }

  if (req.params) {
    req.params = deepSanitize(req.params);
  }

  next();
}

/**
 * Validate MongoDB ObjectId to prevent NoSQL injection
 * Returns 400 if id param is not a valid 24-char hex string
 */
export function validateObjectId(req: Request, res: Response, next: NextFunction) {
  const idParam = req.params.id || req.params.jokeId || req.params.questionId;
  
  if (idParam && !/^[a-fA-F0-9]{24}$/.test(idParam)) {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }
  
  next();
}
