// 实时比分模拟器
// 模拟比赛进行中的进球、红牌等事件

import { getOdds } from './odds.js'

// 比赛状态
const MATCH_STATES = {
  UPCOMING: 'upcoming',
  LIVE: 'live',
  FINISHED: 'finished'
}

// 存储活跃比赛的模拟状态
const activeSimulations = new Map()

// 模拟器配置
const CONFIG = {
  CHECK_INTERVAL: 60 * 1000,     // 每60秒检查一次
  GOAL_BASE_PROB: 0.03,          // 基础进球概率（每分钟）
  CARD_BASE_PROB: 0.005,         // 基础红牌概率
  MAX_GAME_TIME: 90,             // 最大比赛时间（分钟）
  INJURY_TIME_MAX: 8,            // 最大补时时间
  LIVE_ODDS_UPDATE: 30 * 1000   // 实时赔率更新间隔
}

/**
 * 启动实时比分模拟器
 */
export function startLiveSimulator(io, db) {
  console.log('⚽ 实时比分模拟器已启动')

  // 定期检查比赛状态
  setInterval(() => {
    try {
      checkAndStartMatches(io, db)
    } catch (error) {
      console.error('模拟器检查失败:', error)
    }
  }, CONFIG.CHECK_INTERVAL)

  // 初始检查
  checkAndStartMatches(io, db)
}

/**
 * 检查并开始比赛
 */
function checkAndStartMatches(io, db) {
  try {
    const now = new Date()
    const matches = db.exec('SELECT * FROM matches WHERE status = ?', ['upcoming'])

    if (matches.length > 0 && matches[0].values) {
      const columns = matches[0].columns
      for (const values of matches[0].values) {
        const match = {}
        columns.forEach((col, idx) => {
          match[col] = values[idx]
        })

        const matchTime = new Date(match.match_time)

        // 如果比赛时间已到，开始模拟
        if (matchTime <= now) {
          startMatchSimulation(io, db, match)
        }
      }
    }
  } catch (error) {
    console.error('检查比赛状态失败:', error)
  }
}

/**
 * 开始模拟一场比赛
 */
function startMatchSimulation(io, db, match) {
  console.log(`🔴 比赛开始: ${match.home_team} vs ${match.away_team}`)

  // 更新数据库状态
  db.run(
    'UPDATE matches SET status = ?, home_score = 0, away_score = 0 WHERE id = ?',
    ['live', match.id]
  )

  // 初始化模拟状态
  const simulation = {
    matchId: match.id,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    events: [],
    startTime: Date.now()
  }

  activeSimulations.set(match.id, simulation)

  // 通知前端比赛开始
  io.to(`match:${match.id}`).emit('match-start', {
    matchId: match.id,
    homeTeam: match.home_team,
    awayTeam: match.away_team
  })

  // 开始模拟进球
  simulateGoals(io, db, simulation)
}

/**
 * 模拟进球
 */
function simulateGoals(io, db, simulation) {
  const { matchId, homeTeam, awayTeam } = simulation

  // 每分钟检查是否进球
  const goalInterval = setInterval(() => {
    simulation.minute++

    // 比赛结束
    if (simulation.minute > CONFIG.MAX_GAME_TIME) {
      clearInterval(goalInterval)
      endMatchSimulation(io, db, simulation)
      return
    }

    // 计算进球概率
    const homeGoalProb = calculateGoalProbability(simulation, 'home')
    const awayGoalProb = calculateGoalProbability(simulation, 'away')

    // 主队进球
    if (Math.random() < homeGoalProb) {
      simulation.homeScore++
      const event = {
        type: 'goal',
        team: 'home',
        teamName: homeTeam,
        scorer: getRandomScorer(homeTeam),
        assist: getRandomAssister(homeTeam),
        minute: simulation.minute
      }
      simulation.events.push(event)

      // 更新数据库
      db.run(
        'UPDATE matches SET home_score = ? WHERE id = ?',
        [simulation.homeScore, matchId]
      )

      // 通知前端
      io.to(`match:${matchId}`).emit('goal', {
        matchId,
        team: 'home',
        teamName: homeTeam,
        score: `${simulation.homeScore} - ${simulation.awayScore}`,
        scorer: event.scorer,
        assist: event.assist,
        minute: event.minute
      })

      console.log(`⚽ 进球! ${homeTeam} ${simulation.homeScore} - ${simulation.awayScore} ${awayTeam} (${simulation.minute}')`)
    }

    // 客队进球
    if (Math.random() < awayGoalProb) {
      simulation.awayScore++
      const event = {
        type: 'goal',
        team: 'away',
        teamName: awayTeam,
        scorer: getRandomScorer(awayTeam),
        assist: getRandomAssister(awayTeam),
        minute: simulation.minute
      }
      simulation.events.push(event)

      // 更新数据库
      db.run(
        'UPDATE matches SET away_score = ? WHERE id = ?',
        [simulation.awayScore, matchId]
      )

      // 通知前端
      io.to(`match:${matchId}`).emit('goal', {
        matchId,
        team: 'away',
        teamName: awayTeam,
        score: `${simulation.homeScore} - ${simulation.awayScore}`,
        scorer: event.scorer,
        assist: event.assist,
        minute: event.minute
      })

      console.log(`⚽ 进球! ${homeTeam} ${simulation.homeScore} - ${simulation.awayScore} ${awayTeam} (${simulation.minute}')`)
    }

    // 红牌（概率较低）
    if (Math.random() < CONFIG.CARD_BASE_PROB) {
      const team = Math.random() < 0.5 ? 'home' : 'away'
      const teamName = team === 'home' ? homeTeam : awayTeam
      const player = getRandomPlayer(teamName)

      const event = {
        type: 'red-card',
        team,
        teamName,
        player,
        minute: simulation.minute
      }
      simulation.events.push(event)

      // 通知前端
      io.to(`match:${matchId}`).emit('card', {
        matchId,
        team,
        teamName,
        player,
        minute: event.minute
      })

      console.log(`🟥 红牌! ${player} (${teamName}) (${simulation.minute}')`)
    }

    // 每15分钟发送一次比赛状态更新
    if (simulation.minute % 15 === 0) {
      io.to(`match:${matchId}`).emit('match-update', {
        matchId,
        minute: simulation.minute,
        homeScore: simulation.homeScore,
        awayScore: simulation.awayScore,
        events: simulation.events.slice(-3)  // 最近3个事件
      })
    }
  }, 5000)  // 实际每5秒 = 模拟1分钟
}

/**
 * 计算进球概率（考虑比赛时间、比分等因素）
 */
function calculateGoalProbability(simulation, team) {
  let prob = CONFIG.GOAL_BASE_PROB

  // 落后方更积极进攻（概率增加）
  if (team === 'home' && simulation.homeScore < simulation.awayScore) {
    prob *= 1.3
  } else if (team === 'away' && simulation.awayScore < simulation.homeScore) {
    prob *= 1.3
  }

  // 领先方可能保守（概率略减）
  if (team === 'home' && simulation.homeScore > simulation.awayScore) {
    prob *= 0.9
  } else if (team === 'away' && simulation.awayScore > simulation.homeScore) {
    prob *= 0.9
  }

  // 比赛末段概率增加（体能下降）
  if (simulation.minute > 75) {
    prob *= 1.2
  }

  return prob
}

/**
 * 结束比赛模拟
 */
function endMatchSimulation(io, db, simulation) {
  const { matchId, homeTeam, awayTeam, homeScore, awayScore, events } = simulation

  console.log(`🏁 比赛结束: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`)

  // 更新数据库
  db.run(
    'UPDATE matches SET status = ?, home_score = ?, away_score = ? WHERE id = ?',
    ['finished', homeScore, awayScore, matchId]
  )

  // 移除模拟状态
  activeSimulations.delete(matchId)

  // 通知前端比赛结束
  io.to(`match:${matchId}`).emit('match-end', {
    matchId,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    events
  })
}

/**
 * 获取随机球员名字（模拟）
 */
function getRandomScorer(team) {
  const players = [
    '前锋', '中场', '前锋', '中场', '前锋',
    '边锋', '中场', '前锋', '影锋', '前腰'
  ]
  return `${team} ${players[Math.floor(Math.random() * players.length)]}`
}

function getRandomAssister(team) {
  const positions = ['中场', '边锋', '前腰', '后卫', '中场']
  return `${team} ${positions[Math.floor(Math.random() * positions.length)]}`
}

function getRandomPlayer(team) {
  const positions = ['前锋', '中场', '后卫', '守门员']
  return `${team} ${positions[Math.floor(Math.random() * positions.length)]}`
}

/**
 * 停止模拟器
 */
export function stopLiveSimulator() {
  activeSimulations.clear()
  console.log('⏹️ 实时比分模拟器已停止')
}
