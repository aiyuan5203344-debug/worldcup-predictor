import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config()

// Import and validate config
import { validateEnv, config } from './config.js'
validateEnv()

// Import logger
import logger, { requestLogger, errorLogger } from './utils/logger.js'

// Import routes
import authRoutes from './routes/auth.js'
import matchRoutes from './routes/matches.js'
import predictionRoutes from './routes/predictions.js'
import leaderboardRoutes from './routes/leaderboard.js'
import chatRoutes from './routes/chat.js'
import adminRoutes from './routes/admin.js'
import teamRoutes from './routes/teams.js'
import worldcupRoutes from './routes/worldcup.js'
import achievementRoutes from './routes/achievements.js'
import checkinRoutes from './routes/checkin.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'

// Import socket handlers
import { setupSocketHandlers } from './socket/index.js'

// Import live simulator
const { startLiveSimulator } = await import('../mock/live-simulator.js')

// Import database initialization
import { initDatabase, getDatabase, getDatabaseInstance, saveDatabase, cleanExpiredTokens } from './models/database.js'

// Import seed function
import seedTeamsAndPlayers from '../seed-teams.js'
import seedMatches from '../seed-matches.js'

// Create Express app
const app = express()
const httpServer = createServer(app)

// CORS configuration with multiple domain support
const corsOrigins = config.corsOrigin
  ? config.corsOrigin.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000']

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  } : false,
  crossOriginEmbedderPolicy: false
}))

// Request logging
app.use(morgan(config.isProduction ? 'combined' : 'dev'))

// Cookie parser (must be before CORS and auth middleware)
app.use(cookieParser())

// Request logging (must be early in middleware chain)
app.use(requestLogger)

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)

    // In production, disallow wildcard
    if (config.isProduction && corsOrigins.includes('*')) {
      return callback(new Error('Production CORS cannot use wildcard'))
    }

    if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
      callback(null, true)
    } else {
      callback(new Error('不允许的CORS来源'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // Preflight cache for 24 hours
}))
app.use(express.json())

// Request timeout middleware (30s)
app.use((req, res, next) => {
  const timeout = 30000 // 30 seconds
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ error: '请求超时，请重试' })
    }
  }, timeout)
  
  res.on('finish', () => clearTimeout(timer))
  res.on('close', () => clearTimeout(timer))
  next()
})

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/predictions', predictionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/worldcup', worldcupRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/checkin', checkinRoutes)

// Health check
app.get('/api/health', (req, res) => {
  try {
    // Check database connection
    const db = getDatabase()
    const dbStatus = db ? 'connected' : 'disconnected'
    
    // Get basic stats
    const userCount = db.exec('SELECT COUNT(*) as count FROM users')[0]?.values[0][0] || 0
    const matchCount = db.exec('SELECT COUNT(*) as count FROM matches')[0]?.values[0][0] || 0
    const predictionCount = db.exec('SELECT COUNT(*) as count FROM predictions')[0]?.values[0][0] || 0
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: {
        status: dbStatus,
        users: userCount,
        matches: matchCount,
        predictions: predictionCount
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Serve static files in production
if (config.isProduction) {
  const clientDistPath = path.join(process.cwd(), '..', 'client', 'dist')
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath))
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'))
    })
  }
}

// Error handling middleware
app.use(errorHandler)

// Setup socket handlers
setupSocketHandlers(io)

// Database backup function
const BACKUP_DIR = path.join(process.cwd(), 'backups')
const MAX_BACKUPS = 7 // Keep 7 days of backups

const createBackup = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    const db = getDatabaseInstance()
    const data = db.export()
    const buffer = Buffer.from(data)
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(BACKUP_DIR, `worldcup-${timestamp}.db`)
    
    fs.writeFileSync(backupPath, buffer)
    logger.info(`✅ Database backup created: ${backupPath}`)
    
    // Clean old backups
    cleanOldBackups()
    
    return backupPath
  } catch (error) {
    logger.error('❌ Database backup failed:', error)
    return null
  }
}

// Clean old backups (keep last 7 days)
const cleanOldBackups = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('worldcup-') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
      }))
      .sort((a, b) => b.time - a.time)
    
    // Keep only last MAX_BACKUPS files
    if (files.length > MAX_BACKUPS) {
      files.slice(MAX_BACKUPS).forEach(f => {
        fs.unlinkSync(f.path)
        logger.info(`🗑️ Deleted old backup: ${f.name}`)
      })
    }
  } catch (error) {
    logger.error('❌ Clean old backups failed:', error)
  }
}

// Schedule daily backup at 2:00 AM
const scheduleBackup = () => {
  const now = new Date()
  const nextBackup = new Date(now)
  nextBackup.setHours(2, 0, 0, 0)
  if (nextBackup <= now) {
    nextBackup.setDate(nextBackup.getDate() + 1)
  }
  
  const delay = nextBackup.getTime() - now.getTime()
  logger.info(`⏰ Next database backup scheduled at: ${nextBackup.toLocaleString()}`)
  
  setTimeout(() => {
    createBackup()
    // Then schedule every 24 hours
    setInterval(createBackup, 24 * 60 * 60 * 1000)
  }, delay)
}

// Schedule token cleanup every hour
const scheduleTokenCleanup = () => {
  setInterval(() => {
    cleanExpiredTokens()
    logger.info('🧹 Cleaned expired tokens from blacklist')
  }, 60 * 60 * 1000) // Every hour
}

// Graceful shutdown
let isShuttingDown = false

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return
  isShuttingDown = true
  
  logger.info(`\n🛑 Received ${signal}. Starting graceful shutdown...`)
  
  // Stop accepting new connections
  httpServer.close(() => {
    logger.info('✅ HTTP server closed')
  })
  
  // Close Socket.io connections
  io.close(() => {
    logger.info('✅ Socket.io closed')
  })
  
  // Save database before exit
  try {
    saveDatabase()
    logger.info('✅ Database saved')
  } catch (error) {
    logger.error('❌ Error saving database:', error)
  }
  
  // Create final backup
  createBackup()
  
  logger.info('👋 Server shut down gracefully')
  process.exit(0)
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
})

// Initialize database and start server
initDatabase().then(async () => {
  // Seed teams and players data
  await seedTeamsAndPlayers()
  
  // Seed matches with AI predictions
  await seedMatches()
  
  // Create initial backup
  createBackup()
  
  // Schedule daily backups
  scheduleBackup()
  
  // Schedule token cleanup
  scheduleTokenCleanup()
  
  httpServer.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port}`)
    logger.info(`📊 Environment: ${config.nodeEnv}`)
    logger.info(`💾 Database backups: ${BACKUP_DIR}`)
    logger.info(`⚽ 65 matches with AI predictions loaded`)
    
    // Start live match simulator
    const db = getDatabaseInstance()
    startLiveSimulator(io, db)
    logger.info(`🎮 Live match simulator started`)
  })
}).catch((err) => {
  logger.error('Failed to initialize database:', err)
  process.exit(1)
})

export { app, io }
