import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { validate } from '../../validators/validate.middleware.js';
import {
    toggleLikeBodySchema,
    likeIdParamSchema,
} from '../../validators/like.validator.js';
import {
    toggleLikeDislike,
    getLikesDislikesCount,
    getUserReaction,
} from '../../controllers/like.controller.js';

const router = Router();

/**
 * Public routes - no authentication required
 */
// GET /api/v1/likes/:id/count - Get like/dislike counts (PUBLIC)
router.get('/:id/count', validate(likeIdParamSchema, 'params'), getLikesDislikesCount);

/**
 * Protected routes - require valid JWT token
 */
router.use(verifyJWT);

// specific patterns BEFORE generic ones
router.get('/status/:id', validate(likeIdParamSchema, 'params'), getUserReaction);

// generic patterns
router.post('/:id', validate(likeIdParamSchema, 'params'), validate(toggleLikeBodySchema, 'body'), toggleLikeDislike);

// Note: delete functionality is handled through the toggle post request in the current implementation.
// router.delete('/:id', validate(likeIdParamSchema, 'params'), deleteLike);

export default router;
