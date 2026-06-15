import { dbRun, dbAll, getDatabase } from './src/models/database.js'
import { predictMatch } from './src/utils/aiPrediction.js'

// 2026世界杯完整赛程
const matches = [
  // === 小组赛阶段 ===
  // A组 (6 matches)
  { home_team: 'MEX', away_team: 'KOR', match_time: '2026-06-11 15:00:00', venue: 'Estadio Azteca', group_name: 'A', stage: '小组赛', matchday: 1 },
  { home_team: 'CZE', away_team: 'RSA', match_time: '2026-06-11 19:00:00', venue: 'Estadio BBVA', group_name: 'A', stage: '小组赛', matchday: 1 },
  { home_team: 'MEX', away_team: 'CZE', match_time: '2026-06-17 15:00:00', venue: 'NRG Stadium', group_name: 'A', stage: '小组赛', matchday: 2 },
  { home_team: 'KOR', away_team: 'RSA', match_time: '2026-06-17 19:00:00', venue: 'AT&T Stadium', group_name: 'A', stage: '小组赛', matchday: 2 },
  { home_team: 'MEX', away_team: 'RSA', match_time: '2026-06-23 17:00:00', venue: "Levi's Stadium", group_name: 'A', stage: '小组赛', matchday: 3 },
  { home_team: 'KOR', away_team: 'CZE', match_time: '2026-06-23 17:00:00', venue: 'Lumen Field', group_name: 'A', stage: '小组赛', matchday: 3 },

  // B组
  { home_team: 'CAN', away_team: 'BIH', match_time: '2026-06-11 13:00:00', venue: 'BMO Field', group_name: 'B', stage: '小组赛', matchday: 1 },
  { home_team: 'QAT', away_team: 'CHE', match_time: '2026-06-11 17:00:00', venue: 'BC Place', group_name: 'B', stage: '小组赛', matchday: 1 },
  { home_team: 'CAN', away_team: 'QAT', match_time: '2026-06-17 13:00:00', venue: 'BC Place', group_name: 'B', stage: '小组赛', matchday: 2 },
  { home_team: 'BIH', away_team: 'CHE', match_time: '2026-06-17 17:00:00', venue: 'BMO Field', group_name: 'B', stage: '小组赛', matchday: 2 },
  { home_team: 'CAN', away_team: 'CHE', match_time: '2026-06-23 15:00:00', venue: 'Lumen Field', group_name: 'B', stage: '小组赛', matchday: 3 },
  { home_team: 'BIH', away_team: 'QAT', match_time: '2026-06-23 15:00:00', venue: 'Arrowhead Stadium', group_name: 'B', stage: '小组赛', matchday: 3 },

  // C组
  { home_team: 'BRA', away_team: 'MAR', match_time: '2026-06-12 15:00:00', venue: 'AT&T Stadium', group_name: 'C', stage: '小组赛', matchday: 1 },
  { home_team: 'HAI', away_team: 'SCO', match_time: '2026-06-12 19:00:00', venue: 'NRG Stadium', group_name: 'C', stage: '小组赛', matchday: 1 },
  { home_team: 'BRA', away_team: 'HAI', match_time: '2026-06-18 15:00:00', venue: 'Hard Rock Stadium', group_name: 'C', stage: '小组赛', matchday: 2 },
  { home_team: 'MAR', away_team: 'SCO', match_time: '2026-06-18 19:00:00', venue: 'Mercedes-Benz Stadium', group_name: 'C', stage: '小组赛', matchday: 2 },
  { home_team: 'BRA', away_team: 'SCO', match_time: '2026-06-24 17:00:00', venue: 'MetLife Stadium', group_name: 'C', stage: '小组赛', matchday: 3 },
  { home_team: 'MAR', away_team: 'HAI', match_time: '2026-06-24 17:00:00', venue: 'Gillette Stadium', group_name: 'C', stage: '小组赛', matchday: 3 },

  // D组
  { home_team: 'USA', away_team: 'PAR', match_time: '2026-06-12 13:00:00', venue: 'SoFi Stadium', group_name: 'D', stage: '小组赛', matchday: 1 },
  { home_team: 'AUS', away_team: 'TUR', match_time: '2026-06-12 17:00:00', venue: "Levi's Stadium", group_name: 'D', stage: '小组赛', matchday: 1 },
  { home_team: 'USA', away_team: 'AUS', match_time: '2026-06-18 13:00:00', venue: 'SoFi Stadium', group_name: 'D', stage: '小组赛', matchday: 2 },
  { home_team: 'PAR', away_team: 'TUR', match_time: '2026-06-18 17:00:00', venue: "Levi's Stadium", group_name: 'D', stage: '小组赛', matchday: 2 },
  { home_team: 'USA', away_team: 'TUR', match_time: '2026-06-24 15:00:00', venue: 'Arrowhead Stadium', group_name: 'D', stage: '小组赛', matchday: 3 },
  { home_team: 'PAR', away_team: 'AUS', match_time: '2026-06-24 15:00:00', venue: 'Lumen Field', group_name: 'D', stage: '小组赛', matchday: 3 },

  // E组
  { home_team: 'GER', away_team: 'CUR', match_time: '2026-06-13 13:00:00', venue: 'MetLife Stadium', group_name: 'E', stage: '小组赛', matchday: 1 },
  { home_team: 'CIV', away_team: 'ECU', match_time: '2026-06-13 17:00:00', venue: 'Gillette Stadium', group_name: 'E', stage: '小组赛', matchday: 1 },
  { home_team: 'GER', away_team: 'CIV', match_time: '2026-06-19 13:00:00', venue: 'Lincoln Financial Field', group_name: 'E', stage: '小组赛', matchday: 2 },
  { home_team: 'CUR', away_team: 'ECU', match_time: '2026-06-19 17:00:00', venue: 'Mercedes-Benz Stadium', group_name: 'E', stage: '小组赛', matchday: 2 },
  { home_team: 'GER', away_team: 'ECU', match_time: '2026-06-25 15:00:00', venue: 'Hard Rock Stadium', group_name: 'E', stage: '小组赛', matchday: 3 },
  { home_team: 'CUR', away_team: 'CIV', match_time: '2026-06-25 15:00:00', venue: 'NRG Stadium', group_name: 'E', stage: '小组赛', matchday: 3 },

  // F组
  { home_team: 'NED', away_team: 'JPN', match_time: '2026-06-13 15:00:00', venue: 'NRG Stadium', group_name: 'F', stage: '小组赛', matchday: 1 },
  { home_team: 'SWE', away_team: 'TUN', match_time: '2026-06-13 19:00:00', venue: 'Mercedes-Benz Stadium', group_name: 'F', stage: '小组赛', matchday: 1 },
  { home_team: 'NED', away_team: 'SWE', match_time: '2026-06-19 15:00:00', venue: 'Gillette Stadium', group_name: 'F', stage: '小组赛', matchday: 2 },
  { home_team: 'JPN', away_team: 'TUN', match_time: '2026-06-19 19:00:00', venue: 'Lincoln Financial Field', group_name: 'F', stage: '小组赛', matchday: 2 },
  { home_team: 'NED', away_team: 'TUN', match_time: '2026-06-25 17:00:00', venue: 'MetLife Stadium', group_name: 'F', stage: '小组赛', matchday: 3 },
  { home_team: 'JPN', away_team: 'SWE', match_time: '2026-06-25 17:00:00', venue: 'Arrowhead Stadium', group_name: 'F', stage: '小组赛', matchday: 3 },

  // G组
  { home_team: 'BEL', away_team: 'EGY', match_time: '2026-06-14 13:00:00', venue: 'SoFi Stadium', group_name: 'G', stage: '小组赛', matchday: 1 },
  { home_team: 'IRN', away_team: 'NZL', match_time: '2026-06-14 17:00:00', venue: "Levi's Stadium", group_name: 'G', stage: '小组赛', matchday: 1 },
  { home_team: 'BEL', away_team: 'IRN', match_time: '2026-06-20 13:00:00', venue: 'Lumen Field', group_name: 'G', stage: '小组赛', matchday: 2 },
  { home_team: 'EGY', away_team: 'NZL', match_time: '2026-06-20 17:00:00', venue: 'BC Place', group_name: 'G', stage: '小组赛', matchday: 2 },
  { home_team: 'BEL', away_team: 'NZL', match_time: '2026-06-26 15:00:00', venue: 'AT&T Stadium', group_name: 'G', stage: '小组赛', matchday: 3 },
  { home_team: 'EGY', away_team: 'IRN', match_time: '2026-06-26 15:00:00', venue: 'NRG Stadium', group_name: 'G', stage: '小组赛', matchday: 3 },

  // H组
  { home_team: 'ESP', away_team: 'CPV', match_time: '2026-06-14 15:00:00', venue: 'Mercedes-Benz Stadium', group_name: 'H', stage: '小组赛', matchday: 1 },
  { home_team: 'KSA', away_team: 'URU', match_time: '2026-06-14 19:00:00', venue: 'NRG Stadium', group_name: 'H', stage: '小组赛', matchday: 1 },
  { home_team: 'ESP', away_team: 'KSA', match_time: '2026-06-20 15:00:00', venue: 'AT&T Stadium', group_name: 'H', stage: '小组赛', matchday: 2 },
  { home_team: 'CPV', away_team: 'URU', match_time: '2026-06-20 19:00:00', venue: "Levi's Stadium", group_name: 'H', stage: '小组赛', matchday: 2 },
  { home_team: 'ESP', away_team: 'URU', match_time: '2026-06-26 17:00:00', venue: 'SoFi Stadium', group_name: 'H', stage: '小组赛', matchday: 3 },
  { home_team: 'CPV', away_team: 'KSA', match_time: '2026-06-26 17:00:00', venue: 'Lumen Field', group_name: 'H', stage: '小组赛', matchday: 3 },

  // I组
  { home_team: 'FRA', away_team: 'SEN', match_time: '2026-06-15 15:00:00', venue: 'Hard Rock Stadium', group_name: 'I', stage: '小组赛', matchday: 1 },
  { home_team: 'IRQ', away_team: 'NOR', match_time: '2026-06-15 19:00:00', venue: 'Mercedes-Benz Stadium', group_name: 'I', stage: '小组赛', matchday: 1 },
  { home_team: 'FRA', away_team: 'IRQ', match_time: '2026-06-21 15:00:00', venue: 'NRG Stadium', group_name: 'I', stage: '小组赛', matchday: 2 },
  { home_team: 'SEN', away_team: 'NOR', match_time: '2026-06-21 19:00:00', venue: 'AT&T Stadium', group_name: 'I', stage: '小组赛', matchday: 2 },
  { home_team: 'FRA', away_team: 'NOR', match_time: '2026-06-27 17:00:00', venue: "Levi's Stadium", group_name: 'I', stage: '小组赛', matchday: 3 },
  { home_team: 'SEN', away_team: 'IRQ', match_time: '2026-06-27 17:00:00', venue: 'Lumen Field', group_name: 'I', stage: '小组赛', matchday: 3 },

  // J组
  { home_team: 'ARG', away_team: 'ALG', match_time: '2026-06-15 13:00:00', venue: 'MetLife Stadium', group_name: 'J', stage: '小组赛', matchday: 1 },
  { home_team: 'AUT', away_team: 'JOR', match_time: '2026-06-15 17:00:00', venue: 'Gillette Stadium', group_name: 'J', stage: '小组赛', matchday: 1 },
  { home_team: 'ARG', away_team: 'AUT', match_time: '2026-06-21 13:00:00', venue: 'Lincoln Financial Field', group_name: 'J', stage: '小组赛', matchday: 2 },
  { home_team: 'ALG', away_team: 'JOR', match_time: '2026-06-21 17:00:00', venue: 'BC Place', group_name: 'J', stage: '小组赛', matchday: 2 },
  { home_team: 'ARG', away_team: 'JOR', match_time: '2026-06-27 15:00:00', venue: 'Hard Rock Stadium', group_name: 'J', stage: '小组赛', matchday: 3 },
  { home_team: 'ALG', away_team: 'AUT', match_time: '2026-06-27 15:00:00', venue: 'Gillette Stadium', group_name: 'J', stage: '小组赛', matchday: 3 },

  // K组
  { home_team: 'POR', away_team: 'COD', match_time: '2026-06-16 13:00:00', venue: 'AT&T Stadium', group_name: 'K', stage: '小组赛', matchday: 1 },
  { home_team: 'UZB', away_team: 'COL', match_time: '2026-06-16 17:00:00', venue: 'NRG Stadium', group_name: 'K', stage: '小组赛', matchday: 1 },
  { home_team: 'POR', away_team: 'UZB', match_time: '2026-06-22 13:00:00', venue: 'MetLife Stadium', group_name: 'K', stage: '小组赛', matchday: 2 },
  { home_team: 'COD', away_team: 'COL', match_time: '2026-06-22 17:00:00', venue: 'SoFi Stadium', group_name: 'K', stage: '小组赛', matchday: 2 },
  { home_team: 'POR', away_team: 'COL', match_time: '2026-06-28 17:00:00', venue: 'Mercedes-Benz Stadium', group_name: 'K', stage: '小组赛', matchday: 3 },
  { home_team: 'COD', away_team: 'UZB', match_time: '2026-06-28 17:00:00', venue: 'Arrowhead Stadium', group_name: 'K', stage: '小组赛', matchday: 3 },

  // L组
  { home_team: 'ENG', away_team: 'CRO', match_time: '2026-06-16 15:00:00', venue: 'SoFi Stadium', group_name: 'L', stage: '小组赛', matchday: 1 },
  { home_team: 'GHA', away_team: 'PAN', match_time: '2026-06-16 19:00:00', venue: "Levi's Stadium", group_name: 'L', stage: '小组赛', matchday: 1 },
  { home_team: 'ENG', away_team: 'GHA', match_time: '2026-06-22 15:00:00', venue: 'Lumen Field', group_name: 'L', stage: '小组赛', matchday: 2 },
  { home_team: 'CRO', away_team: 'PAN', match_time: '2026-06-22 19:00:00', venue: 'BC Place', group_name: 'L', stage: '小组赛', matchday: 2 },
  { home_team: 'ENG', away_team: 'PAN', match_time: '2026-06-28 15:00:00', venue: 'Hard Rock Stadium', group_name: 'L', stage: '小组赛', matchday: 3 },
  { home_team: 'CRO', away_team: 'GHA', match_time: '2026-06-28 15:00:00', venue: 'Gillette Stadium', group_name: 'L', stage: '小组赛', matchday: 3 },

  // === 淘汰赛阶段 ===

  // 1/16决赛 (Round of 32)
  { home_team: '1A', away_team: '3BEF', match_time: '2026-06-29 17:00:00', venue: 'SoFi Stadium', group_name: null, stage: '1/16决赛' },
  { home_team: '2C', away_team: '2D', match_time: '2026-06-29 21:00:00', venue: 'AT&T Stadium', group_name: null, stage: '1/16决赛' },
  { home_team: '1E', away_team: '3FIJ', match_time: '2026-06-30 17:00:00', venue: 'NRG Stadium', group_name: null, stage: '1/16决赛' },
  { home_team: '2G', away_team: '2H', match_time: '2026-06-30 21:00:00', venue: 'MetLife Stadium', group_name: null, stage: '1/16决赛' },
  { home_team: '1I', away_team: '3JKL', match_time: '2026-07-01 17:00:00', venue: 'Hard Rock Stadium', group_name: null, stage: '1/16决赛' },
  { home_team: '2K', away_team: '2L', match_time: '2026-07-01 21:00:00', venue: 'Mercedes-Benz Stadium', group_name: null, stage: '1/16决赛' },
  { home_team: '1B', away_team: '3ACD', match_time: '2026-07-02 17:00:00', venue: 'Lincoln Financial Field', group_name: null, stage: '1/16决赛' },
  { home_team: '2E', away_team: '2F', match_time: '2026-07-02 21:00:00', venue: 'Gillette Stadium', group_name: null, stage: '1/16决赛' },
  { home_team: '1D', away_team: '3GHI', match_time: '2026-07-03 17:00:00', venue: "Levi's Stadium", group_name: null, stage: '1/16决赛' },
  { home_team: '2A', away_team: '2B', match_time: '2026-07-03 21:00:00', venue: 'Lumen Field', group_name: null, stage: '1/16决赛' },
  { home_team: '1F', away_team: '3EGH', match_time: '2026-07-04 17:00:00', venue: 'BC Place', group_name: null, stage: '1/16决赛' },
  { home_team: '2I', away_team: '2J', match_time: '2026-07-04 21:00:00', venue: 'BMO Field', group_name: null, stage: '1/16决赛' },
  { home_team: '1C', away_team: '3DKL', match_time: '2026-07-05 17:00:00', venue: 'Arrowhead Stadium', group_name: null, stage: '1/16决赛' },
  { home_team: '2E', away_team: '2F', match_time: '2026-07-05 21:00:00', venue: 'Estadio Azteca', group_name: null, stage: '1/16决赛' },
  { home_team: '1H', away_team: '3AIJ', match_time: '2026-07-06 17:00:00', venue: 'Estadio BBVA', group_name: null, stage: '1/16决赛' },
  { home_team: '2C', away_team: '2D', match_time: '2026-07-06 21:00:00', venue: 'Estadio Akron', group_name: null, stage: '1/16决赛' },

  // 1/8决赛 (Round of 16)
  { home_team: 'W49', away_team: 'W50', match_time: '2026-07-07 20:00:00', venue: 'AT&T Stadium', group_name: null, stage: '1/8决赛' },
  { home_team: 'W51', away_team: 'W52', match_time: '2026-07-08 20:00:00', venue: 'SoFi Stadium', group_name: null, stage: '1/8决赛' },
  { home_team: 'W53', away_team: 'W54', match_time: '2026-07-09 20:00:00', venue: 'NRG Stadium', group_name: null, stage: '1/8决赛' },
  { home_team: 'W55', away_team: 'W56', match_time: '2026-07-10 20:00:00', venue: 'MetLife Stadium', group_name: null, stage: '1/8决赛' },
  { home_team: 'W57', away_team: 'W58', match_time: '2026-07-11 20:00:00', venue: 'Mercedes-Benz Stadium', group_name: null, stage: '1/8决赛' },
  { home_team: 'W59', away_team: 'W60', match_time: '2026-07-12 20:00:00', venue: "Levi's Stadium", group_name: null, stage: '1/8决赛' },
  { home_team: 'W61', away_team: 'W62', match_time: '2026-07-13 20:00:00', venue: 'Hard Rock Stadium', group_name: null, stage: '1/8决赛' },
  { home_team: 'W63', away_team: 'W64', match_time: '2026-07-14 20:00:00', venue: 'Lumen Field', group_name: null, stage: '1/8决赛' },

  // 1/4决赛
  { home_team: 'W65', away_team: 'W66', match_time: '2026-07-11 20:00:00', venue: 'MetLife Stadium', group_name: null, stage: '1/4决赛' },
  { home_team: 'W67', away_team: 'W68', match_time: '2026-07-12 20:00:00', venue: 'SoFi Stadium', group_name: null, stage: '1/4决赛' },
  { home_team: 'W69', away_team: 'W70', match_time: '2026-07-13 20:00:00', venue: 'AT&T Stadium', group_name: null, stage: '1/4决赛' },
  { home_team: 'W71', away_team: 'W72', match_time: '2026-07-14 20:00:00', venue: 'NRG Stadium', group_name: null, stage: '1/4决赛' },

  // 半决赛
  { home_team: 'W73', away_team: 'W74', match_time: '2026-07-15 20:00:00', venue: 'MetLife Stadium', group_name: null, stage: '半决赛' },
  { home_team: 'W75', away_team: 'W76', match_time: '2026-07-16 20:00:00', venue: 'SoFi Stadium', group_name: null, stage: '半决赛' },

  // 季军赛
  { home_team: 'L77', away_team: 'L78', match_time: '2026-07-18 17:00:00', venue: 'Hard Rock Stadium', group_name: null, stage: '季军赛' },

  // 决赛
  { home_team: 'W77', away_team: 'W78', match_time: '2026-07-19 15:00:00', venue: 'MetLife Stadium', group_name: null, stage: '决赛' },
]

const seedMatches = async () => {
  try {
    console.log('🤖 Seeding matches with AI-powered predictions...')
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      
      try {
        // Get team data
        const homeTeam = dbAll('SELECT * FROM teams WHERE code = ?', [match.home_team])[0]
        const awayTeam = dbAll('SELECT * FROM teams WHERE code = ?', [match.away_team])[0]
        
        if (!homeTeam || !awayTeam) {
          console.warn(`⚠️ Team not found: ${match.home_team} vs ${match.away_team}`)
          errorCount++
          continue
        }
        
        // Get players
        const homePlayers = dbAll('SELECT * FROM players WHERE team_code = ?', [match.home_team])
        const awayPlayers = dbAll('SELECT * FROM players WHERE team_code = ?', [match.away_team])
        
        // Run AI prediction
        const prediction = predictMatch(match, homeTeam, awayTeam, homePlayers, awayPlayers)
        
        // Insert match with prediction
        dbRun(`
          INSERT OR REPLACE INTO matches (home_team, away_team, match_time, venue, group_name, stage, status, 
            predicted_home_score, predicted_away_score, predicted_result, ai_confidence, ai_analysis,
            home_rating, away_rating, home_win_prob, draw_prob, away_win_prob)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          match.home_team, match.away_team, match.match_time, match.venue,
          match.group_name, match.stage, 'upcoming',
          prediction.predicted_home_score, prediction.predicted_away_score, prediction.predicted_result,
          prediction.ai_confidence, prediction.ai_analysis,
          prediction.home_rating, prediction.away_rating,
          prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob
        ])
        
        successCount++
        
        // Log progress every 10 matches
        if ((i + 1) % 10 === 0) {
          console.log(`  ⚽ Processed ${i + 1}/${matches.length} matches...`)
        }
        
      } catch (error) {
        console.error(`❌ Error processing match ${match.home_team} vs ${match.away_team}:`, error.message)
        errorCount++
      }
    }
    
    console.log(`✅ Matches seeded: ${successCount} success, ${errorCount} errors`)
    
    // Print sample prediction
    if (successCount > 0) {
      const sampleMatch = dbAll('SELECT * FROM matches WHERE ai_analysis IS NOT NULL LIMIT 1')[0]
      if (sampleMatch) {
        console.log('\n📊 Sample AI Prediction:')
        console.log(`  ${sampleMatch.home_team} vs ${sampleMatch.away_team}`)
        console.log(`  Predicted Score: ${sampleMatch.predicted_home_score}-${sampleMatch.predicted_away_score}`)
        console.log(`  Confidence: ${sampleMatch.ai_confidence}%`)
        console.log(`  Home Win: ${sampleMatch.home_win_prob}% | Draw: ${sampleMatch.draw_prob}% | Away Win: ${sampleMatch.away_win_prob}%`)
        console.log(`  Analysis: ${sampleMatch.ai_analysis?.substring(0, 100)}...`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error seeding matches:', error)
  }
}

export default seedMatches
