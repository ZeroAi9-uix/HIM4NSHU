import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import jokeRoutes from './routes/jokeRoutes';
import quizRoutes from './routes/quizRoutes';
import chatRoutes from './routes/chatRoutes';
import { generalLimiter } from './middlewares/rateLimiter';
import { sanitizeInputs } from './middlewares/sanitize';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── SECURITY HEADERS (Helmet) ───────────────────────────────────────────────
// Sets X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, HSTS, CSP etc.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow frontend fetch
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  }
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
// Restrict to known frontend origin — NOT wildcard '*' in production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.5:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ─── REQUEST LOGGING ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ─── BODY PARSING ────────────────────────────────────────────────────────────
// Limit JSON body size to prevent payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── GLOBAL XSS SANITIZATION ─────────────────────────────────────────────────
// Strip all HTML from req.body, req.query, req.params
app.use(sanitizeInputs);

// ─── GLOBAL RATE LIMITER ──────────────────────────────────────────────────────
// 100 requests per 15 minutes per IP (all API routes)
app.use('/api', generalLimiter);

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jokes', jokeRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'active',
    platform: 'RAJ AI Core',
    time: new Date(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // CORS errors
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('💥 Unhandled Exception:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ─── DATABASE & SERVER START ──────────────────────────────────────────────────
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rajai';
console.log(`🔌 Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 RAJ AI Core API active on port: ${PORT}`);
      console.log(`🛡️  Security: helmet + rate-limiting + XSS sanitization active`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failure:', err.message);
    console.log('⚠️  Running in DB-less fallback mode.');
    app.listen(PORT, () => {
      console.log(`🚀 RAJ AI Core API active (Simulated DB) on port: ${PORT}`);
    });
  });
