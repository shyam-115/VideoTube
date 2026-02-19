import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid channel ID format');

export const channelIdParamSchema = Joi.object({
    channelId: objectId.required(),
});
