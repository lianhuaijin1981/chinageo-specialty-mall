import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { categories } from "../schemas/schema";
import { eq, like } from "drizzle-orm";

const app = new Hono();

// ------- 获取分类列表（公开）-------
app.get("/", async (c) => {
  const { parentId, keyword } = c.req.query();

  let query = db.select().from(categories).where(eq(categories.isActive, true));

  // TODO: 实现筛选和树形结构

  const allCategories = await db.select().from(categories).where(eq(categories.isActive, true));

  return c.json({
    success: true,
    data: allCategories,
  });
});

// ------- 获取分类详情（公开）-------
app.get("/:id", async (c) => {
  const idOrSlug = c.req.param("id");

  let category;
  if (/^\d+$/.test(idOrSlug)) {
    const result = await db.select().from(categories).where(eq(categories.id, parseInt(idOrSlug))).limit(1);
    category = result[0];
  } else {
    const result = await db.select().from(categories).where(eq(categories.slug, idOrSlug)).limit(1);
    category = result[0];
  }

  if (!category) {
    return c.json({ success: false, message: "分类不存在" }, 404);
  }

  return c.json({
    success: true,
    data: category,
  });
});

// ------- 创建分类（管理员）-------
app.post("/", zValidator("json", z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  parentId: z.number().int().positive().optional(),
  image: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
})), async (c) => {
  // TODO: 添加 authMiddleware 和 adminMiddleware
  try {
    const data = await c.req.json();
    const [category] = await db.insert(categories).values({
      uuid: `cat_${Date.now()}`,
      ...data,
    }).returning();

    return c.json({ success: true, data: category });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 更新分类（管理员）-------
app.put("/:id", async (c) => {
  // TODO: 添加 authMiddleware 和 adminMiddleware
  try {
    const id = parseInt(c.req.param("id"));
    const data = await c.req.json();

    const [category] = await db.update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!category) {
      return c.json({ success: false, message: "分类不存在" }, 404);
    }

    return c.json({ success: true, data: category });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 删除分类（管理员）-------
app.delete("/:id", async (c) => {
  // TODO: 添加 authMiddleware 和 adminMiddleware
  const id = parseInt(c.req.param("id"));

  await db.update(categories)
    .set({ isActive: false })
    .where(eq(categories.id, id));

  return c.json({ success: true, message: "分类已删除" });
});

export { app as categoryRoutes };
