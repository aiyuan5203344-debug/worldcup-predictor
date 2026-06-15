import express from 'express'
import bcrypt from 'bcryptjs'
import { dbGet, dbRun } from '../models/database.js'
import { generateTokens, authenticateToken, blacklistRefreshToken } from '../middleware/auth.js'
import { validateBody, schemas } from '../middleware/validation.js'
import { createLoginLimiter, recordSuccessfulLogin, recordFailedLogin, resetLimiter } from '../middleware/rateLimiter.js'
import { generateVerificationCode, sendVerificationEmail } from '../utils/email.js'

const router = express.Router()

// Enhanced login rate limiter
const loginLimiter = createLoginLimiter()

// Send verification code
router.post('/send-verification', resetLimiter, validateBody(schemas.forgotPassword), async (req, res, next) => {
  try {
    const { email, type = 'register' } = req.body

    // Check if email already registered
    const existingUser = dbGet('SELECT id FROM users WHERE email = ?', [email])
    if (type === 'register' && existingUser) {
      return res.status(400).json({ error: '该邮箱已注册' })
    }

    // Generate verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // Delete old verification codes for this email
    dbRun('DELETE FROM email_verifications WHERE email = ?', [email])

    // Save to database
    dbRun(
      'INSERT INTO email_verifications (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt]
    )

    // Send email
    const sent = await sendVerificationEmail(email, code, type)
    if (!sent) {
      return res.status(500).json({ error: '邮件发送失败，请稍后重试' })
    }

    res.json({ message: '验证码已发送到您的邮箱' })
  } catch (error) {
    next(error)
  }
})

// Verify email code
router.post('/verify-email', async (req, res, next) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: '请输入邮箱和验证码' })
    }

    const verification = dbGet(
      'SELECT * FROM email_verifications WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime("now") ORDER BY id DESC LIMIT 1',
      [email, code]
    )

    if (!verification) {
      return res.status(400).json({ error: '验证码无效或已过期' })
    }

    // Mark as used
    dbRun('UPDATE email_verifications SET used = 1 WHERE id = ?', [verification.id])

    // Update user email verified status
    dbRun('UPDATE users SET email_verified = 1 WHERE email = ?', [email])

    res.json({ message: '邮箱验证成功' })
  } catch (error) {
    next(error)
  }
})

// Forgot password - send reset code
router.post('/forgot-password', resetLimiter, async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: '请输入邮箱地址' })
    }

    const user = dbGet('SELECT id FROM users WHERE email = ?', [email])
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: '如果该邮箱已注册，验证码将发送到您的邮箱' })
    }

    // Generate reset code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // Delete old reset codes for this email
    dbRun('DELETE FROM password_resets WHERE email = ?', [email])

    // Save to database
    dbRun(
      'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt]
    )

    // Send email
    await sendVerificationEmail(email, code, 'reset')

    res.json({ message: '如果该邮箱已注册，验证码将发送到您的邮箱' })
  } catch (error) {
    next(error)
  }
})

// Verify reset code
router.post('/verify-reset-code', async (req, res, next) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: '请输入邮箱和验证码' })
    }

    const reset = dbGet(
      'SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime("now") ORDER BY id DESC LIMIT 1',
      [email, code]
    )

    if (!reset) {
      return res.status(400).json({ error: '验证码无效或已过期' })
    }

    // Generate reset token
    const jwt = await import('jsonwebtoken')
    const resetToken = jwt.default.sign(
      { email, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    )

    // Mark code as used
    dbRun('UPDATE password_resets SET used = 1 WHERE id = ?', [reset.id])

    res.json({ message: '验证成功', resetToken })
  } catch (error) {
    next(error)
  }
})

// Reset password with token
router.post('/reset-password-token', async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: '请输入新密码' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: '密码至少8位' })
    }

    // Verify token
    const jwt = await import('jsonwebtoken')
    const decoded = jwt.default.verify(resetToken, process.env.JWT_SECRET)

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: '无效的重置令牌' })
    }

    const user = dbGet('SELECT id FROM users WHERE email = ?', [decoded.email])
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // Update password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)
    dbRun('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, decoded.email])

    res.json({ message: '密码重置成功' })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: '验证码已过期，请重新申请' })
    }
    next(error)
  }
})

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, nickname, email, is_admin } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const existingUser = dbGet('SELECT id FROM users WHERE username = ?', [username])
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' })
    }

    // Check if email is verified (optional)
    if (email) {
      const existingEmail = dbGet('SELECT id FROM users WHERE email = ?', [email])
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered' })
      }
    }

    const role = is_admin ? 'admin' : 'user'

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const result = dbRun(
      'INSERT INTO users (username, nickname, password_hash, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, nickname || username, passwordHash, email || null, role]
    )

    const tokens = generateTokens(result.lastId)

    // Set HttpOnly cookies for security
    const accessTokenMaxAge = 2 * 60 * 60 * 1000 // 2 hours
    const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
      path: '/'
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/'
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: { 
        id: result.lastId, 
        username, 
        nickname: nickname || username, 
        points: 0, 
        role: 'user',
        email: email || null
      },
      ...tokens
    })
  } catch (error) {
    next(error)
  }
})

// Login with stricter rate limiting
router.post('/login', loginLimiter, validateBody(schemas.login), async (req, res, next) => {
  try {
    const { username, password, rememberMe } = req.body

    const user = dbGet('SELECT * FROM users WHERE username = ?', [username])
    if (!user) {
      recordFailedLogin(req)
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      recordFailedLogin(req)
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // Record successful login (reset failed attempts)
    recordSuccessfulLogin(req)

    const tokens = generateTokens(user.id, rememberMe)

    // Set HttpOnly cookies for security
    const accessTokenMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000 // 30 days or 2 hours
    const refreshTokenMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
      path: '/'
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/'
    })

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        points: user.points,
        role: user.role || 'user',
        email: user.email
      },
      ...tokens
    })
  } catch (error) {
    next(error)
  }
})

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

// Logout - clear cookies and blacklist refresh token
router.post('/logout', (req, res) => {
  // Get refresh token before clearing cookies
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken
  
  if (refreshToken) {
    blacklistRefreshToken(refreshToken)
  }
  
  res.clearCookie('accessToken', { path: '/' })
  res.clearCookie('refreshToken', { path: '/' })
  res.json({ message: '退出成功' })
})

// Refresh token (with rotation and blacklist)
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token不能为空' })
    }

    // Check if token is blacklisted
    const { isTokenBlacklisted } = await import('../models/database.js')
    if (isTokenBlacklisted(refreshToken)) {
      return res.status(403).json({ error: 'Token已被撤销' })
    }

    const jwt = await import('jsonwebtoken')
    const decoded = jwt.default.verify(refreshToken, process.env.JWT_SECRET)
    
    // Blacklist old refresh token (rotation)
    blacklistRefreshToken(refreshToken)
    
    // Generate new token pair
    const tokens = generateTokens(decoded.userId)

    // Set new HttpOnly cookies
    const accessTokenMaxAge = 2 * 60 * 60 * 1000 // 2 hours
    const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
      path: '/'
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/'
    })

    res.json(tokens)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Refresh token已过期，请重新登录' })
    }
    res.status(403).json({ error: '无效的Token' })
  }
})

// Admin: Reset user password
router.post('/admin-reset-password', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' })
    }

    const { userId, newPassword } = req.body

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password required' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const user = dbGet('SELECT id FROM users WHERE id = ?', [userId])
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId])

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    next(error)
  }
})

export default router
