import { initDatabase, dbRun, dbGet } from './src/models/database.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

async function setupDatabase() {
  console.log('🔧 初始化数据库...')
  
  await initDatabase()
  
  console.log('✅ 数据库表创建完成')
  
  // 创建超级管理员账号（密码随机生成）
  const existingAdmin = dbGet('SELECT id FROM users WHERE username = ?', ['jtnmqlm'])
  
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10)
    const adminPassword = 'WC2026Admin!' + crypto.randomBytes(8).toString('hex')
    const passwordHash = await bcrypt.hash(adminPassword, salt)
    
    dbRun(
      'INSERT INTO users (username, nickname, password_hash, role) VALUES (?, ?, ?, ?)',
      ['jtnmqlm', '超级管理员', passwordHash, 'admin']
    )
    
    console.log('✅ 超级管理员账号创建成功')
    console.log('   用户名: jtnmqlm')
    console.log('   密码: ' + adminPassword)
    console.log('   ⚠️  请保存此密码，重启后将丢失！')
  } else {
    console.log('ℹ️  超级管理员账号已存在')
  }
  
  // 插入示例比赛数据
  const existingMatches = dbGet('SELECT COUNT(*) as count FROM matches')
  
  if (existingMatches.count === 0) {
    const sampleMatches = [
      { home: 'BRA', away: 'ARG', time: '2026-06-11 20:00:00', group: 'A', venue: '墨西哥城体育场' },
      { home: 'FRA', away: 'GER', time: '2026-06-12 18:00:00', group: 'B', venue: '洛杉矶纪念体育场' },
      { home: 'ESP', away: 'ITA', time: '2026-06-13 21:00:00', group: 'C', venue: '纽约大都会球场' },
      { home: 'ENG', away: 'NED', time: '2026-06-14 19:00:00', group: 'D', venue: '多伦多体育场' },
      { home: 'BEL', away: 'POR', time: '2026-06-15 17:00:00', group: 'E', venue: '温哥华体育场' },
      { home: 'JPN', away: 'KOR', time: '2026-06-16 20:00:00', group: 'F', venue: '西雅图体育场' },
      { home: 'USA', away: 'MEX', time: '2026-06-17 21:00:00', group: 'G', venue: '达拉斯体育场' },
      { home: 'AUS', away: 'CAN', time: '2026-06-18 18:00:00', group: 'H', venue: '旧金山体育场' },
      { home: 'CRO', away: 'SRB', time: '2026-06-19 19:00:00', group: 'A', venue: '休斯顿体育场' },
      { home: 'POL', away: 'CHE', time: '2026-06-20 20:00:00', group: 'B', venue: '费城体育场' },
      { home: 'SEN', away: 'MAR', time: '2026-06-21 18:00:00', group: 'C', venue: '波士顿体育场' },
      { home: 'NGA', away: 'GHA', time: '2026-06-22 21:00:00', group: 'D', venue: '亚特兰大体育场' }
    ]
    
    for (const m of sampleMatches) {
      dbRun(
        'INSERT INTO matches (home_team, away_team, match_time, group_name, venue, status) VALUES (?, ?, ?, ?, ?, ?)',
        [m.home, m.away, m.time, m.group, m.venue, 'upcoming']
      )
    }
    
    console.log(`✅ 插入 ${sampleMatches.length} 场示例比赛`)
  } else {
    console.log(`ℹ️  已有 ${existingMatches.count} 场比赛数据`)
  }
  
  console.log('')
  console.log('🎉 数据库初始化完成！')
  console.log('')
  console.log('启动服务器: node src/index.js')
}

setupDatabase().catch(console.error)
