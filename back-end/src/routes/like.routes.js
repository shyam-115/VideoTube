import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validate.middleware.js';
import {
    toggleLikeBodySchema,
    likeIdParamSchema,
} from '../validators/like.validator.js';
import {
    toggleLikeDislike,
    getLikesDislikesCount,
    getUserReaction,
} from '../controllers/like.controller.js';

const router = Router();
router.use(verifyJWT);

// More specific routes first
// GET /api/v1/likes/status/:id - Get user's reaction status
router.get('/status/:id', validate(likeIdParamSchema, 'params'), getUserReaction);
// GET /api/v1/likes/:id/count - Get like/dislike counts
router.get('/:id/count', validate(likeIdParamSchema, 'params'), getLikesDislikesCount);
// POST /api/v1/likes/:id - Toggle like/dislike
router.post('/:id', validate(likeIdParamSchema, 'params'), validate(toggleLikeBodySchema, 'body'), toggleLikeDislike);

export default router;