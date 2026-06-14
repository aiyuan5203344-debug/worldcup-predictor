# ⚽ 今天你买球了吗 - 2026世界杯预测平台

一个基于 React + Node.js 的世界杯足球比赛预测网站，支持实时比分、AI预测、用户预测、排行榜、数据可视化和实时聊天。

## ✨ 功能特性

### 核心功能
- 🏠 **首页** - 展示平台介绍、统计数据、热门比赛
- ⚽ **赛事中心** - 比赛列表、状态筛选、小组筛选
- 🎯 **比赛预测** - 预测比赛结果、查看预测记录
- 🏆 **排行榜** - 用户积分排名、领奖台展示
- 📊 **数据可视化** - ECharts图表统计分析
- 👤 **个人中心** - 用户资料、预测历史

### 安全特性
- 🔐 JWT Token 认证
- 🛡️ Rate Limiting 防暴力破解
- ✅ 密码 bcrypt 加密
- 👑 角色权限控制（管理员/普通用户）

### 管理后台
- 👥 用户管理（查看/删除/重置密码）
- ⚽ 比赛管理（查看/同步数据）
- 📊 数据统计

## 🛠️ 技术栈

### 前端
- React 18 + Vite
- TailwindCSS
- React Router v6
- ECharts (数据可视化)
- React Hot Toast (通知)

### 后端
- Node.js + Express
- Socket.io (WebSocket)
- sql.js (SQLite WASM)
- JWT (认证)
- bcryptjs (密码加密)

## 🚀 快速开始

### 前置要求
- Node.js >= 18
- npm >= 9

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd worldcup-predictor
```

2. **安装后端依赖**
```bash
cd server
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，修改 JWT_SECRET
```

4. **初始化数据库**
```bash
node setup.js
```

5. **安装前端依赖**
```bash
cd ../client
npm install
```

6. **启动开发服务器**

方式一：使用启动脚本（推荐）
```bash
# Windows
start.bat
```

方式二：手动启动
```bash
# 终端1：启动后端
cd server
npm run dev

# 终端2：启动前端
cd client
npm run dev
```

7. **访问应用**
- 前端：http://localhost:5173
- 后端：http://localhost:3001

### 默认账号
- **管理员账号**
  - 用户名：`jtnmqlm`
  - 密码：`a1234567`

## 📦 部署

### 前端部署（Vercel）

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 选择 `client` 目录作为根目录
4. 构建命令：`npm run build`
5. 输出目录：`dist`

### 后端部署（Railway）

1. 将代码推送到 GitHub
2. 在 Railway 导入项目
3. 选择 `server` 目录作为根目录
4. 添加环境变量：
   - `JWT_SECRET`: 你的密钥
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: 你的前端域名

### 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3001 |
| JWT_SECRET | JWT密钥 | - |
| JWT_EXPIRES_IN | Access Token过期时间 | 2h |
| JWT_REFRESH_EXPIRES_IN | Refresh Token过期时间 | 7d |
| CORS_ORIGIN | 允许的跨域来源 | http://localhost:5173 |
| RATE_LIMIT_WINDOW_MS | 限流时间窗口(ms) | 900000 |
| RATE_LIMIT_MAX_REQUESTS | 最大请求数 | 100 |

## 📁 项目结构

```
worldcup-predictor/
├── client/                    # 前端代码
│   ├── public/
│   ├── src/
│   │   ├── components/        # 组件
│   │   │   ├── Common/        # 通用组件
│   │   │   └── Layout/        # 布局组件
│   │   ├── contexts/          # Context
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API服务
│   │   ├── styles/            # 样式
│   │   ├── App.jsx            # 主组件
│   │   └── main.jsx           # 入口
│   ├── package.json
│   └── vite.config.js
├── server/                    # 后端代码
│   ├── src/
│   │   ├── middleware/         # 中间件
│   │   ├── models/            # 数据模型
│   │   ├── routes/            # 路由
│   │   ├── scripts/           # 脚本
│   │   └── socket/            # WebSocket
│   ├── setup.js               # 数据库初始化
│   └── package.json
├── start.bat                  # Windows启动脚本
├── requirements.txt           # Python依赖(可选)
└── README.md
```

## 🎮 使用说明

### 普通用户
1. 注册账号并登录
2. 浏览赛事列表，点击比赛查看详情
3. 在比赛开始前提交预测
4. 在排行榜查看自己的排名
5. 在数据页面查看统计图表

### 管理员
1. 使用管理员账号登录
2. 点击导航栏"管理"进入后台
3. 管理用户（查看/删除/重置密码）
4. 查看比赛数据和统计

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件

## 📞 联系方式

- 项目链接：[https://github.com/your-username/worldcup-predictor](https://github.com/your-username/worldcup-predictor)

---

⭐ 如果觉得有用，请给个 Star 支持一下！
