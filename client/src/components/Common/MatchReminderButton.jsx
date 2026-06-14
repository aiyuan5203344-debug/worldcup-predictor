import { useState } from 'react'
import { useNotifications } from '../../contexts/NotificationContext'

const MatchReminderButton = ({ match }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { setMatchReminder, removeMatchReminder, reminders } = useNotifications()
  
  const existingReminder = reminders.find(r => r.matchId === match.id)
  const hasReminder = !!existingReminder

  const reminderOptions = [
    { minutes: 15, label: '15分钟前' },
    { minutes: 30, label: '30分钟前' },
    { minutes: 60, label: '1小时前' },
    { minutes: 120, label: '2小时前' },
    { minutes: 1440, label: '1天前' }
  ]

  const handleSetReminder = (minutes) => {
    setMatchReminder(match, minutes)
    setIsOpen(false)
  }

  const handleRemoveReminder = () => {
    removeMatchReminder(match.id)
    setIsOpen(false)
  }

  if (match.status !== 'upcoming') {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          hasReminder 
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700'
        }`}
        aria-label={hasReminder ? '修改提醒设置' : '设置比赛提醒'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{hasReminder ? '🔔' : '⏰'}</span>
        <span className="hidden sm:inline">
          {hasReminder ? `${existingReminder.minutesBefore}分钟提醒` : '设置提醒'}
        </span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border overflow-hidden z-50"
          style={{ 
            background: '#1a2332', 
            borderColor: '#1e293b'
          }}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="reminder-menu"
        >
          <div className="p-2">
            <div className="px-3 py-2 text-xs text-slate-400 font-medium">
              提前提醒时间
            </div>
            {reminderOptions.map(option => (
              <button
                key={option.minutes}
                onClick={() => handleSetReminder(option.minutes)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  existingReminder?.minutesBefore === option.minutes
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
                role="menuitem"
              >
                {option.label}
              </button>
            ))}
            {hasReminder && (
              <>
                <div className="my-1 border-t" style={{ borderColor: '#1e293b' }} />
                <button
                  onClick={handleRemoveReminder}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                  role="menuitem"
                >
                  取消提醒
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchReminderButton
