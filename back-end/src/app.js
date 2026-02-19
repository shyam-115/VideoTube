import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { config } from './config.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { requestId } from './middlewares/requestId.middleware.js';

const app = express();

app.use(requestId);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// General API rate limit (e.g. 200 req/min per IP)
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: config.nodeEnv === 'production' ? 200 : 1000,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Stricter limit for auth routes (e.g. 10 req/min per IP for login/register)
const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many auth attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/v1/users/login', authLimiter);
app.use('/api/v1/users/register', authLimiter);

// CORS: avoid * in production; use explicit origin from env
const corsOrigin = config.corsOrigin;
const origins = corsOrigin.includes(',') ? corsOrigin.split(',').map((o) => o.trim()) : [corsOrigin];
app.use(cors({
    origin: (origin, cb) => {
        // Allow requests with no origin (same-origin, Postman, etc.) or when origin is in allowed list
        if (!origin || origins.includes(origin)) return cb(null, true);
        return cb(null, false);
    },
    credentials: true,
}));

app.use(express.json({ limit: '16kb' })); 
//Parses incoming JSON data in the request body. Adds it to req.body.
app.use(express.urlencoded({ extended: true, limit: '16kb' })); 
//urlencode => Parses form data submitted using application/x-www-form-urlencoded.
//extended: true => Allows nested objects like: user[address][city] = "Delhi"

app.use(express.static('public'));
app.use(cookieParser());
//Parses cookies from incoming requests. Adds them to req.cookies.

// Health check for load balancers / monitoring
app.get('/api/v1/health', (_req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        success: true,
        message: 'OK',
        timestamp: new Date().toISOString(),
        db: dbStatus,
    });
});

// Routes
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import likeRouter from './routes/like.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';

app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

// 404 for unknown routes
app.use((_req, _res, next) => {
    next({ statusCode: 404, message: 'Not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;

/*
 Why app.use() is used:
In Express.js, app.use() is used to apply middleware globally to your entire application.

✅ What is Middleware?
Middleware is a function that:

Runs before your route handlers (like app.get() or app.post()).

Can modify the request (req) and response (res) objects.

Can end the response or pass control to the next middleware using next().*/