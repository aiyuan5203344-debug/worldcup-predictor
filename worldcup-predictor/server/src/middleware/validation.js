import { z } from 'zod'

// Validation schemas
export const schemas = {
  // Auth schemas
  login: z.object({
    username: z.string().min(3, '用户名至少3个字符').max(30, '用户名最多30个字符'),
    password: z.string().min(6, '密码至少6个字符'),
    rememberMe: z.boolean().optional()
  }),

  register: z.object({
    username: z.string().min(3, '用户名至少3个字符').max(30, '用户名最多30个字符'),
    password: z.string().min(8, '密码至少8个字符').max(100, '密码最多100个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    nickname: z.string().max(50, '昵称最多50个字符').optional()
  }),

  forgotPassword: z.object({
    email: z.string().email('请输入有效的邮箱地址')
  }),

  verifyResetCode: z.object({
    email: z.string().email('请输入有效的邮箱地址'),
    code: z.string().length(6, '验证码必须是6位数字')
  }),

  resetPassword: z.object({
    token: z.string(),
    password: z.string().min(8, '密码至少8个字符').max(100, '密码最多100个字符')
  }),

  // Prediction schemas
  prediction: z.object({
    matchId: z.number().int().positive('比赛ID必须是正整数'),
    predictedHomeScore: z.number().int().min(0, '比分不能为负数').max(20, '比分不能超过20'),
    predictedAwayScore: z.number().int().min(0, '比分不能为负数').max(20, '比分不能超过20'),
    predictedResult: z.enum(['home', 'away', 'draw'], { 
      errorMap: () => ({ message: '预测结果必须是 home, away 或 draw' }) 
    })
  }),

  // Chat message
  chatMessage: z.object({
    content: z.string().min(1, '消息不能为空').max(500, '消息最多500个字符'),
    roomId: z.string().optional()
  }),

  // Admin schemas
  adminResetPassword: z.object({
    userId: z.number().int().positive('用户ID必须是正整数'),
    newPassword: z.string().min(8, '密码至少8个字符').max(100, '密码最多100个字符')
  }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
}

// Validation middleware factory
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source]
      const result = schema.safeParse(data)
      
      if (!result.success) {
        const errors = result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
        
        return res.status(400).json({ 
          error: '参数验证失败',
          details: errors
        })
      }
      
      // Replace with validated data (adds defaults, transforms)
      req[source] = result.data
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Common validation middleware
export const validateBody = (schema) => validate(schema, 'body')
export const validateQuery = (schema) => validate(schema, 'query')
export const validateParams = (schema) => validate(schema, 'params')
