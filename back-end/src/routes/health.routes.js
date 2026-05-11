import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// GET /health
// Return: { status: "OK", timestamp, uptime }
// Public endpoint
router.get('/', (_req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({ 
        success: true, 
        message: 'OK', 
        status: 'OK',
        db: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

export default router;
