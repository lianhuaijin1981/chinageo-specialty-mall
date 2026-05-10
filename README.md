# 🏪 国家地理标识特产商城

> 纯自营电商网站，新国风设计 | 基于 React 19 + TypeScript + Vite 的前端 + Hono + Drizzle ORM 的后端

## 📦 项目简介

国家地理标识特产商城是一个专注于国家地理标志产品的电子商务平台，采用新国风设计风格，为用户提供优质的地方特产。

### ✨ 特性

- 🎨 **新国风设计** - 融合传统文化与现代审美
- 🛍️ **完整电商功能** - 商品浏览、购物车、订单、支付
- 🔐 **多方式登录** - 邮箱/手机号/用户名 + 微信登录
- 💰 **多种支付** - 微信支付、支付宝
- 🌍 **地理标识** - 按产区浏览地标产品
- 📱 **响应式设计** - 完美适配移动端

## 📚 技术栈

### 前端

- **框架**: React 19 + TypeScript 5.9
- **构建工具**: Vite 7
- **路由**: React Router 7
- **样式**: Tailwind CSS 3 + tw-animate-css
- **组件库**: Radix UI（21+ 组件）
- **表单**: React Hook Form + Zod
- **动画**: GSAP + Framer Motion
- **图表**: Recharts
- **图标**: Lucide React + Remix Icon

### 后端（`/server` 目录）

- **框架**: Hono（轻量级、高性能）
- **ORM**: Drizzle ORM（类型安全）
- **数据库**: PostgreSQL + Redis
- **认证**: JWT + bcrypt
- **验证**: Zod
- **支付**: 微信支付 V3 API + 支付宝 SDK

## 📂 项目结构

```
chinageo-specialty-mall/
├── public/              # 静态资源
├── src/                 # 前端源代码
│   ├── components/      # UI 组件
│   │   └── ui/         # 基础 UI 组件（Radix UI 封装）
│   ├── pages/          # 页面组件
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具函数
│   ├── data/           # 静态数据
│   ├── App.tsx         # 路由配置
│   └── main.tsx        # 入口文件
├── server/              # 后端服务
│   ├── src/
│   │   ├── db/        # 数据库连接
│   │   ├── schemas/   # 数据库 Schema
│   │   ├── routes/     # API 路由
│   │   ├── auth/      # 认证系统
│   │   ├── payment/   # 支付集成
│   │   ├── middleware/ # 中间件
│   │   └── index.ts   # 服务入口
│   └── drizzle.config.ts
├── .env.example        # 环境变量模板
├── .env                # 环境变量配置
├── package.json        # 前端依赖
├── vite.config.ts      # Vite 配置
├── tailwind.config.js   # Tailwind 配置
└── tsconfig.json       # TypeScript 配置
```

## 🚀 快速开始

### 前端

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

前端开发服务器将在 `<http://localhost:5173>` 启动。

### 后端

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 配置环境变量
cp ../.env.example ../.env
# 编辑 ../.env 填写配置

# 创建数据库
createdb chinageo_mall

# 推送 Schema 到数据库
npm run db:push

# 启动开发服务器
npm run dev
```

后端开发服务器将在 `<http://localhost:3000>` 启动。

## 📋 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页 |
| `/region` | Region | 产区浏览 |
| `/categories` | Categories | 分类浏览 |
| `/product/:id` | ProductDetail | 商品详情 |
| `/traceability` | Traceability | 溯源查询 |
| `/cart` | Cart | 购物车 |
| `/orders` | Orders | 订单列表 |
| `/profile` | Profile | 个人中心 |
| `/member` | Member | 会员中心 |
| `/about` | About | 关于我们 |

## 🔧 P0 问题修复进度

✅ **已完成**：

1. ✅ **环境变量配置** - 创建 `.env.example` 和 `.env`，包含数据库、JWT、支付、OSS、SMS、邮件等配置
2. ✅ **后端服务框架** - 搭建基于 Hono + Drizzle ORM 的后端 API 服务
3. ✅ **数据库设计** - 设计用户、商品、订单、购物车等核心数据表（10张表）
4. ✅ **身份验证系统** - 实现注册、登录、JWT 认证、微信登录
5. ✅ **支付系统集成** - 集成微信支付和支付宝 SDK（框架已搭建，待接入实际 API）

🟠 **待完成（P1）**：

- [ ] 添加单元测试和集成测试
- [ ] 配置 CI/CD 流水线
- [ ] 添加 Docker 支持
- [ ] 实现微信支付/支付宝支付的实际 API 调用
- [ ] 添加商品搜索（ElasticSearch）
- [ ] 添加限流、防刷机制

## 📊 数据库 Schema

- **users** - 用户表
- **addresses** - 用户地址表
- **regions** - 地理标识产区表
- **categories** - 商品分类表
- **products** - 商品表
- **cart_items** - 购物车表
- **orders** - 订单表
- **order_items** - 订单商品表
- **reviews** - 商品评价表
- **payments** - 支付记录表

## 🔐 认证方式

在请求头中添加 Token：

```
Authorization: Bearer <your_access_token>
```

## 💰 支付集成

### 微信支付

- 支持 JSAPI 支付（微信公众号/小程序支付）
- 配置文件：`.env`（需要配置 WECHAT_MCH_ID、WECHAT_API_V3_KEY 等）
- 证书路径：`./certs/wechat_private_key.pem`、`./certs/wechat_certificate.pem`

### 支付宝

- 支持电脑网站支付、手机网站支付
- 配置文件：`.env`（需要配置 ALIPAY_APP_ID、ALIPAY_PRIVATE_KEY 等）

## 📝 开发规范

### 代码规范

- ESLint 配置：`.eslintrc.cjs`
- 提交规范：使用 Conventional Commits
- 分支策略：`main` + `develop` + `feature/*`

### Git 提交

```bash
git add .
git commit -m "feat: 添加用户认证系统"
git push origin main
```

## 🛠️ 可用脚本

### 前端

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run preview` | 预览生产版本 |

### 后端

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（支持热更新） |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run db:generate` | 生成数据库迁移文件 |
| `npm run db:push` | 推送 Schema 到数据库 |
| `npm run db:migrate` | 执行数据库迁移 |
| `npm run db:studio` | 打开 Drizzle Studio |

## 📦 部署

### 前端部署

```bash
npm run build
# 将 dist/ 目录部署到 CDN 或静态托管服务
```

### 后端部署

```bash
cd server
npm run build
npm start
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

- 项目链接：[https://github.com/lianhuaijin1981/chinageo-specialty-mall](https://github.com/lianhuaijin1981/chinageo-specialty-mall)
- 问题反馈：[Issues](https://github.com/lianhuaijin1981/chinageo-specialty-mall/issues)

---

**⚡ P0 关键问题已修复！** 项目现在具备了上线所需的核心功能框架。
