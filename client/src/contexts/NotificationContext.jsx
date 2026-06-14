import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('matchNotifications')
    return saved ? JSON.parse(saved) : []
  })
  
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('matchReminders')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('matchNotifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('matchReminders', JSON.stringify(reminders))
  }, [reminders])

  // Check for upcoming matches every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      
      reminders.forEach(reminder => {
        if (reminder.sent) return
        
        const matchTime = new Date(reminder.matchTime)
        const timeDiff = matchTime - now
        const minutesUntil = Math.floor(timeDiff / (1000 * 60))
        
        if (minutesUntil <= reminder.minutesBefore && minutesUntil > 0) {
          sendNotification(reminder)
          setReminders(prev => prev.map(r => 
            r.id === reminder.id ? { ...r, sent: true } : r
          ))
        }
      })
    }

    const interval = setInterval(checkReminders, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [reminders])

  const sendNotification = useCallback((reminder) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`⚽ ${reminder.homeTeam} vs ${reminder.awayTeam}`, {
        body: `比赛将在${reminder.minutesBefore}分钟后开始！`,
        icon: '/soccer-ball.png'
      })
    }
    
    // In-app notification
    addNotification({
      type: 'reminder',
      title: `比赛提醒`,
      message: `${reminder.homeTeam} vs ${reminder.awayTeam} 将在${reminder.minutesBefore}分钟后开始`,
      matchId: reminder.matchId,
      read: false
    })
    
    // Toast notification
    toast(`⚽ ${reminder.homeTeam} vs ${reminder.awayTeam} 即将开始！`, {
      icon: '🔔',
      duration: 10000
    })
  }, [])

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...notification
    }
    setNotifications(prev => [newNotification, ...prev].slice(0, 50))
  }, [])

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const setMatchReminder = useCallback((match, minutesBefore = 30) => {
    const reminder = {
      id: `${match.id}-${minutesBefore}`,
      matchId: match.id,
      homeTeam: match.home_name_cn || match.home_team,
      awayTeam: match.away_name_cn || match.away_team,
      matchTime: match.match_time,
      minutesBefore,
      sent: false,
      createdAt: new Date().toISOString()
    }
    
    setReminders(prev => {
      const existing = prev.findIndex(r => r.id === reminder.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = reminder
        return updated
      }
      return [...prev, reminder]
    })
    
    toast.success(`已设置${minutesBefore}分钟提醒`)
  }, [])

  const removeMatchReminder = useCallback((matchId) => {
    setReminders(prev => prev.filter(r => r.matchId !== matchId))
    toast.success('已取消提醒')
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('通知权限已开启')
        return true
      } else {
        toast.error('通知权限被拒绝')
        return false
      }
    }
    return false
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      reminders,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      setMatchReminder,
      removeMatchReminder,
      requestNotificationPermission
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
