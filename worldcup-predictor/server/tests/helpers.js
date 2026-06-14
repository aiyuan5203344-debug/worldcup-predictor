import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { initDatabase, getDatabaseInstance } from '../src/models/database.js'

let app
let server

export async function createTestApp(port = 3099) {
  // Initialize database
  await initDatabase()

  // Create test app
  app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use(cors({ origin: true, credentials: true }))

  // Import and mount routes
  const { default: authRoutes } = await import('../src/routes/auth.js')
  const { default: matchRoutes } = await import('../src/routes/matches.js')
  const { default: predictionRoutes } = await import('../src/routes/predictions.js')
  const { default: leaderboardRoutes } = await import('../src/routes/leaderboard.js')
  const { default: teamRoutes } = await import('../src/routes/teams.js')

  app.use('/api/auth', authRoutes)
  app.use('/api/matches', matchRoutes)
  app.use('/api/predictions', predictionRoutes)
  app.use('/api/leaderboard', leaderboardRoutes)
  app.use('/api/teams', teamRoutes)

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  // Start server
  await new Promise((resolve) => {
    server = app.listen(port, resolve)
  })

  return { app, server, port }
}

export async function closeTestApp() {
  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }
}

export function getBaseUrl(port = 3099) {
  return `http://localhost:${port}`
}
