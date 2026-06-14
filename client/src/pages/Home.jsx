import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import DailyCheckin from '../components/Common/DailyCheckin'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    teams: 48,
    matches: 72,
    users: 0,
    predictions: 0,
    aiAccuracy: 94.7
  })
  const [liveMatch, setLiveMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/matches/stats/overview', { requireAuth: false })
        if (data && !data.error) {
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    const fetchLiveMatch = async () => {
      try {
        const data = await api.get('/matches/live', { requireAuth: false })
        if (data?.matches?.length > 0) {
          setLiveMatch(data.matches[0])
        }
      } catch (error) {
        console.error('Failed to fetch live match:', error)
      }
    }

    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchLiveMatch()])
      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="bg-pattern"></div>
      <div className="hexagon-grid"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block px-4 py-2 mb-6 rounded-full text-sm font-bold" style={{
            background: 'rgba(0, 255, 135, 0.1)',
            border: '1px solid rgba(0, 255, 135, 0.3)',
            color: '#00ff87',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            🏆 2026 FIFA WORLD CUP
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6" style={{ 
            fontFamily: 'Oswald, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            lineHeight: '1.1'
          }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(0, 255, 135, 0.3)'
            }}>
              今天你买球了吗
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: '#a0a0a0' }}>
            2026世界杯智能预测平台
            <br />
            <span style={{ color: '#606060' }}>基于AI分析，与全球球迷一决高下</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/register" 
                  className="inline-block px-10 py-4 rounded-lg font-black text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
                    color: '#0a0a0a',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 0 40px rgba(0, 255, 135, 0.4)',
                    transition: 'all 0.3s'
                  }}
                >
                  🚀 立即加入
                </Link>
                <Link 
                  to="/login" 
                  className="inline-block px-10 py-4 rounded-lg font-black text-lg"
                  style={{
                    border: '2px solid #00ff87',
                    color: '#00ff87',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.3s'
                  }}
                >
                  🔑 登录
                </Link>
              </>
            ) : (
              <Link 
                to="/matches" 
                className="inline-block px-10 py-4 rounded-lg font-black text-lg"
                style={{
                  background: 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
                  color: '#0a0a0a',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 0 40px rgba(0, 255, 135, 0.4)'
                }}
              >
                ⚽ 查看赛程
              </Link>
            )}
          </div>
        </section>

        {/* Daily Checkin Section - Only for logged in users */}
        {isAuthenticated && (
          <section className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-4xl mx-auto">
              <DailyCheckin />
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: stats.teams.toString(), label: '参赛球队', icon: '🌍', color: '#00ff87' },
              { value: stats.matches.toString(), label: '比赛场次', icon: '⚽', color: '#00d4ff' },
              { value: stats.users > 0 ? `${stats.users.toLocaleString()}` : '1,000+', label: '预测用户', icon: '👥', color: '#ff6b35' },
              { value: `${stats.aiAccuracy}%`, label: 'AI准确率', icon: '🤖', color: '#a855f7' },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="stat-card"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="stat-value" style={{ color: stat.color }}>
                  {loading ? '...' : stat.value}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12" style={{
              fontFamily: 'Oswald, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                核心功能
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📊',
                  title: '实时比分',
                  desc: 'WebSocket实时推送，进球动画提醒',
                  color: '#00ff87'
                },
                {
                  icon: '🤖',
                  title: 'AI预测',
                  desc: '基于历史数据的智能预测分析',
                  color: '#00d4ff'
                },
                {
                  icon: '🏆',
                  title: '排行榜',
                  desc: '与好友比拼预测准确率',
                  color: '#ff6b35'
                },
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="card p-6 text-center"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2" style={{ 
                    fontFamily: 'Oswald, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: feature.color
                  }}>{feature.title}</h3>
                  <p style={{ color: '#a0a0a0' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Match Preview */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-8" style={{
              fontFamily: 'Oswald, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {liveMatch ? '正在直播' : '今日热门'}
              </span>
            </h2>

            <div className="card p-6">
              {liveMatch ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="live-badge">
                      <span className="live-dot"></span>
                      LIVE
                    </span>
                    <span className="text-sm" style={{ color: '#606060' }}>
                      {liveMatch.stage} · {liveMatch.group_name ? `${liveMatch.group_name}组` : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-4">
                      <div className="team-badge">
                        {liveMatch.home_flag || '🏳️'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{liveMatch.home_name_cn || liveMatch.home_team}</h3>
                        <span className="text-sm" style={{ color: '#606060' }}>{liveMatch.home_team}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="score-display">
                        {liveMatch.home_score} : {liveMatch.away_score}
                      </div>
                      <div className="text-sm mt-1" style={{ color: '#00ff87' }}>
                        {liveMatch.current_minute ? `${liveMatch.current_minute}'` : '进行中'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <h3 className="font-bold text-lg">{liveMatch.away_name_cn || liveMatch.away_team}</h3>
                        <span className="text-sm" style={{ color: '#606060' }}>{liveMatch.away_team}</span>
                      </div>
                      <div className="team-badge">
                        {liveMatch.away_flag || '🏳️'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4" style={{ borderTop: '1px solid #2a2a2a' }}>
                    <div className="flex gap-3">
                      <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'rgba(0, 255, 135, 0.1)', border: '1px solid rgba(0, 255, 135, 0.3)' }}>
                        <div className="font-bold" style={{ color: '#00ff87' }}>{liveMatch.home_win_prob || '45'}%</div>
                        <div className="text-xs" style={{ color: '#606060' }}>主胜</div>
                      </div>
                      <div className="flex-1 rounded-lg p-3 text-center" style={{ background: '#1e1e1e' }}>
                        <div className="font-bold" style={{ color: '#a0a0a0' }}>{liveMatch.draw_prob || '25'}%</div>
                        <div className="text-xs" style={{ color: '#606060' }}>平局</div>
                      </div>
                      <div className="flex-1 rounded-lg p-3 text-center" style={{ background: '#1e1e1e' }}>
                        <div className="font-bold" style={{ color: '#a0a0a0' }}>{liveMatch.away_win_prob || '30'}%</div>
                        <div className="text-xs" style={{ color: '#606060' }}>客胜</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⚽</div>
                  <p className="text-lg" style={{ color: '#606060' }}>暂无直播比赛</p>
                  <p className="text-sm mt-2" style={{ color: '#404040' }}>查看完整赛程，提前预测比赛结果</p>
                </div>
              )}
            </div>

            <div className="text-center mt-6">
              <Link 
                to="/matches" 
                className="inline-block px-6 py-3 rounded-lg font-bold"
                style={{ 
                  border: '2px solid #00ff87', 
                  color: '#00ff87',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s'
                }}
              >
                查看全部赛程 →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8" style={{ borderTop: '2px solid #00ff87' }}>
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ 
                background: 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)'
              }}>
                ⚽
              </div>
              <span className="font-bold" style={{ 
                background: 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Oswald, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                今天你买球了吗
              </span>
            </div>
            <p className="text-sm" style={{ color: '#606060' }}>
              © 2026 WorldCup Predictor. 数据来源：OpenLigaDB
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Home
