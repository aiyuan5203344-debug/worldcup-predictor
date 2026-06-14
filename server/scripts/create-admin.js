import initSqlJs from 'sql.js'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '../database/worldcup.db')

async function createAdmin() {
  console.log('🔧 正在创建超级管理员账号...\n')

  const SQL = await initSqlJs()

  const dbDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  // Always create fresh database
  let db = new SQL.Database()

  // Create users table with all columns
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      nickname TEXT DEFAULT '',
      password_hash TEXT NOT NULL,
      avatar TEXT DEFAULT '/avatars/default.png',
      points INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create other tables
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

  // Admin credentials from environment variables or defaults
  const adminData = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || Math.random().toString(36).slice(-12),
    nickname: process.env.ADMIN_NICKNAME || '超级管理员',
    role: 'admin'
  }

  // Create admin account
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(adminData.password, salt)

  db.run(
    'INSERT INTO users (username, nickname, password_hash, role) VALUES (?, ?, ?, ?)',
    [adminData.username, adminData.nickname, passwordHash, adminData.role]
  )

  // Save database
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer)

  console.log('✅ 超级管理员账号创建成功！\n')
  console.log('📋 账号信息：')
  console.log('┌─────────────────────────────────────┐')
  console.log(`│ 用户名：${adminData.username}`)
  console.log(`│ 密  码：${adminData.password}`)
  console.log(`│ 昵  称：${adminData.nickname}`)
  console.log(`│ 角  色：${adminData.role}`)
  console.log('└─────────────────────────────────────┘')
  console.log('\n🚀 现在可以使用此账号登录系统！')
}

createAdmin().catch(console.error)
