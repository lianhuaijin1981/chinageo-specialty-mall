import { db } from "../db";
import { seckillActivities, seckillOrders, products, orders, orderItems, users } from "../schemas/schema";
import { eq, and, gt, lt, sql, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// ------- 管理员功能 -------

// 创建秒杀活动
export async function createSeckillActivity(data: {
  productId: number;
  seckillPrice: number;
  totalStock: number;
  startTime: Date;
  endTime: Date;
  maxPerUser?: number;
}) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);
  
  const [activity] = await db.insert(seckillActivities).values({
    uuid,
    productId: data.productId,
    seckillPrice: data.seckillPrice.toString(),
    totalStock: data.totalStock,
    currentStock: data.totalStock,
    startTime: data.startTime,
    endTime: data.endTime,
    maxPerUser: data.maxPerUser || 1,
    status: "upcoming",
  }).returning();

  return activity;
}

// 获取所有秒杀活动（管理员）
export async function getAllSeckillActivities() {
  const activities = await db
    .select({
      id: seckillActivities.id,
      uuid: seckillActivities.uuid,
      productId: seckillActivities.productId,
      seckillPrice: seckillActivities.seckillPrice,
      totalStock: seckillActivities.totalStock,
      currentStock: seckillActivities.currentStock,
      soldCount: seckillActivities.soldCount,
      startTime: seckillActivities.startTime,
      endTime: seckillActivities.endTime,
      status: seckillActivities.status,
      maxPerUser: seckillActivities.maxPerUser,
      createdAt: seckillActivities.createdAt,
      productName: products.name,
      productImage: products.images,
      originalPrice: products.price,
    })
    .from(seckillActivities)
    .leftJoin(products, eq(seckillActivities.productId, products.id))
    .orderBy(sql`${seckillActivities.createdAt} DESC`);

  return activities;
}

// 更新秒杀活动状态
export async function updateSeckillStatus(activityId: number, status: string) {
  const [activity] = await db
    .update(seckillActivities)
    .set({ status, updatedAt: new Date() })
    .where(eq(seckillActivities.id, activityId))
    .returning();

  return activity;
}

// ------- 用户功能 -------

// 获取进行中的秒杀活动列表
export async function getActiveSeckillActivities() {
  const now = new Date();
  
  const activities = await db
    .select({
      id: seckillActivities.id,
      uuid: seckillActivities.uuid,
      productId: seckillActivities.productId,
      seckillPrice: seckillActivities.seckillPrice,
      totalStock: seckillActivities.totalStock,
      currentStock: seckillActivities.currentStock,
      soldCount: seckillActivities.soldCount,
      startTime: seckillActivities.startTime,
      endTime: seckillActivities.endTime,
      status: seckillActivities.status,
      maxPerUser: seckillActivities.maxPerUser,
      productName: products.name,
      productImage: products.images,
      originalPrice: products.price,
      productSlug: products.slug,
    })
    .from(seckillActivities)
    .leftJoin(products, eq(seckillActivities.productId, products.id))
    .where(
      and(
        eq(seckillActivities.status, "active"),
        lt(seckillActivities.startTime, now),
        gt(seckillActivities.endTime, now)
      )
    )
    .orderBy(seckillActivities.startTime);

  return activities;
}

// 获取即将开始的秒杀活动
export async function getUpcomingSeckillActivities() {
  const now = new Date();
  
  const activities = await db
    .select({
      id: seckillActivities.id,
      uuid: seckillActivities.uuid,
      productId: seckillActivities.productId,
      seckillPrice: seckillActivities.seckillPrice,
      totalStock: seckillActivities.totalStock,
      currentStock: seckillActivities.currentStock,
      soldCount: seckillActivities.soldCount,
      startTime: seckillActivities.startTime,
      endTime: seckillActivities.endTime,
      status: seckillActivities.status,
      maxPerUser: seckillActivities.maxPerUser,
      productName: products.name,
      productImage: products.images,
      originalPrice: products.price,
      productSlug: products.slug,
    })
    .from(seckillActivities)
    .leftJoin(products, eq(seckillActivities.productId, products.id))
    .where(
      and(
        eq(seckillActivities.status, "upcoming"),
        gt(seckillActivities.startTime, now)
      )
    )
    .orderBy(seckillActivities.startTime);

  return activities;
}

// 获取秒杀活动详情
export async function getSeckillActivityDetail(activityId: number) {
  const [activity] = await db
    .select({
      id: seckillActivities.id,
      uuid: seckillActivities.uuid,
      productId: seckillActivities.productId,
      seckillPrice: seckillActivities.seckillPrice,
      totalStock: seckillActivities.totalStock,
      currentStock: seckillActivities.currentStock,
      soldCount: seckillActivities.soldCount,
      startTime: seckillActivities.startTime,
      endTime: seckillActivities.endTime,
      status: seckillActivities.status,
      maxPerUser: seckillActivities.maxPerUser,
      productName: products.name,
      productDescription: products.description,
      productImage: products.images,
      originalPrice: products.price,
      productSlug: products.slug,
      specs: products.specs,
    })
    .from(seckillActivities)
    .leftJoin(products, eq(seckillActivities.productId, products.id))
    .where(eq(seckillActivities.id, activityId));

  return activity;
}

// 检查用户秒杀限购
export async function checkUserSeckillLimit(userId: number, activityId: number, quantity: number) {
  const activity = await db
    .select()
    .from(seckillActivities)
    .where(eq(seckillActivities.id, activityId))
    .limit(1);

  if (!activity[0]) {
    return { allowed: false, message: "秒杀活动不存在" };
  }

  // 检查用户已购买数量
  const userOrders = await db
    .select()
    .from(seckillOrders)
    .where(
      and(
        eq(seckillOrders.userId, userId),
        eq(seckillOrders.activityId, activityId),
        inArray(seckillOrders.status, ["pending", "paid"])
      )
    );

  const userTotalQuantity = userOrders.reduce((sum, order) => sum + order.quantity, 0);

  if (userTotalQuantity + quantity > activity[0].maxPerUser) {
    return { 
      allowed: false, 
      message: `每人限购${activity[0].maxPerUser}件，您已购买${userTotalQuantity}件` 
    };
  }

  return { allowed: true, activity: activity[0] };
}

// 【核心】参与秒杀（使用数据库事务+行锁防超卖）
export async function participateSeckill(userId: number, activityId: number, quantity: number = 1) {
  const now = new Date();

  // 使用事务 + 行锁防止超卖
  const result = await db.transaction(async (tx) => {
    // 1. 查询活动并加行锁（FOR UPDATE）
    const activities = await tx
      .select()
      .from(seckillActivities)
      .where(eq(seckillActivities.id, activityId))
      .forUpdate();

    if (!activities[0]) {
      throw new Error("秒杀活动不存在");
    }

    const activity = activities[0];

    // 2. 检查活动状态
    if (activity.status !== "active") {
      throw new Error("秒杀活动未开始或已结束");
    }

    if (now < activity.startTime) {
      throw new Error("秒杀活动未开始");
    }

    if (now > activity.endTime) {
      throw new Error("秒杀活动已结束");
    }

    // 3. 检查库存（加锁后读取，保证一致性）
    if (activity.currentStock < quantity) {
      throw new Error("库存不足");
    }

    // 4. 检查用户限购
    const userOrders = await tx
      .select()
      .from(seckillOrders)
      .where(
        and(
          eq(seckillOrders.userId, userId),
          eq(seckillOrders.activityId, activityId),
          inArray(seckillOrders.status, ["pending", "paid"])
        )
      );

    const userTotalQuantity = userOrders.reduce((sum, order) => sum + order.quantity, 0);

    if (userTotalQuantity + quantity > activity.maxPerUser) {
      throw new Error(`每人限购${activity.maxPerUser}件`);
    }

    // 5. 扣减库存
    const [updatedActivity] = await tx
      .update(seckillActivities)
      .set({
        currentStock: activity.currentStock - quantity,
        soldCount: activity.soldCount + quantity,
        updatedAt: now,
      })
      .where(eq(seckillActivities.id, activityId))
      .returning();

    // 6. 创建秒杀订单
    const orderUuid = uuidv4().replace(/-/g, "").substring(0, 32);
    const totalAmount = parseFloat(activity.seckillPrice.toString()) * quantity;

    const [seckillOrder] = await tx
      .insert(seckillOrders)
      .values({
        uuid: orderUuid,
        activityId,
        userId,
        quantity,
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
      })
      .returning();

    return {
      seckillOrder,
      activity: updatedActivity,
    };
  });

  return result;
}

// 获取我的秒杀订单
export async function getMySeckillOrders(userId: number) {
  const orders = await db
    .select({
      id: seckillOrders.id,
      uuid: seckillOrders.uuid,
      quantity: seckillOrders.quantity,
      totalAmount: seckillOrders.totalAmount,
      status: seckillOrders.status,
      paidAt: seckillOrders.paidAt,
      createdAt: seckillOrders.createdAt,
      activityId: seckillActivities.id,
      productName: products.name,
      productImage: products.images,
      seckillPrice: seckillActivities.seckillPrice,
    })
    .from(seckillOrders)
    .leftJoin(seckillActivities, eq(seckillOrders.activityId, seckillActivities.id))
    .leftJoin(products, eq(seckillActivities.productId, products.id))
    .where(eq(seckillOrders.userId, userId))
    .orderBy(sql`${seckillOrders.createdAt} DESC`);

  return orders;
}

// 取消秒杀订单（超时未支付自动取消）
export async function cancelSeckillOrder(orderId: number, userId: number) {
  const [order] = await db
    .update(seckillOrders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(seckillOrders.id, orderId),
        eq(seckillOrders.userId, userId),
        eq(seckillOrders.status, "pending")
      )
    )
    .returning();

  if (!order) {
    throw new Error("订单不存在或已支付");
  }

  // 恢复库存
  await db
    .update(seckillActivities)
    .set({
      currentStock: sql`${seckillActivities.currentStock} + ${order.quantity}`,
      soldCount: sql`${seckillActivities.soldCount} - ${order.quantity}`,
      updatedAt: new Date(),
    })
    .where(eq(seckillActivities.id, order.activityId));

  return order;
}

// 支付秒杀订单（简化为直接标记已支付）
export async function paySeckillOrder(orderId: number, userId: number) {
  const [order] = await db
    .update(seckillOrders)
    .set({
      status: "paid",
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(seckillOrders.id, orderId),
        eq(seckillOrders.userId, userId),
        eq(seckillOrders.status, "pending")
      )
    )
    .returning();

  if (!order) {
    throw new Error("订单不存在或已支付");
  }

  return order;
}

// 自动取消超时订单（5分钟未支付）
export async function autoCancelTimeoutOrders() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const timeoutOrders = await db
    .select()
    .from(seckillOrders)
    .where(
      and(
        eq(seckillOrders.status, "pending"),
        lt(seckillOrders.createdAt, fiveMinutesAgo)
      )
    );

  for (const order of timeoutOrders) {
    await db
      .update(seckillOrders)
      .set({ status: "timeout", updatedAt: new Date() })
      .where(eq(seckillOrders.id, order.id));

    // 恢复库存
    await db
      .update(seckillActivities)
      .set({
        currentStock: sql`${seckillActivities.currentStock} + ${order.quantity}`,
        soldCount: sql`${seckillActivities.soldCount} - ${order.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(seckillActivities.id, order.activityId));
  }

  return timeoutOrders.length;
}
