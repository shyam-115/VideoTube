import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { validate } from '../../validators/validate.middleware.js';
import { channelIdParamSchema } from '../../validators/subscription.validator.js';
import {
    subscribeChannel,
    unsubscribeChannel,
    getSubscriberCount,
    isSubscribedToChannel,
    getSubscribedChannels,
} from '../../controllers/subscription.controller.js';

const router = Router();

/**
 * Public routes - no authentication required
 */
router.get('/count/:channelId', validate(channelIdParamSchema, 'params'), getSubscriberCount);

/**
 * Protected routes - require valid JWT token
 */
router.use(verifyJWT);

// GET /list before /status/:channelId to prevent param shadowing if needed, 
// but since one has :channelId and one doesn't, just separate them out clearly.
router.get('/list', getSubscribedChannels);

router.get('/status/:channelId', validate(channelIdParamSchema, 'params'), isSubscribedToChannel);

router.post('/:channelId', validate(channelIdParamSchema, 'params'), subscribeChannel);

router.delete('/:channelId', validate(channelIdParamSchema, 'params'), unsubscribeChannel);

export default router;
