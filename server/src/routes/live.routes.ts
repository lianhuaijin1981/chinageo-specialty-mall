import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  createLiveStream,
  getAllLiveStreams,
  getActiveLiveStreams,
  getLiveStreamDetail,
  updateLiveStreamStatus,
  sendLiveMessage,
  sendLikeMessage,
  getLiveMessages,
  likeLiveStream,
  createLivePromotion,
  getLivePromotions,
} from "../services/live.service";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";

const app = new Hono();

// ------- 公开接口 -------

// 获取进行中的直播间
app.get("/active", async (c) => {
  try {
    const streams = await getActiveLiveStreams();
    return c.json({ success: true, data: streams });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 获取直播间详情
app.get("/:id", async (c) => {
  try {
    const liveId = parseInt(c.req.param("id"));
    const stream = await getLiveStreamDetail(liveId);
    
    if (!stream) {
      return c.json({ success: false, error: "直播间不存在" }, 404);
    }

    return c.json({ success: true, data: stream });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 获取直播消息（轮询）
app.get("/:id/messages", async (c) => {
  try {
    const liveId = parseInt(c.req.param("id"));
    const limit = parseInt(c.req.query("limit") || "50");
    
    const messages = await getLiveMessages(liveId, limit);
    return c.json({ success: true, data: messages });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 获取直播促销
app.get("/:id/promotions", async (c) => {
  try {
    const liveId = parseInt(c.req.param("id"));
    const promotions = await getLivePromotions(liveId);
    return c.json({ success: true, data: promotions });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ------- 需要登录的接口 -------

// 发送消息
app.post(
  "/:id/messages",
  authMiddleware,
  createRateLimit({ ...rateLimitConfigs.general, max: 30 }), // 聊天消息限制宽松
  zValidator("json", z.object({
    message: z.string().min(1).max(500),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      const liveId = parseInt(c.req.param("id"));
      const body = await c.req.valid("json");

      const msg = await sendLiveMessage(liveId, user.userId, body.message);

      return c.json({
        success: true,
        data: msg,
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// 点赞
app.post("/:id/like", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const liveId = parseInt(c.req.param("id"));

    await sendLikeMessage(liveId, user.userId);

    return c.json({
      success: true,
      message: "点赞成功",
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// ------- 管理员接口 -------

// 创建直播间
app.post(
  "/admin/create",
  authMiddleware,
  zValidator("json", z.object({
    title: z.string().min(2).max(200),
    description: z.string().optional(),
    productId: z.number().min(1).optional(),
    startTime: z.string(),
    endTime: z.string().optional(),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      
      if (user.role !== "admin") {
        return c.json({ success: false, error: "无权限" }, 403);
      }

      const body = await c.req.valid("json");
      const stream = await createLiveStream({
        ...body,
        streamerId: user.userId,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : undefined,
      });

      return c.json({
        success: true,
        data: stream,
        message: "直播间创建成功",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// 获取所有直播间（管理员）
app.get("/admin/all", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    
    if (user.role !== "admin") {
      return c.json({ success: false, error: "无权限" }, 403);
    }

    const streams = await getAllLiveStreams();
    return c.json({ success: true, data: streams });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 更新直播间状态（管理员）
app.patch("/admin/:id/status", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    
    if (user.role !== "admin") {
      return c.json({ success: false, error: "无权限" }, 403);
    }

    const liveId = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { status } = body;

    if (!["upcoming", "live", "ended", "cancelled"].includes(status)) {
      return c.json({ success: false, error: "无效的状态" }, 400);
    }

    const stream = await updateLiveStreamStatus(liveId, status);

    return c.json({
      success: true,
      data: stream,
      message: "状态更新成功",
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// 创建直播促销（管理员）
app.post(
  "/admin/promotions",
  authMiddleware,
  zValidator("json", z.object({
    liveId: z.number().min(1),
    productId: z.number().min(1),
    promotionPrice: z.number().min(0.01),
    startTime: z.string(),
    endTime: z.string(),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      
      if (user.role !== "admin") {
        return c.json({ success: false, error: "无权限" }, 403);
      }

      const body = await c.req.valid("json");
      const promotion = await createLivePromotion({
        ...body,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
      });

      return c.json({
        success: true,
        data: promotion,
        message: "直播促销创建成功",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

export { app as liveRoutes };
