import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getTeamName, getTeamFlag } from '../utils/teams'
import { API_BASE } from '../config'
import ChatRoom from '../components/Chat/ChatRoom'
import OddsDisplay from '../components/Match/OddsDisplay'

const MatchDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Team details state
  const [homeTeam, setHomeTeam] = useState(null)
  const [awayTeam, setAwayTeam] = useState(null)
  const [homePlayers, setHomePlayers] = useState([])
  const [awayPlayers, setAwayPlayers] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [activeSquad, setActiveSquad] = useState('home')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
    fetchMatch()
  }, [id])

  const fetchMatch = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

      const [matchRes, predRes] = await Promise.all([
        fetch(`${API_BASE}/matches/${id}`, { headers }),
        token ? fetch(`${API_BASE}/predictions?match_id=${id}`, { headers }) : Promise.resolve({ ok: false })
      ])

      const matchData = await matchRes.json()
      const predData = predRes.ok ? await predRes.json() : { predictions: [] }

      if (matchRes.ok) {
        setMatch(matchData.match)
        setPredictions(predData.predictions || [])
        
        // Fetch team details
        fetchTeamDetails(matchData.match.home_team, matchData.match.away_team)
      } else {
        toast.error('比赛不存在')
        navigate('/matches')
      }
    } catch (error) {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamDetails = async (homeCode, awayCode) => {
    try {
      const [homeRes, awayRes] = await Promise.all([
        fetch(`${API_BASE}/teams/${homeCode}`),
        fetch(`${API_BASE}/teams/${awayCode}`)
      ])
      
      if (homeRes.ok) {
        const homeData = await homeRes.json()
        setHomeTeam(homeData.team)
        setHomePlayers(homeData.players || [])
      }
      
      if (awayRes.ok) {
        const awayData = await awayRes.json()
        setAwayTeam(awayData.team)
        setAwayPlayers(awayData.players || [])
      }
    } catch (error) {
      console.error('Failed to fetch team details:', error)
    }
  }

  const handlePredict = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    if (homeScore === '' || awayScore === '') {
      toast.error('请输入比分')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${API_BASE}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          match_id: parseInt(id),
          home_score: parseInt(homeScore),
          away_score: parseInt(awayScore)
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('预测成功！')
        fetchMatch()
      } else {
        toast.error(data.error || '预测失败')
      }
    } catch (error) {
      toast.error('网络错误')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: { bg: '#1e40af', text: '未开始', color: '#93c5fd' },
      live: { bg: '#dc2626', text: '进行中', color: '#fca5a5', pulse: true },
      finished: { bg: '#059669', text: '已结束', color: '#6ee7b7' }
    }
    const s = styles[status] || styles.upcoming
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        background: s.bg,
        color: s.color,
        borderRadius: '16px',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        {s.pulse && <span style={{
          width: '8px',
          height: '8px',
          background: '#ef4444',
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite'
        }} />}
        {s.text}
      </span>
    )
  }

  const getPositionName = (pos) => {
    const positions = {
      'GK': '门将', 'CB': '中后卫', 'LB': '左后卫', 'RB': '右后卫',
      'LWB': '左翼卫', 'RWB': '右翼卫', 'CDM': '后腰', 'CM': '中场',
      'CAM': '前腰', 'LM': '左中场', 'RM': '右中场', 'LW': '左边锋',
      'RW': '右边锋', 'ST': '前锋', 'CF': '中锋'
    }
    return positions[pos] || pos
  }

  const getInjuryStatus = (status) => {
    const statuses = {
      'fit': { text: '健康', color: '#22c55e' },
      'injured': { text: '受伤', color: '#ef4444' },
      'recovering': { text: '恢复中', color: '#f59e0b' },
      'suspended': { text: '停赛', color: '#6b7280' }
    }
    return statuses[status] || { text: status, color: '#6b7280' }
  }

  const TeamComparison = ({ label, homeValue, awayValue, type = 'text' }) => {
    const homeNum = typeof homeValue === 'string' ? parseInt(homeValue) || 0 : homeValue
    const awayNum = typeof awayValue === 'string' ? parseInt(awayValue) || 0 : awayValue
    const total = homeNum + awayNum
    const homePercent = total > 0 ? (homeNum / total) * 100 : 50
    
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-primary font-medium">{homeValue}</span>
          <span className="text-text-secondary">{label}</span>
          <span className="text-text-primary font-medium">{awayValue}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
          <div className="h-full rounded-full" style={{ 
            width: `${homePercent}%`, 
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    )
  }

  if (!match) return null

  const myPrediction = predictions.find(p => p.user_id === user?.id)

  const tabs = [
    { id: 'overview', label: '概览', icon: '📊' },
    { id: 'comparison', label: '对比', icon: '⚔️' },
    { id: 'squad', label: '阵容', icon: '👥' },
    { id: 'predictions', label: '预测', icon: '🎯' },
    { id: 'chat', label: '聊天', icon: '💬' }
  ]

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Back Button */}
      <Link
        to="/matches"
        className="inline-flex items-center gap-2 mb-6 text-text-secondary hover:text-text-primary transition-colors"
      >
        <span>←</span>
        <span>返回赛事列表</span>
      </Link>

      {/* Match Header Card */}
      <div className="mb-6 p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1a2332 100%)', border: '1px solid #2d4a6f' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {match.group_name && (
              <span className="px-3 py-1 rounded-lg text-sm" style={{ background: '#1e293b', color: '#94a3b8' }}>
                {match.group_name}组
              </span>
            )}
            <span className="text-text-secondary">
              {new Date(match.match_time).toLocaleString('zh-CN')}
            </span>
          </div>
          {getStatusBadge(match.status)}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between py-6">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <span className="text-6xl mb-4 block">{getTeamFlag(match.home_team)}</span>
            <h2 className="text-2xl font-bold text-text-primary">{getTeamName(match.home_team)}</h2>
            <p className="text-text-secondary text-sm">主队</p>
            {homeTeam && (
              <p className="text-accent-gold text-sm mt-1">FIFA #{homeTeam.fifa_ranking}</p>
            )}
          </div>

          {/* Score */}
          <div className="px-8 text-center">
            {match.status === 'finished' || match.status === 'live' ? (
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold text-accent-gold">{match.home_score ?? '-'}</span>
                <span className="text-3xl text-text-secondary">:</span>
                <span className="text-5xl font-bold text-accent-gold">{match.away_score ?? '-'}</span>
              </div>
            ) : (
              <div className="text-4xl font-bold text-text-secondary">VS</div>
            )}
            {match.status === 'live' && (
              <div className="mt-2 text-red-500 font-medium animate-pulse">● LIVE</div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <span className="text-6xl mb-4 block">{getTeamFlag(match.away_team)}</span>
            <h2 className="text-2xl font-bold text-text-primary">{getTeamName(match.away_team)}</h2>
            <p className="text-text-secondary text-sm">客队</p>
            {awayTeam && (
              <p className="text-accent-gold text-sm mt-1">FIFA #{awayTeam.fifa_ranking}</p>
            )}
          </div>
        </div>

        {/* Venue */}
        {match.venue && (
          <div className="text-center text-text-secondary text-sm pt-4 border-t border-border-primary">
            📍 {match.venue}
          </div>
        )}
      </div>

      {/* Odds Display */}
      <div className="mb-6">
        <OddsDisplay matchId={parseInt(id)} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                : '#1a2332',
              color: activeTab === tab.id ? '#0a0e17' : '#94a3b8',
              border: `1px solid ${activeTab === tab.id ? '#d4af37' : '#1e293b'}`
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Home Team Info */}
          {homeTeam && (
            <div className="p-6 rounded-xl" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                {getTeamFlag(match.home_team)} {getTeamName(match.home_team)}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">FIFA排名</span>
                  <span className="text-text-primary font-medium">#{homeTeam.fifa_ranking}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">实力评分</span>
                  <span className="text-accent-gold font-bold">{homeTeam.strength_rating}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">球队身价</span>
                  <span className="text-text-primary font-medium">{homeTeam.market_value}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">主教练</span>
                  <span className="text-text-primary font-medium">{homeTeam.coach}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">队长</span>
                  <span className="text-text-primary font-medium">{homeTeam.captain}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">阵型</span>
                  <span className="text-accent-gold font-medium">{homeTeam.formation}</span>
                </div>
                <div className="py-2">
                  <span className="text-text-secondary block mb-1">战术风格</span>
                  <span className="text-text-primary text-sm">{homeTeam.style}</span>
                </div>
                <div className="py-2">
                  <span className="text-text-secondary block mb-1">关键球员</span>
                  <span className="text-accent-gold text-sm">{homeTeam.key_players}</span>
                </div>
                <div className="py-2">
                  <span className="text-text-secondary block mb-1">近期战绩</span>
                  <div className="flex gap-1">
                    {homeTeam.recent_form?.split('').map((result, i) => (
                      <span key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: result === 'W' ? '#22c55e' : result === 'D' ? '#f59e0b' : '#ef4444',
                          color: '#fff'
                        }}>
                        {result}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="py-2">
                  <span className="text-text-secondary block mb-1">伤病情况</span>
                  <span className="text-text-primary text-sm">{homeTeam.injuries}</span>
                </div>
              </div>
            </div>
          )}

          {/* Away Team Info */}
          {awayTeam && (
            <div className="p-6 rounded-xl" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                {getTeamFlag(match.away_team)} {getTeamName(match.away_team)}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">FIFA排名</span>
                  <span className="text-text-primary font-medium">#{awayTeam.fifa_ranking}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">实力评分</span>
                  <span className="text-accent-gold font-bold">{awayTeam.strength_rating}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">球队身价</span>
                  <span className="text-text-primary font-medium">{awayTeam.market_value}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">主教练</span>
                  <span className="text-text-primary font-medium">{awayTeam.coach}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">队长</span>
                  <span className="text-text-primary font-medium">{awayTeam.captain}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-primary">
                  <span className="text-text-secondary">阵型</span>
                  <span className="text-accent-gold font-medium">{awayTeam.formation}</span>
                </div>
                <div className="py-2">
                  <span className="text-text-secondary block mb-1">战术风格</span>
                  <span className="text-text-primary text-sm">{awayTeam.style}</span>
                </div>
                <div className="py-2">
                  <span className="text-text-secondary block mb-1">关键球员</span>
                  <span className="text-accent-gold text-sm">{awayTeam.key_players}</span>
                </div>
                <div className="py-2">
                  <span className="text-text-secondary block mb-1">近期战绩</span>
                  <div className="flex gap-1">
                    {awayTeam.recent_form?.split('').map((result, i) => (
                      <span key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: result === 'W' ? '#22c55e' : result === 'D' ? '#f59e0b' : '#ef4444',
                          color: '#fff'
                        }}>
                        {result}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="py-2">
                  <span className="text-text-secondary block mb-1">伤病情况</span>
                  <span className="text-text-primary text-sm">{awayTeam.injuries}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comparison' && homeTeam && awayTeam && (
        <div className="p-6 rounded-xl" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
          <h3 className="text-xl font-bold text-text-primary mb-6 text-center">⚔️ 数据对比</h3>
          
          <TeamComparison label="FIFA排名" homeValue={`#${homeTeam.fifa_ranking}`} awayValue={`#${awayTeam.fifa_ranking}`} />
          <TeamComparison label="实力评分" homeValue={homeTeam.strength_rating} awayValue={awayTeam.strength_rating} />
          <TeamComparison label="世界杯冠军" homeValue={homeTeam.world_cup_titles} awayValue={awayTeam.world_cup_titles} />
          
          <div className="mt-6 pt-6 border-t border-border-primary">
            <h4 className="text-lg font-bold text-text-primary mb-4">🏆 荣誉对比</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ background: '#111827' }}>
                <p className="text-text-secondary text-sm">世界杯冠军</p>
                <p className="text-2xl font-bold text-accent-gold">{homeTeam.world_cup_titles}</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ background: '#111827' }}>
                <p className="text-text-secondary text-sm">世界杯冠军</p>
                <p className="text-2xl font-bold text-accent-gold">{awayTeam.world_cup_titles}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'squad' && (
        <div className="p-6 rounded-xl" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
          {/* Squad Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveSquad('home')}
              className="flex-1 py-3 rounded-lg font-bold transition-all"
              style={{
                background: activeSquad === 'home' ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' : '#111827',
                color: activeSquad === 'home' ? '#fff' : '#94a3b8',
                border: `1px solid ${activeSquad === 'home' ? '#3b82f6' : '#1e293b'}`
              }}
            >
              {getTeamFlag(match.home_team)} {getTeamName(match.home_team)}
            </button>
            <button
              onClick={() => setActiveSquad('away')}
              className="flex-1 py-3 rounded-lg font-bold transition-all"
              style={{
                background: activeSquad === 'away' ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' : '#111827',
                color: activeSquad === 'away' ? '#fff' : '#94a3b8',
                border: `1px solid ${activeSquad === 'away' ? '#ef4444' : '#1e293b'}`
              }}
            >
              {getTeamFlag(match.away_team)} {getTeamName(match.away_team)}
            </button>
          </div>

          {/* Players List */}
          <div className="space-y-2">
            {(activeSquad === 'home' ? homePlayers : awayPlayers).length === 0 ? (
              <p className="text-center text-text-secondary py-8">暂无球员数据</p>
            ) : (
              (activeSquad === 'home' ? homePlayers : awayPlayers).map(player => {
                const injury = getInjuryStatus(player.injury_status)
                return (
                  <div key={player.id} className="flex items-center gap-4 p-3 rounded-lg"
                    style={{ 
                      background: player.is_key_player ? 'rgba(212, 175, 55, 0.1)' : '#111827',
                      border: `1px solid ${player.is_key_player ? '#d4af37' : '#1e293b'}`
                    }}>
                    <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: '#1e293b', color: '#d4af37' }}>
                      {player.number}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{player.name_cn || player.name}</span>
                        {player.is_captain === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#d4af37', color: '#000' }}>C</span>
                        )}
                        {player.is_key_player === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#22c55e', color: '#fff' }}>★</span>
                        )}
                      </div>
                      <p className="text-text-secondary text-sm">
                        {getPositionName(player.position)} · {player.club}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded" style={{ background: injury.color + '20', color: injury.color }}>
                        {injury.text}
                      </span>
                      <p className="text-text-secondary text-xs mt-1">{player.market_value}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <>
          {/* AI Prediction Card */}
          {match.status === 'upcoming' && match.home_win_prob != null && (
            <div className="mb-6 p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1a2332 100%)', border: '1px solid #2d4a6f' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <span className="text-2xl">🤖</span> AI智能预测
                </h3>
                <span className="px-3 py-1 rounded-lg text-sm font-medium" style={{ 
                  background: match.ai_confidence >= 70 ? 'rgba(34, 197, 94, 0.2)' : match.ai_confidence >= 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: match.ai_confidence >= 70 ? '#22c55e' : match.ai_confidence >= 50 ? '#f59e0b' : '#ef4444'
                }}>
                  置信度 {match.ai_confidence}%
                </span>
              </div>
              
              {/* Three Probability Bars */}
              <div className="space-y-4 mb-6">
                {/* Home Win */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-primary font-medium">{getTeamName(match.home_team)} 胜</span>
                    <span className="text-accent-gold font-bold">{match.home_win_prob}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ 
                      width: `${match.home_win_prob}%`, 
                      background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                    }} />
                  </div>
                </div>
                
                {/* Draw */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-primary font-medium">平局</span>
                    <span className="text-yellow-400 font-bold">{match.draw_prob}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ 
                      width: `${match.draw_prob}%`, 
                      background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    }} />
                  </div>
                </div>
                
                {/* Away Win */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-primary font-medium">{getTeamName(match.away_team)} 胜</span>
                    <span className="text-red-400 font-bold">{match.away_win_prob}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ 
                      width: `${match.away_win_prob}%`, 
                      background: 'linear-gradient(90deg, #ef4444, #f87171)'
                    }} />
                  </div>
                </div>
              </div>
              
              {/* Recommended Score */}
              {match.predicted_home_score != null && (
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <p className="text-text-secondary text-sm mb-2">推荐比分</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-text-primary font-medium">{getTeamName(match.home_team)}</span>
                    <span className="text-4xl font-bold text-accent-gold">{match.predicted_home_score} - {match.predicted_away_score}</span>
                    <span className="text-text-primary font-medium">{getTeamName(match.away_team)}</span>
                  </div>
                </div>
              )}
              
              {/* AI Analysis */}
              {match.ai_analysis && (
                <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <p className="text-text-secondary text-sm leading-relaxed">{match.ai_analysis}</p>
                </div>
              )}
            </div>
          )}

          {/* Prediction Section */}
          {match.status === 'upcoming' && (
            <div className="mb-6 p-6 rounded-xl" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
              <h3 className="text-xl font-bold text-text-primary mb-4">🎯 提交预测</h3>
              
              {myPrediction ? (
                <div className="text-center py-4">
                  <p className="text-text-secondary mb-2">你已预测</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-4xl font-bold text-accent-gold">{myPrediction.home_score}</span>
                    <span className="text-2xl text-text-secondary">:</span>
                    <span className="text-4xl font-bold text-accent-gold">{myPrediction.away_score}</span>
                  </div>
                  <p className="text-text-secondary text-sm mt-2">
                    预测时间：{new Date(myPrediction.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-text-secondary text-sm mb-2">{getTeamName(match.home_team)}</p>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      className="w-20 h-20 text-center text-3xl font-bold rounded-xl"
                      style={{ background: '#111827', border: '2px solid #1e293b', color: '#f8fafc', outline: 'none' }}
                      placeholder="0"
                    />
                  </div>

                  <span className="text-3xl font-bold text-text-secondary">:</span>

                  <div className="text-center">
                    <p className="text-text-secondary text-sm mb-2">{getTeamName(match.away_team)}</p>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      className="w-20 h-20 text-center text-3xl font-bold rounded-xl"
                      style={{ background: '#111827', border: '2px solid #1e293b', color: '#f8fafc', outline: 'none' }}
                      placeholder="0"
                    />
                  </div>

                  <button
                    onClick={handlePredict}
                    disabled={submitting || homeScore === '' || awayScore === ''}
                    className="px-8 py-4 rounded-xl font-bold text-lg transition-all"
                    style={{
                      background: submitting || homeScore === '' || awayScore === ''
                        ? '#64748b'
                        : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      color: '#0a0e17',
                      cursor: submitting || homeScore === '' || awayScore === '' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submitting ? '提交中...' : '提交预测'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* All Predictions */}
          <div className="p-6 rounded-xl" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
            <h3 className="text-xl font-bold text-text-primary mb-4">
              📊 预测统计 ({predictions.length}人参与)
            </h3>

            {predictions.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                暂无预测数据
              </div>
            ) : (
              <div className="space-y-3">
                {predictions.map((pred, idx) => (
                  <div
                    key={pred.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: pred.user_id === user?.id ? 'rgba(212, 175, 55, 0.1)' : '#111827',
                      border: `1px solid ${pred.user_id === user?.id ? '#d4af37' : '#1e293b'}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary text-sm w-8">#{idx + 1}</span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: '#d4af37', color: '#0a0e17' }}
                      >
                        {pred.nickname?.[0] || pred.username?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {pred.nickname || pred.username}
                          {pred.user_id === user?.id && (
                            <span className="ml-2 text-xs" style={{ color: '#d4af37' }}>(我)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-accent-gold">{pred.home_score}</span>
                      <span className="text-text-secondary">:</span>
                      <span className="text-xl font-bold text-accent-gold">{pred.away_score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'chat' && (
        <div className="h-[500px]">
          <ChatRoom matchId={parseInt(id)} user={user} />
        </div>
      )}
    </div>
  )
}

export default MatchDetail
