import { useState, useEffect, useRef, useCallback } from 'react'

const Captcha = ({ onVerify, refreshTrigger }) => {
  const canvasRef = useRef(null)
  const inputRef = useRef(null)
  const [code, setCode] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [error, setError] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  const generateCaptchaCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }, [])

  const drawCaptcha = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.fillStyle = '#1a2332'
    ctx.fillRect(0, 0, width, height)
    
    // Draw noise dots
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
      ctx.beginPath()
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
    
    // Draw noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(Math.random() * width, Math.random() * height)
      ctx.lineTo(Math.random() * width, Math.random() * height)
      ctx.stroke()
    }
    
    // Draw captcha text
    const newCode = generateCaptchaCode()
    setCaptchaCode(newCode)
    
    const colors = ['#d4af37', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6']
    
    for (let i = 0; i < newCode.length; i++) {
      ctx.font = `bold ${22 + Math.random() * 8}px Arial`
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
      
      const x = 15 + i * 25
      const y = 25 + Math.random() * 12
      
      // Random rotation
      const angle = (Math.random() - 0.5) * 0.3
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.fillText(newCode[i], 0, 0)
      ctx.restore()
    }
  }, [generateCaptchaCode])

  useEffect(() => {
    drawCaptcha()
  }, [refreshTrigger, drawCaptcha])

  const handleRefresh = () => {
    setCode('')
    setError('')
    setIsVerified(false)
    drawCaptcha()
  }

  const handleVerify = () => {
    if (!code) {
      setError('请输入验证码')
      inputRef.current?.focus()
      return
    }
    
    if (code.toLowerCase() !== captchaCode.toLowerCase()) {
      setError('验证码错误，请重新输入')
      setCode('')
      drawCaptcha()
      inputRef.current?.focus()
      return
    }
    
    setError('')
    setIsVerified(true)
    onVerify(true)
  }

  const handleClear = () => {
    setCode('')
    setError('')
    setIsVerified(false)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-secondary">
        图形验证码
      </label>
      
      <div className="flex gap-2">
        <canvas
          ref={canvasRef}
          width={120}
          height={50}
          className="rounded-lg border border-border-color cursor-pointer"
          onClick={handleRefresh}
          title="点击刷新验证码"
        />
        <button
          type="button"
          onClick={handleRefresh}
          className="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          style={{ background: '#1a2332', border: '1px solid #1e293b' }}
          aria-label="刷新验证码"
        >
          🔄
        </button>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => {
              const value = e.target.value
              setCode(value)
              setError('')
              
              // Auto verify when 4 characters entered
              if (value.length === 4) {
                setTimeout(() => {
                  if (value.toLowerCase() !== captchaCode.toLowerCase()) {
                    setError('验证码错误，请重新输入')
                    setCode('')
                    drawCaptcha()
                    inputRef.current?.focus()
                  } else {
                    setError('')
                    setIsVerified(true)
                    onVerify(true)
                  }
                }, 100)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleVerify()
            }}
            placeholder="请输入4位验证码"
            maxLength={4}
            className="w-full px-4 py-2 pr-10 rounded-lg text-text-primary"
            style={{ 
              background: '#1a2332', 
              border: `1px solid ${error ? '#ef4444' : '#1e293b'}`,
              letterSpacing: '4px',
              fontWeight: 'bold',
              fontSize: '18px'
            }}
            aria-label="验证码输入"
            aria-describedby={error ? 'captcha-error' : undefined}
            disabled={isVerified}
          />
          {code && !isVerified && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="清空验证码"
            >
              ✕
            </button>
          )}
        </div>
        {isVerified && (
          <div className="flex items-center px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">
            ✓
          </div>
        )}
      </div>
      
      {error && (
        <p id="captcha-error" className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}
      
      <p className="text-text-muted text-xs">
        点击图片可刷新验证码
      </p>
    </div>
  )
}

export default Captcha
