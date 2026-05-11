import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

export const uploadVideoSchema = Joi.object({
    title: Joi.string().trim().min(1).max(150).required().messages({
        'string.empty': 'Title is required',
        'string.max': 'Title must be at most 150 characters',
    }),
    description: Joi.string().trim().max(2000).allow('').optional(),
});

export const videoIdParamSchema = Joi.object({
    id: objectId.required(),
});

export const getAllVideosQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    query: Joi.string().trim().max(200).allow('').optional(),
    sortBy: Joi.string().valid('views', 'createdAt').optional(),
    sortType: Joi.string().valid('asc', 'desc').default('desc'),
});

export const channelUserIdParamSchema = Joi.object({
    userId: objectId.required(),
});
