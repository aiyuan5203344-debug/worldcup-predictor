// Environment configuration with validation
// This file validates all required environment variables at startup

const requiredEnvVars = [
  'JWT_SECRET'
]

const optionalEnvVars = {
  NODE_ENV: 'development',
  PORT: '3001',
  JWT_EXPIRES_IN: '2h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  DATABASE_PATH: './database/worldcup.db',
  CORS_ORIGIN: 'http://localhost:5173',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100'
}

// Validate required environment variables
function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ 安全错误: 缺少必需的环境变量:')
    missing.forEach(key => {
      console.error(`   - ${key}`)
    })
    console.error('')
    console.error('请在 .env 文件中设置这些变量')
    console.error('参考 .env.example 文件')
    process.exit(1)
  }

  // Check JWT_SECRET is not the default placeholder
  if (process.env.JWT_SECRET === 'your-super-secret-key-change-in-production') {
    console.error('❌ 安全错误: JWT_SECRET 使用了默认值!')
    console.error('   请生成新的密钥: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"')
    process.exit(1)
  }

  // Set defaults for optional variables
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue
    }
  }

  console.log('✅ 环境变量验证通过')
}

// Export config object
const config = {
  get port() { return parseInt(process.env.PORT) || 3001 },
  get nodeEnv() { return process.env.NODE_ENV || 'development' },
  get jwtSecret() { return process.env.JWT_SECRET },
  get jwtExpiresIn() { return process.env.JWT_EXPIRES_IN },
  get jwtRefreshExpiresIn() { return process.env.JWT_REFRESH_EXPIRES_IN },
  get databasePath() { return process.env.DATABASE_PATH },
  get corsOrigin() { return process.env.CORS_ORIGIN },
  get rateLimitWindowMs() { return parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000 },
  get rateLimitMaxRequests() { return parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 },
  get isProduction() { return process.env.NODE_ENV === 'production' },
  get isDevelopment() { return process.env.NODE_ENV !== 'production' }
}

export { validateEnv, config }
export default config
