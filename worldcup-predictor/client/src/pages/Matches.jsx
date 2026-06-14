import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getTeamName, getTeamFlag } from '../utils/teams'
import CalendarView from '../components/Common/CalendarView'
import api from '../services/api'

const Matches = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', group: '', stage: '' })
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grouped')  // grouped, list, calendar
  const [selectedDate, setSelectedDate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const refreshInterval = useRef(null)

  const fetchMatches = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.group) params.append('group', filter.group)
      if (filter.stage) params.append('stage', filter.stage)
      params.append('limit', '200')

      const data = await api.get(`/matches?${params}`, { requireAuth: false })

      if (data.matches) {
        setMatches(data.matches || [])
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Fetch matches error:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  useEffect(() => {
    const hasLiveMatches = matches.some(m => m.status === 'live')
    if (hasLiveMatches && !autoRefresh) {
      setAutoRefresh(true)
    }
  }, [matches])

  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(fetchMatches, 60000)
    } else {
      if (refreshInterval.current) clearInterval(refreshInterval.current)
    }
    return () => { if (refreshInterval.current) clearInterval(refreshInterval.current) }
  }, [autoRefresh, fetchMatches])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await api.post('/worldcup/sync')
      if (result.synced !== undefined) {
        toast.success(`同步完成: ${result.synced}新增, ${result.updated}更新`)
        fetchMatches()
      } else {
        toast.error(result.error || '同步失败')
      }
    } catch (error) {
      toast.error('同步失败')
    } finally {
      setSyncing(false)
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
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 10px', background: s.bg, color: s.color,
        borderRadius: '12px', fontSize: '12px', fontWeight: '600'
      }}>
        {s.pulse && <span style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />}
        {s.text}
      </span>
    )
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }),
      time: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      fullDate: date.toISOString().split('T')[0]
    }
  }

  // Group matches by date
  const groupMatchesByDate = (matches) => {
    const grouped = {}
    matches.forEach(match => {
      const { fullDate } = formatDate(match.match_time)
      if (!grouped[fullDate]) {
        grouped[fullDate] = []
      }
      grouped[fullDate].push(match)
    })
    
    // Sort dates
    const sortedDates = Object.keys(grouped).sort()
    return sortedDates.map(date => ({
      date,
      matches: grouped[date].sort((a, b) => new Date(a.match_time) - new Date(b.match_time))
    }))
  }

  const getAIPredictionBadge = (match) => {
    if (match.status !== 'upcoming' || !match.ai_confidence) return null
    const confidence = match.ai_confidence
    let color = '#10b981'
    if (confidence < 60) color = '#f59e0b'
    if (confidence < 40) color = '#ef4444'

    return (
      <div className="mt-2 p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-blue-400 font-medium">🤖 AI预测</span>
          <span style={{ color }}>{confidence}% 置信度</span>
        </div>
        
        {/* Three Probability Bars - Compact */}
        {match.home_win_prob != null && (
          <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-2">
            <div style={{ width: `${match.home_win_prob}%`, background: '#3b82f6' }} title={`主胜 ${match.home_win_prob}%`} />
            <div style={{ width: `${match.draw_prob}%`, background: '#f59e0b' }} title={`平局 ${match.draw_prob}%`} />
            <div style={{ width: `${match.away_win_prob}%`, background: '#ef4444' }} title={`客胜 ${match.away_win_prob}%`} />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs">
            {match.home_win_prob != null && (
              <>
                <span className="text-blue-400">主胜 {match.home_win_prob}%</span>
                <span className="text-yellow-400">平 {match.draw_prob}%</span>
                <span className="text-red-400">客胜 {match.away_win_prob}%</span>
              </>
            )}
          </div>
          {match.predicted_home_score != null && (
            <span className="text-accent-gold font-bold text-xs">推荐: {match.predicted_home_score}-{match.predicted_away_score}</span>
          )}
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'all', label: '全部', icon: '📋' },
    { id: 'live', label: '进行中', icon: '🔴' },
    { id: 'upcoming', label: '未开始', icon: '📅' },
    { id: 'finished', label: '已结束', icon: '✅' }
  ]

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  
  const stages = [
    { value: '', label: '全部阶段' },
    { value: '小组赛', label: '小组赛' },
    { value: '32强', label: '32强' },
    { value: '16强', label: '16强' },
    { value: '8强', label: '8强' },
    { value: '4强', label: '4强' },
    { value: '季军赛', label: '季军赛' },
    { value: '决赛', label: '决赛' }
  ]

  const filteredMatches = matches.filter(match => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const homeName = getTeamName(match.home_team).toLowerCase()
    const awayName = getTeamName(match.away_team).toLowerCase()
    return homeName.includes(query) || awayName.includes(query)
  })

  const groupedMatches = groupMatchesByDate(filteredMatches)

  const renderMatchCard = (match) => {
    const { date, time } = formatDate(match.match_time)
    return (
      <Link
        key={match.id}
        to={`/matches/${match.id}`}
        className="block p-3 rounded-xl transition-all hover:scale-[1.01]"
        style={{ background: '#1a2332', border: '1px solid #1e293b' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm">{time}</span>
            {match.group_name && (
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#1e293b', color: '#94a3b8' }}>
                {match.group_name}组
              </span>
            )}
            {match.stage && match.stage !== '小组赛' && (
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#7c3aed', color: '#ddd6fe' }}>
                {match.stage}
              </span>
            )}
          </div>
          {getStatusBadge(match.status)}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{getTeamFlag(match.home_team)}</span>
            <p className="font-bold text-text-primary text-sm truncate">{match.home_name_cn || getTeamName(match.home_team)}</p>
          </div>

          <div className="px-4 text-center">
            {match.status === 'finished' || match.status === 'live' ? (
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-accent-gold">{match.home_score ?? '-'}</span>
                <span className="text-text-secondary">:</span>
                <span className="text-2xl font-bold text-accent-gold">{match.away_score ?? '-'}</span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-text-secondary text-lg">VS</span>
                {match.predicted_home_score !== null && (
                  <div className="text-xs text-blue-400 mt-1">
                    AI: {match.predicted_home_score}-{match.predicted_away_score}
                  </div>
                )}
              </div>
            )}
            {match.status === 'live' && (
              <span className="text-red-500 text-xs font-medium animate-pulse">
                ● LIVE {match.current_minute && `${match.current_minute}'`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <p className="font-bold text-text-primary text-sm truncate text-right">{match.away_name_cn || getTeamName(match.away_team)}</p>
            <span className="text-2xl">{getTeamFlag(match.away_team)}</span>
          </div>
        </div>

        {getAIPredictionBadge(match)}
      </Link>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">⚽ 赛事中心</h1>
            <p className="text-text-secondary">2026世界杯全部赛程，AI智能预测 + 实时比分</p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-text-muted text-xs hidden md:block">
                更新于 {lastRefresh.toLocaleTimeString('zh-CN')}
              </span>
            )}
            {autoRefresh && (
              <span className="flex items-center gap-1 text-green-400 text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                自动刷新中
              </span>
            )}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: syncing ? '#374151' : 'rgba(59, 130, 246, 0.2)',
                color: syncing ? '#9ca3af' : '#60a5fa',
                border: `1px solid ${syncing ? '#4b5563' : 'rgba(59, 130, 246, 0.3)'}`
              }}
            >
              <span className={syncing ? 'animate-spin' : ''}>🔄</span>
              <span className="hidden sm:inline">{syncing ? '同步中...' : '同步数据'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setFilter(prev => ({ ...prev, status: tab.id === 'all' ? '' : tab.id }))
            }}
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
        
        {/* View Mode Toggle */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setViewMode('grouped')}
            className="p-2 rounded-lg transition-all"
            style={{
              background: viewMode === 'grouped' ? '#d4af37' : '#1a2332',
              color: viewMode === 'grouped' ? '#0a0e17' : '#94a3b8',
              border: `1px solid ${viewMode === 'grouped' ? '#d4af37' : '#1e293b'}`
            }}
            title="按日期分组"
          >
            📅
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="p-2 rounded-lg transition-all"
            style={{
              background: viewMode === 'list' ? '#d4af37' : '#1a2332',
              color: viewMode === 'list' ? '#0a0e17' : '#94a3b8',
              border: `1px solid ${viewMode === 'list' ? '#d4af37' : '#1e293b'}`
            }}
            title="列表视图"
          >
            📋
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className="p-2 rounded-lg transition-all"
            style={{
              background: viewMode === 'calendar' ? '#d4af37' : '#1a2332',
              color: viewMode === 'calendar' ? '#0a0e17' : '#94a3b8',
              border: `1px solid ${viewMode === 'calendar' ? '#d4af37' : '#1e293b'}`
            }}
            title="日历视图"
          >
            🗓️
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="搜索球队..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-xl text-text-primary"
          style={{ background: '#1a2332', border: '1px solid #1e293b' }}
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Group Filter */}
      <div className="mb-3">
        <p className="text-text-secondary text-sm mb-2">按小组筛选</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter(prev => ({ ...prev, group: '' }))}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: !filter.group ? '#d4af37' : '#1a2332',
              color: !filter.group ? '#0a0e17' : '#94a3b8',
              border: `1px solid ${!filter.group ? '#d4af37' : '#1e293b'}`
            }}
          >
            全部
          </button>
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setFilter(prev => ({ ...prev, group: g }))}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: filter.group === g ? '#d4af37' : '#1a2332',
                color: filter.group === g ? '#0a0e17' : '#94a3b8',
                border: `1px solid ${filter.group === g ? '#d4af37' : '#1e293b'}`
              }}
            >
              {g}组
            </button>
          ))}
        </div>
      </div>

      {/* Stage Filter */}
      <div className="mb-4">
        <p className="text-text-secondary text-sm mb-2">按阶段筛选</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {stages.map(s => (
            <button
              key={s.value}
              onClick={() => setFilter(prev => ({ ...prev, stage: s.value }))}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: filter.stage === s.value ? '#8b5cf6' : '#1a2332',
                color: filter.stage === s.value ? '#fff' : '#94a3b8',
                border: `1px solid ${filter.stage === s.value ? '#8b5cf6' : '#1e293b'}`
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-xl font-bold text-text-primary mb-2">暂无比赛数据</h3>
          <p className="text-text-secondary">比赛开始后将显示实时比分</p>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View */
        <CalendarView
          matches={filteredMatches}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      ) : viewMode === 'grouped' ? (
        /* Grouped by Date View */
        <div className="space-y-6">
          {groupedMatches.map(({ date, matches: dayMatches }) => {
            const d = new Date(date)
            const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
            const isPast = d < new Date(new Date().toDateString())
            
            return (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`px-4 py-2 rounded-xl ${isToday ? 'bg-accent-gold text-black' : isPast ? 'bg-gray-700 text-gray-300' : 'bg-blue-600 text-white'}`}>
                    <div className="text-lg font-bold">
                      {d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-xs opacity-80">
                      {d.toLocaleDateString('zh-CN', { weekday: 'long' })}
                    </div>
                  </div>
                  {isToday && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                      今天
                    </span>
                  )}
                  <span className="text-text-secondary text-sm">
                    {dayMatches.length}场比赛
                  </span>
                  <div className="flex-1 h-px bg-border-color"></div>
                </div>
                
                {/* Matches for this date */}
                <div className="grid gap-3">
                  {dayMatches.map(match => renderMatchCard(match))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="grid gap-3">
          {filteredMatches.map(match => renderMatchCard(match))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '总场次', value: matches.length, icon: '⚽' },
          { label: '已结束', value: matches.filter(m => m.status === 'finished').length, icon: '✅' },
          { label: '进行中', value: matches.filter(m => m.status === 'live').length, icon: '🔴' },
          { label: '未开始', value: matches.filter(m => m.status === 'upcoming').length, icon: '📅' }
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl text-center" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold text-accent-gold mt-1">{stat.value}</p>
            <p className="text-text-secondary text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Matches
