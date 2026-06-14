import { useState, useEffect } from 'react'
import { API_BASE } from '../../config'

const OddsDisplay = ({ matchId }) => {
  const [odds, setOdds] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOdds()
  }, [matchId])

  const fetchOdds = async () => {
    try {
      const response = await fetch(`${API_BASE}/matches/${matchId}/odds`)
      const data = await response.json()
      if (response.ok) {
        setOdds(data.odds)
      }
    } catch (error) {
      console.error('Failed to fetch odds:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-text-secondary">
        加载赔率中...
      </div>
    )
  }

  if (!odds) {
    return (
      <div className="p-4 text-center text-text-secondary">
        暂无赔率数据
      </div>
    )
  }

  // 找出最低赔率（最划算）
  const findBestOdds = (type) => {
    let best = null
    let bestCompany = ''
    
    for (const [key, company] of Object.entries(odds)) {
      if (!best || company[type] < best) {
        best = company[type]
        bestCompany = key
      }
    }
    
    return { value: best, company: bestCompany }
  }

  const bestHome = findBestOdds('home')
  const bestDraw = findBestOdds('draw')
  const bestAway = findBestOdds('away')

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(212, 175, 55, 0.1)', borderBottom: '1px solid #334155' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span className="font-bold text-text-primary">赔率对比</span>
        </div>
        <span className="text-xs text-text-secondary">3家博彩公司</span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs font-medium text-text-secondary" style={{ borderBottom: '1px solid #334155' }}>
        <div>公司</div>
        <div className="text-center">主胜</div>
        <div className="text-center">平局</div>
        <div className="text-center">客胜</div>
      </div>

      {/* Odds Rows */}
      <div className="divide-y" style={{ borderColor: '#334155' }}>
        {Object.entries(odds).map(([key, company]) => (
          <div key={key} className="grid grid-cols-4 gap-2 px-4 py-3 items-center hover:bg-white/5 transition-colors">
            {/* Company Name */}
            <div>
              <span className="font-medium text-text-primary">{company.name}</span>
            </div>

            {/* Home Odds */}
            <div className="text-center">
              <span className={`font-bold text-lg ${
                key === bestHome.company ? 'text-green-400' : 'text-text-primary'
              }`}>
                {company.home.toFixed(2)}
              </span>
              {key === bestHome.company && (
                <span className="ml-1 text-xs text-green-400">最低</span>
              )}
            </div>

            {/* Draw Odds */}
            <div className="text-center">
              <span className={`font-bold text-lg ${
                key === bestDraw.company ? 'text-green-400' : 'text-text-primary'
              }`}>
                {company.draw.toFixed(2)}
              </span>
              {key === bestDraw.company && (
                <span className="ml-1 text-xs text-green-400">最低</span>
              )}
            </div>

            {/* Away Odds */}
            <div className="text-center">
              <span className={`font-bold text-lg ${
                key === bestAway.company ? 'text-green-400' : 'text-text-primary'
              }`}>
                {company.away.toFixed(2)}
              </span>
              {key === bestAway.company && (
                <span className="ml-1 text-xs text-green-400">最低</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 text-xs text-text-secondary" style={{ borderTop: '1px solid #334155', background: 'rgba(0,0,0,0.2)' }}>
        <p>💡 赔率仅供参考，实际投注请以博彩公司官网为准</p>
        <p className="mt-1">数据更新时间：每60秒刷新</p>
      </div>
    </div>
  )
}

export default OddsDisplay
