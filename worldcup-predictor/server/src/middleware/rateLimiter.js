import rateLimit from 'express-rate-limit'
import { dbGet, dbRun } from '../models/database.js'

// In-memory store for failed login attempts per IP+user combination
const failedAttempts = new Map()

// Clean up old entries every 15 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > 15 * 60 * 1000) {
      failedAttempts.delete(key)
    }
  }
}, 15 * 60 * 1000)

// Enhanced rate limiter with IP+user tracking
export const createLoginLimiter = () => {
  // Standard rate limit by IP
  const ipLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per IP per window
    message: { error: 'IP请求过于频繁，请15分钟后再试' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip
  })

  return async (req, res, next) => {
    // First check IP-based rate limit
    ipLimiter(req, res, (err) => {
      if (err) return next(err)

      // Then check IP+user combination
      const { username } = req.body
      if (!username) return next()

      const ip = req.ip || req.connection.remoteAddress
      const key = `${ip}:${username}`
      const now = Date.now()

      const record = failedAttempts.get(key)

      if (record) {
        // Check if locked out (5 failed attempts in 15 minutes)
        const timeSinceLastAttempt = now - record.lastAttempt
        
        if (record.count >= 5 && timeSinceLastAttempt < 15 * 60 * 1000) {
          const remainingTime = Math.ceil((15 * 60 * 1000 - timeSinceLastAttempt) / 1000 / 60)
          return res.status(429).json({ 
            error: `登录尝试过多，请${remainingTime}分钟后再试`,
            retryAfter: remainingTime
          })
        }

        // Reset count if window has passed
        if (timeSinceLastAttempt >= 15 * 60 * 1000) {
          failedAttempts.delete(key)
        }
      }

      // Track this attempt
      const record2 = failedAttempts.get(key) || { count: 0, lastAttempt: now }
      record2.count++
      record2.lastAttempt = now
      failedAttempts.set(key, record2)

      next()
    })
  }
}

// Record successful login (reset failed attempts)
export const recordSuccessfulLogin = (req) => {
  const { username } = req.body
  const ip = req.ip || req.connection.remoteAddress
  const key = `${ip}:${username}`
  failedAttempts.delete(key)
}

// Record failed login
export const recordFailedLogin = (req) => {
  const { username } = req.body
  const ip = req.ip || req.connection.remoteAddress
  const key = `${ip}:${username}`
  const now = Date.now()

  const record = failedAttempts.get(key) || { count: 0, lastAttempt: now }
  record.count++
  record.lastAttempt = now
  failedAttempts.set(key, record)
}

// Get failed attempts for a user (for admin monitoring)
export const getFailedAttempts = (username) => {
  const results = []
  for (const [key, data] of failedAttempts.entries()) {
    if (key.endsWith(`:${username}`)) {
      const [ip] = key.split(':')
      results.push({ ip, ...data })
    }
  }
  return results
}

// Stricter rate limit for password reset
export const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: { error: '请求过于频繁，请1小时后再试' },
  standardHeaders: true,
  legacyHeaders: false,
})

// API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
})
