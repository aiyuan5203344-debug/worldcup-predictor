import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../../contexts/NotificationContext'

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications } = useNotifications()
  const panelRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-all"
        style={{
          background: isOpen ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
          color: isOpen ? '#d4af37' : '#94a3b8'
        }}
        aria-label={`通知 ${unreadCount > 0 ? `(${unreadCount}条未读)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50"
          style={{ 
            background: '#1a2332', 
            borderColor: '#1e293b'
          }}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="notification-menu"
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#1e293b' }}>
            <h3 className="font-bold text-white">通知</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  全部已读
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  清空
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <div className="text-4xl mb-2">🔔</div>
                <p>暂无通知</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b transition-colors ${
                    notification.read ? 'opacity-60' : 'hover:bg-slate-700/30'
                  }`}
                  style={{ borderColor: '#1e293b' }}
                  onClick={() => markAsRead(notification.id)}
                  role="menuitem"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {notification.type === 'reminder' ? '⚽' : 
                           notification.type === 'goal' ? '⚽' :
                           notification.type === 'result' ? '🏆' : 'ℹ️'}
                        </span>
                        <span className="font-medium text-white text-sm">
                          {notification.title}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mt-1">
                        {notification.message}
                      </p>
                      <span className="text-slate-500 text-xs">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        clearNotification(notification.id)
                      }}
                      className="text-slate-400 hover:text-white ml-2"
                      aria-label="删除通知"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
