import { ApiError } from '../utils/ApiError.js';

/**
 * Validates req body/query/params using the provided Joi schema.
 * @param {Object} schema - Joi schema (or { body, query, params } with Joi schemas)
 * @param {string} source - 'body' | 'query' | 'params'
 */
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

        // Store validated values
        if (source === 'body') {
            req.body = value;
        } else {
            // For query/params, store in req.validated since we can't overwrite read-only properties
            if (!req.validated) req.validated = {};
            req.validated[source] = value;
        }
        next();
    };
}

/**
 * Validate multiple sources in one middleware.
 * @param {Object} schemas - { body?: Joi.Schema, query?: Joi.Schema, params?: Joi.Schema }
 */
export function validateAll(schemas) {
    return (req, _res, next) => {
        const allErrors = [];
        for (const [source, schema] of Object.entries(schemas)) {
            if (!schema) continue;
            const data = req[source];
            const { error, value } = schema.validate(data, {
                abortEarly: false,
                stripUnknown: true,
                convert: true,
            });
            if (error) {
                allErrors.push(...error.details.map((d) => ({ source, path: d.path.join('.'), message: d.message })));
            } else {
                if (source === 'body') {
                    req.body = value;
                } else {
                    if (!req.validated) req.validated = {};
                    req.validated[source] = value;
                }
            }
        }
        if (allErrors.length) {
            const message = allErrors.map((e) => `${e.source}.${e.path}: ${e.message}`).join('; ');
            return next(new ApiError(400, message, allErrors));
        }
        next();
    };
}
