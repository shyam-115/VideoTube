import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';

// Global error-handling middleware. Must be registered after all routes.
// Returns a consistent JSON shape: { success, message, errors?, statusCode }
export function errorHandler(err, req, res, _next) {
  const isProduction = process.env.NODE_ENV === 'production';

  let statusCode = 500;
  let message = 'Something went wrong';
  let errors = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    if (err.errors?.length) errors = err.errors;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token';
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'id'}`;
  } else if (err instanceof mongoose.Error) {
    statusCode = 400;
    message = err.message || 'Bad request';
  } else if (err.statusCode >= 400 && err.statusCode < 600) {
    statusCode = err.statusCode;
    message = err.message || 'Request failed';
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error(`[${req.method}] ${req.originalUrl} →`, err);
  }

  const payload = { success: false, message, statusCode };
  if (errors.length) payload.errors = errors;
  if (!isProduction && err.stack) payload.stack = err.stack;

  res.status(statusCode).json(payload);
}
