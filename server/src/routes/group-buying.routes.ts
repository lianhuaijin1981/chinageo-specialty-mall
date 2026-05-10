import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  upsertEnterpriseInfo,
  getEnterpriseInfo,
  verifyEnterprise,
  createGroupBuyingActivity,
  getAllGroupBuyingActivities,
  getActiveGroupBuyingActivities,
  getGroupBuyingActivityDetail,
  joinGroupBuying,
  getMyGroupBuyingOrders,
  payGroupBuyingOrder,
  cancelGroupBuyingOrder,
  updateGroupBuyingStatus,
} from "../services/group-buying.service";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";

const app = new Hono();

// ------- 企业信息认证接口 -------

// 提交/更新企业信息
app.post(
  "/enterprise/verify",
  authMiddleware,
  zValidator("json", z.object({
    companyName: z.string().min(2).max(200),
    contactPerson: z.string().min(2).max(50),
    contactPhone: z.string().min(11).max(20),
    companyAddress: z.string().min(10),
    businessLicense: z.string().optional(),
    taxNumber: z.string().optional(),
    invoiceType: z.enum(["normal", "special"]).default("normal"),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      const body = await c.req.valid("json");

      const result = await upsertEnterpriseInfo({
        userId: user.userId,
        ...body,
      });

      return c.json({
        success: true,
        data: result,
        message: "企业信息已提交，请等待审核",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// 获取我的企业信息
app.get("/enterprise/my", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const info = await getEnterpriseInfo(user.userId);
    return c.json({ success: true, data: info });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ------- 管理员审核接口 -------

// 审核企业信息
app.post(
  "/admin/enterprise/verify",
  authMiddleware,
  zValidator("json", z.object({
    enterpriseId: z.number().min(1),
    approved: z.boolean(),
    rejectionReason: z.string().optional(),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      
      if (user.role !== "admin") {
        return c.json({ success: false, error: "无权限" }, 403);
      }

      const body = await c.req.valid("json");
      const result = await verifyEnterprise(
        body.enterpriseId,
        body.approved,
        body.rejectionReason
      );

      return c.json({
        success: true,
        data: result,
        message: body.approved ? "审核通过" : "审核拒绝",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// ------- 团购活动接口 -------

// 获取进行中的团购活动（公开）
app.get("/activities/active", async (c) => {
  try {
    const activities = await getActiveGroupBuyingActivities();
    return c.json({ success: true, data: activities });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 获取团购活动详情（公开）
app.get("/activities/:id", async (c) => {
  try {
    const activityId = parseInt(c.req.param("id"));
    const activity = await getGroupBuyingActivityDetail(activityId);
    
    if (!activity) {
      return c.json({ success: false, error: "团购活动不存在" }, 404);
    }

    return c.json({ success: true, data: activity });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 参团（需要登录）
app.post(
  "/activities/:id/join",
  authMiddleware,
  createRateLimit(rateLimitConfigs.general),
  zValidator("json", z.object({
    quantity: z.number().min(1).max(100).default(1),
  }).optional()),
  async (c) => {
    try {
      const user = c.get("user");
      const activityId = parseInt(c.req.param("id"));
      const body = await c.req.valid("json").catch(() => ({ quantity: 1 }));
      const quantity = body?.quantity || 1;

      // 检查企业用户
      const enterpriseInfo = await getEnterpriseInfo(user.userId);
      const enterpriseId = enterpriseInfo?.status === "verified" ? enterpriseInfo.id : undefined;

      const result = await joinGroupBuying(user.userId, activityId, quantity, enterpriseId);

      return c.json({
        success: true,
        data: result,
        message: "参团成功，请在30分钟内完成支付",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// 获取我的团购订单
app.get("/orders/my", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const orders = await getMyGroupBuyingOrders(user.userId);
    return c.json({ success: true, data: orders });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 支付团购订单
app.post(
  "/orders/:id/pay",
  authMiddleware,
  zValidator("json", z.object({
    invoiceTitle: z.string().optional(),
    invoiceTaxNumber: z.string().optional(),
  }).optional()),
  async (c) => {
    try {
      const user = c.get("user");
      const orderId = parseInt(c.req.param("id"));
      const body = await c.req.valid("json").catch(() => ({}));

      const order = await payGroupBuyingOrder(
        orderId,
        user.userId,
        body?.invoiceTitle,
        body?.invoiceTaxNumber
      );

      return c.json({
        success: true,
        data: order,
        message: "支付成功",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// 取消团购订单
app.post("/orders/:id/cancel", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const orderId = parseInt(c.req.param("id"));

    const order = await cancelGroupBuyingOrder(orderId, user.userId);

    return c.json({
      success: true,
      data: order,
      message: "订单已取消",
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// ------- 管理员接口 -------

// 创建团购活动
app.post(
  "/admin/activities",
  authMiddleware,
  zValidator("json", z.object({
    productId: z.number().min(1),
    groupPrice: z.number().min(0.01),
    minGroupSize: z.number().min(2).default(10),
    maxGroupSize: z.number().min(1).optional(),
    startTime: z.string(),
    endTime: z.string(),
    enterpriseOnly: z.boolean().default(false),
    customPackaging: z.boolean().default(false),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      
      if (user.role !== "admin") {
        return c.json({ success: false, error: "无权限" }, 403);
      }

      const body = await c.req.valid("json");
      const activity = await createGroupBuyingActivity({
        ...body,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
      });

      return c.json({
        success: true,
        data: activity,
        message: "团购活动创建成功",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// 获取所有团购活动（管理员）
app.get("/admin/activities", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    
    if (user.role !== "admin") {
      return c.json({ success: false, error: "无权限" }, 403);
    }

    const activities = await getAllGroupBuyingActivities();
    return c.json({ success: true, data: activities });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 更新活动状态（管理员）
app.patch("/admin/activities/:id/status", authMiddleware, async (c) => {
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

    const activity = await updateGroupBuyingStatus(activityId, status);

    return c.json({
      success: true,
      data: activity,
      message: "状态更新成功",
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export { app as groupBuyingRoutes };
