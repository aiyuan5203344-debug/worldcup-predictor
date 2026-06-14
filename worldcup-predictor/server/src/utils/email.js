import nodemailer from 'nodemailer'

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// 生成6位随机验证码
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 发送验证码邮件
export const sendVerificationEmail = async (email, code, type = 'register') => {
  const subject = type === 'register' ? '【今天你买球了吗】邮箱验证码' : '【今天你买球了吗】密码重置验证码'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center;">
          <h1 style="color: #0a0e17; margin: 0; font-size: 24px;">⚽ 今天你买球了吗</h1>
          <p style="color: #0a0e17; margin: 10px 0 0; opacity: 0.8;">2026世界杯智能预测平台</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1a2332; margin: 0 0 20px; font-size: 20px;">
            ${type === 'register' ? '邮箱验证码' : '密码重置验证码'}
          </h2>
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px;">
            您的验证码是：
          </p>
          
          <!-- Code Box -->
          <div style="background-color: #f8fafc; border: 2px dashed #d4af37; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <span style="font-size: 36px; font-weight: bold; color: #d4af37; letter-spacing: 8px;">${code}</span>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
            ⏰ 验证码有效期：<strong>5分钟</strong>
          </p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
            🔒 如果这不是您的操作，请忽略此邮件。
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            © 2026 今天你买球了吗 - 2026世界杯智能预测平台
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"今天你买球了吗" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export default transporter
