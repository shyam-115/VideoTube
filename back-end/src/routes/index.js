import { Router } from 'express';
import healthRoutes from './health.routes.js';
import v1Routes from './v1/index.js';

const router = Router();

// Mount health check
router.use('/health', healthRoutes);

// Mount v1 API routes
router.use('/api/v1', v1Routes);

// 404 handler for unknown routes handled by aggregator
router.use((_req, _res, next) => {
    next({ statusCode: 404, message: 'Not found' });
});

export default router;
