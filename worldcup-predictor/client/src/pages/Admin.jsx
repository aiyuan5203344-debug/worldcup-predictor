import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API_BASE } from '../config'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }
    const userData = JSON.parse(storedUser)
    if (userData.role !== 'admin') {
      toast.error('无管理员权限')
      navigate('/')
      return
    }
    setUser(userData)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [usersRes, matchesRes] = await Promise.all([
        fetch(`${API_BASE}/admin/users`, { headers }),
        fetch(`${API_BASE}/matches?limit=200`, { headers })
      ])

      const usersData = await usersRes.json()
      const matchesData = await matchesRes.json()

      setUsers(usersData.users || [])
      setMatches(matchesData.matches || [])
    } catch (error) {
      toast.error('数据加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (userId, username) => {
    const newPassword = prompt(`请输入 ${username} 的新密码：`)
    if (!newPassword) return

    if (newPassword.length < 8) {
      toast.error('密码至少8位')
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, newPassword })
      })

      if (response.ok) {
        toast.success('密码重置成功')
      } else {
        const data = await response.json()
        toast.error(data.error || '重置失败')
      }
    } catch (error) {
      toast.error('网络错误')
    }
  }

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`确定要删除用户 ${username} 吗？`)) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('用户已删除')
        fetchData()
      } else {
        toast.error('删除失败')
      }
    } catch (error) {
      toast.error('网络错误')
    }
  }

  const handleSyncMatches = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${API_BASE}/admin/sync-matches`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('比赛数据同步成功')
        fetchData()
      } else {
        toast.error('同步失败')
      }
    } catch (error) {
      toast.error('网络错误')
    }
  }

  const tabs = [
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'matches', label: '比赛管理', icon: '⚽' },
    { id: 'stats', label: '数据统计', icon: '📊' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          ⚙️ 管理后台
        </h1>
        <p className="text-text-secondary">
          管理用户和比赛数据
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
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

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">用户列表 ({users.length})</h2>
          </div>
          <div className="space-y-3">
            {users.map(u => (
              <div
                key={u.id}
                className="p-4 rounded-xl flex items-center justify-between"
                style={{ background: '#1a2332', border: '1px solid #1e293b' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ background: u.role === 'admin' ? '#ef4444' : '#d4af37', color: '#fff' }}
                  >
                    {u.nickname?.[0] || u.username?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-text-primary">{u.nickname || u.username}</p>
                      {u.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#ef4444', color: '#fff' }}>
                          管理员
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-sm">@{u.username} · {u.points || 0}分</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResetPassword(u.id, u.username)}
                    className="px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: '#1e293b', color: '#94a3b8' }}
                  >
                    重置密码
                  </button>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ background: '#7f1d1d', color: '#fca5a5' }}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">比赛列表 ({matches.length})</h2>
            <button
              onClick={handleSyncMatches}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff' }}
            >
              🔄 同步比赛数据
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <th className="text-left p-3 text-text-secondary">ID</th>
                  <th className="text-left p-3 text-text-secondary">主队</th>
                  <th className="text-left p-3 text-text-secondary">客队</th>
                  <th className="text-left p-3 text-text-secondary">比分</th>
                  <th className="text-left p-3 text-text-secondary">状态</th>
                  <th className="text-left p-3 text-text-secondary">时间</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 50).map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td className="p-3 text-text-primary">{m.id}</td>
                    <td className="p-3 text-text-primary">{m.home_team}</td>
                    <td className="p-3 text-text-primary">{m.away_team}</td>
                    <td className="p-3 text-accent-gold font-bold">
                      {m.status === 'finished' || m.status === 'live'
                        ? `${m.home_score ?? '-'} : ${m.away_score ?? '-'}`
                        : '-'}
                    </td>
                    <td className="p-3">
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          background: m.status === 'live' ? '#dc2626' : m.status === 'finished' ? '#059669' : '#1e40af',
                          color: '#fff'
                        }}
                      >
                        {m.status === 'live' ? '进行中' : m.status === 'finished' ? '已结束' : '未开始'}
                      </span>
                    </td>
                    <td className="p-3 text-text-secondary text-sm">
                      {new Date(m.match_time).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '总用户数', value: users.length, icon: '👥', color: '#3b82f6' },
            { label: '管理员数', value: users.filter(u => u.role === 'admin').length, icon: '👑', color: '#ef4444' },
            { label: '总比赛数', value: matches.length, icon: '⚽', color: '#22c55e' },
            { label: '已结束', value: matches.filter(m => m.status === 'finished').length, icon: '✅', color: '#d4af37' }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl text-center"
              style={{ background: '#1a2332', border: '1px solid #1e293b' }}
            >
              <span className="text-3xl">{stat.icon}</span>
              <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Admin
