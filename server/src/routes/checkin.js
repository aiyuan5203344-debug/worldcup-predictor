import express from 'express'
import { dbRun, dbGet, dbAll } from '../models/database.js'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// Points system based on streak
const getPointsForStreak = (streak) => {
  if (streak >= 30) return 100  // 30天签到
  if (streak >= 14) return 50   // 14天签到
  if (streak >= 7) return 30    // 7天签到
  if (streak >= 3) return 20    // 3天签到
  return 10                      // 基础积分
}

// POST /api/checkin - Daily checkin
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Check if already checked in today
    const existingCheckin = dbGet(
      'SELECT id FROM checkins WHERE user_id = ? AND checkin_date = ?',
      [userId, today]
    )

    if (existingCheckin) {
      return res.status(400).json({ error: '今日已签到' })
    }

    // Get current streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const lastCheckin = dbGet(
      'SELECT streak FROM checkins WHERE user_id = ? AND checkin_date = ?',
      [userId, yesterdayStr]
    )

    const streak = lastCheckin ? lastCheckin.streak + 1 : 1
    const points = getPointsForStreak(streak)

    // Insert checkin
    dbRun(
      'INSERT INTO checkins (user_id, checkin_date, streak, points_earned) VALUES (?, ?, ?, ?)',
      [userId, today, streak, points]
    )

    // Update user points
    dbRun(
      'UPDATE users SET points = points + ? WHERE id = ?',
      [points, userId]
    )

    // Get total checkins this month
    const monthStart = new Date()
    monthStart.setDate(1)
    const monthStartStr = monthStart.toISOString().split('T')[0]

    const monthCheckins = dbGet(
      'SELECT COUNT(*) as count FROM checkins WHERE user_id = ? AND checkin_date >= ?',
      [userId, monthStartStr]
    )?.count || 0

    // Get total checkins all time
    const totalCheckins = dbGet(
      'SELECT COUNT(*) as count FROM checkins WHERE user_id = ?',
      [userId]
    )?.count || 0

    logger.info(`User ${userId} checked in: streak=${streak}, points=${points}`)

    res.json({
      success: true,
      streak,
      points,
      monthCheckins,
      totalCheckins,
      message: `签到成功！获得 ${points} 积分`
    })
  } catch (error) {
    logger.error('Checkin error:', error)
    res.status(500).json({ error: '签到失败' })
  }
})

// GET /api/checkin/status - Get checkin status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const today = new Date().toISOString().split('T')[0]

    // Check if checked in today
    const todayCheckin = dbGet(
      'SELECT * FROM checkins WHERE user_id = ? AND checkin_date = ?',
      [userId, today]
    )

    // Get current streak
    const lastCheckin = dbGet(
      'SELECT streak FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC LIMIT 1',
      [userId]
    )

    // Get month checkins
    const monthStart = new Date()
    monthStart.setDate(1)
    const monthStartStr = monthStart.toISOString().split('T')[0]

    const monthCheckins = dbAll(
      'SELECT checkin_date FROM checkins WHERE user_id = ? AND checkin_date >= ? ORDER BY checkin_date',
      [userId, monthStartStr]
    )

    // Get total checkins
    const totalCheckins = dbGet(
      'SELECT COUNT(*) as count FROM checkins WHERE user_id = ?',
      [userId]
    )?.count || 0

    // Get total points from checkins
    const totalPoints = dbGet(
      'SELECT SUM(points_earned) as total FROM checkins WHERE user_id = ?',
      [userId]
    )?.total || 0

    res.json({
      checkedInToday: !!todayCheckin,
      currentStreak: lastCheckin?.streak || 0,
      monthCheckins: monthCheckins.map(c => c.checkin_date),
      totalCheckins,
      totalPoints
    })
  } catch (error) {
    logger.error('Get checkin status error:', error)
    res.status(500).json({ error: '获取签到状态失败' })
  }
})

// GET /api/checkin/history - Get checkin history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 30 } = req.query

    const checkins = dbAll(
      `SELECT checkin_date, streak, points_earned 
       FROM checkins 
       WHERE user_id = ? 
       ORDER BY checkin_date DESC 
       LIMIT ?`,
      [userId, parseInt(limit)]
    )

    res.json({ checkins })
  } catch (error) {
    logger.error('Get checkin history error:', error)
    res.status(500).json({ error: '获取签到历史失败' })
  }
})

// GET /api/checkin/leaderboard - Checkin leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const leaderboard = dbAll(`
      SELECT u.id, u.username, u.nickname, u.avatar,
             COUNT(c.id) as total_checkins,
             MAX(c.streak) as max_streak,
             SUM(c.points_earned) as total_points
      FROM users u
      LEFT JOIN checkins c ON u.id = c.user_id
      GROUP BY u.id
      ORDER BY total_checkins DESC, max_streak DESC
      LIMIT 20
    `)

    res.json({ leaderboard })
  } catch (error) {
    logger.error('Get checkin leaderboard error:', error)
    res.status(500).json({ error: '获取签到排行榜失败' })
  }
})

export default router
