import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import toast from 'react-hot-toast'
import api from '../services/api'

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

  const getMatchStatusChart = () => {
    if (!stats) return {}
    const matches = stats.matches
    const statusCount = {
      upcoming: matches.filter(m => m.status === 'upcoming').length,
      live: matches.filter(m => m.status === 'live').length,
      finished: matches.filter(m => m.status === 'finished').length
    }

    return {
      tooltip: { trigger: 'item', backgroundColor: '#1a2332', borderColor: '#1e293b', textStyle: { color: '#f8fafc' } },
      legend: { bottom: '5%', textStyle: { color: '#94a3b8' } },
      series: [{
        name: '比赛状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#0a0e17', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#f8fafc' } },
        labelLine: { show: false },
        data: [
          { value: statusCount.upcoming, name: '未开始', itemStyle: { color: '#1e40af' } },
          { value: statusCount.live, name: '进行中', itemStyle: { color: '#dc2626' } },
          { value: statusCount.finished, name: '已结束', itemStyle: { color: '#059669' } }
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
      tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#1e293b', textStyle: { color: '#f8fafc' } },
      xAxis: {
        type: 'category',
        data: groups.map(g => `${g}组`),
        axisLabel: { color: '#94a3b8' },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#1e293b' } }
      },
      series: [{
        data: groupData.map(d => d.value),
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#d4af37' },
              { offset: 1, color: '#f4d03f' }
            ]
          },
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
      if (m.home_team && m.home_score != null) {
        teamGoals[m.home_team] = (teamGoals[m.home_team] || 0) + m.home_score
      }
      if (m.away_team && m.away_score != null) {
        teamGoals[m.away_team] = (teamGoals[m.away_team] || 0) + m.away_score
      }
    })

    const sorted = Object.entries(teamGoals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    return {
      tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#1e293b', textStyle: { color: '#f8fafc' } },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: {
        type: 'category',
        data: sorted.map(s => s[0]).reverse(),
        axisLabel: { color: '#94a3b8' },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      series: [{
        data: sorted.map(s => s[1]).reverse(),
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#d4af37' },
              { offset: 1, color: '#f4d03f' }
            ]
          },
          borderRadius: [0, 4, 4, 0]
        }
      }]
    }
  }

  const getLeaderboardChart = () => {
    if (!stats) return {}
    const top10 = stats.leaderboard.slice(0, 10)

    return {
      tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#1e293b', textStyle: { color: '#f8fafc' } },
      xAxis: {
        type: 'category',
        data: top10.map(u => u.nickname || u.username),
        axisLabel: { color: '#94a3b8', rotate: 45 },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: {
        type: 'value',
        name: '积分',
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#1e293b' } }
      },
      series: [{
        data: top10.map(u => u.points || 0),
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#f4d03f' },
              { offset: 1, color: '#d4af37' }
            ]
          },
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
      tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#1e293b', textStyle: { color: '#f8fafc' } },
      xAxis: {
        type: 'category',
        data: sorted.map(s => `${s[0]}球`),
        axisLabel: { color: '#94a3b8' },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: {
        type: 'value',
        name: '场次',
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#1e293b' } }
      },
      series: [{
        data: sorted.map(s => s[1]),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#d4af37', width: 3 },
        itemStyle: { color: '#d4af37' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(212, 175, 55, 0.4)' },
              { offset: 1, color: 'rgba(212, 175, 55, 0)' }
            ]
          }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          📊 数据可视化
        </h1>
        <p className="text-text-secondary">
          世界杯数据统计与分析
        </p>
      </div>

      {/* Chart Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {charts.map(chart => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
            style={{
              background: activeChart === chart.id
                ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                : '#1a2332',
              color: activeChart === chart.id ? '#0a0e17' : '#94a3b8',
              border: `1px solid ${activeChart === chart.id ? '#d4af37' : '#1e293b'}`
            }}
          >
            <span>{chart.icon}</span>
            {chart.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="p-4 rounded-xl" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
        {activeChart === 'overview' && (
          <ReactECharts option={getMatchStatusChart()} style={{ height: '400px' }} />
        )}
        {activeChart === 'group' && (
          <ReactECharts option={getGroupDistributionChart()} style={{ height: '400px' }} />
        )}
        {activeChart === 'scorers' && (
          <ReactECharts option={getTopScorersChart()} style={{ height: '400px' }} />
        )}
        {activeChart === 'leaderboard' && (
          <ReactECharts option={getLeaderboardChart()} style={{ height: '400px' }} />
        )}
        {activeChart === 'scores' && (
          <ReactECharts option={getScoreDistributionChart()} style={{ height: '400px' }} />
        )}
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: '总场次',
            value: stats?.matches?.length || 0,
            icon: '⚽',
            color: '#3b82f6'
          },
          {
            label: '总进球',
            value: stats?.matches
              ?.filter(m => m.status === 'finished')
              .reduce((sum, m) => sum + (m.home_score || 0) + (m.away_score || 0), 0) || 0,
            icon: '🥅',
            color: '#22c55e'
          },
          {
            label: '场均进球',
            value: (() => {
              const finished = stats?.matches?.filter(m => m.status === 'finished') || []
              const totalGoals = finished.reduce((sum, m) => sum + (m.home_score || 0) + (m.away_score || 0), 0)
              return finished.length > 0 ? (totalGoals / finished.length).toFixed(1) : '0.0'
            })(),
            icon: '📈',
            color: '#f59e0b'
          },
          {
            label: '参与者',
            value: stats?.leaderboard?.length || 0,
            icon: '👥',
            color: '#8b5cf6'
          }
        ].map((stat, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl text-center"
            style={{ background: '#111827', border: '1px solid #1e293b' }}
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-text-secondary text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Charts
