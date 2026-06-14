import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, setTokens, clearTokens } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  // Check if user is logged in on mount (via cookie)
  useEffect(() => {
    const guestMode = localStorage.getItem('isGuest')

    if (guestMode === 'true') {
      setIsGuest(true)
      setLoading(false)
    } else {
      // Try to load user from cookie (HttpOnly)
      loadUser()
    }
  }, [])

  const loadUser = async () => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const response = await authAPI.getMe({ signal: controller.signal })
      clearTimeout(timeout)
      setUser(response.data.user)
      setIsGuest(false)
      localStorage.removeItem('isGuest')
    } catch (error) {
      clearTokens()
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, password) => {
    try {
      const response = await authAPI.register({ username, password })
      const { user, accessToken, refreshToken } = response.data

      // Store tokens in memory (HttpOnly cookies are set by server)
      setTokens(accessToken, refreshToken)
      localStorage.removeItem('isGuest')

      setUser(user)
      setIsGuest(false)
      toast.success('注册成功！欢迎加入！')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || '注册失败，请重试'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password })
      const { user, accessToken, refreshToken } = response.data

      // Store tokens in memory (HttpOnly cookies are set by server)
      setTokens(accessToken, refreshToken)
      localStorage.removeItem('isGuest')

      setUser(user)
      setIsGuest(false)
      toast.success('登录成功！')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || '登录失败，请重试'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = useCallback(() => {
    clearTokens()
    localStorage.removeItem('isGuest')
    setUser(null)
    setIsGuest(false)
    toast.success('已退出登录')
  }, [])

  const enterGuestMode = useCallback(() => {
    localStorage.setItem('isGuest', 'true')
    setIsGuest(true)
    setUser(null)
    toast('游客模式：登录后可进行预测', { icon: '👤' })
  }, [])

  const requireAuth = useCallback((callback) => {
    if (!user && !isGuest) {
      toast.error('请先登录')
      return false
    }
    if (isGuest) {
      toast('登录后可进行预测', { icon: '👤' })
      return false
    }
    return true
  }, [user, isGuest])

  const value = {
    user,
    loading,
    isGuest,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    enterGuestMode,
    requireAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
