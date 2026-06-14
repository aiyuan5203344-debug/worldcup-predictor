import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database/worldcup.db')

let db = null

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export const initDatabase = async () => {
  const SQL = await initSqlJs()

  // Ensure database directory exists
  const dbDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      nickname TEXT,
      password_hash TEXT NOT NULL,
      avatar TEXT DEFAULT '/avatars/default.png',
      points INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user',
      email_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY,
      external_id TEXT UNIQUE,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      home_flag TEXT,
      away_flag TEXT,
      home_score INTEGER,
      away_score INTEGER,
      match_time DATETIME,
      status TEXT DEFAULT 'upcoming',
      group_name TEXT,
      stage TEXT,
      venue TEXT,
      predicted_home_score INTEGER,
      predicted_away_score INTEGER,
      predicted_result TEXT,
      ai_confidence INTEGER DEFAULT 50,
      ai_analysis TEXT,
      current_minute INTEGER,
      home_rating INTEGER,
      away_rating INTEGER,
      home_win_prob INTEGER,
      draw_prob INTEGER,
      away_win_prob INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      predicted_home_score INTEGER,
      predicted_away_score INTEGER,
      predicted_result TEXT,
      points_earned INTEGER DEFAULT 0,
      settled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (match_id) REFERENCES matches(id),
      UNIQUE(user_id, match_id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      total_points INTEGER DEFAULT 0,
      correct_predictions INTEGER DEFAULT 0,
      total_predictions INTEGER DEFAULT 0,
      rank INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_type TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, achievement_type)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_type TEXT NOT NULL,
      match_id INTEGER,
      owner_id INTEGER,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES matches(id),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      code TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Audit logs table - 管理员操作日志
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // Teams table - 球队信息
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_cn TEXT,
      flag TEXT,
      confederation TEXT,
      fifa_ranking INTEGER,
      world_cup_titles INTEGER DEFAULT 0,
      strength_rating INTEGER DEFAULT 70,
      market_value TEXT,
      coach TEXT,
      captain TEXT,
      formation TEXT,
      style TEXT,
      key_players TEXT,
      recent_form TEXT,
      injuries TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Players table - 球员信息
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_code TEXT NOT NULL,
      name TEXT NOT NULL,
      name_cn TEXT,
      position TEXT,
      number INTEGER,
      club TEXT,
      age INTEGER,
      market_value TEXT,
      goals INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      caps INTEGER DEFAULT 0,
      is_captain INTEGER DEFAULT 0,
      is_key_player INTEGER DEFAULT 0,
      injury_status TEXT DEFAULT 'fit',
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_code) REFERENCES teams(code)
    )
  `)

  // Token blacklist for JWT refresh token security
  db.run(`
    CREATE TABLE IF NOT EXISTS token_blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // Performance: Add indexes for high-frequency queries
  db.run('CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status)')
  db.run('CREATE INDEX IF NOT EXISTS idx_matches_time ON matches(match_time)')
  db.run('CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team)')
  db.run('CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team)')
  db.run('CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_predictions_user_match ON predictions(user_id, match_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard(total_points DESC)')
  db.run('CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_code)')
  db.run('CREATE INDEX IF NOT EXISTS idx_players_position ON players(position)')
  db.run('CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token)')
  db.run('CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at)')

  saveDatabase()
  console.log('Database initialized successfully')
}

export const saveDatabase = () => {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(DB_PATH, buffer)
  }
}

// Throttled save - batch writes to avoid performance issues
let saveTimeout = null
let pendingSave = false

export const saveDatabaseThrottled = () => {
  if (pendingSave) return
  pendingSave = true
  
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  saveTimeout = setTimeout(() => {
    saveDatabase()
    pendingSave = false
  }, 100) // Batch writes within 100ms window
}

// Force save (for critical operations)
export const forceSaveDatabase = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }
  pendingSave = false
  saveDatabase()
}

// Helper: run query and return all rows
export const dbAll = (query, params = []) => {
  const stmt = db.prepare(query)
  if (params.length > 0) {
    stmt.bind(params)
  }
  const results = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

// Helper: run query and return first row
export const dbGet = (query, params = []) => {
  const stmt = db.prepare(query)
  if (params.length > 0) {
    stmt.bind(params)
  }
  let result = null
  if (stmt.step()) {
    result = stmt.getAsObject()
  }
  stmt.free()
  return result
}

// Helper: run insert/update/delete (with throttled save)
export const dbRun = (query, params = []) => {
  db.run(query, params)
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0] || 0
  const changes = db.getRowsModified()
  saveDatabaseThrottled()
  return { lastId, changes }
}

// Helper: run insert/update/delete (with immediate save for critical ops)
export const dbRunSync = (query, params = []) => {
  db.run(query, params)
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0] || 0
  const changes = db.getRowsModified()
  saveDatabase()
  return { lastId, changes }
}

// Transaction support - 原子操作
export const beginTransaction = () => {
  db.run('BEGIN TRANSACTION')
}

export const commitTransaction = () => {
  db.run('COMMIT')
  saveDatabase()
}

export const rollbackTransaction = () => {
  db.run('ROLLBACK')
}

// Execute multiple operations in a transaction
export const executeTransaction = (operations) => {
  try {
    beginTransaction()
    
    const results = []
    for (const operation of operations) {
      const result = dbRun(operation.query, operation.params)
      results.push(result)
    }
    
    commitTransaction()
    return { success: true, results }
  } catch (error) {
    rollbackTransaction()
    throw error
  }
}

// Token blacklist helpers
export const blacklistToken = (token, userId, expiresAt) => {
  dbRun(
    'INSERT INTO token_blacklist (token, user_id, expires_at) VALUES (?, ?, ?)',
    [token, userId, expiresAt]
  )
}

export const isTokenBlacklisted = (token) => {
  const result = dbGet(
    'SELECT id FROM token_blacklist WHERE token = ?',
    [token]
  )
  return !!result
}

// Clean expired tokens (run periodically)
export const cleanExpiredTokens = () => {
  dbRun('DELETE FROM token_blacklist WHERE expires_at < datetime("now")')
}

// Get database instance for backup
export const getDatabaseInstance = () => db

export default getDatabase
