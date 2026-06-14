import { useState, useEffect } from 'react'
import api from '../services/api'

const Achievements = () => {
  const [achievements, setAchievements] = useState([])
  const [stats, setStats] = useState({ total: 0, unlocked: 0, points: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const data = await api.get('/achievements')
      if (data.achievements) {
        setAchievements(data.achievements || [])
        setStats(data.stats || { total: 0, unlocked: 0, points: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkNewAchievements = async () => {
    try {
      const data = await api.post('/achievements/check', {})
      if (data.newAchievements?.length > 0) {
        fetchAchievements() // Refresh list
      }
    } catch (error) {
      console.error('Check achievements error:', error)
    }
  }

  const filteredAchievements = achievements.filter(a => {
    if (activeTab === 'unlocked') return a.unlocked
    if (activeTab === 'locked') return !a.unlocked
    return true
  })

  const getProgressWidth = () => {
    if (stats.total === 0) return 0
    return (stats.unlocked / stats.total) * 100
  }

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
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">🏆 成就系统</h1>
        <p className="text-text-secondary">完成挑战，解锁成就，展示你的预测实力</p>
      </div>

      {/* Stats Card */}
      <div className="mb-6 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #1a2332 0%, #0f172a 100%)', border: '1px solid #1e293b' }}>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p className="text-3xl font-bold" style={{ 
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{stats.unlocked}</p>
            <p className="text-text-secondary text-sm">已解锁</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: '#10b981' }}>{stats.total}</p>
            <p className="text-text-secondary text-sm">总成就</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>{stats.points}</p>
            <p className="text-text-secondary text-sm">积分</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">完成进度</span>
            <span className="text-accent-gold">{Math.round(getProgressWidth())}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${getProgressWidth()}%`,
                background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 100%)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: '全部', icon: '📋' },
          { id: 'unlocked', label: '已解锁', icon: '✅' },
          { id: 'locked', label: '未解锁', icon: '🔒' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? '#d4af37' : '#1a2332',
              color: activeTab === tab.id ? '#0a0e17' : '#94a3b8',
              border: `1px solid ${activeTab === tab.id ? '#d4af37' : '#1e293b'}`
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            {activeTab === 'unlocked' ? '暂无解锁成就' : '暂无成就数据'}
          </h3>
          <p className="text-text-secondary">
            {activeTab === 'unlocked' ? '继续努力，解锁更多成就！' : '成就系统正在加载中'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.type}
              className="p-4 rounded-xl transition-all"
              style={{ 
                background: achievement.unlocked ? 'linear-gradient(135deg, #1a2332 0%, #0f172a 100%)' : '#111827',
                border: `1px solid ${achievement.unlocked ? '#d4af37' : '#1e293b'}`,
                opacity: achievement.unlocked ? 1 : 0.6
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-text-primary">{achievement.name}</h3>
                    {achievement.unlocked && (
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#22c55e', color: '#fff' }}>
                        已解锁
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent-gold text-sm font-medium">+{achievement.points} 积分</span>
                    {achievement.unlocked && achievement.unlocked_at && (
                      <span className="text-text-muted text-xs">
                        {new Date(achievement.unlocked_at).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Check for new achievements button */}
      <div className="mt-8 text-center">
        <button
          onClick={checkNewAchievements}
          className="px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            color: '#0a0e17'
          }}
        >
          🔄 检查新成就
        </button>
      </div>
    </div>
  )
}

export default Achievements
