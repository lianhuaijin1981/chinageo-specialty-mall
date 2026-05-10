import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { cartItems, products } from "../schemas/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();

// ------- 获取购物车列表（需要认证）-------
app.get("/", authMiddleware, async (c) => {
  const userId = c.get("userId");

  const items = await db.select({
    id: cartItems.id,
    productId: cartItems.productId,
    quantity: cartItems.quantity,
    productName: products.name,
    productPrice: products.price,
    productImage: products.images,
    createdAt: cartItems.createdAt,
  })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  return c.json({
    success: true,
    data: items,
  });
});

// ------- 添加商品到购物车（需要认证）-------
app.post("/", authMiddleware, zValidator("json", z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
})), async (c) => {
  try {
    const userId = c.get("userId");
    const { productId, quantity } = await c.req.json();

    // 检查商品是否存在
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (product.length === 0) {
      return c.json({ success: false, message: "商品不存在" }, 404);
    }

    // 检查购物车是否已存在该商品
    const existing = await db.select().from(cartItems)
      .where(eq(cartItems.userId, userId) && eq(cartItems.productId, productId))
      .limit(1);

    if (existing.length > 0) {
      // 更新数量
      await db.update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      // 新增
      await db.insert(cartItems).values({
        userId,
        productId,
        quantity,
      });
    }

    return c.json({ success: true, message: "已添加到购物车" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 更新购物车商品数量（需要认证）-------
app.put("/:id", authMiddleware, zValidator("json", z.object({
  quantity: z.number().int().min(1),
})), async (c) => {
  try {
    const userId = c.get("userId");
    const itemId = parseInt(c.req.param("id"));
    const { quantity } = await c.req.json();

    await db.update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, itemId) && eq(cartItems.userId, userId));

    return c.json({ success: true, message: "已更新" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 删除购物车商品（需要认证）-------
app.delete("/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const itemId = parseInt(c.req.param("id"));

    await db.delete(cartItems)
      .where(eq(cartItems.id, itemId) && eq(cartItems.userId, userId));

    return c.json({ success: true, message: "已删除" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 清空购物车（需要认证）-------
app.delete("/", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    await db.delete(cartItems).where(eq(cartItems.userId, userId));

    return c.json({ success: true, message: "购物车已清空" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

export { app as cartRoutes };
