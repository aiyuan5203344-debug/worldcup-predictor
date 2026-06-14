import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Captcha from '../components/Common/Captcha'
import { API_BASE } from '../config'

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '', rememberMe: false })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaRefresh, setCaptchaRefresh] = useState(0)
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) newErrors.username = '请输入用户名'
    if (!formData.password) newErrors.password = '请输入密码'
    if (!captchaVerified) newErrors.captcha = '请完成验证码验证'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          rememberMe: formData.rememberMe
        })
      })
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success(`欢迎回来，${data.user.nickname || data.user.username}！`)
        navigate('/')
        window.location.reload()
      } else {
        toast.error(data.error || '登录失败')
        setCaptchaVerified(false)
        setCaptchaRefresh(prev => prev + 1)
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    } finally {
      setLoading(false)
    }
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
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0e17 0%, #1a2332 50%, #0d1f2d 100%)' }}>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}>
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-3xl font-bold mb-2"
            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            今天你买球了吗
          </h1>
          <p className="text-gray-400">2026世界杯智能预测平台</p>
        </div>

        {/* Login Form */}
        <div className="p-8 rounded-2xl"
          style={{ background: '#1a2332', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          
          <h2 className="text-xl font-bold text-white mb-6">登录账号</h2>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-5">
              <label className="block text-gray-400 text-sm font-medium mb-2">用户名</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  borderColor: errors.username ? '#ef4444' : '#1e293b'
                }}
                placeholder="请输入用户名"
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-gray-400 text-sm font-medium mb-2">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    paddingRight: '50px',
                    borderColor: errors.password ? '#ef4444' : '#1e293b'
                  }}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-amber-400 hover:text-amber-300 text-sm">
                  忘记密码？
                </Link>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#d4af37' }}
                />
                <span className="text-gray-400 text-sm">记住我</span>
              </label>
              <span className="text-gray-500 text-xs">
                {formData.rememberMe ? '30天免登录' : '2小时后过期'}
              </span>
            </div>

            {/* Captcha */}
            <div className="mb-6">
              <Captcha 
                onVerify={setCaptchaVerified}
                refreshTrigger={captchaRefresh}
              />
              {errors.captcha && (
                <p className="text-red-400 text-sm mt-1">{errors.captcha}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: loading ? '#64748b' : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                color: '#0a0e17',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 10px 20px -5px rgba(212, 175, 55, 0.3)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> 登录中...
                </span>
              ) : '登 录'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">或者</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block w-full py-3 rounded-xl text-center font-medium transition-all"
            style={{
              background: 'transparent',
              border: '1px solid #d4af37',
              color: '#d4af37',
              textDecoration: 'none'
            }}
          >
            注册新账号
          </Link>
        </div>

        {/* Demo Account */}
        <div className="mt-6 p-4 rounded-xl text-center"
          style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <p className="text-gray-400 text-sm mb-1">体验账号</p>
          <p className="text-amber-400 font-mono">jtnmqlm / a1234567</p>
        </div>
      </div>
    </div>
  )
}

export default Login
