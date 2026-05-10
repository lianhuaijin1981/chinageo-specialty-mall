import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { products, categories, regions } from "../schemas/schema";
import { eq, like, desc, asc } from "drizzle-orm";
import { optionalAuthMiddleware } from "../middleware/auth";
import { indexProduct, deleteProductIndex } from "../services/search";

const app = new Hono();

// ------- 获取商品列表（公开）-------
app.get("/", optionalAuthMiddleware, async (c) => {
  const {
    categoryId,
    regionId,
    keyword,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = "1",
    pageSize = "20",
  } = c.req.query();

  // TODO: 实现分页和筛选
  let query = db.select().from(products).where(eq(products.isActive, true));

  // 模拟返回
  const allProducts = await db.select().from(products).where(eq(products.isActive, true)).limit(parseInt(pageSize));

  return c.json({
    success: true,
    data: {
      items: allProducts,
      total: allProducts.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    },
  });
});

// ------- 获取商品详情（公开）-------
app.get("/:id", optionalAuthMiddleware, async (c) => {
  const idOrSlug = c.req.param("id");

  // 尝试按 ID 或 slug 查询
  let product;
  if (/^\d+$/.test(idOrSlug)) {
    const result = await db.select().from(products).where(eq(products.id, parseInt(idOrSlug))).limit(1);
    product = result[0];
  } else {
    const result = await db.select().from(products).where(eq(products.slug, idOrSlug)).limit(1);
    product = result[0];
  }

  if (!product) {
    return c.json({ success: false, message: "商品不存在" }, 404);
  }

  return c.json({
    success: true,
    data: product,
  });
});

// ------- 创建商品（管理员/商家）-------
app.post("/", zValidator("json", z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  regionId: z.number().int().optional(),
  categoryId: z.number().int().positive(),
  images: z.array(z.string().url()).default([]),
  specs: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })).optional(),
})), async (c) => {
  // TODO: 添加 authMiddleware 和 adminMiddleware
  try {
    const data = await c.req.json();
    const [product] = await db.insert(products).values({
      uuid: `prod_${Date.now()}`,
      ...data,
      price: data.price.toString(),
      originalPrice: data.originalPrice?.toString(),
    }).returning();

    // 索引到Elasticsearch
    await indexProduct(product);

    return c.json({ success: true, data: product });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 更新商品（管理员/商家）-------
app.put("/:id", async (c) => {
  // TODO: 添加 authMiddleware 和 adminMiddleware
  try {
    const id = parseInt(c.req.param("id"));
    const data = await c.req.json();

    const [product] = await db.update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!product) {
      return c.json({ success: false, message: "商品不存在" }, 404);
    }

    // 更新Elasticsearch索引
    await indexProduct(product);

    return c.json({ success: true, data: product });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 删除商品（管理员/商家）-------
app.delete("/:id", async (c) => {
  // TODO: 添加 authMiddleware 和 adminMiddleware
  const id = parseInt(c.req.param("id"));

  await db.update(products)
    .set({ isActive: false })
    .where(eq(products.id, id));

  // 从Elasticsearch删除索引
  await deleteProductIndex(id);

  return c.json({ success: true, message: "商品已删除" });
});

export { app as productRoutes };
