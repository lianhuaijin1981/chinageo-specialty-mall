import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { orders, orderItems, products, cartItems } from "../schemas/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { nanoid } from "nanoid";

const app = new Hono();

// ------- 创建订单（需要认证）-------
app.post("/", authMiddleware, zValidator("json", z.object({
  addressId: z.number().int().positive(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })),
  remark: z.string().optional(),
})), async (c) => {
  try {
    const userId = c.get("userId");
    const { addressId, items, remark } = await c.req.json();

    // 1. 验证地址是否属于当前用户
    // TODO: 查询地址表验证

    // 2. 计算订单金额
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      
      if (product.length === 0) {
        return c.json({ success: false, message: `商品 ${item.productId} 不存在` }, 400);
      }

      if (!product[0].isActive) {
        return c.json({ success: false, message: `商品 ${product[0].name} 已下架` }, 400);
      }

      if (product[0].stock < item.quantity) {
        return c.json({ success: false, message: `商品 ${product[0].name} 库存不足` }, 400);
      }

      const itemTotal = parseFloat(product[0].price.toString()) * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        productName: product[0].name,
        price: product[0].price,
        quantity: item.quantity,
        image: product[0].images ? (product[0].images as string[])[0] : null,
      });

      // 扣减库存
      await db.update(products)
        .set({ stock: product[0].stock - item.quantity })
        .where(eq(products.id, item.productId));
    }

    // 3. 创建订单
    const orderNo = `ORDER${Date.now()}${nanoid(6)}`;
    const [order] = await db.insert(orders).values({
      uuid: nanoid(32),
      orderNo,
      userId,
      totalAmount: totalAmount.toFixed(2),
      payAmount: totalAmount.toFixed(2),
      status: "pending",
      paymentStatus: "unpaid",
      addressSnapshot: {
        // TODO: 从地址表获取地址信息
        name: "测试用户",
        phone: "13800138000",
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
        detail: "测试地址",
      },
      remark,
    }).returning();

    // 4. 创建订单商品
    for (const item of orderItemsData) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      });
    }

    // 5. 清空购物车（可选）
    // await db.delete(cartItems).where(eq(cartItems.userId, userId));

    return c.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo: order.orderNo,
        totalAmount,
        payAmount: totalAmount,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// ------- 获取订单列表（需要认证）-------
app.get("/", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const { status } = c.req.query();

  // TODO: 实现筛选和分页
  const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));

  return c.json({
    success: true,
    data: userOrders,
  });
});

// ------- 获取订单详情（需要认证）-------
app.get("/:orderNo", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const orderNo = c.req.param("orderNo");

  const order = await db.select().from(orders)
    .where(eq(orders.orderNo, orderNo) && eq(orders.userId, userId))
    .limit(1);

  if (order.length === 0) {
    return c.json({ success: false, message: "订单不存在" }, 404);
  }

  // 获取订单商品
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id));

  return c.json({
    success: true,
    data: {
      ...order[0],
      items,
    },
  });
});

// ------- 取消订单（需要认证）-------
app.put("/:orderNo/cancel", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const orderNo = c.req.param("orderNo");

    const order = await db.select().from(orders)
      .where(eq(orders.orderNo, orderNo) && eq(orders.userId, userId))
      .limit(1);

    if (order.length === 0) {
      return c.json({ success: false, message: "订单不存在" }, 404);
    }

    if (order[0].status !== "pending") {
      return c.json({ success: false, message: "订单状态不允许取消" }, 400);
    }

    // 恢复库存
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id));
    for (const item of items) {
      await db.update(products)
        .set({ stock: db.unsafe(`stock + ${item.quantity}`) })
        .where(eq(products.id, item.productId));
    }

    // 更新订单状态
    await db.update(orders)
      .set({ status: "cancelled" })
      .where(eq(orders.id, order[0].id));

    return c.json({ success: true, message: "订单已取消" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

export { app as orderRoutes };
