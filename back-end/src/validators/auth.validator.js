import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

export const registerSchema = Joi.object({
    fullname: Joi.string().trim().min(1).max(100).required().messages({
        'string.empty': 'Full name is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
    }),
    username: Joi.string().trim().alphanum().min(3).max(30).required().messages({
        'string.alphanum': 'Username must be alphanumeric',
        'string.min': 'Username must be at least 3 characters',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
    }),
});

export const loginSchema = Joi.object({
    username: Joi.string().trim(),
    email: Joi.string().email(),
    password: Joi.string().required(),
}).or('username', 'email').messages({
    'object.missing': 'Username or email is required',
});

export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters',
    }),
});

export const updateDetailsSchema = Joi.object({
    fullname: Joi.string().trim().min(1).max(100).required(),
    email: Joi.string().email().required(),
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().optional(),
}).optional();
