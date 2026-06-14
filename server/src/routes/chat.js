import express from 'express'
import { dbAll, dbGet, dbRun } from '../models/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Get messages for a room
router.get('/:roomId/messages', optionalAuth, (req, res, next) => {
  try {
    const { limit = 50, before } = req.query
    const { roomId } = req.params

    let query = `
      SELECT m.*, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ?
    `
    const params = [roomId]

    if (before) {
      query += ' AND m.id < ?'
      params.push(before)
    }

    query += ' ORDER BY m.created_at DESC LIMIT ?'
    params.push(parseInt(limit))

    const messages = dbAll(query, params)
    res.json({ messages: messages.reverse() })
  } catch (error) {
    next(error)
  }
})

// Send message
router.post('/:roomId/messages', authenticateToken, (req, res, next) => {
  try {
    const { content, messageType = 'text' } = req.body
    const { roomId } = req.params

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' })
    }

    if (content.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 characters)' })
    }

    const result = dbRun(`
      INSERT INTO messages (room_id, user_id, content, message_type)
      VALUES (?, ?, ?, ?)
    `, [roomId, req.user.id, content.trim(), messageType])

    const message = dbGet(`
      SELECT m.*, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [result.lastId])

    res.status(201).json({ message })
  } catch (error) {
    next(error)
  }
})

// Delete message
router.delete('/:roomId/messages/:messageId', authenticateToken, (req, res, next) => {
  try {
    const { messageId } = req.params

    const message = dbGet(
      'SELECT * FROM messages WHERE id = ? AND user_id = ?',
      [messageId, req.user.id]
    )

    if (!message) {
      return res.status(404).json({ error: 'Message not found or not authorized' })
    }

    dbRun('DELETE FROM messages WHERE id = ?', [messageId])
    res.json({ message: 'Message deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
