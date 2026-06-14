import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const DailyCheckin = ({ onCheckin }) => {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const data = await api.get('/checkin/status')
      if (data && !data.error) {
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch checkin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async () => {
    if (status?.checkedInToday) {
      toast('今日已签到', { icon: '✅' })
      return
    }

    setChecking(true)
    try {
      const result = await api.post('/checkin')
      if (result.success) {
        toast.success(result.message)
        await fetchStatus()
        if (onCheckin) onCheckin(result)
      } else {
        toast.error(result.error || '签到失败')
      }
    } catch (error) {
      toast.error('签到失败，请重试')
    } finally {
      setChecking(false)
    }
  }

  const getStreakBonus = (streak) => {
    if (streak >= 30) return { text: '30天', color: '#ffd700', points: 100 }
    if (streak >= 14) return { text: '14天', color: '#ff6b35', points: 50 }
    if (streak >= 7) return { text: '7天', color: '#00d4ff', points: 30 }
    if (streak >= 3) return { text: '3天', color: '#00ff87', points: 20 }
    return { text: '连续', color: '#a0a0a0', points: 10 }
  }

  if (loading) {
    return (
      <div className="card p-4">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-14 h-14 rounded-full" style={{ background: '#2a2a2a' }}></div>
          <div className="flex-1">
            <div className="h-4 w-24 rounded" style={{ background: '#2a2a2a' }}></div>
            <div className="h-3 w-16 rounded mt-2" style={{ background: '#2a2a2a' }}></div>
          </div>
        </div>
      </div>
    )
  }

  const streakBonus = getStreakBonus(status?.currentStreak || 0)

  return (
    <div className="card p-4" style={{ 
      borderLeft: '4px solid #00ff87'
    }}>
      <div className="flex items-center justify-between">
        {/* Left: Checkin Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ 
              background: status?.checkedInToday 
                ? 'rgba(0, 255, 135, 0.2)' 
                : 'rgba(0, 212, 255, 0.1)',
              border: `2px solid ${status?.checkedInToday ? '#00ff87' : '#00d4ff'}`
            }}>
            {status?.checkedInToday ? '✅' : '📅'}
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ 
              fontFamily: 'Oswald, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {status?.checkedInToday ? '今日已签到' : '每日签到'}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: streakBonus.color, fontWeight: '700' }}>
                连续 {status?.currentStreak || 0} 天
              </span>
              {status?.currentStreak >= 3 && (
                <span className="px-2 py-0.5 rounded text-xs font-bold" 
                  style={{ 
                    background: `${streakBonus.color}20`, 
                    color: streakBonus.color,
                    border: `1px solid ${streakBonus.color}40`
                  }}>
                  +{streakBonus.points}积分
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Checkin Button */}
        <button
          onClick={handleCheckin}
          disabled={checking || status?.checkedInToday}
          className="px-6 py-3 rounded-lg font-bold transition-all"
          style={{
            background: status?.checkedInToday
              ? '#2a2a2a'
              : checking
                ? '#2a2a2a'
                : 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
            color: status?.checkedInToday || checking ? '#606060' : '#0a0a0a',
            cursor: status?.checkedInToday || checking ? 'not-allowed' : 'pointer',
            minWidth: '100px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: status?.checkedInToday || checking ? 'none' : '0 0 20px rgba(0, 255, 135, 0.3)'
          }}
        >
          {checking ? '签到中...' : status?.checkedInToday ? '已签到' : '签到'}
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #2a2a2a' }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: '#00ff87' }}>{status?.totalCheckins || 0}</p>
          <p className="text-xs" style={{ color: '#606060' }}>总签到</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: '#00d4ff' }}>{status?.monthCheckins?.length || 0}</p>
          <p className="text-xs" style={{ color: '#606060' }}>本月签到</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: '#ff6b35' }}>{status?.totalPoints || 0}</p>
          <p className="text-xs" style={{ color: '#606060' }}>签到积分</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: streakBonus.color }}>
            {status?.currentStreak || 0}
          </p>
          <p className="text-xs" style={{ color: '#606060' }}>连续签到</p>
        </div>
      </div>

      {/* Streak Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-2" style={{ color: '#606060' }}>
          <span>签到进度</span>
          <span>下一档: {status?.currentStreak < 3 ? '3天' : status?.currentStreak < 7 ? '7天' : status?.currentStreak < 14 ? '14天' : '30天'}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ 
            width: `${Math.min(((status?.currentStreak || 0) / 30) * 100, 100)}%`,
            background: 'linear-gradient(90deg, #00ff87, #00d4ff)'
          }} />
        </div>
        <div className="flex justify-between mt-1 text-xs" style={{ color: '#606060' }}>
          <span>3天</span>
          <span>7天</span>
          <span>14天</span>
          <span>30天</span>
        </div>
      </div>
    </div>
  )
}

export default DailyCheckin
