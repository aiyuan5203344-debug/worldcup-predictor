import jwt from 'jsonwebtoken'
import { dbGet, isTokenBlacklisted, blacklistToken } from '../models/database.js'

export const authenticateToken = (req, res, next) => {
  // Check Authorization header first, then cookies
  const authHeader = req.headers['authorization']
  const headerToken = authHeader && authHeader.split(' ')[1]
  const cookieToken = req.cookies?.accessToken
  const token = headerToken || cookieToken

  if (!token) {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Token已被撤销，请重新登录' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = dbGet('SELECT id, username, nickname, points, role FROM users WHERE id = ?', [decoded.userId])

    if (!user) {
      return res.status(401).json({ error: '用户不存在' })
    }

    req.user = {
      id: user.id,
      username: user.username,
      nickname: user.nickname || user.username,
      points: user.points,
      role: user.role || 'user'
    }
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '登录已过期，请重新登录' })
    }
    return res.status(403).json({ error: '无效的Token' })
  }
}

export const optionalAuth = (req, res, next) => {
  // Check Authorization header first, then cookies
  const authHeader = req.headers['authorization']
  const headerToken = authHeader && authHeader.split(' ')[1]
  const cookieToken = req.cookies?.accessToken
  const token = headerToken || cookieToken

  if (!token) {
    return next()
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = dbGet('SELECT id, username, nickname, points, role FROM users WHERE id = ?', [decoded.userId])
    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        points: user.points,
        role: user.role || 'user'
      }
    }
  } catch (error) {
    // Token invalid, continue without user
  }

  next()
}

export const generateTokens = (userId, rememberMe = false) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '2h') }
  )

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '90d' : (process.env.JWT_REFRESH_EXPIRES_IN || '7d') }
  )

  return { accessToken, refreshToken }
}

// Blacklist refresh token on logout
export const blacklistRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    blacklistToken(refreshToken, decoded.userId, new Date(decoded.exp * 1000))
  } catch (error) {
    // Token already invalid, ignore
  }
}
