import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import NotificationBell from '../Common/NotificationBell'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser(null)
      }
    }
  }, [])

  const isGuest = localStorage.getItem('isGuest') === 'true'
  const isAuthenticated = !!user

  const navLinks = [
    { path: '/', label: '首页', icon: '🏠', ariaLabel: '返回首页' },
    { path: '/matches', label: '赛事', icon: '⚽', ariaLabel: '查看赛事中心' },
    { path: '/teams', label: '球队', icon: '🏆', ariaLabel: '查看球队资料库' },
    { path: '/predict', label: '预测', icon: '🎯', ariaLabel: '提交预测' },
    { path: '/leaderboard', label: '排行榜', icon: '🏆', ariaLabel: '查看排行榜' },
    { path: '/charts', label: '数据', icon: '📊', ariaLabel: '查看数据统计' },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isGuest')
      setUser(null)
      navigate('/login')
      window.location.reload()
    }
  }

  const handleGuest = () => {
    localStorage.setItem('isGuest', 'true')
    window.location.reload()
  }

  const isAdmin = user?.role === 'admin'

  return (
    <nav 
      role="navigation"
      aria-label="主导航"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: isDark ? 'rgba(10, 14, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        zIndex: 50
      }}
    >
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          aria-label="今天你买球了吗 - 返回首页"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
        >
          <div 
            aria-hidden="true"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}
          >
            ⚽
          </div>
          <span style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'none'
          }} className="sm:block">
            今天你买球了吗
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul 
          role="menubar"
          aria-label="主导航菜单"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            listStyle: 'none',
            margin: 0,
            padding: 0
          }} 
          className="hidden md:flex"
        >
          {navLinks.map((link) => (
            <li role="none" key={link.path}>
              <Link
                role="menuitem"
                to={link.path}
                aria-label={link.ariaLabel}
                aria-current={isActive(link.path) ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive(link.path) ? '#d4af37' : (isDark ? '#94a3b8' : '#64748b'),
                  background: isActive(link.path) ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span aria-hidden="true">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
            title={isDark ? '切换到浅色模式' : '切换到深色模式'}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              color: '#d4af37',
              cursor: 'pointer',
              fontSize: '18px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Notification bell */}
          {isAuthenticated && <NotificationBell />}

          {isAuthenticated ? (
            <>
              {/* Admin badge */}
              {isAdmin && (
                <span 
                  aria-label管理员账户
                  style={{
                    padding: '4px 10px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  <span aria-hidden="true">👑</span> 管理员
                </span>
              )}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  aria-label="管理后台"
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  <span aria-hidden="true">⚙️</span> 管理
                </Link>
              )}
              
              <Link
                to="/profile"
                aria-label="个人中心"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: isDark ? '#1a2332' : '#f1f5f9',
                  textDecoration: 'none',
                  color: isDark ? '#f8fafc' : '#1e293b',
                  fontSize: '14px'
                }}
              >
                <div 
                  aria-hidden="true"
                  style={{
                    width: '28px',
                    height: '28px',
                    background: isAdmin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(212, 175, 55, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}
                >
                  {isAdmin ? '👑' : '👤'}
                </div>
                <span>{user?.nickname || user?.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                aria-label="退出登录"
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                退出
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={handleGuest}
                aria-label="游客模式浏览"
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #d4af37',
                  color: '#d4af37',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                游客浏览
              </button>
              <Link
                to="/login"
                aria-label="登录账号"
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #d4af37',
                  color: '#d4af37',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                登录
              </Link>
              <Link
                to="/register"
                aria-label="注册新账号"
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  color: '#0a0e17',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                注册
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              color: isDark ? '#94a3b8' : '#64748b',
              cursor: 'pointer'
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav 
        id="mobile-menu"
        role="navigation"
        aria-label="移动端导航"
        aria-hidden={!mobileMenuOpen}
        className="md:hidden" 
        style={{
          padding: mobileMenuOpen ? '16px' : '0',
          maxHeight: mobileMenuOpen ? '400px' : '0',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          borderTop: mobileMenuOpen ? `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` : 'none',
          background: isDark ? 'rgba(10, 14, 23, 0.98)' : 'rgba(255, 255, 255, 0.98)'
        }}
      >
        <ul role="menu" aria-label="移动端菜单" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {navLinks.map((link) => (
            <li role="none" key={link.path}>
              <Link
                role="menuitem"
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                aria-label={link.ariaLabel}
                aria-current={isActive(link.path) ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive(link.path) ? '#d4af37' : (isDark ? '#94a3b8' : '#64748b'),
                  background: isActive(link.path) ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  marginBottom: '4px'
                }}
              >
                <span aria-hidden="true">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </nav>
  )
}

export default Navbar
