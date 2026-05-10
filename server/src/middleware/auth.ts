import { createMiddleware } from "hono/factory";
import * as authService from "../auth/auth.service";

// 认证中间件
export const authMiddleware = createMiddleware(async (c, next) => {
  // 从 Header 获取 Token
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({
      success: false,
      message: "未提供认证令牌",
    }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = authService.verifyToken(token);
    c.set("userId", payload.userId);
    
    // 可选：从数据库获取用户角色
    // const user = await authService.getUserById(payload.userId);
    // c.set("userRole", user.role);
    
    await next();
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message || "认证失败",
    }, 401);
  }
});

// 管理员权限中间件
export const adminMiddleware = createMiddleware(async (c, next) => {
  const userId = c.get("userId");
  
  // TODO: 从数据库查询用户角色
  // 暂时实现逻辑
  const user = await authService.getUserById(userId);
  
  if (user.role !== "admin") {
    return c.json({
      success: false,
      message: "无权限访问",
    }, 403);
  }

  await next();
});

// 可选认证中间件（不强制要求登录）
export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const payload = authService.verifyToken(token);
      c.set("userId", payload.userId);
    } catch {
      // 忽略无效 token
    }
  }

  await next();
});
