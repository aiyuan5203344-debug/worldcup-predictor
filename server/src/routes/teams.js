import express from 'express'
import { dbGet, dbAll } from '../models/database.js'

const router = express.Router()

// Get all teams
router.get('/', (req, res) => {
  try {
    const { confederation, search } = req.query
    
    let query = 'SELECT * FROM teams'
    const params = []
    const conditions = []
    
    if (confederation) {
      conditions.push('confederation = ?')
      params.push(confederation)
    }
    
    if (search) {
      conditions.push('(name LIKE ? OR name_cn LIKE ? OR code LIKE ?)')
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' ORDER BY fifa_ranking ASC'
    
    const teams = dbAll(query, params)
    res.json({ teams })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' })
  }
})

// Get team by code
router.get('/:code', (req, res) => {
  try {
    const { code } = req.params
    const team = dbGet('SELECT * FROM teams WHERE code = ?', [code])
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    // Get team players
    const players = dbAll('SELECT * FROM players WHERE team_code = ? ORDER BY number ASC', [code])
    
    // Get squad by position
    const goalkeepers = players.filter(p => p.position === 'GK')
    const defenders = players.filter(p => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p.position))
    const midfielders = players.filter(p => ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.position))
    const forwards = players.filter(p => ['ST', 'CF', 'LW', 'RW'].includes(p.position))
    
    res.json({ 
      team, 
      players,
      squad: {
        goalkeepers,
        defenders,
        midfielders,
        forwards
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' })
  }
})

// Get team players
router.get('/:code/players', (req, res) => {
  try {
    const { code } = req.params
    const { position } = req.query
    
    let query = 'SELECT * FROM players WHERE team_code = ?'
    const params = [code]
    
    if (position) {
      query += ' AND position = ?'
      params.push(position)
    }
    
    query += ' ORDER BY number ASC'
    
    const players = dbAll(query, params)
    res.json({ players })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' })
  }
})

// Get match with team details
router.get('/match/:matchId/preview', (req, res) => {
  try {
    const { matchId } = req.params
    
    const match = dbGet('SELECT * FROM matches WHERE id = ?', [matchId])
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }
    
    const homeTeam = dbGet('SELECT * FROM teams WHERE code = ?', [match.home_team])
    const awayTeam = dbGet('SELECT * FROM teams WHERE code = ?', [match.away_team])
    
    const homePlayers = dbAll('SELECT * FROM players WHERE team_code = ? ORDER BY number ASC', [match.home_team])
    const awayPlayers = dbAll('SELECT * FROM players WHERE team_code = ? ORDER BY number ASC', [match.away_team])
    
    res.json({
      match,
      homeTeam: homeTeam || null,
      awayTeam: awayTeam || null,
      homePlayers,
      awayPlayers
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match preview' })
  }
})

export default router
