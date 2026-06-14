import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { API_BASE } from '../config'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
    fetchLeaderboard()
  }, [timeRange])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

      const response = await fetch(`${API_BASE}/leaderboard?range=${timeRange}`, { headers })
      const data = await response.json()

      if (response.ok) {
        setLeaderboard(data.leaderboard || [])
      } else {
        toast.error('获取排行榜失败')
      }
    } catch (error) {
      toast.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>
    if (rank === 2) return <span className="text-2xl">🥈</span>
    if (rank === 3) return <span className="text-2xl">🥉</span>
    return <span className="text-text-secondary font-bold">#{rank}</span>
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return { background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', border: '#d4af37' }
    if (rank === 2) return { background: '#c0c0c0', border: '#a8a8a8' }
    if (rank === 3) return { background: '#cd7f32', border: '#b87333' }
    return { background: '#1a2332', border: '#1e293b' }
  }

  const getAvatarColor = (index) => {
    const colors = ['#d4af37', '#f4d03f', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
    return colors[index % colors.length]
  }

  const timeRanges = [
    { id: 'all', label: '全部时间' },
    { id: 'week', label: '本周' },
    { id: 'month', label: '本月' }
  ]

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          🏆 排行榜
        </h1>
        <p className="text-text-secondary">
          与好友比拼预测准确率
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2 mb-6">
        {timeRanges.map(range => (
          <button
            key={range.id}
            onClick={() => setTimeRange(range.id)}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: timeRange === range.id
                ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                : '#1a2332',
              color: timeRange === range.id ? '#0a0e17' : '#94a3b8',
              border: `1px solid ${timeRange === range.id ? '#d4af37' : '#1e293b'}`
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {!loading && leaderboard.length >= 3 && (
        <div className="mb-8 flex items-end justify-center gap-4">
          {/* 2nd Place */}
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2"
              style={{ background: '#c0c0c0', color: '#1a2332' }}
            >
              {leaderboard[1]?.nickname?.[0] || 'U'}
            </div>
            <p className="text-text-primary font-bold text-sm truncate max-w-[80px]">
              {leaderboard[1]?.nickname || 'Unknown'}
            </p>
            <p className="text-accent-gold font-bold">{leaderboard[1]?.points || 0}分</p>
            <div className="mt-2 text-3xl">🥈</div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-2"
              style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', color: '#0a0e17' }}
            >
              {leaderboard[0]?.nickname?.[0] || 'U'}
            </div>
            <p className="text-text-primary font-bold truncate max-w-[100px]">
              {leaderboard[0]?.nickname || 'Unknown'}
            </p>
            <p className="text-accent-gold font-bold text-lg">{leaderboard[0]?.points || 0}分</p>
            <div className="mt-2 text-4xl">🥇</div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2"
              style={{ background: '#cd7f32', color: '#fff' }}
            >
              {leaderboard[2]?.nickname?.[0] || 'U'}
            </div>
            <p className="text-text-primary font-bold text-sm truncate max-w-[80px]">
              {leaderboard[2]?.nickname || 'Unknown'}
            </p>
            <p className="text-accent-gold font-bold">{leaderboard[2]?.points || 0}分</p>
            <div className="mt-2 text-3xl">🥉</div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-text-primary mb-2">暂无排行数据</h3>
          <p className="text-text-secondary">参与预测即可上榜</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const rank = index + 1
            const rankStyle = getRankStyle(rank)
            const isCurrentUser = currentUser && user.id === currentUser.id

            return (
              <div
                key={user.id}
                className="p-4 rounded-xl flex items-center gap-4 transition-all"
                style={{
                  background: isCurrentUser ? 'rgba(212, 175, 55, 0.1)' : rankStyle.background,
                  border: `1px solid ${isCurrentUser ? '#d4af37' : rankStyle.border}`
                }}
              >
                {/* Rank */}
                <div className="w-12 text-center">
                  {getRankBadge(rank)}
                </div>

                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ background: getAvatarColor(index), color: '#0a0e17' }}
                >
                  {user.nickname?.[0] || 'U'}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-text-primary truncate">
                      {user.nickname || user.username}
                    </p>
                    {isCurrentUser && (
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#d4af37', color: '#0a0e17' }}>
                        我
                      </span>
                    )}
                    {user.role === 'admin' && (
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#ef4444', color: '#fff' }}>
                        管理员
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm">
                    预测 {user.total_predictions || 0} 场 · 正确 {user.correct_predictions || 0} 场
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent-gold">{user.points || 0}</p>
                  <p className="text-text-secondary text-sm">积分</p>
                </div>

                {/* Accuracy */}
                <div className="text-right w-20">
                  <p className="text-lg font-bold text-green-500">
                    {user.total_predictions > 0
                      ? Math.round((user.correct_predictions / user.total_predictions) * 100)
                      : 0}%
                  </p>
                  <p className="text-text-secondary text-xs">准确率</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* My Ranking Card */}
      {currentUser && (
        <div className="mt-8 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1a2332 100%)', border: '1px solid #2d4a6f' }}>
          <h3 className="text-text-secondary text-sm mb-3">我的排名</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: '#d4af37', color: '#0a0e17' }}
              >
                {currentUser.nickname?.[0] || 'U'}
              </div>
              <div>
                <p className="font-bold text-text-primary">{currentUser.nickname}</p>
                <p className="text-text-secondary text-sm">
                  第 {leaderboard.findIndex(u => u.id === currentUser.id) + 1 || '-'} 名
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-accent-gold">{currentUser.points || 0}</p>
              <p className="text-text-secondary text-sm">积分</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
