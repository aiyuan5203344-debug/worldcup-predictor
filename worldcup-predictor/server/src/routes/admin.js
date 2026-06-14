import express from 'express'
import bcrypt from 'bcryptjs'
import { dbAll, dbGet, dbRun } from '../models/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' })
  }
  next()
}

// Helper: Log admin action
const logAdminAction = (userId, action, targetType, targetId, details, ipAddress) => {
  dbRun(
    'INSERT INTO audit_logs (user_id, action, target_type, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, action, targetType, targetId, details, ipAddress]
  )
}

// Get all users
router.get('/users', authenticateToken, requireAdmin, (req, res, next) => {
  try {
    const users = dbAll(
      'SELECT id, username, nickname, points, role, email, created_at FROM users ORDER BY created_at DESC'
    )
    res.json({ users })
  } catch (error) {
    next(error)
  }
})

// Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, (req, res, next) => {
  try {
    const userId = req.params.id

    // Prevent deleting self
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: '不能删除自己' })
    }

    const user = dbGet('SELECT id, username, role FROM users WHERE id = ?', [userId])
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({ error: '不能删除管理员账户' })
    }

    dbRun('DELETE FROM users WHERE id = ?', [userId])
    dbRun('DELETE FROM predictions WHERE user_id = ?', [userId])

    // Log the action
    logAdminAction(req.user.id, 'DELETE_USER', 'user', userId, 
      `删除用户: ${user.username}`, req.ip)

    res.json({ message: '用户删除成功' })
  } catch (error) {
    next(error)
  }
})

// Reset user password
router.post('/users/:id/reset-password', authenticateToken, requireAdmin, (req, res, next) => {
  try {
    const userId = req.params.id
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: '密码至少8位' })
    }

    const user = dbGet('SELECT id, username FROM users WHERE id = ?', [userId])
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10)
    dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId])

    // Log the action
    logAdminAction(req.user.id, 'RESET_PASSWORD', 'user', userId,
      `重置用户密码: ${user.username}`, req.ip)

    res.json({ message: '密码重置成功' })
  } catch (error) {
    next(error)
  }
})

// Get audit logs
router.get('/audit-logs', authenticateToken, requireAdmin, (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit
    
    const logs = dbAll(
      `SELECT al.*, u.username as admin_username 
       FROM audit_logs al 
       JOIN users u ON al.user_id = u.id 
       ORDER BY al.created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    )
    
    const total = dbGet('SELECT COUNT(*) as count FROM audit_logs')
    
    res.json({ 
      logs, 
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get match statistics
router.get('/stats', authenticateToken, requireAdmin, (req, res, next) => {
  try {
    const totalUsers = dbGet('SELECT COUNT(*) as count FROM users')
    const totalMatches = dbGet('SELECT COUNT(*) as count FROM matches')
    const totalPredictions = dbGet('SELECT COUNT(*) as count FROM predictions')
    const liveMatches = dbGet("SELECT COUNT(*) as count FROM matches WHERE status = 'live'")
    const totalTeams = dbGet('SELECT COUNT(*) as count FROM teams')
    const totalPlayers = dbGet('SELECT COUNT(*) as count FROM players')
    const recentAuditLogs = dbGet('SELECT COUNT(*) as count FROM audit_logs WHERE created_at > datetime("now", "-24 hours")')

    res.json({
      stats: {
        totalUsers: totalUsers.count,
        totalMatches: totalMatches.count,
        totalPredictions: totalPredictions.count,
        liveMatches: liveMatches.count,
        totalTeams: totalTeams.count,
        totalPlayers: totalPlayers.count,
        recentAuditLogs: recentAuditLogs.count
      }
    })
  } catch (error) {
    next(error)
  }
})

// Sync matches from OpenLigaDB (placeholder)
router.post('/sync-matches', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    // Log the action
    logAdminAction(req.user.id, 'SYNC_MATCHES', 'system', null,
      '触发比赛数据同步', req.ip)
    
    // This would integrate with OpenLigaDB API
    // For now, return success message
    res.json({ message: '比赛同步功能即将推出' })
  } catch (error) {
    next(error)
  }
})

export default router
