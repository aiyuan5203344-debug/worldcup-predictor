import express from 'express'
import { dbAll, dbGet, dbRun } from '../models/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Chat rate limiting - 10 messages per user per minute per room
const chatRateLimit = new Map()

const checkChatRateLimit = (userId, roomId) => {
  const key = `${userId}:${roomId}`
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxMessages = 10

  if (!chatRateLimit.has(key)) {
    chatRateLimit.set(key, [])
  }

  const timestamps = chatRateLimit.get(key)
  
  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter(t => now - t < windowMs)
  chatRateLimit.set(key, validTimestamps)

  if (validTimestamps.length >= maxMessages) {
    return false // Rate limit exceeded
  }

  validTimestamps.push(now)
  return true
}

// Cleanup old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of chatRateLimit.entries()) {
    const validTimestamps = timestamps.filter(t => now - t < 60000)
    if (validTimestamps.length === 0) {
      chatRateLimit.delete(key)
    } else {
      chatRateLimit.set(key, validTimestamps)
    }
  }
}, 5 * 60 * 1000)

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

    // Rate limit check
    if (!checkChatRateLimit(req.user.id, roomId)) {
      return res.status(429).json({ error: '发送太频繁，请稍后再试（每分钟最多10条消息）' })
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
