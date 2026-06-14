/**
 * AI比赛预测引擎
 * 基于多维度分析模型，综合考虑球队实力、球员、战术、伤病等因素
 */

// 位置权重配置
const POSITION_WEIGHTS = {
  GK: { attack: 0.1, defense: 0.4, midfield: 0.1 },
  CB: { attack: 0.1, defense: 0.8, midfield: 0.2 },
  LB: { attack: 0.4, defense: 0.6, midfield: 0.5 },
  RB: { attack: 0.4, defense: 0.6, midfield: 0.5 },
  CDM: { attack: 0.3, defense: 0.7, midfield: 0.8 },
  CM: { attack: 0.5, defense: 0.5, midfield: 0.9 },
  CAM: { attack: 0.8, defense: 0.3, midfield: 0.9 },
  LW: { attack: 0.9, defense: 0.2, midfield: 0.6 },
  RW: { attack: 0.9, defense: 0.2, midfield: 0.6 },
  ST: { attack: 1.0, defense: 0.1, midfield: 0.3 },
  CF: { attack: 0.95, defense: 0.15, midfield: 0.4 }
}

// 伤病影响系数
const INJURY_IMPACT = {
  fit: 1.0,
  minor: 0.85,
  recovering: 0.7,
  injured: 0.3,
  major: 0.1
}

// 战术克制关系
const TACTICS_ADVANTAGE = {
  '控球进攻': { strong: ['防守反击', '长传冲吊'], weak: ['高位逼抢', '全攻全守'] },
  '防守反击': { strong: ['控球进攻', '传控足球'], weak: ['高位逼抢', '整体压迫'] },
  '高位逼抢': { strong: ['控球进攻', '防守反击'], weak: ['快速反击', '长传冲吊'] },
  '快速反击': { strong: ['高位逼抢', '全攻全守'], weak: ['控球进攻', '传控足球'] },
  '全攻全守': { strong: ['防守反击', '长传冲吊'], weak: ['快速反击', '高位逼抢'] },
  '长传冲吊': { strong: ['高位逼抢', '整体压迫'], weak: ['控球进攻', '防守反击'] },
  '整体压迫': { strong: ['防守反击', '长传冲吊'], weak: ['控球进攻', '快速反击'] },
  '传控足球': { strong: ['快速反击', '整体压迫'], weak: ['防守反击', '高位逼抢'] },
  '身体对抗': { strong: ['传控足球', '技术流进攻'], weak: ['快速反击', '高位逼抢'] },
  '技术流进攻': { strong: ['身体对抗', '长传冲吊'], weak: ['高位逼抢', '防守反击'] },
  '中场压迫': { strong: ['控球进攻', '传控足球'], weak: ['快速反击', '长传冲吊'] },
  '中场控制': { strong: ['防守反击', '快速反击'], weak: ['高位逼抢', '整体压迫'] },
  '速度冲击': { strong: ['整体压迫', '中场压迫'], weak: ['防守反击', '长传冲吊'] },
  '防守反击、高位逼抢': { strong: ['控球进攻'], weak: ['快速反击'] },
  '控球+快速反击': { strong: ['高位逼抢', '整体压迫'], weak: ['长传冲吊'] },
  '控球进攻、高位逼抢': { strong: ['防守反击'], weak: ['快速反击'] },
  '防守反击、高位逼抢': { strong: ['控球进攻'], weak: ['快速反击'] },
  '技术流进攻': { strong: ['身体对抗'], weak: ['高位逼抢'] },
  '高效进攻': { strong: ['防守反击', '长传冲吊'], weak: ['高位逼抢', '整体压迫'] },
  '防守反击': { strong: ['控球进攻', '传控足球'], weak: ['高位逼抢', '整体压迫'] }
}

// 近期战绩评分
const FORM_SCORES = {
  'W': 3,
  'D': 1,
  'L': 0
}

/**
 * 计算球队综合评分
 */
function calculateTeamRating(team, players) {
  // 1. 基础实力评分 (30%)
  const baseRating = team.strength_rating || 75
  
  // 2. 球员阵容评分 (35%)
  const playerRating = calculatePlayerRating(players)
  
  // 3. 近期状态评分 (15%)
  const formRating = calculateFormRating(team.recent_form)
  
  // 4. 伤病影响 (10%)
  const injuryImpact = calculateInjuryImpact(players)
  
  // 5. 教练经验 (10%)
  const coachRating = calculateCoachRating(team)
  
  const totalRating = (
    baseRating * 0.30 +
    playerRating * 0.35 +
    formRating * 0.15 +
    injuryImpact * 0.10 +
    coachRating * 0.10
  )
  
  return {
    total: Math.round(totalRating),
    breakdown: {
      base: baseRating,
      players: Math.round(playerRating),
      form: Math.round(formRating),
      injury: Math.round(injuryImpact),
      coach: Math.round(coachRating)
    }
  }
}

/**
 * 计算球员阵容评分
 */
function calculatePlayerRating(players) {
  if (!players || players.length === 0) return 70
  
  let attackPower = 0
  let defensePower = 0
  let midfieldPower = 0
  let goalkeeperRating = 0
  let playerCount = 0
  
  players.forEach(player => {
    const position = player.position
    const weight = POSITION_WEIGHTS[position] || { attack: 0.5, defense: 0.5, midfield: 0.5 }
    
    // 球员个人能力评分
    let playerScore = 70 // 基础分
    
    // 市场价值加分
    const value = parseMarketValue(player.market_value)
    playerScore += Math.min(20, value / 5000000)
    
    // 进球/助攻加分
    playerScore += Math.min(10, (player.goals || 0) * 0.5)
    playerScore += Math.min(8, (player.assists || 0) * 0.3)
    
    // 国家队经验
    playerScore += Math.min(5, (player.caps || 0) * 0.1)
    
    // 关键球员/队长加分
    if (player.is_key_player) playerScore += 5
    if (player.is_captain) playerScore += 3
    
    // 伤病影响
    const injuryFactor = INJURY_IMPACT[player.injury_status] || 1.0
    playerScore *= injuryFactor
    
    // 根据位置累加
    attackPower += playerScore * weight.attack
    defensePower += playerScore * weight.defense
    midfieldPower += playerScore * weight.midfield
    
    if (position === 'GK') {
      goalkeeperRating = playerScore
    }
    
    playerCount++
  })
  
  // 平均分
  if (playerCount > 0) {
    attackPower = attackPower / playerCount * 10
    defensePower = defensePower / playerCount * 10
    midfieldPower = midfieldPower / playerCount * 10
  }
  
  // 位置权重：GK 20%, 后场 30%, 中场 30%, 前场 20%
  const totalRating = (
    goalkeeperRating * 0.20 +
    defensePower * 0.30 +
    midfieldPower * 0.30 +
    attackPower * 0.20
  )
  
  return Math.min(99, Math.max(50, totalRating))
}

/**
 * 解析市场价值
 */
function parseMarketValue(valueStr) {
  if (!valueStr) return 0
  
  const str = valueStr.replace(/[€$£]/g, '').trim()
  let value = 0
  
  if (str.includes('亿')) {
    value = parseFloat(str) * 100000000
  } else if (str.includes('万')) {
    value = parseFloat(str) * 10000
  } else {
    value = parseFloat(str) || 0
  }
  
  return value
}

/**
 * 计算近期状态评分
 */
function calculateFormRating(form) {
  if (!form || form.length === 0) return 70
  
  // recent_form is a string like "WWWWL"
  const formStr = typeof form === 'string' ? form : String(form)
  
  let score = 0
  const recentForm = formStr.slice(-5).split('') // 最近5场，转为数组
  
  recentForm.forEach((result, index) => {
    const weight = 1 + (index * 0.2) // 越近的比赛权重越高
    score += (FORM_SCORES[result] || 0) * weight
  })
  
  // 归一化到50-99
  const maxScore = 5 * 3 * (1 + 0.2 + 0.4 + 0.6 + 0.8) // 理论最高分
  const normalized = (score / maxScore) * 49 + 50
  
  return Math.min(99, Math.max(50, normalized))
}

/**
 * 计算伤病影响
 */
function calculateInjuryImpact(players) {
  if (!players || players.length === 0) return 85
  
  let totalImpact = 0
  let playerCount = 0
  
  players.forEach(player => {
    const impact = INJURY_IMPACT[player.injury_status] || 1.0
    totalImpact += impact
    playerCount++
  })
  
  const avgImpact = playerCount > 0 ? totalImpact / playerCount : 1.0
  
  // 归一化到50-99
  return Math.round(avgImpact * 49 + 50)
}

/**
 * 计算教练评分
 */
function calculateCoachRating(team) {
  let score = 70
  
  // 世界杯冠军经验
  if (team.world_cup_titles > 0) {
    score += team.world_cup_titles * 5
  }
  
  // FIFA排名
  if (team.fifa_ranking) {
    score += Math.max(0, 30 - team.fifa_ranking) * 0.5
  }
  
  return Math.min(99, score)
}

/**
 * 分析战术克制
 */
function analyzeTacticalMatchup(homeStyle, awayStyle) {
  let advantage = 0
  
  // 检查战术克制关系
  for (const [tactic, relations] of Object.entries(TACTICS_ADVANTAGE)) {
    if (homeStyle && homeStyle.includes(tactic)) {
      if (relations.strong.some(s => awayStyle && awayStyle.includes(s))) {
        advantage += 8
      }
      if (relations.weak.some(w => awayStyle && awayStyle.includes(w))) {
        advantage -= 8
      }
    }
    if (awayStyle && awayStyle.includes(tactic)) {
      if (relations.strong.some(s => homeStyle && homeStyle.includes(s))) {
        advantage -= 8
      }
      if (relations.weak.some(w => homeStyle && homeStyle.includes(w))) {
        advantage += 8
      }
    }
  }
  
  return advantage
}

/**
 * 预测比分
 */
function predictScore(homeRating, awayRating) {
  const ratingDiff = homeRating.total - awayRating.total
  
  // 基础进球期望
  let homeExpected = 1.3 + ratingDiff * 0.03
  let awayExpected = 1.3 - ratingDiff * 0.03
  
  // 限制范围
  homeExpected = Math.max(0.3, Math.min(4.0, homeExpected))
  awayExpected = Math.max(0.3, Math.min(4.0, awayExpected))
  
  // 使用泊松分布模拟
  const homeGoals = poissonRandom(homeExpected)
  const awayGoals = poissonRandom(awayExpected)
  
  return { home: homeGoals, away: awayGoals }
}

/**
 * 泊松分布随机数
 */
function poissonRandom(lambda) {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  
  do {
    k++
    p *= Math.random()
  } while (p > L)
  
  return k - 1
}

/**
 * 计算胜平负概率
 */
function calculateProbabilities(homeRating, awayRating, tacticalAdvantage) {
  const totalDiff = homeRating.total - awayRating.total + tacticalAdvantage
  
  // 基础概率
  let homeWin = 45 + totalDiff * 1.5
  let draw = 25 - Math.abs(totalDiff) * 0.5
  let awayWin = 100 - homeWin - draw
  
  // 归一化
  homeWin = Math.max(5, Math.min(85, homeWin))
  draw = Math.max(10, Math.min(35, draw))
  awayWin = Math.max(5, Math.min(85, awayWin))
  
  const total = homeWin + draw + awayWin
  homeWin = Math.round(homeWin / total * 100)
  draw = Math.round(draw / total * 100)
  awayWin = 100 - homeWin - draw
  
  return { homeWin, draw, awayWin }
}

/**
 * 生成详细分析报告
 */
function generateAnalysis(match, homeTeam, awayTeam, homePlayers, awayPlayers, homeRating, awayRating, predictedScore) {
  const parts = []
  
  // 实力对比
  const ratingDiff = homeRating.total - awayRating.total
  if (ratingDiff > 10) {
    parts.push(`${homeTeam.name_cn}整体实力明显占优`)
  } else if (ratingDiff > 5) {
    parts.push(`${homeTeam.name_cn}实力略占上风`)
  } else if (ratingDiff > -5) {
    parts.push('两队实力接近')
  } else {
    parts.push(`${awayTeam.name_cn}实力更强`)
  }
  
  // 关键球员
  const homeKeyPlayers = homePlayers?.filter(p => p.is_key_player).map(p => p.name_cn).slice(0, 3)
  const awayKeyPlayers = awayPlayers?.filter(p => p.is_key_player).map(p => p.name_cn).slice(0, 3)
  
  if (homeKeyPlayers?.length > 0) {
    parts.push(`${homeTeam.name_cn}核心：${homeKeyPlayers.join('、')}`)
  }
  if (awayKeyPlayers?.length > 0) {
    parts.push(`${awayTeam.name_cn}核心：${awayKeyPlayers.join('、')}`)
  }
  
  // 伤病情况
  const homeInjured = homePlayers?.filter(p => p.injury_status === 'injured' || p.injury_status === 'major')
  const awayInjured = awayPlayers?.filter(p => p.injury_status === 'injured' || p.injury_status === 'major')
  
  if (homeInjured?.length > 0) {
    parts.push(`${homeTeam.name_cn}伤病：${homeInjured.map(p => p.name_cn).join('、')}`)
  }
  if (awayInjured?.length > 0) {
    parts.push(`${awayTeam.name_cn}伤病：${awayInjured.map(p => p.name_cn).join('、')}`)
  }
  
  // 战术分析
  if (homeTeam.style && awayTeam.style) {
    parts.push(`${homeTeam.name_cn}采用${homeTeam.style}，${awayTeam.name_cn}主打${awayTeam.style}`)
  }
  
  // 预测比分
  parts.push(`AI预测比分：${predictedScore.home}-${predictedScore.away}`)
  
  return parts.join('。')
}

/**
 * 主预测函数
 */
export function predictMatch(match, homeTeam, awayTeam, homePlayers, awayPlayers) {
  // 1. 计算两队综合评分
  const homeRating = calculateTeamRating(homeTeam, homePlayers)
  const awayRating = calculateTeamRating(awayTeam, awayPlayers)
  
  // 2. 分析战术克制
  const tacticalAdvantage = analyzeTacticalMatchup(homeTeam.style, awayTeam.style)
  
  // 3. 计算概率
  const probabilities = calculateProbabilities(homeRating, awayRating, tacticalAdvantage)
  
  // 4. 预测比分
  const predictedScore = predictScore(homeRating, awayRating)
  
  // 5. 计算置信度
  const confidence = Math.min(95, Math.max(35, 
    50 + Math.abs(homeRating.total - awayRating.total) * 1.5 + Math.random() * 10
  ))
  
  // 6. 生成分析报告
  const analysis = generateAnalysis(
    match, homeTeam, awayTeam, homePlayers, awayPlayers, 
    homeRating, awayRating, predictedScore
  )
  
  // 7. 确定预测结果
  let predictedResult = 'draw'
  if (probabilities.homeWin > probabilities.awayWin && probabilities.homeWin > probabilities.draw) {
    predictedResult = 'home'
  } else if (probabilities.awayWin > probabilities.homeWin && probabilities.awayWin > probabilities.draw) {
    predictedResult = 'away'
  }
  
  return {
    predicted_home_score: predictedScore.home,
    predicted_away_score: predictedScore.away,
    predicted_result: predictedResult,
    ai_confidence: Math.round(confidence),
    ai_analysis: analysis,
    home_rating: homeRating.total,
    away_rating: awayRating.total,
    home_win_prob: probabilities.homeWin,
    draw_prob: probabilities.draw,
    away_win_prob: probabilities.awayWin,
    home_rating_breakdown: homeRating.breakdown,
    away_rating_breakdown: awayRating.breakdown,
    tactical_advantage: tacticalAdvantage
  }
}

export default {
  predictMatch,
  calculateTeamRating,
  calculatePlayerRating,
  analyzeTacticalMatchup
}
