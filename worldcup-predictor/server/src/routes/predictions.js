import express from 'express'
import { dbAll, dbGet, dbRun, executeTransaction } from '../models/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get user's predictions
router.get('/me', authenticateToken, (req, res, next) => {
  try {
    const predictions = dbAll(`
      SELECT p.*, m.home_team, m.away_team, m.home_score, m.away_score, m.status, m.match_time
      FROM predictions p
      JOIN matches m ON p.match_id = m.id
      WHERE p.user_id = ?
      ORDER BY m.match_time DESC
    `, [req.user.id])

    res.json({ predictions })
  } catch (error) {
    next(error)
  }
})

// Submit prediction (with transaction)
router.post('/', authenticateToken, (req, res, next) => {
  try {
    const { matchId, predictedHomeScore, predictedAwayScore, predictedResult } = req.body

    if (!matchId) {
      return res.status(400).json({ error: '比赛ID不能为空' })
    }

    const match = dbGet("SELECT * FROM matches WHERE id = ? AND status = 'upcoming'", [matchId])
    if (!match) {
      return res.status(400).json({ error: '比赛不存在或已开始' })
    }

    const existingPrediction = dbGet(
      'SELECT id FROM predictions WHERE user_id = ? AND match_id = ?',
      [req.user.id, matchId]
    )

    if (existingPrediction) {
      return res.status(409).json({ error: '你已经预测过这场比赛' })
    }

    // Use transaction for atomic operation
    const operations = [
      {
        query: `INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score, predicted_result)
                VALUES (?, ?, ?, ?, ?)`,
        params: [req.user.id, matchId, predictedHomeScore, predictedAwayScore, predictedResult]
      },
      {
        query: `INSERT OR IGNORE INTO leaderboard (user_id, total_predictions) VALUES (?, 0)`,
        params: [req.user.id]
      },
      {
        query: `UPDATE leaderboard SET total_predictions = total_predictions + 1, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?`,
        params: [req.user.id]
      }
    ]

    const { success, results } = executeTransaction(operations)

    if (!success) {
      return res.status(500).json({ error: '预测提交失败，请重试' })
    }

    res.status(201).json({
      message: '预测成功',
      prediction: {
        id: results[0].lastId,
        matchId,
        predictedHomeScore,
        predictedAwayScore,
        predictedResult
      }
    })
  } catch (error) {
    next(error)
  }
})

// Update prediction
router.put('/:id', authenticateToken, (req, res, next) => {
  try {
    const { predictedHomeScore, predictedAwayScore, predictedResult } = req.body

    const prediction = dbGet(
      'SELECT p.*, m.status FROM predictions p JOIN matches m ON p.match_id = m.id WHERE p.id = ? AND p.user_id = ?',
      [req.params.id, req.user.id]
    )

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' })
    }

    if (prediction.status !== 'upcoming') {
      return res.status(400).json({ error: 'Cannot modify prediction after match started' })
    }

    dbRun(`
      UPDATE predictions 
      SET predicted_home_score = ?, predicted_away_score = ?, predicted_result = ?
      WHERE id = ?
    `, [predictedHomeScore, predictedAwayScore, predictedResult, req.params.id])

    res.json({ message: 'Prediction updated successfully' })
  } catch (error) {
    next(error)
  }
})

// Delete prediction
router.delete('/:id', authenticateToken, (req, res, next) => {
  try {
    const prediction = dbGet(
      'SELECT p.*, m.status FROM predictions p JOIN matches m ON p.match_id = m.id WHERE p.id = ? AND p.user_id = ?',
      [req.params.id, req.user.id]
    )

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' })
    }

    if (prediction.status !== 'upcoming') {
      return res.status(400).json({ error: 'Cannot delete prediction after match started' })
    }

    dbRun('DELETE FROM predictions WHERE id = ?', [req.params.id])

    res.json({ message: 'Prediction deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
