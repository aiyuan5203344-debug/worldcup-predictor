import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ nickname: '' })
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    setFormData({ nickname: userData.nickname || '' })
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    try {
      const data = await api.get('/predictions')
      if (data.predictions) {
        setPredictions(data.predictions || [])
      }
    } catch (error) {
      console.error('Failed to fetch predictions')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!formData.nickname.trim()) {
      toast.error('昵称不能为空')
      return
    }

    try {
      const result = await api.put('/auth/profile', { nickname: formData.nickname })

      if (result.user) {
        const updatedUser = { ...user, nickname: formData.nickname }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setEditing(false)
        toast.success('更新成功')
      } else {
        toast.error('更新失败')
      }
    } catch (error) {
      toast.error('网络错误')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
    window.location.reload()
  }

  const getStats = () => {
    const total = predictions.length
    const correct = predictions.filter(p => p.is_correct === 1).length
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
    return { total, correct, accuracy }
  }

  const getTeamFlag = (teamCode) => {
    const flags = {
      'BRA': '🇧🇷', 'ARG': '🇦🇷', 'FRA': '🇫🇷', 'GER': '🇩🇪', 'ESP': '🇪🇸',
      'ENG': '🏴', 'ITA': '🇮🇹', 'NED': '🇳🇱', 'POR': '🇵🇹', 'BEL': '🇧🇪'
    }
    return flags[teamCode] || '🏳️'
  }

  if (!user) return null

  const stats = getStats()

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          👤 个人中心
        </h1>
        <p className="text-text-secondary">
          管理你的账号和查看预测历史
        </p>
      </div>

      {/* User Card */}
      <div className="mb-6 p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1a2332 100%)', border: '1px solid #2d4a6f' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', color: '#0a0e17' }}
            >
              {user.nickname?.[0] || user.username?.[0] || 'U'}
            </div>
            <div>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ nickname: e.target.value })}
                    className="px-3 py-1 rounded-lg text-text-primary"
                    style={{ background: '#111827', border: '1px solid #1e293b' }}
                  />
                  <button
                    onClick={handleUpdateProfile}
                    className="px-3 py-1 rounded-lg text-sm font-medium"
                    style={{ background: '#22c55e', color: '#fff' }}
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1 rounded-lg text-sm font-medium"
                    style={{ background: '#64748b', color: '#fff' }}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-text-primary">{user.nickname}</p>
                  <p className="text-text-secondary">@{user.username}</p>
                </>
              )}
              <div className="flex items-center gap-2 mt-2">
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#ef4444', color: '#fff' }}>
                    👑 管理员
                  </span>
                )}
                {user.email_verified === 1 ? (
                  <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#22c55e', color: '#fff' }}>
                    ✓ 已验证
                  </span>
                ) : user.email ? (
                  <Link 
                    to={`/verify-email?email=${encodeURIComponent(user.email)}`}
                    className="px-2 py-0.5 rounded text-xs hover:opacity-80"
                    style={{ background: '#f59e0b', color: '#000', textDecoration: 'none' }}
                  >
                    ✉️ 验证邮箱
                  </Link>
                ) : null}
                <span className="text-text-secondary text-sm">
                  加入于 {new Date(user.created_at || Date.now()).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#1e293b', color: '#94a3b8' }}
            >
              ✏️ 编辑
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '当前积分', value: user.points || 0, icon: '💰', color: '#d4af37' },
          { label: '预测场次', value: stats.total, icon: '🎯', color: '#3b82f6' },
          { label: '预测正确', value: stats.correct, icon: '✅', color: '#22c55e' },
          { label: '准确率', value: `${stats.accuracy}%`, icon: '📊', color: '#8b5cf6' }
        ].map((stat, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl text-center"
            style={{ background: '#1a2332', border: '1px solid #1e293b' }}
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-text-secondary text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Predictions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">📝 最近预测</h2>
          {predictions.length > 5 && (
            <span className="text-text-secondary text-sm">显示最近5条</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-10 rounded-xl" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
            <p className="text-text-secondary">暂无预测记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.slice(0, 5).map(pred => (
              <div
                key={pred.id}
                className="p-4 rounded-xl flex items-center justify-between"
                style={{
                  background: '#1a2332',
                  border: `1px solid ${pred.is_correct === 1 ? '#22c55e' : pred.is_correct === 0 ? '#ef4444' : '#1e293b'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTeamFlag(pred.home_team)}</span>
                  <div>
                    <p className="font-bold text-text-primary">{pred.home_team}</p>
                    <p className="text-text-secondary text-xs">主队</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-accent-gold">{pred.home_score}</span>
                    <span className="text-text-secondary">:</span>
                    <span className="text-xl font-bold text-accent-gold">{pred.away_score}</span>
                  </div>
                  {pred.is_correct === 1 && (
                    <span className="text-green-500 text-xs">✓ 正确</span>
                  )}
                  {pred.is_correct === 0 && (
                    <span className="text-red-500 text-xs">✗ 错误</span>
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
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/predict')}
          className="w-full p-4 rounded-xl text-left flex items-center justify-between transition-all hover:scale-[1.01]"
          style={{ background: '#1a2332', border: '1px solid #1e293b' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-text-primary">继续预测</span>
          </div>
          <span className="text-text-secondary">→</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full p-4 rounded-xl text-left flex items-center justify-between transition-all hover:scale-[1.01]"
          style={{ background: '#1a2332', border: '1px solid #ef4444' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚪</span>
            <span className="font-bold text-red-500">退出登录</span>
          </div>
          <span className="text-red-500">→</span>
        </button>
      </div>
    </div>
  )
}

export default Profile
