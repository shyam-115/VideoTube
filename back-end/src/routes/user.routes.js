import { Router } from 'express';
import multer from 'multer';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validate.middleware.js';
import {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    updateDetailsSchema,
} from '../validators/auth.validator.js';

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccuntDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    searchChannels,
} from '../controllers/user.controller.js';


const router = Router();

// User registration with avatar + cover upload
router.route('/register').post(
    validate(registerSchema, 'body'),
    (req, res, next) => {
        upload.fields([
            { name: 'avatar', maxCount: 1 },
            { name: 'coverImage', maxCount: 1 },
        ])(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return next({ statusCode: 400, message: err.message });
            }
            if (err) return next(err);
            next();
        });
    },
    registerUser
);

// User auth routes
router.route('/login').post(validate(loginSchema, 'body'), loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(verifyJWT, validate(changePasswordSchema, 'body'), changePassword);
router.get('/search', searchChannels);


// User profile routes
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/update-details').patch(verifyJWT, validate(updateDetailsSchema, 'body'), updateAccuntDetails);
router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);
router.route('/c/:username').get(getUserChannelProfile);
router.route('/watch-history').get(verifyJWT, getWatchHistory);


export default router;
