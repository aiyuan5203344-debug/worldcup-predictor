import express from 'express'
import { dbAll, dbGet, dbRun } from '../models/database.js'
import { optionalAuth } from '../middleware/auth.js'
import { getOdds } from '../../mock/odds.js'

const router = express.Router()

// Get all matches with AI predictions
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const { status, group, stage, limit = 50, offset = 0 } = req.query

    let query = `
      SELECT m.*, 
             t1.flag as home_flag, t1.name_cn as home_name_cn, t1.strength_rating as home_rating,
             t2.flag as away_flag, t2.name_cn as away_name_cn, t2.strength_rating as away_rating
      FROM matches m
      LEFT JOIN teams t1 ON m.home_team = t1.code
      LEFT JOIN teams t2 ON m.away_team = t2.code
      WHERE 1=1
    `
    const params = []

    if (status) {
      query += ' AND m.status = ?'
      params.push(status)
    }

    if (group) {
      query += ' AND m.group_name = ?'
      params.push(group)
    }

    if (stage) {
      query += ' AND m.stage = ?'
      params.push(stage)
    }

    query += ' ORDER BY m.match_time ASC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))

    const matches = dbAll(query, params)
    res.json({ matches })
  } catch (error) {
    next(error)
  }
})

// Get live matches with real-time updates
router.get('/live', optionalAuth, (req, res, next) => {
  try {
    const matches = dbAll(`
      SELECT m.*, 
             t1.flag as home_flag, t1.name_cn as home_name_cn,
             t2.flag as away_flag, t2.name_cn as away_name_cn
      FROM matches m
      LEFT JOIN teams t1 ON m.home_team = t1.code
      LEFT JOIN teams t2 ON m.away_team = t2.code
      WHERE m.status = 'live' 
      ORDER BY m.match_time ASC
    `)
    res.json({ matches })
  } catch (error) {
    next(error)
  }
})

// Get match by ID with full details
router.get('/:id', optionalAuth, (req, res, next) => {
  try {
    const match = dbGet(`
      SELECT m.*, 
             t1.flag as home_flag, t1.name_cn as home_name_cn, t1.strength_rating as home_rating,
             t1.formation as home_formation, t1.style as home_style, t1.key_players as home_key_players,
             t2.flag as away_flag, t2.name_cn as away_name_cn, t2.strength_rating as away_rating,
             t2.formation as away_formation, t2.style as away_style, t2.key_players as away_key_players
      FROM matches m
      LEFT JOIN teams t1 ON m.home_team = t1.code
      LEFT JOIN teams t2 ON m.away_team = t2.code
      WHERE m.id = ?
    `, [req.params.id])
    
    if (!match) {
      return res.status(404).json({ error: '比赛不存在' })
    }

    // Get team players
    const homePlayers = dbAll('SELECT * FROM players WHERE team_code = ?', [match.home_team])
    const awayPlayers = dbAll('SELECT * FROM players WHERE team_code = ?', [match.away_team])

    res.json({ 
      match: {
        ...match,
        home_players: homePlayers,
        away_players: awayPlayers
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get matches by date
router.get('/date/:date', optionalAuth, (req, res, next) => {
  try {
    const matches = dbAll(`
      SELECT m.*, 
             t1.flag as home_flag, t1.name_cn as home_name_cn,
             t2.flag as away_flag, t2.name_cn as away_name_cn
      FROM matches m
      LEFT JOIN teams t1 ON m.home_team = t1.code
      LEFT JOIN teams t2 ON m.away_team = t2.code
      WHERE DATE(m.match_time) = DATE(?) 
      ORDER BY m.match_time ASC
    `, [req.params.date])
    res.json({ matches })
  } catch (error) {
    next(error)
  }
})

// Get matches by group
router.get('/group/:group', optionalAuth, (req, res, next) => {
  try {
    const matches = dbAll(`
      SELECT m.*, 
             t1.flag as home_flag, t1.name_cn as home_name_cn,
             t2.flag as away_flag, t2.name_cn as away_name_cn
      FROM matches m
      LEFT JOIN teams t1 ON m.home_team = t1.code
      LEFT JOIN teams t2 ON m.away_team = t2.code
      WHERE m.group_name = ? 
      ORDER BY m.match_time ASC
    `, [req.params.group])
    res.json({ matches })
  } catch (error) {
    next(error)
  }
})

// Get matches by stage (淘汰赛)
router.get('/stage/:stage', optionalAuth, (req, res, next) => {
  try {
    const matches = dbAll(`
      SELECT m.*, 
             t1.flag as home_flag, t1.name_cn as home_name_cn,
             t2.flag as away_flag, t2.name_cn as away_name_cn
      FROM matches m
      LEFT JOIN teams t1 ON m.home_team = t1.code
      LEFT JOIN teams t2 ON m.away_team = t2.code
      WHERE m.stage = ? 
      ORDER BY m.match_time ASC
    `, [req.params.stage])
    res.json({ matches })
  } catch (error) {
    next(error)
  }
})

// Get AI prediction for a match
router.get('/:id/prediction', optionalAuth, (req, res, next) => {
  try {
    const match = dbGet('SELECT * FROM matches WHERE id = ?', [req.params.id])
    if (!match) {
      return res.status(404).json({ error: '比赛不存在' })
    }

    // Get team strengths
    const homeTeam = dbGet('SELECT * FROM teams WHERE code = ?', [match.home_team])
    const awayTeam = dbGet('SELECT * FROM teams WHERE code = ?', [match.away_team])

    // AI prediction analysis
    const homeStrength = homeTeam?.strength_rating || 75
    const awayStrength = awayTeam?.strength_rating || 75
    const strengthDiff = homeStrength - awayStrength

    // Predict based on strength difference
    let homeWinProb = 50 + strengthDiff * 0.5
    let drawProb = 25 - Math.abs(strengthDiff) * 0.3
    let awayWinProb = 100 - homeWinProb - drawProb

    // Ensure probabilities are valid
    homeWinProb = Math.max(5, Math.min(90, homeWinProb))
    drawProb = Math.max(10, Math.min(35, drawProb))
    awayWinProb = Math.max(5, Math.min(90, awayWinProb))

    // Normalize
    const total = homeWinProb + drawProb + awayWinProb
    homeWinProb = Math.round(homeWinProb / total * 100)
    drawProb = Math.round(drawProb / total * 100)
    awayWinProb = 100 - homeWinProb - drawProb

    // Predicted score
    const homeGoals = Math.max(0, Math.round((homeStrength / 100) * 2.5 + Math.random() * 0.5))
    const awayGoals = Math.max(0, Math.round((awayStrength / 100) * 2 + Math.random() * 0.5))

    res.json({
      match_id: match.id,
      ai_prediction: {
        home_win: homeWinProb,
        draw: drawProb,
        away_win: awayWinProb,
        predicted_score: `${homeGoals}-${awayGoals}`,
        confidence: match.ai_confidence || 50,
        analysis: match.ai_analysis || 'AI分析中...',
        home_team: {
          code: match.home_team,
          name_cn: homeTeam?.name_cn,
          strength: homeStrength,
          form: homeTeam?.recent_form
        },
        away_team: {
          code: match.away_team,
          name_cn: awayTeam?.name_cn,
          strength: awayStrength,
          form: awayTeam?.recent_form
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get odds for a match (3 virtual bookmakers)
router.get('/:id/odds', optionalAuth, (req, res, next) => {
  try {
    const match = dbGet('SELECT * FROM matches WHERE id = ?', [req.params.id])
    if (!match) {
      return res.status(404).json({ error: '比赛不存在' })
    }

    const odds = getOdds(match)
    res.json({ match_id: match.id, odds })
  } catch (error) {
    next(error)
  }
})

export default router
