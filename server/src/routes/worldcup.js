import express from 'express'
import { dbRun, dbGet, dbAll } from '../models/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// API-FOOTBALL configuration (lazy load to ensure dotenv.config() runs first)
const getApiKey = () => process.env.API_FOOTBALL_KEY
const API_FOOTBALL_URL = 'https://v3.football.api-sports.io'

// World Cup 2026 identifiers
const WC_LEAGUE = 1
const WC_SEASON = 2026

// Team code mapping
const TEAM_MAP = {
  'Mexico': 'MEX', 'South Africa': 'RSA', 'Uruguay': 'URU', 'France': 'FRA',
  'Morocco': 'MAR', 'Croatia': 'CRO', 'Brazil': 'BRA', 'Spain': 'ESP',
  'Germany': 'GER', 'Japan': 'JPN', 'England': 'ENG', 'Italy': 'ITA',
  'Argentina': 'ARG', 'Australia': 'AUS', 'Senegal': 'SEN', 'Netherlands': 'NED',
  'Iran': 'IRN', 'USA': 'USA', 'Korea Republic': 'KOR', 'Portugal': 'POR',
  'Canada': 'CAN', 'Belgium': 'BEL', 'Cameroon': 'CMR', 'Serbia': 'SRB',
  'Switzerland': 'CHE', 'Tunisia': 'TUN', 'Chile': 'CHI', 'Peru': 'PER',
  'Ecuador': 'ECU', 'Denmark': 'DEN', 'Ghana': 'GHA', 'Poland': 'POL',
  'Scotland': 'SCO', 'China PR': 'CHN', 'Saudi Arabia': 'KSA', 'Qatar': 'QAT'
}

const getTeamCode = (name) => TEAM_MAP[name] || name?.substring(0, 3).toUpperCase() || 'TBD'

// Map API status to our status
const mapStatus = (s) => {
  const m = { 'NS':'upcoming','1H':'live','HT':'live','2H':'live','ET':'live','P':'live','FT':'finished','AET':'finished','PEN':'finished' }
  return m[s] || 'upcoming'
}

// Call API-FOOTBALL
const callAPI = async (endpoint, params = {}) => {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API_KEY_NOT_CONFIGURED')
  
  const qs = new URLSearchParams({ league: WC_LEAGUE, season: WC_SEASON, ...params }).toString()
  const res = await fetch(`${API_FOOTBALL_URL}${endpoint}?${qs}`, {
    headers: { 'x-apisports-key': apiKey }
  })
  
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// Sync matches from API-FOOTBALL
router.post('/sync', authenticateToken, async (req, res) => {
  // Only admin can sync
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' })
  }

  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      return res.status(400).json({ 
        error: '请先配置API密钥',
        message: '在 server/.env 文件中设置 API_FOOTBALL_KEY'
      })
    }

    logger.info('🔄 Syncing World Cup data...')
    const data = await callAPI('/fixtures')
    
    if (!data.response?.length) {
      return res.status(404).json({ error: '未找到比赛数据' })
    }

    let synced = 0, updated = 0

    for (const f of data.response) {
      const { fixture, teams, goals, league } = f
      const homeCode = teams.home.code || getTeamCode(teams.home.name)
      const awayCode = teams.away.code || getTeamCode(teams.away.name)
      
      const existing = dbGet(
        'SELECT id FROM matches WHERE external_id = ?', [fixture.id.toString()]
      )

      if (existing) {
        dbRun(`UPDATE matches SET home_score=?, away_score=?, status=?, current_minute=?,
               home_flag=?, away_flag=?, venue=?, updated_at=CURRENT_TIMESTAMP
               WHERE external_id=?`,
          [goals.home, goals.away, mapStatus(fixture.status?.short), fixture.status?.elapsed,
           teams.home.logo, teams.away.logo, fixture.venue?.name, fixture.id.toString()])
        updated++
      } else {
        dbRun(`INSERT INTO matches (external_id,home_team,away_team,
               home_flag,away_flag,home_score,away_score,match_time,status,group_name,stage,venue,current_minute)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [fixture.id.toString(), homeCode, awayCode,
           teams.home.logo, teams.away.logo, goals.home, goals.away, fixture.date,
           mapStatus(fixture.status?.short), league.round?.replace('Group ',''),
           league.round?.includes('Group') ? '小组赛' : league.round,
           fixture.venue?.name, fixture.status?.elapsed])
        synced++
      }
    }

    logger.info(`✅ Sync: ${synced} new, ${updated} updated`)
    res.json({ message: '同步完成', synced, updated, total: data.response.length })
  } catch (error) {
    logger.error('❌ Sync error:', error.message)
    if (error.message === 'API_KEY_NOT_CONFIGURED') {
      res.status(400).json({ error: '请先配置API密钥', message: '在 server/.env 中设置 API_FOOTBALL_KEY' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

// Get all matches
router.get('/matches', async (req, res) => {
  try {
    const matches = dbAll("SELECT * FROM matches ORDER BY match_time")
    res.json({ matches, total: matches.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get live matches
router.get('/live', async (req, res) => {
  try {
    const matches = dbAll("SELECT * FROM matches WHERE status='live' ORDER BY match_time")
    res.json({ matches })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get standings
router.get('/standings', async (req, res) => {
  try {
    const matches = dbAll("SELECT * FROM matches WHERE status='finished'")
    const teams = {}
    
    for (const m of matches) {
      if (m.home_score == null || m.away_score == null) continue
      for (const [key, gf, ga] of [[m.home_team, m.home_score, m.away_score], [m.away_team, m.away_score, m.home_score]]) {
        if (!teams[key]) teams[key] = { team: key, p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }
        teams[key].p++
        teams[key].gf += gf
        teams[key].ga += ga
      }
      const h = m.home_score, a = m.away_score
      if (h > a) { teams[m.home_team].w++; teams[m.home_team].pts+=3; teams[m.away_team].l++ }
      else if (h < a) { teams[m.away_team].w++; teams[m.away_team].pts+=3; teams[m.home_team].l++ }
      else { teams[m.home_team].d++; teams[m.away_team].d++; teams[m.home_team].pts++; teams[m.away_team].pts++ }
    }
    
    const standings = Object.values(teams).map(t => ({ ...t, gd: t.gf - t.ga }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    
    res.json({ standings })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Check API status
router.get('/status', (req, res) => {
  const apiKey = getApiKey()
  res.json({ configured: !!apiKey, key: apiKey ? '***' + apiKey.slice(-4) : null })
})

export default router
