import { API_BASE } from '../config'

// Token management (stored in memory only for CSRF protection, cookies for auth)
let accessToken = null
let refreshToken = null

// Get stored token (memory only - HttpOnly cookies handle auth)
function getToken() {
  return accessToken
}

// Get refresh token (memory only)
function getRefreshToken() {
  return refreshToken
}

// Store tokens (memory only - HttpOnly cookies handle auth)
function setTokens(newAccessToken, newRefreshToken) {
  accessToken = newAccessToken
  refreshToken = newRefreshToken
  // Note: HttpOnly cookies are set by the server, we only keep in memory for CSRF
}

// Clear tokens
function clearTokens() {
  accessToken = null
  refreshToken = null
}

// Handle token refresh via cookie
async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Send cookies
      body: JSON.stringify({ refreshToken: getRefreshToken() })
    })

    if (response.ok) {
      const data = await response.json()
      setTokens(data.accessToken, data.refreshToken)
      return data.accessToken
    } else {
      clearTokens()
      return null
    }
  } catch {
    clearTokens()
    return null
  }
}

// Main API request function
async function request(endpoint, options = {}) {
  const { requireAuth = true, ...fetchOptions } = options

  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  }

  // Add token if available (for backward compatibility)
  if (requireAuth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include' // Always include cookies for auth
    })

    // Handle token expiration - try refresh
    if (response.status === 401 && requireAuth) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers,
          credentials: 'include'
        })
        return retryResponse.json()
      }
    }

    return response.json()
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// API methods
const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),

  put: (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),

  // Auth methods
  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),

  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  // Utility methods
  setTokens,
  clearTokens,
  getToken,
  getRefreshToken
}

export default api
export { API_BASE, getToken, setTokens, clearTokens }

// Auth API for AuthContext compatibility
export const authAPI = {
  getMe: async (opts = {}) => {
    const response = await request('/auth/me', { ...opts, requireAuth: false })
    return { data: response }
  },
  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),
  logout: () => request('/auth/logout', { method: 'POST' })
}
