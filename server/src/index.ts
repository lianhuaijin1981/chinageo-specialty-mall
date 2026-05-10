import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { config } from "dotenv";
import { db } from "./db";
import { ipBlacklistMiddleware, createRateLimit, rateLimitConfigs } from "./middleware/rateLimit";

// 加载环境变量
config({ path: "../.env" });

const app = new Hono();

// 中间件
app.use("*", ipBlacklistMiddleware);
app.use("*", createRateLimit(rateLimitConfigs.general));
app.use("*", cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use("*", logger());
app.use("*", prettyJSON());

// 健康检查
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// ------- 路由注册 -------
// 认证路由
import { authRoutes } from "./auth/auth.routes";
app.route("/api/auth", authRoutes);

// 用户路由
import { userRoutes } from "./routes/users";
app.route("/api/users", userRoutes);

// 商品路由
import { productRoutes } from "./routes/products";
app.route("/api/products", productRoutes);

// 分类路由
import { categoryRoutes } from "./routes/categories";
app.route("/api/categories", categoryRoutes);

// 产区路由
import { regionRoutes } from "./routes/regions";
app.route("/api/regions", regionRoutes);

// 购物车路由
import { cartRoutes } from "./routes/cart";
app.route("/api/cart", cartRoutes);

// 订单路由
import { orderRoutes } from "./routes/orders";
app.route("/api/orders", orderRoutes);

// 支付路由
import { paymentRoutes } from "./payment/payment.routes";
app.route("/api/payments", paymentRoutes);

// 搜索路由
import { default as searchRoutes } from "./routes/search";
app.route("/api/search", searchRoutes);

// 优惠券路由
import { default as couponRoutes } from "./routes/coupons";
app.route("/api/coupons", couponRoutes);

// 积分路由
import { default as pointsRoutes } from "./routes/points.routes";
app.route("/api/points", pointsRoutes);

// 会员路由
import { default as memberRoutes } from "./routes/member.routes";
app.route("/api/member", memberRoutes);

// 404 处理
app.notFound((c) => {
  return c.json({ error: "Not Found", path: c.req.path }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  }, 500);
});

// 启动服务器
const port = parseInt(process.env.PORT || "3000");
console.log(`🚀 Server running at <http://localhost>:${port}`);
console.log(`📝 API docs at <http://localhost>:${port}/health`);

export default {
  port,
  fetch: app.fetch,
};
