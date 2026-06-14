import { dbRun, dbAll, getDatabase } from './src/models/database.js'
import { predictMatch } from './src/utils/aiPrediction.js'

// 2026世界杯完整赛程
const matches = [
  // === 小组赛阶段 ===
  // A组
  { home_team: 'USA', away_team: 'MEX', match_time: '2026-06-11 20:00:00', venue: '墨西哥城阿兹特克体育场', group_name: 'A', stage: '小组赛', matchday: 1 },
  { home_team: 'CAN', away_team: 'CHI', match_time: '2026-06-12 17:00:00', venue: '洛杉矶纪念体育场', group_name: 'A', stage: '小组赛', matchday: 1 },
  { home_team: 'USA', away_team: 'CAN', match_time: '2026-06-17 20:00:00', venue: '达拉斯AT&T体育场', group_name: 'A', stage: '小组赛', matchday: 2 },
  { home_team: 'MEX', away_team: 'CHI', match_time: '2026-06-17 22:00:00', venue: '休斯顿NRG体育场', group_name: 'A', stage: '小组赛', matchday: 2 },
  { home_team: 'MEX', away_team: 'CAN', match_time: '2026-06-22 19:00:00', venue: '旧金山甲骨文球场', group_name: 'A', stage: '小组赛', matchday: 3 },
  { home_team: 'CHI', away_team: 'USA', match_time: '2026-06-22 19:00:00', venue: '西雅图流明球场', group_name: 'A', stage: '小组赛', matchday: 3 },

  // B组
  { home_team: 'BRA', away_team: 'SRB', match_time: '2026-06-12 20:00:00', venue: '纽约大都会人寿球场', group_name: 'B', stage: '小组赛', matchday: 1 },
  { home_team: 'CMR', away_team: 'AUS', match_time: '2026-06-13 16:00:00', venue: '费城林肯金融球场', group_name: 'B', stage: '小组赛', matchday: 1 },
  { home_team: 'BRA', away_team: 'CMR', match_time: '2026-06-18 17:00:00', venue: '波士顿吉列球场', group_name: 'B', stage: '小组赛', matchday: 2 },
  { home_team: 'SRB', away_team: 'AUS', match_time: '2026-06-18 20:00:00', venue: '匹兹堡阿克里舒尔球场', group_name: 'B', stage: '小组赛', matchday: 2 },
  { home_team: 'BRA', away_team: 'AUS', match_time: '2026-06-23 21:00:00', venue: '迈阿密', group_name: 'B', stage: '小组赛', matchday: 3 },
  { home_team: 'SRB', away_team: 'CMR', match_time: '2026-06-23 21:00:00', venue: '亚特兰大梅赛德斯-奔驰球场', group_name: 'B', stage: '小组赛', matchday: 3 },

  // C组
  { home_team: 'ARG', away_team: 'IRN', match_time: '2026-06-13 20:00:00', venue: '芝加哥军人球场', group_name: 'C', stage: '小组赛', matchday: 1 },
  { home_team: 'NED', away_team: 'NGA', match_time: '2026-06-14 17:00:00', venue: '堪萨斯城箭头球场', group_name: 'C', stage: '小组赛', matchday: 1 },
  { home_team: 'ARG', away_team: 'NGA', match_time: '2026-06-19 20:00:00', venue: '洛杉矶玫瑰碗球场', group_name: 'C', stage: '小组赛', matchday: 2 },
  { home_team: 'NED', away_team: 'IRN', match_time: '2026-06-19 23:00:00', venue: '旧金山甲骨文球场', group_name: 'C', stage: '小组赛', matchday: 2 },
  { home_team: 'ARG', away_team: 'NED', match_time: '2026-06-24 20:00:00', venue: '达拉斯AT&T体育场', group_name: 'C', stage: '小组赛', matchday: 3 },
  { home_team: 'IRN', away_team: 'NGA', match_time: '2026-06-24 20:00:00', venue: '波士顿吉列球场', group_name: 'C', stage: '小组赛', matchday: 3 },

  // D组
  { home_team: 'FRA', away_team: 'CHN', match_time: '2026-06-14 20:00:00', venue: '纽约大都会人寿球场', group_name: 'D', stage: '小组赛', matchday: 1 },
  { home_team: 'DEN', away_team: 'TUN', match_time: '2026-06-15 17:00:00', venue: '华盛顿联邦球场', group_name: 'D', stage: '小组赛', matchday: 1 },
  { home_team: 'FRA', away_team: 'TUN', match_time: '2026-06-20 20:00:00', venue: '费城林肯金融球场', group_name: 'D', stage: '小组赛', matchday: 2 },
  { home_team: 'DEN', away_team: 'CHN', match_time: '2026-06-20 23:00:00', venue: '辛辛那提TQL球场', group_name: 'D', stage: '小组赛', matchday: 2 },
  { home_team: 'FRA', away_team: 'DEN', match_time: '2026-06-25 21:00:00', venue: '波士顿吉列球场', group_name: 'D', stage: '小组赛', matchday: 3 },
  { home_team: 'CHN', away_team: 'TUN', match_time: '2026-06-25 21:00:00', venue: '堪萨斯城箭头球场', group_name: 'D', stage: '小组赛', matchday: 3 },

  // E组
  { home_team: 'ESP', away_team: 'URU', match_time: '2026-06-15 20:00:00', venue: '亚特兰大梅赛德斯-奔驰球场', group_name: 'E', stage: '小组赛', matchday: 1 },
  { home_team: 'GER', away_team: 'KOR', match_time: '2026-06-16 17:00:00', venue: '纳什维尔日产球场', group_name: 'E', stage: '小组赛', matchday: 1 },
  { home_team: 'ESP', away_team: 'KOR', match_time: '2026-06-21 17:00:00', venue: '休斯顿NRG体育场', group_name: 'E', stage: '小组赛', matchday: 2 },
  { home_team: 'GER', away_team: 'URU', match_time: '2026-06-21 20:00:00', venue: '达拉斯AT&T体育场', group_name: 'E', stage: '小组赛', matchday: 2 },
  { home_team: 'ESP', away_team: 'GER', match_time: '2026-06-26 20:00:00', venue: '纽约大都会人寿球场', group_name: 'E', stage: '小组赛', matchday: 3 },
  { home_team: 'URU', away_team: 'KOR', match_time: '2026-06-26 20:00:00', venue: '堪萨斯城箭头球场', group_name: 'E', stage: '小组赛', matchday: 3 },

  // F组
  { home_team: 'BEL', away_team: 'MAR', match_time: '2026-06-16 20:00:00', venue: '洛杉矶纪念体育场', group_name: 'F', stage: '小组赛', matchday: 1 },
  { home_team: 'CAN_F', away_team: 'CRO', match_time: '2026-06-17 17:00:00', venue: '丹佛Empower球场', group_name: 'F', stage: '小组赛', matchday: 1 },
  { home_team: 'BEL', away_team: 'CRO', match_time: '2026-06-22 17:00:00', venue: '西雅图流明球场', group_name: 'F', stage: '小组赛', matchday: 2 },
  { home_team: 'MAR', away_team: 'CAN_F', match_time: '2026-06-22 20:00:00', venue: '亚特兰大梅赛德斯-奔驰球场', group_name: 'F', stage: '小组赛', matchday: 2 },
  { home_team: 'BEL', away_team: 'CAN_F', match_time: '2026-06-27 21:00:00', venue: '迈阿密', group_name: 'F', stage: '小组赛', matchday: 3 },
  { home_team: 'CRO', away_team: 'MAR', match_time: '2026-06-27 21:00:00', venue: '波士顿吉列球场', group_name: 'F', stage: '小组赛', matchday: 3 },

  // G组
  { home_team: 'POR', away_team: 'ECU', match_time: '2026-06-17 20:00:00', venue: '纽约大都会人寿球场', group_name: 'G', stage: '小组赛', matchday: 1 },
  { home_team: 'GHA', away_team: 'SEN', match_time: '2026-06-18 17:00:00', venue: '纳什维尔日产球场', group_name: 'G', stage: '小组赛', matchday: 1 },
  { home_team: 'POR', away_team: 'SEN', match_time: '2026-06-23 17:00:00', venue: '芝加哥军人球场', group_name: 'G', stage: '小组赛', matchday: 2 },
  { home_team: 'GHA', away_team: 'ECU', match_time: '2026-06-23 20:00:00', venue: '辛辛那提TQL球场', group_name: 'G', stage: '小组赛', matchday: 2 },
  { home_team: 'POR', away_team: 'GHA', match_time: '2026-06-28 20:00:00', venue: '费城林肯金融球场', group_name: 'G', stage: '小组赛', matchday: 3 },
  { home_team: 'SEN', away_team: 'ECU', match_time: '2026-06-28 20:00:00', venue: '华盛顿联邦球场', group_name: 'G', stage: '小组赛', matchday: 3 },

  // H组
  { home_team: 'ENG', away_team: 'ITA', match_time: '2026-06-18 20:00:00', venue: '洛杉矶纪念体育场', group_name: 'H', stage: '小组赛', matchday: 1 },
  { home_team: 'JPN', away_team: 'AUS_H', match_time: '2026-06-19 17:00:00', venue: '休斯顿NRG体育场', group_name: 'H', stage: '小组赛', matchday: 1 },
  { home_team: 'ENG', away_team: 'JPN', match_time: '2026-06-24 17:00:00', venue: '旧金山甲骨文球场', group_name: 'H', stage: '小组赛', matchday: 2 },
  { home_team: 'ITA', away_team: 'AUS_H', match_time: '2026-06-24 20:00:00', venue: '亚特兰大梅赛德斯-奔驰球场', group_name: 'H', stage: '小组赛', matchday: 2 },
  { home_team: 'ENG', away_team: 'ITA', match_time: '2026-06-29 21:00:00', venue: '纽约大都会人寿球场', group_name: 'H', stage: '小组赛', matchday: 3 },
  { home_team: 'JPN', away_team: 'ITA', match_time: '2026-06-29 21:00:00', venue: '达拉斯AT&T体育场', group_name: 'H', stage: '小组赛', matchday: 3 },

  // === 淘汰赛阶段 ===
  // 1/16决赛
  { home_team: 'ARG', away_team: 'AUS', match_time: '2026-06-30 17:00:00', venue: '洛杉矶纪念体育场', group_name: null, stage: '1/16决赛' },
  { home_team: 'BRA', away_team: 'CHI', match_time: '2026-06-30 21:00:00', venue: '纽约大都会人寿球场', group_name: null, stage: '1/16决赛' },
  { home_team: 'FRA', away_team: 'NGA', match_time: '2026-07-01 17:00:00', venue: '达拉斯AT&T体育场', group_name: null, stage: '1/16决赛' },
  { home_team: 'ESP', away_team: 'MAR', match_time: '2026-07-01 21:00:00', venue: '休斯顿NRG体育场', group_name: null, stage: '1/16决赛' },
  { home_team: 'GER', away_team: 'CRO', match_time: '2026-07-02 17:00:00', venue: '波士顿吉列球场', group_name: null, stage: '1/16决赛' },
  { home_team: 'ENG', away_team: 'ECU', match_time: '2026-07-02 21:00:00', venue: '亚特兰大梅赛德斯-奔驰球场', group_name: null, stage: '1/16决赛' },
  { home_team: 'POR', away_team: 'SEN', match_time: '2026-07-03 17:00:00', venue: '费城林肯金融球场', group_name: null, stage: '1/16决赛' },
  { home_team: 'BEL', away_team: 'ITA', match_time: '2026-07-03 21:00:00', venue: '旧金山甲骨文球场', group_name: null, stage: '1/16决赛' },

  // 1/8决赛
  { home_team: 'ARG', away_team: 'GER', match_time: '2026-07-05 20:00:00', venue: '纽约大都会人寿球场', group_name: null, stage: '1/8决赛' },
  { home_team: 'BRA', away_team: 'ESP', match_time: '2026-07-06 20:00:00', venue: '洛杉矶纪念体育场', group_name: null, stage: '1/8决赛' },
  { home_team: 'FRA', away_team: 'ENG', match_time: '2026-07-07 20:00:00', venue: '达拉斯AT&T体育场', group_name: null, stage: '1/8决赛' },
  { home_team: 'POR', away_team: 'ITA', match_time: '2026-07-08 20:00:00', venue: '亚特兰大梅赛德斯-奔驰球场', group_name: null, stage: '1/8决赛' },

  // 1/4决赛
  { home_team: 'ARG', away_team: 'BRA', match_time: '2026-07-11 20:00:00', venue: '纽约大都会人寿球场', group_name: null, stage: '1/4决赛' },
  { home_team: 'FRA', away_team: 'POR', match_time: '2026-07-12 20:00:00', venue: '洛杉矶纪念体育场', group_name: null, stage: '1/4决赛' },

  // 半决赛
  { home_team: 'ARG', away_team: 'FRA', match_time: '2026-07-15 20:00:00', venue: '达拉斯AT&T体育场', group_name: null, stage: '半决赛' },

  // 季军赛
  { home_team: 'BRA', away_team: 'POR', match_time: '2026-07-18 20:00:00', venue: '迈阿密', group_name: null, stage: '季军赛' },

  // 决赛
  { home_team: 'ARG', away_team: 'FRA', match_time: '2026-07-19 18:00:00', venue: '纽约大都会人寿球场', group_name: null, stage: '决赛' },
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
