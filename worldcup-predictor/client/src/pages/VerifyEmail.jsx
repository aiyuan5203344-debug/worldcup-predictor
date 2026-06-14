import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API_BASE } from '../config'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [verified, setVerified] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (email) {
      handleSendCode()
    }
  }, [])

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error('请输入邮箱地址')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/auth/send-verification`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        startCountdown()
      } else {
        toast.error(data.error || '发送失败')
      }
    } catch (error) {
      toast.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.error('请输入验证码')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('邮箱验证成功！')
        setVerified(true)
        setTimeout(() => navigate('/profile'), 2000)
      } else {
        toast.error(data.error || '验证失败')
      }
    } catch (error) {
      toast.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: '#111827',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    color: '#f8fafc',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0e17 0%, #1a2332 50%, #0d1f2d 100%)' }}>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', textDecoration: 'none' }}>
            <span className="text-4xl">✉️</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">邮箱验证</h1>
          <p className="text-gray-400">验证您的邮箱地址以完成注册</p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl"
          style={{ background: '#1a2332', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          
          {verified ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <span className="text-4xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">验证成功！</h3>
              <p className="text-gray-400">正在跳转到个人中心...</p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <label className="block text-gray-400 text-sm font-medium mb-2">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="请输入您的邮箱"
                />
              </div>

              <div className="mb-5">
                <label className="block text-gray-400 text-sm font-medium mb-2">验证码</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={inputStyle}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3 mb-5">
                <button
                  onClick={handleSendCode}
                  disabled={loading || countdown > 0}
                  className="flex-1 py-3 rounded-xl font-medium transition-all"
                  style={{
                    background: '#1e293b',
                    color: countdown > 0 ? '#64748b' : '#d4af37',
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
                </button>
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                style={{
                  background: loading ? '#64748b' : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  color: '#0a0e17',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '验证中...' : '验证'}
              </button>
            </>
          )}
        </div>

        {/* Back to Profile */}
        <div className="text-center mt-6">
          <Link to="/profile" className="text-gray-400 hover:text-amber-400 transition-colors">
            ← 返回个人中心
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
