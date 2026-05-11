import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid video ID format');

export const toggleLikeSchema = Joi.object({
    id: objectId.required(),
});

export const toggleLikeBodySchema = Joi.object({
    type: Joi.string().valid('like', 'dislike').required().messages({
        'any.only': "Type must be either 'like' or 'dislike'",
    }),
});

export const likeIdParamSchema = Joi.object({
    id: objectId.required(),
});
