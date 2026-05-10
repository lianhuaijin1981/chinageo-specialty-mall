# 国家地理标识特产商城 - 后端服务

> 基于 Hono + Drizzle ORM + PostgreSQL 的电商后端 API 服务

## 📦 技术栈

- **Web 框架**: Hono（轻量级、高性能）
- **ORM**: Drizzle ORM（类型安全）
- **数据库**: PostgreSQL
- **认证**: JWT + bcrypt
- **验证**: Zod
- **支付**: 微信支付 V3 API + 支付宝 SDK

## 📂 目录结构

```
server/
├── src/
│   ├── db/              # 数据库连接
│   │   └── index.ts
│   ├── schemas/         # 数据库 Schema 定义
│   │   └── schema.ts
│   ├── routes/          # API 路由
│   │   ├── users.ts
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── regions.ts
│   │   ├── cart.ts
│   │   └── orders.ts
│   ├── auth/            # 认证系统
│   │   ├── auth.service.ts
│   │   └── auth.routes.ts
│   ├── payment/          # 支付集成
│   │   ├── wechat.ts
│   │   ├── alipay.ts
│   │   ├── payment.service.ts
│   │   └── payment.routes.ts
│   ├── middleware/       # 中间件
│   │   └── auth.ts
│   └── index.ts         # 服务入口
├── drizzle.config.ts    # Drizzle 配置
└── package.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并填写配置：

```bash
cp ../.env.example ../.env
# 编辑 .env 填写数据库、JWT密钥等配置
```

### 3. 创建数据库

```bash
# 创建数据库
createdb chinageo_mall
```

### 4. 推送 Schema 到数据库

```bash
npm run db:push
```

### 5. 启动开发服务器

```bash
npm run dev
```

服务器将在 `<http://localhost:3000>` 启动。

## 📝 API 端点

### 认证相关

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | /api/auth/register | 用户注册 | ❌ |
| POST | /api/auth/login | 用户登录 | ❌ |
| POST | /api/auth/wechat-login | 微信登录 | ❌ |
| POST | /api/auth/refresh | 刷新 Token | ❌ |
| GET | /api/auth/me | 获取当前用户信息 | ✅ |

### 用户相关

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | /api/users/me | 获取个人信息 | ✅ |
| PUT | /api/users/me | 更新个人信息 | ✅ |
| GET | /api/users | 获取用户列表（管理员） | ✅ (admin) |

### 商品相关

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | /api/products | 获取商品列表 | ❌ |
| GET | /api/products/:id | 获取商品详情 | ❌ |
| POST | /api/products | 创建商品（管理员/商家） | ✅ (admin/merchant) |
| PUT | /api/products/:id | 更新商品（管理员/商家） | ✅ (admin/merchant) |
| DELETE | /api/products/:id | 删除商品（管理员/商家） | ✅ (admin/merchant) |

### 分类相关

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | /api/categories | 获取分类列表 | ❌ |
| GET | /api/categories/:id | 获取分类详情 | ❌ |
| POST | /api/categories | 创建分类（管理员） | ✅ (admin) |
| PUT | /api/categories/:id | 更新分类（管理员） | ✅ (admin) |
| DELETE | /api/categories/:id | 删除分类（管理员） | ✅ (admin) |

### 购物车相关

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | /api/cart | 获取购物车列表 | ✅ |
| POST | /api/cart | 添加商品到购物车 | ✅ |
| PUT | /api/cart/:id | 更新购物车商品数量 | ✅ |
| DELETE | /api/cart/:id | 删除购物车商品 | ✅ |
| DELETE | /api/cart | 清空购物车 | ✅ |

### 订单相关

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | /api/orders | 创建订单 | ✅ |
| GET | /api/orders | 获取订单列表 | ✅ |
| GET | /api/orders/:orderNo | 获取订单详情 | ✅ |
| PUT | /api/orders/:orderNo/cancel | 取消订单 | ✅ |

### 支付相关

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | /api/payments/create | 创建支付 | ✅ |
| POST | /api/payments/wechat/notify | 微信支付回调 | ❌ |
| POST | /api/payments/alipay/notify | 支付宝回调 | ❌ |
| GET | /api/payments/status/:orderNo | 查询支付状态 | ✅ |
| POST | /api/payments/refund | 申请退款 | ✅ |

## 🔐 认证方式

在请求头中添加 Token：

```
Authorization: Bearer <your_access_token>
```

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

## 💰 支付集成

### 微信支付

- 支持 JSAPI 支付（微信公众号/小程序支付）
- 配置文件：`.env`（需要配置 WECHAT_MCH_ID、WECHAT_API_V3_KEY 等）
- 证书路径：`./certs/wechat_private_key.pem`、`./certs/wechat_certificate.pem`

### 支付宝

- 支持电脑网站支付、手机网站支付
- 配置文件：`.env`（需要配置 ALIPAY_APP_ID、ALIPAY_PRIVATE_KEY 等）

## 🛠️ 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（支持热更新） |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run db:generate` | 生成数据库迁移文件 |
| `npm run db:push` | 推送 Schema 到数据库 |
| `npm run db:migrate` | 执行数据库迁移 |
| `npm run db:studio` | 打开 Drizzle Studio（数据库管理界面） |

## ⚙️ 环境变量

参见 `.env.example` 文件，包含：
- 服务器配置
- 数据库配置
- JWT 认证配置
- 微信登录/支付配置
- 支付宝配置
- 文件存储配置（阿里云 OSS）
- SMS 服务配置
- 邮件服务配置

## 📋 TODO（后续迭代）

- [ ] 完善微信支付/支付宝支付的实际 API 调用
- [ ] 添加单元测试和集成测试
- [ ] 添加 CI/CD 流水线
- [ ] 添加 Docker 支持
- [ ] 实现商品搜索（ElasticSearch）
- [ ] 实现推荐系统
- [ ] 添加限流、防刷机制
- [ ] 添加日志系统（Winston/Pino）
- [ ] 添加监控告警（Sentry）
- [ ] 实现短信验证登录
- [ ] 实现邮箱验证登录

## 📄 许可证

MIT License
