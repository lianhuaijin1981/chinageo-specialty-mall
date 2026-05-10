import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { chatService } from "../services/chat.service";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";

const chatRoutes = new Hono();

// ==================== 用户端路由 ====================

// 获取或创建聊天会话
chatRoutes.post("/session", authMiddleware, async (c) => {
  const user = c.get("user");
  
  try {
    const result = await chatService.getUserChatHistory(user.userId);
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 发送消息
chatRoutes.post("/message", authMiddleware, createRateLimit(rateLimitConfigs.general), async (c) => {
  const user = c.get("user");
  const { message } = await c.req.json();
  
  if (!message || !message.trim()) {
    return c.json({ success: false, message: "消息内容不能为空" }, 400);
  }
  
  try {
    // 获取用户会话
    const { session } = await chatService.getUserChatHistory(user.userId);
    
    // 添加用户消息
    const messageRecord = await chatService.addMessage(
      session.id,
      user.userId,
      "user",
      message
    );
    
    return c.json({ success: true, data: messageRecord });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 获取消息列表（轮询）
chatRoutes.get("/messages", authMiddleware, async (c) => {
  const user = c.get("user");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  
  try {
    const { session } = await chatService.getUserChatHistory(user.userId);
    const messages = await chatService.getSessionMessages(session.id, limit, offset);
    
    return c.json({ success: true, data: messages });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 关闭会话
chatRoutes.post("/session/close", authMiddleware, async (c) => {
  const user = c.get("user");
  
  try {
    const { session } = await chatService.getUserChatHistory(user.userId);
    await chatService.closeSession(session.id);
    
    return c.json({ success: true, message: "会话已关闭" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ==================== 客服端路由 ====================

// 获取所有活跃会话（客服）
chatRoutes.get("/admin/sessions", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  try {
    const sessions = await chatService.getAllActiveSessions();
    return c.json({ success: true, data: sessions });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 获取会话详情（客服）
chatRoutes.get("/admin/sessions/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const sessionId = parseInt(c.req.param("id"));
  
  try {
    const detail = await chatService.getSessionDetail(sessionId);
    return c.json({ success: true, data: detail });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 客服发送消息
chatRoutes.post("/admin/message", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const { sessionId, message } = await c.req.json();
  
  if (!sessionId || !message || !message.trim()) {
    return c.json({ success: false, message: "参数错误" }, 400);
  }
  
  try {
    const messageRecord = await chatService.addMessage(
      sessionId,
      user.userId,
      "admin",
      message
    );
    
    return c.json({ success: true, data: messageRecord });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

export default chatRoutes;
