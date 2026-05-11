import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import routes from './routes/index.js';

const app = express();

app.set('trust proxy', 1);

// CORS must be registered first so that error responses (429, 5xx) also
// include the Access-Control-Allow-Origin header the browser requires.
const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS policy: origin '${origin}' is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security headers, cookie parsing, body parsing
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

// General rate limit: 200 req/min in production, 1000 in development
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: config.nodeEnv === 'production' ? 200 : 1000,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Stricter limit on auth endpoints: 10 req/min
const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many auth attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/send-otp', authLimiter);

// All routes
app.use('/', routes);

// Global error handler — must be the last middleware registered
app.use(errorHandler);

export default app;