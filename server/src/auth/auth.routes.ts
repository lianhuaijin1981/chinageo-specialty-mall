import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as authService from "./auth.service";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";

const app = new Hono();

// ------- 注册路由 -------
const registerSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(11).max(20).optional(),
  password: z.string().min(6).max(50),
  nickname: z.string().max(50).optional(),
}).refine(data => data.email || data.phone || data.username, {
  message: "邮箱、手机号或用户名至少提供一个",
});

app.post("/register", createRateLimit(rateLimitConfigs.register), zValidator("json", registerSchema), async (c) => {
  try {
    const dto = await c.req.json();
    const result = await authService.register(dto);
    return c.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message,
    }, 400);
  }
});

// ------- 登录路由 -------
const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(6).max(50),
}).refine(data => data.email || data.phone || data.username, {
  message: "邮箱、手机号或用户名至少提供一个",
});

app.post("/login", createRateLimit(rateLimitConfigs.login), zValidator("json", loginSchema), async (c) => {
  try {
    const dto = await c.req.json();
    const result = await authService.login(dto);
    return c.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message,
    }, 401);
  }
});

// ------- 微信登录路由 -------
app.post("/wechat-login", zValidator("json", z.object({
  code: z.string().min(1),
})), async (c) => {
  try {
    const { code } = await c.req.json();
    const result = await authService.wechatLogin(code);
    return c.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message,
    }, 401);
  }
});

// ------- 刷新 Token 路由 -------
app.post("/refresh", zValidator("json", z.object({
  refreshToken: z.string().min(1),
})), async (c) => {
  try {
    const { refreshToken } = await c.req.json();
    const tokens = authService.refreshToken(refreshToken);
    return c.json({
      success: true,
      data: tokens,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message,
    }, 401);
  }
});

// ------- 获取当前用户信息（需要认证）-------
app.get("/me", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const user = await authService.getUserById(userId);
    return c.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message,
    }, 401);
  }
});

export { app as authRoutes };
