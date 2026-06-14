// API Configuration
// 使用环境变量或回退到默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const API_BASE = `${API_BASE_URL}/api`

// WebSocket URL (same as API base, just without /api)
export const WS_URL = import.meta.env.VITE_WS_URL || API_BASE_URL

// App info
export const APP_NAME = '今天你买球了吗'
export const APP_VERSION = '1.0.0'

// Other config
export const ITEMS_PER_PAGE = 20
export const CHAT_MAX_LENGTH = 500
export const PREDICTION_DEADLINE_MINUTES = 30
