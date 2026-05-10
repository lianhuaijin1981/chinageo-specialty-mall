import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  createSeckillActivity,
  getAllSeckillActivities,
  getActiveSeckillActivities,
  getUpcomingSeckillActivities,
  getSeckillActivityDetail,
  participateSeckill,
  getMySeckillOrders,
  cancelSeckillOrder,
  paySeckillOrder,
  autoCancelTimeoutOrders,
  updateSeckillStatus,
} from "../services/seckill.service";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { db } from "../db";
import { inArray } from "drizzle-orm";

const app = new Hono();

// ------- 公开接口（无需登录）-------

// 获取进行中的秒杀活动
app.get("/active", async (c) => {
  try {
    const activities = await getActiveSeckillActivities();
    return c.json({ success: true, data: activities });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 获取即将开始的秒杀活动
app.get("/upcoming", async (c) => {
  try {
    const activities = await getUpcomingSeckillActivities();
    return c.json({ success: true, data: activities });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 获取秒杀活动详情
app.get("/:id", async (c) => {
  try {
    const activityId = parseInt(c.req.param("id"));
    const activity = await getSeckillActivityDetail(activityId);
    
    if (!activity) {
      return c.json({ success: false, error: "秒杀活动不存在" }, 404);
    }

    return c.json({ success: true, data: activity });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ------- 需要登录的接口 -------

// 参与秒杀（核心接口）
app.post(
  "/:id/participate",
  authMiddleware,
  createRateLimit({ ...rateLimitConfigs.seckill, max: 3 }), // 秒杀接口限制更严格
  zValidator("json", z.object({
    quantity: z.number().min(1).max(10).default(1),
  }).optional()),
  async (c) => {
    try {
      const user = c.get("user");
      const activityId = parseInt(c.req.param("id"));
      const body = await c.req.valid("json").catch(() => ({ quantity: 1 }));
      const quantity = body?.quantity || 1;

      const result = await participateSeckill(user.userId, activityId, quantity);

      return c.json({
        success: true,
        data: result,
        message: "秒杀成功，请在5分钟内完成支付",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// 获取我的秒杀订单
app.get("/orders/my", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const orders = await getMySeckillOrders(user.userId);
    return c.json({ success: true, data: orders });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 取消秒杀订单
app.post("/orders/:id/cancel", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const orderId = parseInt(c.req.param("id"));

    const order = await cancelSeckillOrder(orderId, user.userId);

    return c.json({
      success: true,
      data: order,
      message: "订单已取消，库存已恢复",
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// 支付秒杀订单
app.post("/orders/:id/pay", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const orderId = parseInt(c.req.param("id"));

    const order = await paySeckillOrder(orderId, user.userId);

    return c.json({
      success: true,
      data: order,
      message: "支付成功",
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// ------- 管理员接口 -------

// 创建秒杀活动
app.post(
  "/admin/create",
  authMiddleware,
  createRateLimit(rateLimitConfigs.general),
  zValidator("json", z.object({
    productId: z.number().min(1),
    seckillPrice: z.number().min(0.01),
    totalStock: z.number().min(1),
    startTime: z.string(), // ISO 8601 格式
    endTime: z.string(),
    maxPerUser: z.number().min(1).max(10).default(1),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      
      // 检查管理员权限
      if (user.role !== "admin") {
        return c.json({ success: false, error: "无权限" }, 403);
      }

      const body = await c.req.valid("json");
      const activity = await createSeckillActivity({
        ...body,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
      });

      return c.json({
        success: true,
        data: activity,
        message: "秒杀活动创建成功",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// 获取所有秒杀活动（管理员）
app.get("/admin/all", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    
    if (user.role !== "admin") {
      return c.json({ success: false, error: "无权限" }, 403);
    }

    const activities = await getAllSeckillActivities();
    return c.json({ success: true, data: activities });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 更新秒杀活动状态（管理员）
app.patch("/admin/:id/status", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    
    if (user.role !== "admin") {
      return c.json({ success: false, error: "无权限" }, 403);
    }

    const activityId = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { status } = body;

    if (!["upcoming", "active", "ended", "cancelled"].includes(status)) {
      return c.json({ success: false, error: "无效的状态" }, 400);
    }

    const activity = await updateSeckillStatus(activityId, status);

    return c.json({
      success: true,
      data: activity,
      message: "状态更新成功",
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// 手动触发超时订单取消（管理员）
app.post("/admin/auto-cancel", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    
    if (user.role !== "admin") {
      return c.json({ success: false, error: "无权限" }, 403);
    }

    const count = await autoCancelTimeoutOrders();

    return c.json({
      success: true,
      data: { cancelledCount: count },
      message: `已取消${count}个超时订单`,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app as seckillRoutes };
