import jwt from 'jsonwebtoken'
import { dbGet, dbRun } from '../models/database.js'
import logger from '../utils/logger.js'

const onlineUsers = new Map()

// Chat rate limiting for socket - 10 messages per user per minute
const socketRateLimit = new Map()

const checkSocketRateLimit = (userId) => {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxMessages = 10

  if (!socketRateLimit.has(userId)) {
    socketRateLimit.set(userId, [])
  }

  const timestamps = socketRateLimit.get(userId)
  
  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter(t => now - t < windowMs)
  socketRateLimit.set(userId, validTimestamps)

  if (validTimestamps.length >= maxMessages) {
    return false // Rate limit exceeded
  }

  validTimestamps.push(now)
  return true
}

export const setupSocketHandlers = (io) => {
  // 允许可选认证（未登录可查看，但不能发送）
  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      // 未登录用户也可以连接（只读模式）
      socket.user = null
      return next()
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = dbGet('SELECT id, username, avatar FROM users WHERE id = ?', [decoded.userId])

      if (!user) {
        socket.user = null
        return next()
      }

      socket.user = user
      next()
    } catch (error) {
      socket.user = null
      next()
    }
  })

  io.on('connection', (socket) => {
    const username = socket.user?.username || '匿名用户'
    logger.info(`User connected: ${username}`)

    if (socket.user) {
      onlineUsers.set(socket.user.id, {
        id: socket.user.id,
        username: socket.user.username,
        socketId: socket.id
      })
      io.emit('onlineUsers', Array.from(onlineUsers.values()))
    }

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      logger.info(`${username} joined room: ${roomId}`)
      io.to(roomId).emit('userJoined', {
        userId: socket.user?.id,
        username,
        timestamp: new Date().toISOString()
      })
    })

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId)
      logger.info(`${username} left room: ${roomId}`)
      io.to(roomId).emit('userLeft', {
        userId: socket.user?.id,
        username,
        timestamp: new Date().toISOString()
      })
    })

    socket.on('sendMessage', (data) => {
      // 检查是否已登录
      if (!socket.user) {
        return socket.emit('error', { message: '请登录后发言' })
      }

      const { roomId, content, messageType = 'text' } = data

      if (!content || content.trim().length === 0) {
        return socket.emit('error', { message: '消息内容不能为空' })
      }

      if (content.length > 500) {
        return socket.emit('error', { message: '消息过长（最多500字）' })
      }

      // Rate limit check
      if (!checkSocketRateLimit(socket.user.id)) {
        return socket.emit('error', { message: '发送太频繁，请稍后再试（每分钟最多10条消息）' })
      }

      const result = dbRun(`
        INSERT INTO messages (room_id, user_id, content, message_type)
        VALUES (?, ?, ?, ?)
      `, [roomId, socket.user.id, content.trim(), messageType])

      const message = dbGet(`
        SELECT m.*, u.username, u.avatar
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.id = ?
      `, [result.lastId])

      io.to(roomId).emit('newMessage', message)
    })

    socket.on('typing', (roomId) => {
      if (!socket.user) return
      socket.to(roomId).emit('userTyping', {
        userId: socket.user.id,
        username: socket.user.username
      })
    })

    socket.on('stopTyping', (roomId) => {
      if (!socket.user) return
      socket.to(roomId).emit('userStopTyping', {
        userId: socket.user.id,
        username: socket.user.username
      })
    })

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${username}`)
      if (socket.user) {
        onlineUsers.delete(socket.user.id)
        io.emit('onlineUsers', Array.from(onlineUsers.values()))
      }
    })
  })

  setInterval(() => {
    io.emit('heartbeat', { timestamp: Date.now() })
  }, 30000)
}

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.values())
}
