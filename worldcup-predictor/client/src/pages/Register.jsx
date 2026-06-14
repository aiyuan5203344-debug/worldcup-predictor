import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API_BASE } from '../config'

const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '',
    agreeTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线'
    }
    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 8) {
      newErrors.password = '密码至少8位'
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密码需包含字母和数字'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致'
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '请同意用户协议'
    }
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
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: formData.username.trim(), 
          password: formData.password,
          nickname: formData.username.trim()
        })
      })
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success('注册成功！欢迎加入！')
        navigate('/')
        window.location.reload()
      } else {
        toast.error(data.error || '注册失败')
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

  const getPasswordStrength = () => {
    const pwd = formData.password
    if (!pwd) return { level: 0, text: '', color: '' }
    
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    if (score <= 1) return { level: 1, text: '弱', color: '#ef4444' }
    if (score <= 3) return { level: 2, text: '中', color: '#f59e0b' }
    return { level: 3, text: '强', color: '#22c55e' }
  }

  const passwordStrength = getPasswordStrength()

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
          <h1 className="text-3xl font-bold mb-2"
            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            加入我们
          </h1>
          <p className="text-gray-400">创建账号，开始预测之旅</p>
        </div>

        {/* Register Form */}
        <div className="p-8 rounded-2xl"
          style={{ background: '#1a2332', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          
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
                placeholder="3个字符以上，字母数字下划线"
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
                  placeholder="至少8位，包含字母和数字"
                  autoComplete="new-password"
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
              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full"
                        style={{ background: passwordStrength.level >= i ? passwordStrength.color : '#1e293b' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: passwordStrength.color }}>
                    密码强度：{passwordStrength.text}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-5">
              <label className="block text-gray-400 text-sm font-medium mb-2">确认密码</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  borderColor: errors.confirmPassword ? '#ef4444' : '#1e293b'
                }}
                placeholder="请再次输入密码"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Agree Terms */}
            <div className="mb-6">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded"
                  style={{ accentColor: '#d4af37' }}
                />
                <span className="text-gray-400 text-sm">
                  我已阅读并同意 <span className="text-amber-400">用户协议</span> 和 <span className="text-amber-400">隐私政策</span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-400 text-sm mt-1">{errors.agreeTerms}</p>
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
                  <span className="animate-spin">⏳</span> 注册中...
                </span>
              ) : '注 册'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">或者</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="block w-full py-3 rounded-xl text-center font-medium transition-all"
            style={{
              background: 'transparent',
              border: '1px solid #d4af37',
              color: '#d4af37',
              textDecoration: 'none'
            }}
          >
            已有账号？立即登录
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
