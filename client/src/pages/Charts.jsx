import { useState, useEffect, lazy, Suspense } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { SkeletonStats } from '../components/Common/Skeleton'

const ReactECharts = lazy(() => import('echarts-for-react'))

const Charts = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('overview')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [matchesData, leaderboardData] = await Promise.all([
        api.get('/matches?limit=200', { requireAuth: false }),
        api.get('/leaderboard', { requireAuth: false })
      ])

      setStats({
        matches: matchesData.matches || [],
        leaderboard: leaderboardData.leaderboard || []
      })
    } catch (error) {
      toast.error('数据加载失败')
    } finally {
      setLoading(false)
    }
  }

  const chartTooltip = { backgroundColor: '#1e1e1e', borderColor: '#2a2a2a', textStyle: { color: '#fff' } }

  const getMatchStatusChart = () => {
    if (!stats) return {}
    const matches = stats.matches
    const statusCount = {
      upcoming: matches.filter(m => m.status === 'upcoming').length,
      live: matches.filter(m => m.status === 'live').length,
      finished: matches.filter(m => m.status === 'finished').length
    }

    return {
      tooltip: { trigger: 'item', ...chartTooltip },
      legend: { bottom: '5%', textStyle: { color: '#a0a0a0' } },
      series: [{
        name: '比赛状态',
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: { borderRadius: 10, borderColor: '#0a0a0a', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff' } },
        data: [
          { value: statusCount.upcoming, name: '未开始', itemStyle: { color: '#00d4ff' } },
          { value: statusCount.live, name: '进行中', itemStyle: { color: '#ff3366' } },
          { value: statusCount.finished, name: '已结束', itemStyle: { color: '#00ff87' } }
        ]
      }]
    }
  }

  const getGroupDistributionChart = () => {
    if (!stats) return {}
    const matches = stats.matches
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const groupData = groups.map(g => ({
      name: `${g}组`,
      value: matches.filter(m => m.group_name === g).length
    }))

    return {
      tooltip: { trigger: 'axis', ...chartTooltip },
      xAxis: {
        type: 'category',
        data: groups.map(g => `${g}组`),
        axisLabel: { color: '#a0a0a0' },
        axisLine: { lineStyle: { color: '#2a2a2a' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#a0a0a0' },
        splitLine: { lineStyle: { color: '#2a2a2a' } }
      },
      series: [{
        data: groupData.map(d => d.value),
        type: 'bar',
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00ff87' }, { offset: 1, color: '#00d4ff' }] },
          borderRadius: [4, 4, 0, 0]
        }
      }]
    }
  }

  const getTopScorersChart = () => {
    if (!stats) return {}
    const matches = stats.matches.filter(m => m.status === 'finished')
    const teamGoals = {}
    matches.forEach(m => {
      if (m.home_team && m.home_score != null) teamGoals[m.home_team] = (teamGoals[m.home_team] || 0) + m.home_score
      if (m.away_team && m.away_score != null) teamGoals[m.away_team] = (teamGoals[m.away_team] || 0) + m.away_score
    })
    const sorted = Object.entries(teamGoals).sort((a, b) => b[1] - a[1]).slice(0, 10)

    return {
      tooltip: { trigger: 'axis', ...chartTooltip },
      xAxis: { type: 'value', axisLabel: { color: '#a0a0a0' }, splitLine: { lineStyle: { color: '#2a2a2a' } } },
      yAxis: {
        type: 'category',
        data: sorted.map(s => s[0]).reverse(),
        axisLabel: { color: '#a0a0a0' },
        axisLine: { lineStyle: { color: '#2a2a2a' } }
      },
      series: [{
        data: sorted.map(s => s[1]).reverse(),
        type: 'bar',
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#ff6b35' }, { offset: 1, color: '#ff3366' }] },
          borderRadius: [0, 4, 4, 0]
        }
      }]
    }
  }

  const getLeaderboardChart = () => {
    if (!stats) return {}
    const top10 = stats.leaderboard.slice(0, 10)
    return {
      tooltip: { trigger: 'axis', ...chartTooltip },
      xAxis: {
        type: 'category',
        data: top10.map(u => u.nickname || u.username),
        axisLabel: { color: '#a0a0a0', rotate: 45 },
        axisLine: { lineStyle: { color: '#2a2a2a' } }
      },
      yAxis: { type: 'value', name: '积分', axisLabel: { color: '#a0a0a0' }, splitLine: { lineStyle: { color: '#2a2a2a' } } },
      series: [{
        data: top10.map(u => u.points || 0),
        type: 'bar',
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00d4ff' }, { offset: 1, color: '#00ff87' }] },
          borderRadius: [4, 4, 0, 0]
        }
      }]
    }
  }

  const getScoreDistributionChart = () => {
    if (!stats) return {}
    const matches = stats.matches.filter(m => m.status === 'finished' && m.home_score != null && m.away_score != null)
    const scoreCounts = {}
    matches.forEach(m => {
      const totalGoals = m.home_score + m.away_score
      scoreCounts[totalGoals] = (scoreCounts[totalGoals] || 0) + 1
    })
    const sorted = Object.entries(scoreCounts).sort((a, b) => a[0] - b[0])

    return {
      tooltip: { trigger: 'axis', ...chartTooltip },
      xAxis: { type: 'category', data: sorted.map(s => `${s[0]}球`), axisLabel: { color: '#a0a0a0' }, axisLine: { lineStyle: { color: '#2a2a2a' } } },
      yAxis: { type: 'value', name: '场次', axisLabel: { color: '#a0a0a0' }, splitLine: { lineStyle: { color: '#2a2a2a' } } },
      series: [{
        data: sorted.map(s => s[1]),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#00ff87', width: 3 },
        itemStyle: { color: '#00ff87' },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0, 255, 135, 0.3)' }, { offset: 1, color: 'rgba(0, 255, 135, 0)' }] }
        }
      }]
    }
  }

  const charts = [
    { id: 'overview', label: '比赛状态', icon: '📊' },
    { id: 'group', label: '小组分布', icon: '📋' },
    { id: 'scorers', label: '进球榜', icon: '⚽' },
    { id: 'leaderboard', label: '排行榜', icon: '🏆' },
    { id: 'scores', label: '比分分布', icon: '📈' }
  ]

  const chartOptions = {
    overview: getMatchStatusChart,
    group: getGroupDistributionChart,
    scorers: getTopScorersChart,
    leaderboard: getLeaderboardChart,
    scores: getScoreDistributionChart
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>
            <span style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              📊 数据可视化
            </span>
          </h1>
        </div>
        <SkeletonStats />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📊 数据可视化
          </span>
        </h1>
        <p style={{ color: '#606060' }}>世界杯数据统计与分析</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {charts.map(chart => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap"
            style={{
              background: activeChart === chart.id ? 'linear-gradient(135deg, #00ff87, #00d4ff)' : '#1e1e1e',
              color: activeChart === chart.id ? '#0a0a0a' : '#a0a0a0',
              border: `1px solid ${activeChart === chart.id ? '#00ff87' : '#2a2a2a'}`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '12px'
            }}
          >
            <span>{chart.icon}</span>
            {chart.label}
          </button>
        ))}
      </div>

      <div className="card p-4" style={{ minHeight: '400px' }}>
        <Suspense fallback={
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8" style={{ border: '3px solid #2a2a2a', borderTopColor: '#00ff87' }}></div>
          </div>
        }>
          <ReactECharts option={chartOptions[activeChart]()} style={{ height: '400px' }} />
        </Suspense>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '总场次', value: stats?.matches?.length || 0, icon: '⚽', color: '#00ff87' },
          { label: '总进球', value: stats?.matches?.filter(m => m.status === 'finished').reduce((sum, m) => sum + (m.home_score || 0) + (m.away_score || 0), 0) || 0, icon: '🥅', color: '#00d4ff' },
          { label: '场均进球', value: (() => { const f = stats?.matches?.filter(m => m.status === 'finished') || []; return f.length > 0 ? (f.reduce((s, m) => s + (m.home_score || 0) + (m.away_score || 0), 0) / f.length).toFixed(1) : '0.0' })(), icon: '📈', color: '#ff6b35' },
          { label: '参与者', value: stats?.leaderboard?.length || 0, icon: '👥', color: '#a855f7' }
        ].map((stat, idx) => (
          <div key={idx} className="stat-card">
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm" style={{ color: '#606060' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Charts
