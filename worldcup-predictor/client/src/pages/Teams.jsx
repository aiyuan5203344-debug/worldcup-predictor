import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTeamName, getTeamFlag } from '../utils/teams'
import { API_BASE } from '../config'

const Teams = () => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [sortBy, setSortBy] = useState('ranking') // ranking, rating, value
  const [selectedTeam, setSelectedTeam] = useState(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE}/teams`)
      const data = await response.json()
      if (response.ok) {
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  const sortOptions = [
    { value: 'ranking', label: 'FIFA排名' },
    { value: 'rating', label: '实力评分' },
    { value: 'value', label: '球队身价' }
  ]

  const parseValue = (valueStr) => {
    if (!valueStr) return 0
    const str = valueStr.replace(/[€$£]/g, '').trim()
    if (str.includes('亿')) return parseFloat(str) * 100000000
    if (str.includes('万')) return parseFloat(str) * 10000
    return parseFloat(str) || 0
  }

  const filteredTeams = teams
    .filter(team => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const nameMatch = team.name_cn?.toLowerCase().includes(query) || 
                         team.name?.toLowerCase().includes(query) ||
                         team.code?.toLowerCase().includes(query)
        if (!nameMatch) return false
      }
      if (filterGroup && team.group_name !== filterGroup) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'ranking') return (a.fifa_ranking || 999) - (b.fifa_ranking || 999)
      if (sortBy === 'rating') return (b.strength_rating || 0) - (a.strength_rating || 0)
      if (sortBy === 'value') return parseValue(b.market_value) - parseValue(a.market_value)
      return 0
    })

  const getRatingColor = (rating) => {
    if (rating >= 85) return '#22c55e'
    if (rating >= 75) return '#3b82f6'
    if (rating >= 65) return '#f59e0b'
    return '#ef4444'
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
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">🏆 球队资料库</h1>
        <p className="text-text-secondary">2026世界杯48支球队完整数据</p>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="搜索球队名称或代码..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-xl text-text-primary"
          style={{ background: '#1a2332', border: '1px solid #1e293b' }}
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        {/* Group Filter */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-text-secondary text-sm mb-2">按小组筛选</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterGroup('')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: !filterGroup ? '#d4af37' : '#1a2332',
                color: !filterGroup ? '#0a0e17' : '#94a3b8',
                border: `1px solid ${!filterGroup ? '#d4af37' : '#1e293b'}`
              }}
            >
              全部
            </button>
            {groups.map(g => (
              <button
                key={g}
                onClick={() => setFilterGroup(g)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: filterGroup === g ? '#d4af37' : '#1a2332',
                  color: filterGroup === g ? '#0a0e17' : '#94a3b8',
                  border: `1px solid ${filterGroup === g ? '#d4af37' : '#1e293b'}`
                }}
              >
                {g}组
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <p className="text-text-secondary text-sm mb-2">排序方式</p>
          <div className="flex gap-2">
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: sortBy === opt.value ? '#8b5cf6' : '#1a2332',
                  color: sortBy === opt.value ? '#fff' : '#94a3b8',
                  border: `1px solid ${sortBy === opt.value ? '#8b5cf6' : '#1e293b'}`
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl text-center" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
          <p className="text-2xl font-bold text-accent-gold">{teams.length}</p>
          <p className="text-text-secondary text-sm">总球队</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
          <p className="text-2xl font-bold text-green-400">{teams.filter(t => t.strength_rating >= 85).length}</p>
          <p className="text-text-secondary text-sm">顶级强队</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
          <p className="text-2xl font-bold text-blue-400">{new Set(teams.map(t => t.confederation)).size}</p>
          <p className="text-text-secondary text-sm">大洲联合会</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
          <p className="text-2xl font-bold text-purple-400">{teams.filter(t => t.world_cup_titles > 0).length}</p>
          <p className="text-text-secondary text-sm">前冠军</p>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-xl font-bold text-text-primary mb-2">未找到匹配的球队</h3>
          <p className="text-text-secondary">请调整搜索条件</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map(team => (
            <div
              key={team.id}
              className="p-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: '#1a2332', border: '1px solid #1e293b' }}
              onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}
            >
              {/* Team Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{team.flag || getTeamFlag(team.code)}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary">{team.name_cn || getTeamName(team.code)}</h3>
                  <p className="text-text-secondary text-sm">{team.name} ({team.code})</p>
                </div>
                <div className="text-right">
                  <span className="text-accent-gold font-bold text-lg">#{team.fifa_ranking}</span>
                  <p className="text-text-secondary text-xs">FIFA排名</p>
                </div>
              </div>

              {/* Rating Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-secondary">实力评分</span>
                  <span className="font-bold" style={{ color: getRatingColor(team.strength_rating) }}>
                    {team.strength_rating}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                  <div className="h-full rounded-full" style={{ 
                    width: `${team.strength_rating}%`, 
                    background: getRatingColor(team.strength_rating)
                  }} />
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">身价</span>
                  <span className="text-text-primary">{team.market_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">冠军</span>
                  <span className="text-accent-gold">{team.world_cup_titles}次</span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedTeam?.id === team.id && (
                <div className="mt-4 pt-4 border-t border-border-primary space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">大洲</span>
                    <span className="text-text-primary">{team.confederation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">主教练</span>
                    <span className="text-text-primary">{team.coach}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">队长</span>
                    <span className="text-text-primary">{team.captain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">阵型</span>
                    <span className="text-accent-gold">{team.formation}</span>
                  </div>
                  <div className="py-2">
                    <span className="text-text-secondary block mb-1">战术风格</span>
                    <span className="text-text-primary">{team.style}</span>
                  </div>
                  <div className="py-2">
                    <span className="text-text-secondary block mb-1">关键球员</span>
                    <span className="text-accent-gold">{team.key_players}</span>
                  </div>
                  <div className="py-2">
                    <span className="text-text-secondary block mb-1">近期战绩</span>
                    <div className="flex gap-1">
                      {team.recent_form?.split('').map((result, i) => (
                        <span key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
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
                    <span className="text-text-primary">{team.injuries}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Teams
