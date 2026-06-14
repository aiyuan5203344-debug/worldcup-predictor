// 3家虚拟博彩公司赔率模拟
// WorldBet (欧洲保守), AsianOdds (亚洲激进), GlobalSports (均衡)

export const BOOKMAKERS = {
  worldbet: {
    name: 'WorldBet',
    style: 'conservative',
    baseMargin: 0.08,  // 8%利润率
    fluctuation: 0.02  // 2%波动
  },
  asianOdds: {
    name: '亚洲赔率',
    style: 'aggressive',
    baseMargin: 0.06,  // 6%利润率
    fluctuation: 0.03  // 3%波动
  },
  globalSports: {
    name: 'GlobalSports',
    style: 'balanced',
    baseMargin: 0.07,  // 7%利润率
    fluctuation: 0.025 // 2.5%波动
  }
}

// 缓存赔率数据
const oddsCache = new Map()
const CACHE_DURATION = 60 * 1000  // 缓存60秒

/**
 * 根据AI预测概率计算赔率
 * @param {Object} match - 比赛数据
 * @param {number} match.home_win_prob - 主胜概率 (0-1)
 * @param {number} match.draw_prob - 平局概率 (0-1)
 * @param {number} match.away_win_prob - 客胜概率 (0-1)
 * @returns {Object} 三家博彩公司的赔率
 */
export function calculateOdds(match) {
  const { home_win_prob = 0.45, draw_prob = 0.25, away_win_prob = 0.30 } = match

  const odds = {}

  for (const [key, bookmaker] of Object.entries(BOOKMAKERS)) {
    const { baseMargin, fluctuation } = bookmaker

    // 计算基础赔率（1/概率 + 利润率）
    const rawHome = (1 / home_win_prob) * (1 + baseMargin)
    const rawDraw = (1 / draw_prob) * (1 + baseMargin)
    const rawAway = (1 / away_win_prob) * (1 + baseMargin)

    // 添加随机波动
    const homeFluc = 1 + (Math.random() - 0.5) * 2 * fluctuation
    const drawFluc = 1 + (Math.random() - 0.5) * 2 * fluctuation
    const awayFluc = 1 + (Math.random() - 0.5) * 2 * fluctuation

    odds[key] = {
      name: bookmaker.name,
      home: Math.round(rawHome * homeFluc * 100) / 100,
      draw: Math.round(rawDraw * drawFluc * 100) / 100,
      away: Math.round(rawAway * awayFluc * 100) / 100,
      margin: baseMargin,
      // 赔率变化历史（用于图表）
      history: generateOddsHistory(home_win_prob, draw_prob, away_win_prob, baseMargin)
    }
  }

  return odds
}

/**
 * 生成赔率变化历史（模拟过去24小时）
 */
function generateOddsHistory(homeProb, drawProb, awayProb, margin) {
  const history = []
  const now = Date.now()
  const points = 24 * 6  // 每10分钟一个点，共144个点

  for (let i = points; i >= 0; i--) {
    const time = new Date(now - i * 10 * 60 * 1000)
    const fluctuation = 0.02 + Math.random() * 0.03

    history.push({
      time: time.toISOString(),
      home: Math.round((1 / homeProb) * (1 + margin) * (1 + (Math.random() - 0.5) * fluctuation) * 100) / 100,
      draw: Math.round((1 / drawProb) * (1 + margin) * (1 + (Math.random() - 0.5) * fluctuation) * 100) / 100,
      away: Math.round((1 / awayProb) * (1 + margin) * (1 + (Math.random() - 0.5) * fluctuation) * 100) / 100
    })
  }

  return history
}

/**
 * 获取比赛赔率（带缓存）
 */
export function getOdds(match) {
  const cacheKey = `match_${match.id}`
  const cached = oddsCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.odds
  }

  const odds = calculateOdds(match)
  oddsCache.set(cacheKey, {
    odds,
    timestamp: Date.now()
  })

  return odds
}

/**
 * 清除赔率缓存
 */
export function clearOddsCache(matchId) {
  if (matchId) {
    oddsCache.delete(`match_${matchId}`)
  } else {
    oddsCache.clear()
  }
}
