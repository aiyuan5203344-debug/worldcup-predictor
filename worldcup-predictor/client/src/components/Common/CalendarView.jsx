import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const CalendarView = ({ matches, onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const matchesByDate = useMemo(() => {
    const grouped = {}
    matches.forEach(match => {
      if (match.match_time) {
        const date = new Date(match.match_time).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '-')
        if (!grouped[date]) grouped[date] = []
        grouped[date].push(match)
      }
    })
    return grouped
  }, [matches])

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + direction)
      return newDate
    })
  }

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 md:h-16" />)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = formatDate(date)
    const dayMatches = matchesByDate[dateStr] || []
    const isToday = date.toDateString() === new Date().toDateString()
    const isSelected = selectedDate === dateStr
    
    days.push(
      <div
        key={day}
        onClick={() => dayMatches.length > 0 && onSelectDate(dateStr)}
        className={`
          h-10 md:h-16 p-1 rounded-lg border transition-all
          ${dayMatches.length > 0 ? 'cursor-pointer' : 'cursor-default'}
          ${isToday ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700/50'}
          ${isSelected ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-400/30' : ''}
          ${dayMatches.length > 0 && !isToday && !isSelected ? 'hover:border-amber-400/50 hover:bg-slate-800/50' : ''}
        `}
      >
        <div className={`text-right text-xs md:text-sm ${isToday ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
          {day}
        </div>
        {dayMatches.length > 0 && (
          <div className="hidden md:flex items-center justify-center mt-1">
            <div className="flex gap-0.5">
              {dayMatches.slice(0, 3).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              ))}
              {dayMatches.length > 3 && (
                <span className="text-[8px] text-amber-400 ml-0.5">+{dayMatches.length - 3}</span>
              )}
            </div>
          </div>
        )}
        {dayMatches.length > 0 && (
          <div className="md:hidden flex items-center justify-center mt-0.5">
            <div className="w-1 h-1 rounded-full bg-amber-400" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300"
          aria-label="上一月"
        >
          ←
        </button>
        <h3 className="text-lg font-bold text-amber-400">
          {currentMonth.getFullYear()}年{MONTHS[currentMonth.getMonth()]}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300"
          aria-label="下一月"
        >
          →
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs text-slate-400 font-medium py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      {selectedDate && matchesByDate[selectedDate] && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <h4 className="text-sm font-bold text-slate-300 mb-3">
            {selectedDate} 比赛 ({matchesByDate[selectedDate].length}场)
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {matchesByDate[selectedDate].map(match => (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className={match.status === 'live' ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {new Date(match.match_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-200">{match.home_team}</span>
                  {match.status === 'finished' || match.status === 'in_progress' ? (
                    <span className="text-amber-400 font-bold">{match.home_score}-{match.away_score}</span>
                  ) : (
                    <span className="text-slate-500">vs</span>
                  )}
                  <span className="text-slate-200">{match.away_team}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView
