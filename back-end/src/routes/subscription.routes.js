import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validate.middleware.js';
import { channelIdParamSchema } from '../validators/subscription.validator.js';
import {
    subscribeChannel,
    unsubscribeChannel,
    getSubscriberCount,
    isSubscribedToChannel,
    getSubscribedChannels,
} from '../controllers/subscription.controller.js';

const router = Router();
router.use(verifyJWT);

router
    .route('/:channelId')
    .post(validate(channelIdParamSchema, 'params'), subscribeChannel)
    .delete(validate(channelIdParamSchema, 'params'), unsubscribeChannel);

router.route('/isSubscribed/:channelId').get(validate(channelIdParamSchema, 'params'), isSubscribedToChannel);
router.route('/count/:channelId').get(validate(channelIdParamSchema, 'params'), getSubscriberCount);
router.route('/subscribed').get(getSubscribedChannels);

export default router;