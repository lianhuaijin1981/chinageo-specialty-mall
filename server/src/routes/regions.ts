import { Hono } from "hono";
import { db } from "../db";
import { regions } from "../schemas/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

// ------- 获取产区列表（公开）-------
app.get("/", async (c) => {
  const allRegions = await db.select().from(regions);
  return c.json({
    success: true,
    data: allRegions,
  });
});

// ------- 获取产区详情（公开）-------
app.get("/:id", async (c) => {
  const idOrSlug = c.req.param("id");

  let region;
  if (/^\d+$/.test(idOrSlug)) {
    const result = await db.select().from(regions).where(eq(regions.id, parseInt(idOrSlug))).limit(1);
    region = result[0];
  } else {
    const result = await db.select().from(regions).where(eq(regions.slug, idOrSlug)).limit(1);
    region = result[0];
  }

  if (!region) {
    return c.json({ success: false, message: "产区不存在" }, 404);
  }

  return c.json({
    success: true,
    data: region,
  });
});

// ------- 创建产区（管理员）-------
app.post("/", async (c) => {
  // TODO: 添加 authMiddleware 和 adminMiddleware
  try {
    const data = await c.req.json();
    const [region] = await db.insert(regions).values({
      uuid: `region_${Date.now()}`,
      ...data,
    }).returning();

    return c.json({ success: true, data: region });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 更新产区（管理员）-------
app.put("/:id", async (c) => {
  // TODO: 添加 authMiddleware 和 adminMiddleware
  try {
    const id = parseInt(c.req.param("id"));
    const data = await c.req.json();

    const [region] = await db.update(regions)
      .set(data)
      .where(eq(regions.id, id))
      .returning();

    if (!region) {
      return c.json({ success: false, message: "产区不存在" }, 404);
    }

    return c.json({ success: true, data: region });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 删除产区（管理员）-------
app.delete("/:id", async (c) => {
  // TODO: 添加 authMiddleware 和 adminMiddleware
  const id = parseInt(c.req.param("id"));
  await db.delete(regions).where(eq(regions.id, id));
  return c.json({ success: true, message: "产区已删除" });
});

export { app as regionRoutes };
