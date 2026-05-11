import { Router } from 'express';
import { upload } from '../../middlewares/multer.middleware.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { validate } from '../../validators/validate.middleware.js';
import {
    uploadVideoSchema,
    videoIdParamSchema,
    getAllVideosQuerySchema,
    channelUserIdParamSchema,
} from '../../validators/video.validator.js';

import {
    uploadVideo,
    getAllVideos,
    getVideoById,
    getChannelVideos,
} from '../../controllers/video.controller.js';

const router = Router();

/**
 * Public routes - no authentication required
 */
router.get('/', validate(getAllVideosQuerySchema, 'query'), getAllVideos);

// Specific route must come BEFORE generic /:id route
router.get('/channel/:userId', validate(channelUserIdParamSchema, 'params'), getChannelVideos);

// Generic /:id route is last public route
router.get('/:id', validate(videoIdParamSchema, 'params'), getVideoById);

/**
 * Protected routes - require valid JWT token
 */
router.use(verifyJWT);

router.post(
    '/upload',
    validate(uploadVideoSchema, 'body'),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ]),
    uploadVideo
);

// Note: updateVideo and deleteVideo controllers are not implemented yet. 
// Add these once implemented in the controller.
// router.patch('/:id', validate(videoIdParamSchema, 'params'), updateVideo);
// router.delete('/:id', validate(videoIdParamSchema, 'params'), deleteVideo);

export default router;
