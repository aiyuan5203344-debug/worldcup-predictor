import { useRef, useState, useCallback } from 'react'
import toast from 'react-hot-toast'

const PredictionShare = ({ match, prediction, user, onClose }) => {
  const canvasRef = useRef(null)
  const [generating, setGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const generatePoster = useCallback(async () => {
    setGenerating(true)
    
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // Canvas dimensions (9:16 aspect ratio for mobile sharing)
      const width = 1080
      const height = 1920
      canvas.width = width
      canvas.height = height
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#0a0e17')
      gradient.addColorStop(0.5, '#1a2332')
      gradient.addColorStop(1, '#0a0e17')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Decorative gold border
      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 4
      ctx.strokeRect(40, 40, width - 80, height - 80)
      
      // Inner decorative border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)'
      ctx.lineWidth = 2
      ctx.strokeRect(60, 60, width - 120, height - 120)
      
      // Title
      ctx.fillStyle = '#d4af37'
      ctx.font = 'bold 48px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⚽ 今天你买球了吗', width / 2, 150)
      
      // Subtitle
      ctx.fillStyle = '#64748b'
      ctx.font = '32px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText('2026 世界杯预测', width / 2, 210)
      
      // Divider line
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(100, 250)
      ctx.lineTo(width - 100, 250)
      ctx.stroke()
      
      // Match card background
      const cardY = 300
      const cardHeight = 400
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'
      ctx.beginPath()
      ctx.roundRect(80, cardY, width - 160, cardHeight, 20)
      ctx.fill()
      
      // Match stage
      ctx.fillStyle = '#64748b'
      ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText(match.stage || '小组赛', width / 2, cardY + 50)
      
      // Team names - Home
      ctx.fillStyle = '#f8fafc'
      ctx.font = 'bold 56px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText(match.home_name_cn || match.home_team, width / 2 - 180, cardY + 140)
      
      // Team names - Away
      ctx.fillText(match.away_name_cn || match.away_team, width / 2 + 180, cardY + 140)
      
      // VS text
      ctx.fillStyle = '#d4af37'
      ctx.font = 'bold 48px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText('VS', width / 2, cardY + 140)
      
      // Match time
      ctx.fillStyle = '#94a3b8'
      ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif'
      const matchTime = new Date(match.match_time).toLocaleString('zh-CN', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      ctx.fillText(matchTime, width / 2, cardY + 200)
      
      // Venue
      ctx.fillStyle = '#64748b'
      ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText(match.venue || '', width / 2, cardY + 250)
      
      // Prediction section
      const predY = cardY + 320
      ctx.fillStyle = '#d4af37'
      ctx.font = 'bold 36px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText('🎯 我的预测', width / 2, predY)
      
      // Prediction score
      ctx.fillStyle = '#f8fafc'
      ctx.font = 'bold 72px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText(
        `${prediction?.home_score ?? '-'} : ${prediction?.away_score ?? '-'}`,
        width / 2,
        predY + 90
      )
      
      // Prediction result
      let resultText = '平局'
      let resultColor = '#94a3b8'
      if (prediction?.home_score > prediction?.away_score) {
        resultText = `${match.home_name_cn || match.home_team} 胜`
        resultColor = '#10b981'
      } else if (prediction?.home_score < prediction?.away_score) {
        resultText = `${match.away_name_cn || match.away_team} 胜`
        resultColor = '#10b981'
      }
      
      ctx.fillStyle = resultColor
      ctx.font = 'bold 40px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText(resultText, width / 2, predY + 160)
      
      // AI Analysis (if available)
      if (match.ai_analysis) {
        const analysisY = predY + 220
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)'
        ctx.beginPath()
        ctx.roundRect(100, analysisY, width - 200, 180, 15)
        ctx.fill()
        
        ctx.fillStyle = '#d4af37'
        ctx.font = 'bold 28px "PingFang SC", "Microsoft YaHei", sans-serif'
        ctx.fillText('🤖 AI 分析', 140, analysisY + 40)
        
        // Word wrap AI analysis
        ctx.fillStyle = '#94a3b8'
        ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif'
        const words = match.ai_analysis.split('')
        let line = ''
        let lineY = analysisY + 80
        const maxWidth = width - 240
        
        for (const char of words) {
          const testLine = line + char
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && line) {
            ctx.fillText(line, 140, lineY)
            line = char
            lineY += 30
            if (lineY > analysisY + 160) break
          } else {
            line = testLine
          }
        }
        if (lineY <= analysisY + 160) {
          ctx.fillText(line, 140, lineY)
        }
      }
      
      // User info section
      const userY = height - 350
      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)'
      ctx.beginPath()
      ctx.roundRect(100, userY, width - 200, 120, 15)
      ctx.fill()
      
      // User avatar circle
      ctx.fillStyle = '#d4af37'
      ctx.beginPath()
      ctx.arc(170, userY + 60, 35, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#0a0e17'
      ctx.font = 'bold 36px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText(user?.username?.[0]?.toUpperCase() || 'U', 170, userY + 72)
      
      // Username
      ctx.fillStyle = '#f8fafc'
      ctx.font = 'bold 32px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(user?.username || '匿名用户', 230, userY + 50)
      
      // Join date
      ctx.fillStyle = '#64748b'
      ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText('预测达人 · 2026世界杯', 230, userY + 90)
      ctx.textAlign = 'center'
      
      // Footer
      ctx.fillStyle = '#64748b'
      ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText('扫描二维码，一起预测世界杯', width / 2, height - 200)
      
      // QR Code placeholder (would be real QR in production)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(width / 2 - 80, height - 180, 160, 160, 10)
      ctx.fill()
      
      ctx.fillStyle = '#0a0e17'
      ctx.font = 'bold 24px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText('预测网站', width / 2, height - 90)
      
      // Watermark
      ctx.fillStyle = 'rgba(100, 116, 139, 0.5)'
      ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText('© 2026 WorldCup Predictor', width / 2, height - 60)
      
      // Generate preview URL
      const url = canvas.toDataURL('image/png')
      setPreviewUrl(url)
      
      toast.success('海报生成成功！')
    } catch (error) {
      console.error('Failed to generate poster:', error)
      toast.error('海报生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }, [match, prediction, user])
  
  const downloadPoster = useCallback(() => {
    if (!previewUrl) return
    
    const link = document.createElement('a')
    link.download = `prediction-${match.id}-${Date.now()}.png`
    link.href = previewUrl
    link.click()
    
    toast.success('海报已下载')
  }, [previewUrl, match.id])
  
  const copyToClipboard = useCallback(async () => {
    if (!previewUrl) return
    
    try {
      const response = await fetch(previewUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      toast.success('已复制到剪贴板')
    } catch (error) {
      // Fallback for browsers that don't support Clipboard API
      toast('请长按图片保存', { icon: '📱' })
    }
  }, [previewUrl])
  
  const shareToSocial = useCallback((platform) => {
    const text = encodeURIComponent(
      `我在"今天你买球了吗"预测了${match.home_name_cn || match.home_team} vs ${match.away_name_cn || match.away_team}，预测比分：${prediction?.home_score ?? '-'} : ${prediction?.away_score ?? '-'}，一起来预测世界杯吧！⚽`
    )
    const url = encodeURIComponent(window.location.origin)
    
    const shareUrls = {
      weibo: `https://service.weibo.com/share/share.php?title=${text}&url=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`
    }
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }, [match, prediction])
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-lg w-full mx-4 bg-bg-card rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <h3 className="text-lg font-bold text-text-primary">分享预测海报</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Canvas (hidden but needed for generation) */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Preview or Generate Button */}
        <div className="p-4">
          {previewUrl ? (
            <div className="space-y-4">
              <img 
                src={previewUrl} 
                alt="预测海报" 
                className="w-full rounded-lg shadow-lg"
              />
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadPoster}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #b8941f)',
                    color: '#0a0e17'
                  }}
                >
                  <span>📥</span> 下载海报
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold border transition-all"
                  style={{
                    borderColor: '#d4af37',
                    color: '#d4af37'
                  }}
                >
                  <span>📋</span> 复制图片
                </button>
              </div>
              
              {/* Social Share */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => shareToSocial('weibo')}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ background: '#e6162d', color: '#fff' }}
                >
                  微博
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ background: '#1da1f2', color: '#fff' }}
                >
                  Twitter
                </button>
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ background: '#4267b2', color: '#fff' }}
                >
                  Facebook
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <button
                onClick={generatePoster}
                disabled={generating}
                className="px-8 py-4 rounded-lg font-bold text-lg transition-all"
                style={{
                  background: generating ? '#374151' : 'linear-gradient(135deg, #d4af37, #b8941f)',
                  color: generating ? '#94a3b8' : '#0a0e17'
                }}
              >
                {generating ? '生成中...' : '🎨 生成海报'}
              </button>
              <p className="text-sm text-text-secondary mt-4">
                生成精美预测海报，分享给好友
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PredictionShare
