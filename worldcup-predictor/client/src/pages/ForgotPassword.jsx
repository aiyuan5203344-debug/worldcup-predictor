import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API_BASE } from '../config'

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: email, 2: verify code, 3: new password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error('请输入邮箱地址')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setStep(2)
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

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      toast.error('请输入验证码')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('验证成功')
        setResetToken(data.resetToken)
        setStep(3)
      } else {
        toast.error(data.error || '验证失败')
      }
    } catch (error) {
      toast.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error('请输入新密码')
      return
    }

    if (newPassword.length < 8) {
      toast.error('密码至少8位')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('两次密码不一致')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('密码重置成功，请重新登录')
        navigate('/login')
      } else {
        toast.error(data.error || '重置失败')
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
          <Link to="/login" className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', textDecoration: 'none' }}>
            <span className="text-4xl">⚽</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">找回密码</h1>
          <p className="text-gray-400">
            {step === 1 && '输入邮箱获取验证码'}
            {step === 2 && '输入收到的验证码'}
            {step === 3 && '设置新密码'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: step >= s ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' : '#1e293b',
                  color: step >= s ? '#0a0e17' : '#64748b'
                }}>
                {s}
              </div>
              {s < 3 && (
                <div className="w-12 h-1 mx-2"
                  style={{ background: step > s ? '#d4af37' : '#1e293b' }} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl"
          style={{ background: '#1a2332', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          
          {/* Step 1: Enter Email */}
          {step === 1 && (
            <div>
              <div className="mb-5">
                <label className="block text-gray-400 text-sm font-medium mb-2">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="请输入注册时使用的邮箱"
                />
              </div>

              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                style={{
                  background: loading ? '#64748b' : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  color: '#0a0e17',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '发送中...' : '发送验证码'}
              </button>
            </div>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <div>
              <p className="text-gray-400 text-sm mb-4">
                验证码已发送至 <span className="text-amber-400">{email}</span>
              </p>

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

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-medium"
                  style={{ background: '#1e293b', color: '#94a3b8', border: 'none', cursor: 'pointer' }}
                >
                  上一步
                </button>
                <button
                  onClick={handleVerifyCode}
                  disabled={loading || countdown > 0}
                  className="flex-1 py-3 rounded-xl font-bold transition-all"
                  style={{
                    background: loading ? '#64748b' : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    color: '#0a0e17',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '验证中...' : countdown > 0 ? `${countdown}s后重发` : '重新发送'}
                </button>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={loading}
                className="w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all"
                style={{
                  background: loading ? '#64748b' : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  color: '#0a0e17',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '验证中...' : '下一步'}
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div>
              <div className="mb-5">
                <label className="block text-gray-400 text-sm font-medium mb-2">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="至少8位，包含字母和数字"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 text-sm font-medium mb-2">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="请再次输入新密码"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl font-medium"
                  style={{ background: '#1e293b', color: '#94a3b8', border: 'none', cursor: 'pointer' }}
                >
                  上一步
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold transition-all"
                  style={{
                    background: loading ? '#64748b' : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    color: '#0a0e17',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '重置中...' : '重置密码'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link to="/login" className="text-gray-400 hover:text-amber-400 transition-colors">
            ← 返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
