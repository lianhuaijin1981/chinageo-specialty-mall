# 阶段1：构建
FROM node:20-alpine as build

WORKDIR /app/

# 复制依赖文件
COPY package*.json ./
COPY drizzle.config.ts ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY src ./src/

# 生成数据库客户端
RUN npx drizzle-kit generate:pg || true

# 阶段2：运行
FROM node:20-alpine

WORKDIR /app/

# 安装PostgreSQL客户端（用于数据库迁移）
RUN apk add --no-cache postgresql-client

# 复制package.json和package-lock.json
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules/
COPY --from=build /app/src ./src/
COPY --from=build /app/drizzle.config.ts ./

# 创建非root用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider <http://localhost:3000/health> || exit 1

# 启动服务
CMD ["node", "dist/index.js"]
