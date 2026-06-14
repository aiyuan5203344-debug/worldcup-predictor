import logger from '../utils/logger.js'
import config from '../config.js'

export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress
  })

  // Default error
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    statusCode = 409
    message = 'Resource already exists'
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    statusCode = 400
    message = 'Invalid reference'
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = err.message
  }

  // Don't leak error details in production
  const response = {
    error: message,
    ...(config.isDevelopment && { stack: err.stack })
  }

  res.status(statusCode).json(response)
}

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}
