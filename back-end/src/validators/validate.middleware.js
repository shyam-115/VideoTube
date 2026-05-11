import { ApiError } from '../utils/ApiError.js';

// Validates req.body (or req.query / req.params) using the provided Joi schema.
// Usage: validate(schema) or validate(schema, 'query')
export function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const data = req[source];
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });

        if (error) {
            const message = error.details.map((d) => d.message).join('; ');
            const errors = error.details.map((d) => ({
                field: d.path.join('.'),
                message: d.message,
            }));
            return next(new ApiError(400, message, errors));
        }

        if (source === 'body') {
            req.body = value;
        } else {
            if (!req.validated) req.validated = {};
            req.validated[source] = value;
        }
        next();
    };
}
