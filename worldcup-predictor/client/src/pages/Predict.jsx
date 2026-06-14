import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { API_BASE } from '../config'

const Predict = () => {
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

      const [matchesRes, predictionsRes] = await Promise.all([
        fetch(`${API_BASE}/matches?status=upcoming&limit=50`, { headers }),
        token ? fetch(`${API_BASE}/predictions`, { headers }) : Promise.resolve({ ok: false })
      ])

      const matchesData = await matchesRes.json()
      const predictionsData = predictionsRes.ok ? await predictionsRes.json() : { predictions: [] }

      setMatches(matchesData.matches || [])
      setPredictions(predictionsData.predictions || [])
    } catch (error) {
      toast.error('数据加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async (matchId, homeScore, awayScore) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    if (homeScore === '' || awayScore === '') {
      toast.error('请输入比分')
      return
    }

    setSubmitting(matchId)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${API_BASE}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          match_id: matchId,
          home_score: parseInt(homeScore),
          away_score: parseInt(awayScore)
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('预测成功！')
        fetchData()
      } else {
        toast.error(data.error || '预测失败')
      }
    } catch (error) {
      toast.error('网络错误')
    } finally {
      setSubmitting(null)
    }
  }

  const getPredictionForMatch = (matchId) => {
    return predictions.find(p => p.match_id === matchId)
  }

  const getTeamFlag = (teamCode) => {
    const flags = {
      'BRA': '🇧🇷', 'ARG': '🇦🇷', 'FRA': '🇫🇷', 'GER': '🇩🇪', 'ESP': '🇪🇸',
      'ENG': '🏴', 'ITA': '🇮🇹', 'NED': '🇳🇱', 'POR': '🇵🇹', 'BEL': '🇧🇪',
      'CRO': '🇭🇷', 'JPN': '🇯🇵', 'KOR': '🇰🇷', 'MEX': '🇲🇽', 'USA': '🇺🇸',
      'CHN': '🇨🇳', 'AUS': '🇦🇺', 'CAN': '🇨🇦', 'MAR': '🇲🇦', 'SEN': '🇸🇳'
    }
    return flags[teamCode] || '🏳️'
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">请先登录</h2>
          <p className="text-text-secondary">登录后即可参与比赛预测</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          🎯 比赛预测
        </h1>
        <p className="text-text-secondary">
          预测比赛结果，赢取积分奖励
        </p>
      </div>

      {/* User Stats */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1a2332 100%)', border: '1px solid #2d4a6f' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm">当前积分</p>
            <p className="text-3xl font-bold text-accent-gold">{user.points || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-sm">已预测</p>
            <p className="text-2xl font-bold text-text-primary">{predictions.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'upcoming', label: '可预测', icon: '🎯' },
          { id: 'my', label: '我的预测', icon: '📝' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                : '#1a2332',
              color: activeTab === tab.id ? '#0a0e17' : '#94a3b8',
              border: `1px solid ${activeTab === tab.id ? '#d4af37' : '#1e293b'}`
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
        </div>
      ) : activeTab === 'upcoming' ? (
        matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">暂无可预测比赛</h3>
            <p className="text-text-secondary">新比赛开始后将显示在这里</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map(match => {
              const prediction = getPredictionForMatch(match.id)
              return (
                <div
                  key={match.id}
                  className="p-4 rounded-xl transition-all"
                  style={{
                    background: '#1a2332',
                    border: `1px solid ${prediction ? '#d4af37' : '#1e293b'}`
                  }}
                >
                  {/* Match Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary text-sm">{formatDate(match.match_time)}</span>
                      {match.group_name && (
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#1e293b', color: '#94a3b8' }}>
                          {match.group_name}组
                        </span>
                      )}
                    </div>
                    {prediction && (
                      <span className="px-2 py-1 rounded text-xs" style={{ background: '#059669', color: '#6ee7b7' }}>
                        ✓ 已预测
                      </span>
                    )}
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">{getTeamFlag(match.home_team)}</span>
                      <div>
                        <p className="font-bold text-text-primary">{match.home_team}</p>
                        <p className="text-text-secondary text-xs">主队</p>
                      </div>
                    </div>

                    <div className="px-4 text-center">
                      {prediction ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-accent-gold">
                            {prediction.home_score}
                          </span>
                          <span className="text-text-secondary">:</span>
                          <span className="text-2xl font-bold text-accent-gold">
                            {prediction.away_score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-secondary">VS</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <div className="text-right">
                        <p className="font-bold text-text-primary">{match.away_team}</p>
                        <p className="text-text-secondary text-xs">客队</p>
                      </div>
                      <span className="text-3xl">{getTeamFlag(match.away_team)}</span>
                    </div>
                  </div>

                  {/* Prediction Form */}
                  {!prediction ? (
                    <PredictionForm
                      match={match}
                      onSubmit={handlePredict}
                      loading={submitting === match.id}
                    />
                  ) : (
                    <div className="text-center py-2 text-text-secondary text-sm">
                      预测提交于 {new Date(prediction.created_at).toLocaleString('zh-CN')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* My Predictions Tab */
        predictions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">暂无预测记录</h3>
            <p className="text-text-secondary">去"可预测"页面提交你的第一个预测吧</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {predictions.map(pred => (
              <div
                key={pred.id}
                className="p-4 rounded-xl"
                style={{ background: '#1a2332', border: '1px solid #1e293b' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTeamFlag(pred.home_team)}</span>
                    <div>
                      <p className="font-bold text-text-primary">{pred.home_team}</p>
                      <p className="text-text-secondary text-xs">主队</p>
                    </div>
                  </div>

                  <div className="px-4 text-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-accent-gold">{pred.home_score}</span>
                      <span className="text-text-secondary">:</span>
                      <span className="text-xl font-bold text-accent-gold">{pred.away_score}</span>
                    </div>
                    {pred.points_earned > 0 && (
                      <span className="text-green-500 text-xs">+{pred.points_earned}分</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 justify-end">
                    <div className="text-right">
                      <p className="font-bold text-text-primary">{pred.away_team}</p>
                      <p className="text-text-secondary text-xs">客队</p>
                    </div>
                    <span className="text-2xl">{getTeamFlag(pred.away_team)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// Prediction Form Component
const PredictionForm = ({ match, onSubmit, loading }) => {
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')

  const handleSubmit = () => {
    onSubmit(match.id, homeScore, awayScore)
  }

  const inputStyle = {
    width: '60px',
    height: '50px',
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    background: '#111827',
    border: '2px solid #1e293b',
    borderRadius: '12px',
    color: '#f8fafc',
    outline: 'none'
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <input
        type="number"
        min="0"
        max="20"
        value={homeScore}
        onChange={(e) => setHomeScore(e.target.value)}
        style={inputStyle}
        placeholder="0"
      />
      <span className="text-2xl font-bold text-text-secondary">:</span>
      <input
        type="number"
        min="0"
        max="20"
        value={awayScore}
        onChange={(e) => setAwayScore(e.target.value)}
        style={inputStyle}
        placeholder="0"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || homeScore === '' || awayScore === ''}
        className="px-6 py-3 rounded-lg font-bold transition-all"
        style={{
          background: loading || homeScore === '' || awayScore === ''
            ? '#64748b'
            : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
          color: '#0a0e17',
          cursor: loading || homeScore === '' || awayScore === '' ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '提交中...' : '提交预测'}
      </button>
    </div>
  )
}

export default Predict
