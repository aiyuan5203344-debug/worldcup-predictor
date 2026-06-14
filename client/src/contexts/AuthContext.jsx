import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
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

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const guestMode = localStorage.getItem('isGuest')

    if (token) {
      loadUser()
    } else if (guestMode === 'true') {
      setIsGuest(true)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe()
      setUser(response.data.user)
      setIsGuest(false)
      localStorage.removeItem('isGuest')
    } catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, password) => {
    try {
      const response = await authAPI.register({ username, password })
      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
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

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
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
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
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
