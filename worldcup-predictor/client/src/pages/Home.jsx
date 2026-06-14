import { Link } from 'react-router-dom'

const Home = () => {
  const token = localStorage.getItem('accessToken')

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="bg-pattern"></div>
      <div className="hexagon-grid"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 mt-8">
            <span style={{ 
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              今天你买球了吗
            </span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8" style={{ color: '#94a3b8' }}>
            2026世界杯智能预测平台
            <br />
            <span style={{ color: '#64748b' }}>基于AI分析，与全球球迷一决高下</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!token ? (
              <>
                <Link 
                  to="/register" 
                  className="inline-block px-8 py-4 rounded-lg font-bold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
                    color: '#0a0e17'
                  }}
                >
                  🚀 立即注册
                </Link>
                <Link 
                  to="/login" 
                  className="inline-block px-8 py-4 rounded-lg font-bold text-lg"
                  style={{
                    border: '1px solid #d4af37',
                    color: '#d4af37'
                  }}
                >
                  🔑 登录
                </Link>
              </>
            ) : (
              <Link 
                to="/matches" 
                className="inline-block px-8 py-4 rounded-lg font-bold text-lg"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
                  color: '#0a0e17'
                }}
              >
                ⚽ 查看赛程
              </Link>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '48', label: '参赛球队', icon: '🌍' },
              { value: '104', label: '比赛场次', icon: '⚽' },
              { value: '2.1M+', label: '预测用户', icon: '👥' },
              { value: '94.7%', label: 'AI准确率', icon: '🤖' },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="rounded-2xl p-6 text-center"
                style={{
                  background: '#1a2332',
                  border: '1px solid #1e293b'
                }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold" style={{ 
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {stat.value}
                </div>
                <div className="text-sm mt-1" style={{ color: '#64748b' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span style={{ 
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
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
                },
                {
                  icon: '🤖',
                  title: 'AI预测',
                  desc: '基于历史数据的智能预测分析',
                },
                {
                  icon: '🏆',
                  title: '排行榜',
                  desc: '与好友比拼预测准确率',
                },
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="rounded-2xl p-6 text-center"
                  style={{
                    background: '#1a2332',
                    border: '1px solid #1e293b'
                  }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p style={{ color: '#94a3b8' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Match Preview */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              <span style={{ 
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                今日热门
              </span>
            </h2>

            <div className="rounded-2xl p-6" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="live-badge">
                  <span className="live-dot"></span>
                  LIVE
                </span>
                <span className="text-sm" style={{ color: '#64748b' }}>小组赛 · A组</span>
              </div>

              <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ background: '#111827' }}>
                    🇧🇷
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">巴西</h3>
                    <span className="text-sm" style={{ color: '#64748b' }}>Brazil</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ 
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    2 : 1
                  </div>
                  <div className="text-sm mt-1" style={{ color: '#10b981' }}>67'</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <h3 className="font-bold text-lg">德国</h3>
                    <span className="text-sm" style={{ color: '#64748b' }}>Germany</span>
                  </div>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ background: '#111827' }}>
                    🇩🇪
                  </div>
                </div>
              </div>

              <div className="pt-4" style={{ borderTop: '1px solid #1e293b' }}>
                <div className="flex gap-3">
                  <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div className="font-bold" style={{ color: '#10b981' }}>1.85</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>主胜</div>
                  </div>
                  <div className="flex-1 rounded-lg p-3 text-center" style={{ background: '#111827' }}>
                    <div className="font-bold" style={{ color: '#94a3b8' }}>3.40</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>平局</div>
                  </div>
                  <div className="flex-1 rounded-lg p-3 text-center" style={{ background: '#111827' }}>
                    <div className="font-bold" style={{ color: '#94a3b8' }}>4.20</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>客胜</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link 
                to="/matches" 
                className="inline-block px-6 py-3 rounded-lg font-semibold"
                style={{ border: '1px solid #d4af37', color: '#d4af37' }}
              >
                查看全部赛程 →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8" style={{ borderTop: '1px solid #1e293b' }}>
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ 
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
              }}>
                ⚽
              </div>
              <span className="font-bold" style={{ 
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                今天你买球了吗
              </span>
            </div>
            <p className="text-sm" style={{ color: '#64748b' }}>
              © 2026 WorldCup Predictor. 数据来源：OpenLigaDB
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Home
