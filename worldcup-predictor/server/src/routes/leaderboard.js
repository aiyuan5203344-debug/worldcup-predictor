import express from 'express'
import { dbAll, dbGet } from '../models/database.js'
import { optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Get global leaderboard
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query

    const leaderboard = dbAll(`
      SELECT l.*, u.username, u.avatar
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.total_points DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)])

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1 + parseInt(offset)
    }))

    res.json({ leaderboard: rankedLeaderboard })
  } catch (error) {
    next(error)
  }
})

// Get user's rank
router.get('/my-rank', optionalAuth, (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const userLeaderboard = dbGet(
      'SELECT * FROM leaderboard WHERE user_id = ?',
      [req.user.id]
    )

    if (!userLeaderboard) {
      return res.json({ rank: null, points: 0 })
    }

    const rankResult = dbGet(
      'SELECT COUNT(*) as rank FROM leaderboard WHERE total_points > ?',
      [userLeaderboard.total_points]
    )

    res.json({
      rank: (rankResult?.rank || 0) + 1,
      points: userLeaderboard.total_points,
      correctPredictions: userLeaderboard.correct_predictions,
      totalPredictions: userLeaderboard.total_predictions
    })
  } catch (error) {
    next(error)
  }
})

// Get top 3
router.get('/top3', optionalAuth, (req, res, next) => {
  try {
    const top3 = dbAll(`
      SELECT l.*, u.username, u.avatar
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.total_points DESC
      LIMIT 3
    `)

    res.json({ top3 })
  } catch (error) {
    next(error)
  }
})

export default router
