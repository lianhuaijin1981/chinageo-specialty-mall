import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { users } from "../schemas/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const app = new Hono();

// ------- 获取用户信息（需要认证）-------
app.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (result.length === 0) {
    return c.json({ success: false, message: "用户不存在" }, 404);
  }

  const user = result[0];
  return c.json({
    success: true,
    data: {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
    },
  });
});

// ------- 更新用户信息（需要认证）-------
app.put("/me", authMiddleware, zValidator("json", z.object({
  nickname: z.string().max(50).optional(),
  avatar: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(11).max(20).optional(),
})), async (c) => {
  try {
    const userId = c.get("userId");
    const data = await c.req.json();

    await db.update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return c.json({ success: true, message: "更新成功" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 获取用户列表（管理员）-------
app.get("/", adminMiddleware, async (c) => {
  const allUsers = await db.select().from(users);
  return c.json({
    success: true,
    data: allUsers.map(u => ({
      id: u.id,
      uuid: u.uuid,
      username: u.username,
      email: u.email,
      phone: u.phone,
      nickname: u.nickname,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    })),
  });
});

export { app as userRoutes };
