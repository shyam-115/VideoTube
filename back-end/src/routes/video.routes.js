import express from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import {
    uploadVideo,
    getAllVideos,
    getVideoById,
    getChannelVideos,
} from '../controllers/video.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validate.middleware.js';
import {
    uploadVideoSchema,
    videoIdParamSchema,
    getAllVideosQuerySchema,
    channelUserIdParamSchema,
} from '../validators/video.validator.js';

const router = express.Router();

// POST /api/v1/videos/upload - Upload new video
router.post(
    '/upload',
    verifyJWT,
    validate(uploadVideoSchema, 'body'),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ]),
    uploadVideo
);

// GET /api/v1/videos - Get all published videos
router.get('/', validate(getAllVideosQuerySchema, 'query'), getAllVideos);

// Place before :id
router.get('/channel/:userId', validate(channelUserIdParamSchema, 'params'), getChannelVideos);

// GET /api/v1/videos/:id - Get video by ID and increment views
router.get('/:id', validate(videoIdParamSchema, 'params'), getVideoById);

export default router;
