import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';

const router = Router();

/**
 * Public routes - no authentication required
 */
// router.get('/video/:videoId', getCommentsForVideo);

/**
 * Protected routes - require valid JWT token
 */
router.use(verifyJWT);

// router.post('/', addComment);
// router.patch('/:id', updateComment);
// router.delete('/:id', deleteComment);

export default router;
