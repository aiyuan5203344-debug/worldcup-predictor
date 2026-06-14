import express from 'express'
import { dbAll, dbGet, dbRun } from '../models/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Achievement definitions
const ACHIEVEMENTS = {
  first_prediction: { name: '首次预测', description: '完成第一次比赛预测', icon: '🎯', points: 10 },
  five_predictions: { name: '预测达人', description: '完成5次比赛预测', icon: '📊', points: 25 },
  ten_predictions: { name: '预测大师', description: '完成10次比赛预测', icon: '🏆', points: 50 },
  correct_prediction: { name: '神算子', description: '预测正确一场比赛', icon: '✨', points: 20 },
  three_correct: { name: '三连红', description: '连续预测正确3场', icon: '🔥', points: 100 },
  perfect_day: { name: '完美一天', description: '当天所有预测都正确', icon: '🌟', points: 75 },
  top_10: { name: '十佳预测', description: '进入排行榜前10名', icon: '👑', points: 150 },
  chat_active: { name: '社交达人', description: '发送10条聊天消息', icon: '💬', points: 30 },
  early_bird: { name: '早起的鸟', description: '在比赛开始前24小时预测', icon: '🐦', points: 15 },
  night_owl: { name: '夜猫子', description: '在凌晨0-5点预测', icon: '🦉', points: 15 }
}

// GET /api/achievements - Get all achievement types with user status
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Get user's unlocked achievements
    const unlocked = await dbAll(
      'SELECT achievement_type, unlocked_at FROM achievements WHERE user_id = ?',
      [userId]
    )
    const unlockedMap = {}
    unlocked.forEach(a => {
      unlockedMap[a.achievement_type] = a.unlocked_at
    })

    // Build achievement list with unlock status
    const achievements = Object.entries(ACHIEVEMENTS).map(([type, info]) => ({
      type,
      ...info,
      unlocked: !!unlockedMap[type],
      unlocked_at: unlockedMap[type] || null
    }))

    // Calculate stats
    const totalUnlocked = unlocked.length
    const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)

    res.json({
      achievements,
      stats: {
        total: Object.keys(ACHIEVEMENTS).length,
        unlocked: totalUnlocked,
        points: totalPoints
      }
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    res.status(500).json({ error: '获取成就失败' })
  }
})

// GET /api/achievements/my - Get only user's unlocked achievements
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const unlocked = await dbAll(
      `SELECT a.achievement_type, a.unlocked_at 
       FROM achievements a 
       WHERE a.user_id = ?
       ORDER BY a.unlocked_at DESC`,
      [userId]
    )

    const achievements = unlocked.map(a => ({
      type: a.achievement_type,
      ...ACHIEVEMENTS[a.achievement_type],
      unlocked_at: a.unlocked_at
    }))

    res.json({ achievements })
  } catch (error) {
    console.error('Get my achievements error:', error)
    res.status(500).json({ error: '获取我的成就失败' })
  }
})

// POST /api/achievements/check - Check and award new achievements
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const newAchievements = []

    // Get user stats
    const user = dbGet('SELECT id, role FROM users WHERE id = ?', [userId])
    const predictionCount = dbGet(
      'SELECT COUNT(*) as count FROM predictions WHERE user_id = ?',
      [userId]
    )?.count || 0

    const correctPredictions = dbGet(
      `SELECT COUNT(*) as count FROM predictions p 
       JOIN matches m ON p.match_id = m.id 
       WHERE p.user_id = ? AND m.status = 'finished' 
       AND p.home_score = m.home_score AND p.away_score = m.away_score`,
      [userId]
    )?.count || 0

    const messageCount = dbGet(
      'SELECT COUNT(*) as count FROM messages WHERE user_id = ?',
      [userId]
    )?.count || 0

    const leaderboard = dbGet(
      'SELECT position FROM leaderboard WHERE user_id = ?',
      [userId]
    )?.position

    // Check each achievement
    const checks = [
      { type: 'first_prediction', condition: predictionCount >= 1 },
      { type: 'five_predictions', condition: predictionCount >= 5 },
      { type: 'ten_predictions', condition: predictionCount >= 10 },
      { type: 'correct_prediction', condition: correctPredictions >= 1 },
      { type: 'three_correct', condition: correctPredictions >= 3 },
      { type: 'top_10', condition: leaderboard && leaderboard <= 10 },
      { type: 'chat_active', condition: messageCount >= 10 }
    ]

    for (const check of checks) {
      if (check.condition) {
        try {
          await dbRun(
            'INSERT OR IGNORE INTO achievements (user_id, achievement_type) VALUES (?, ?)',
            [userId, check.type]
          )
          // Check if it was actually inserted (new achievement)
          const existing = dbGet(
            'SELECT id FROM achievements WHERE user_id = ? AND achievement_type = ?',
            [userId, check.type]
          )
          if (existing) {
            newAchievements.push({
              type: check.type,
              ...ACHIEVEMENTS[check.type]
            })
          }
        } catch (e) {
          // Ignore duplicate errors
        }
      }
    }

    res.json({
      newAchievements,
      message: newAchievements.length > 0 
        ? `恭喜获得 ${newAchievements.length} 个新成就！` 
        : '暂无新成就'
    })
  } catch (error) {
    console.error('Check achievements error:', error)
    res.status(500).json({ error: '检查成就失败' })
  }
})

export default router
