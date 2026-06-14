import { Link, useLocation } from 'react-router-dom'

const BottomNav = () => {
  const location = useLocation()
  const token = localStorage.getItem('accessToken')

  if (!token) return null

  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/matches', icon: '⚽', label: '赛事' },
    { path: '/teams', icon: '🏆', label: '球队' },
    { path: '/predict', icon: '🎯', label: '预测' },
    { path: '/leaderboard', icon: '📊', label: '排行' },
    { path: '/profile', icon: '👤', label: '我的' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(30, 41, 59, 0.5)'
      }}>
      <nav className="flex items-center justify-around py-2">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all"
            style={{
              textDecoration: 'none',
              minWidth: '60px'
            }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium"
              style={{
                color: isActive(item.path) ? '#d4af37' : '#64748b'
              }}>
              {item.label}
            </span>
            {isActive(item.path) && (
              <div className="w-1 h-1 rounded-full"
                style={{ background: '#d4af37' }} />
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default BottomNav
