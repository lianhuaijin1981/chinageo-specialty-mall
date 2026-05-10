import { Hono } from "hono";
import { z } from "zod";
import { pointsService } from "../services/points.service";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";

const pointsRoutes = new Hono();

// ==================== 用户端路由 ====================

// 获取用户积分余额
pointsRoutes.get("/balance", authMiddleware, async (c) => {
  const user = c.get("user");
  const points = await pointsService.getUserPoints(user.userId);
  return c.json({ success: true, data: { points } });
});

// 获取积分历史记录
pointsRoutes.get("/history", authMiddleware, async (c) => {
  const user = c.get("user");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  
  const history = await pointsService.getPointsHistory(user.userId, limit, offset);
  return c.json({ success: true, data: history });
});

// 获取积分商品列表
pointsRoutes.get("/products", authMiddleware, createRateLimit(rateLimitConfigs.general), async (c) => {
  const products = await pointsService.getPointsProducts();
  return c.json({ success: true, data: products });
});

// 获取积分商品详情
pointsRoutes.get("/products/:id", authMiddleware, async (c) => {
  const id = parseInt(c.req.param("id"));
  const product = await pointsService.getPointsProduct(id);
  
  if (!product) {
    return c.json({ success: false, message: "商品不存在" }, 404);
  }
  
  return c.json({ success: true, data: product });
});

// 兑换积分商品
pointsRoutes.post("/exchange", authMiddleware, createRateLimit(rateLimitConfigs.payment), async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  if (!body.productId || !body.quantity || !body.shippingAddress) {
    return c.json({ success: false, message: "缺少必要参数" }, 400);
  }
  
  try {
    const order = await pointsService.createPointsOrder({
      userId: user.userId,
      productId: body.productId,
      quantity: body.quantity,
      shippingAddress: body.shippingAddress,
    });
    
    return c.json({ success: true, data: order, message: "兑换成功" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 获取我的兑换订单
pointsRoutes.get("/orders", authMiddleware, async (c) => {
  const user = c.get("user");
  const orders = await pointsService.getPointsOrders(user.userId);
  return c.json({ success: true, data: orders });
});

// ==================== 管理员端路由 ====================

// 获取所有积分商品（管理员）
pointsRoutes.get("/admin/products", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const products = await pointsService.getAllPointsProducts();
  return c.json({ success: true, data: products });
});

// 创建积分商品（管理员）
pointsRoutes.post("/admin/products", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const body = await c.req.json();
  
  try {
    const product = await pointsService.createPointsProduct(body);
    return c.json({ success: true, data: product, message: "创建成功" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 更新积分商品（管理员）
pointsRoutes.put("/admin/products/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();
  
  try {
    await pointsService.updatePointsProduct(id, body);
    return c.json({ success: true, message: "更新成功" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 删除积分商品（管理员）
pointsRoutes.delete("/admin/products/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const id = parseInt(c.req.param("id"));
  
  try {
    await pointsService.deletePointsProduct(id);
    return c.json({ success: true, message: "删除成功" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 更新兑换订单状态（管理员）
pointsRoutes.put("/admin/orders/:id/status", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const id = parseInt(c.req.param("id"));
  const { status, trackingNo } = await c.req.json();
  
  try {
    await pointsService.updatePointsOrderStatus(id, status, trackingNo);
    return c.json({ success: true, message: "更新成功" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

export default pointsRoutes;
