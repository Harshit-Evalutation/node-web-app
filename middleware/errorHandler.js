'use strict';

const logger = require('../config/logger');

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Unhandled error', {
    status,
    message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // API routes get JSON error responses
  if (req.originalUrl.startsWith('/api')) {
    return res.status(status).json({
      status: 'error',
      statusCode: status,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }

  // Web routes get rendered error page
  res.status(status).render('error', {
    title: `${status} - ${message}`,
    layout: 'layouts/main',
    page: 'error',
    status,
    message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : null,
  });
};

module.exports = { notFoundHandler, errorHandler };
