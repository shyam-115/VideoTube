import { Router } from 'express';
import multer from 'multer';
import { upload } from '../../middlewares/multer.middleware.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { validate } from '../../validators/validate.middleware.js';
import {
    registerSchema,
    loginSchema,
    changePasswordSchema,
} from '../../validators/auth.validator.js';

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    sendOtp,
} from '../../controllers/user.controller.js';

const router = Router();

/**
 * Public routes - no authentication required
 */
router.post('/send-otp', sendOtp);

router.post(
    '/register',
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

router.post('/login', validate(loginSchema, 'body'), loginUser);
router.post('/refresh-token', refreshAccessToken);

/**
 * Protected routes - require valid JWT token
 */
router.use(verifyJWT);

router.post('/logout', logoutUser);
router.post('/change-password', validate(changePasswordSchema, 'body'), changePassword);

export default router;
