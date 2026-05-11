import { Router } from 'express';
import { upload } from '../../middlewares/multer.middleware.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { validate } from '../../validators/validate.middleware.js';
import {
    updateDetailsSchema,
} from '../../validators/auth.validator.js';

import {
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    searchChannels,
} from '../../controllers/user.controller.js';

const router = Router();

/**
 * Public routes - no authentication required
 */
router.get('/search', searchChannels);
router.get('/c/:username', getUserChannelProfile);

/**
 * Protected routes - require valid JWT token
 */
router.use(verifyJWT);

router.get('/current-user', getCurrentUser);
router.patch('/update-details', validate(updateDetailsSchema, 'body'), updateAccountDetails);
router.patch('/avatar', upload.single('avatar'), updateUserAvatar);
router.patch('/cover-image', upload.single('coverImage'), updateUserCoverImage);
router.get('/watch-history', getWatchHistory);

export default router;
