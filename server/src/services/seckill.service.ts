import { db } from "../db";
import { seckillActivities, seckillOrders, products, users } from "../schemas/schema";
import { eq, and, gt, lt, gte, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";

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
  const {
    productId,
    seckillPrice,
    totalStock,
    startTime,
    endTime,
    maxPerUser = 1,
  } = data;

  // 验证产品存在
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product) {
    throw new Error("产品不存在");
  }

  // 验证时间
  if (startTime >= endTime) {
    throw new Error("开始时间必须早于结束时间");
  }

  if (startTime <= new Date()) {
    throw new Error("开始时间必须晚于当前时间");
  }

  // 检查是否已有重叠的秒杀活动
  const existing = await db.select().from(seckillActivities)
    .where(
      and(
        eq(seckillActivities.productId, productId),
        eq(seckillActivities.status, "active")
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("该产品已有进行中的秒杀活动");
  }

  // 创建秒杀活动
  const [activity] = await db.insert(seckillActivities).values({
    uuid: `seckill_${Date.now()}`,
    productId,
    seckillPrice: seckillPrice.toString(),
    totalStock,
    currentStock: totalStock,
    soldCount: 0,
    startTime,
    endTime,
    maxPerUser,
    status: "upcoming",
  }).returning();

  return activity;
}

// 获取所有秒杀活动（管理员）
export async function getAllSeckillActivities() {
  const activities = await db.select({
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
    .orderBy(sql`${seckillActivities.startTime} DESC`);

  return activities;
}

// 更新秒杀活动状态（管理员）
export async function updateSeckillStatus(activityId: number, status: string) {
  if (!["upcoming", "active", "ended", "cancelled"].includes(status)) {
    throw new Error("无效的状态");
  }

  const [activity] = await db.update(seckillActivities)
    .set({ status, updatedAt: new Date() })
    .where(eq(seckillActivities.id, activityId))
    .returning();

  if (!activity) {
    throw new Error("秒杀活动不存在");
  }

  return activity;
}

// ------- 公开接口 -------

// 获取进行中的秒杀活动
export async function getActiveSeckillActivities() {
  const now = new Date();

  const activities = await db.select({
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
    productDescription: products.description,
  })
    .from(seckillActivities)
    .leftJoin(products, eq(seckillActivities.productId, products.id))
    .where(
      and(
        eq(seckillActivities.status, "active"),
        lte(seckillActivities.startTime, now),
        gte(seckillActivities.endTime, now)
      )
    )
    .orderBy(seckillActivities.startTime);

  return activities;
}

// 获取即将开始的秒杀活动
export async function getUpcomingSeckillActivities() {
  const now = new Date();

  const activities = await db.select({
    id: seckillActivities.id,
    uuid: seckillActivities.uuid,
    productId: seckillActivities.productId,
    seckillPrice: seckillActivities.seckillPrice,
    totalStock: seckillActivities.totalStock,
    currentStock: seckillActivities.currentStock,
    startTime: seckillActivities.startTime,
    endTime: seckillActivities.endTime,
    productName: products.name,
    productImage: products.images,
    originalPrice: products.price,
  })
    .from(seckillActivities)
    .leftJoin(products, eq(seckillActivities.productId, products.id))
    .where(
      and(
        eq(seckillActivities.status, "upcoming"),
        gt(seckillActivities.startTime, now)
      )
    )
    .orderBy(seckillActivities.startTime)
    .limit(10);

  return activities;
}

// 获取秒杀活动详情
export async function getSeckillActivityDetail(activityId: number) {
  const [activity] = await db.select({
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
    updatedAt: seckillActivities.updatedAt,
    productName: products.name,
    productImage: products.images,
    originalPrice: products.price,
    productDescription: products.description,
    productRegion: regions.name,
  })
    .from(seckillActivities)
    .leftJoin(products, eq(seckillActivities.productId, products.id))
    .leftJoin(regions, eq(products.regionId, regions.id))
    .where(eq(seckillActivities.id, activityId))
    .limit(1);

  if (!activity) {
    throw new Error("秒杀活动不存在");
  }

  // 计算进度
  const progress = activity.totalStock > 0
    ? Math.round((activity.soldCount / activity.totalStock) * 100)
    : 0;

  // 计算剩余时间
  const now = new Date();
  let timeRemaining = 0;
  if (activity.status === "active") {
    timeRemaining = new Date(activity.endTime).getTime() - now.getTime();
  }

  return {
    ...activity,
    progress,
    timeRemaining: Math.max(0, timeRemaining),
  };
}

// ------- 用户功能 -------

// 参与秒杀（下单）
export async function joinSeckill(userId: number, activityId: number, quantity: number = 1) {
  // 获取秒杀活动
  const activity = await getSeckillActivityDetail(activityId);

  // 检查活动状态
  if (activity.status !== "active") {
    throw new Error("秒杀活动未开始或已结束");
  }

  // 检查时间
  const now = new Date();
  if (now < new Date(activity.startTime) || now > new Date(activity.endTime)) {
    throw new Error("不在秒杀活动时间内");
  }

  // 检查库存
  if (activity.currentStock < quantity) {
    throw new Error("库存不足");
  }

  // 检查用户购买数量限制
  const userOrders = await db.select()
    .from(seckillOrders)
    .where(
      and(
        eq(seckillOrders.activityId, activityId),
        eq(seckillOrders.userId, userId),
        eq(seckillOrders.status, "paid")
      )
    );

  const userTotalQuantity = userOrders.reduce((sum, order) => sum + order.quantity, 0);
  if (userTotalQuantity + quantity > activity.maxPerUser) {
    throw new Error(`每人限购${activity.maxPerUser}件`);
  }

  // 创建秒杀订单
  const totalAmount = parseFloat(activity.seckillPrice) * quantity;

  const [order] = await db.insert(seckillOrders).values({
    uuid: `seckill_order_${Date.now()}`,
    activityId,
    userId,
    quantity,
    totalAmount: totalAmount.toString(),
    status: "pending",
  }).returning();

  // 扣减库存（使用事务保证一致性）
  await db.update(seckillActivities)
    .set({
      currentStock: activity.currentStock - quantity,
      soldCount: activity.soldCount + quantity,
      updatedAt: new Date(),
    })
    .where(eq(seckillActivities.id, activityId));

  return order;
}

// 支付秒杀订单
export async function paySeckillOrder(orderId: number, userId: number) {
  // 获取订单
  const [order] = await db.select()
    .from(seckillOrders)
    .where(eq(seckillOrders.id, orderId))
    .limit(1);

  if (!order) {
    throw new Error("订单不存在");
  }

  if (order.userId !== userId) {
    throw new Error("无权操作此订单");
  }

  if (order.status !== "pending") {
    throw new Error("订单状态异常");
  }

  // 检查支付超时（15分钟）
  const createdAt = new Date(order.createdAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  if (diffMinutes > 15) {
    // 超时，取消订单并恢复库存
    await db.update(seckillOrders)
      .set({ status: "timeout", updatedAt: new Date() })
      .where(eq(seckillOrders.id, orderId));

    // 恢复库存
    const activity = await db.select()
      .from(seckillActivities)
      .where(eq(seckillActivities.id, order.activityId))
      .limit(1);

    if (activity[0]) {
      await db.update(seckillActivities)
        .set({
          currentStock: activity[0].currentStock + order.quantity,
          soldCount: activity[0].soldCount - order.quantity,
          updatedAt: new Date(),
        })
        .where(eq(seckillActivities.id, order.activityId));
    }

    throw new Error("支付超时，订单已取消");
  }

  // 更新订单状态为已支付
  const [updatedOrder] = await db.update(seckillOrders)
    .set({
      status: "paid",
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(seckillOrders.id, orderId))
    .returning();

  return updatedOrder;
}

// 取消秒杀订单
export async function cancelSeckillOrder(orderId: number, userId: number) {
  // 获取订单
  const [order] = await db.select()
    .from(seckillOrders)
    .where(eq(seckillOrders.id, orderId))
    .limit(1);

  if (!order) {
    throw new Error("订单不存在");
  }

  if (order.userId !== userId) {
    throw new Error("无权操作此订单");
  }

  if (order.status !== "pending") {
    throw new Error("只能取消待支付订单");
  }

  // 更新订单状态
  const [updatedOrder] = await db.update(seckillOrders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(seckillOrders.id, orderId))
    .returning();

  // 恢复库存
  const activity = await db.select()
    .from(seckillActivities)
    .where(eq(seckillActivities.id, order.activityId))
    .limit(1);

  if (activity[0]) {
    await db.update(seckillActivities)
      .set({
        currentStock: activity[0].currentStock + order.quantity,
        soldCount: activity[0].soldCount - order.quantity,
        updatedAt: new Date(),
      })
      .where(eq(seckillActivities.id, order.activityId));
  }

  return updatedOrder;
}

// 获取我的秒杀订单
export async function getMySeckillOrders(userId: number) {
  const orders = await db.select({
    id: seckillOrders.id,
    uuid: seckillOrders.uuid,
    activityId: seckillOrders.activityId,
    quantity: seckillOrders.quantity,
    totalAmount: seckillOrders.totalAmount,
    status: seckillOrders.status,
    paidAt: seckillOrders.paidAt,
    createdAt: seckillOrders.createdAt,
    activityProductName: products.name,
    activitySeckillPrice: seckillActivities.seckillPrice,
    activityStartTime: seckillActivities.startTime,
    activityEndTime: seckillActivities.endTime,
  })
    .from(seckillOrders)
    .leftJoin(seckillActivities, eq(seckillOrders.activityId, seckillActivities.id))
    .leftJoin(products, eq(seckillActivities.productId, products.id))
    .where(eq(seckillOrders.userId, userId))
    .orderBy(sql`${seckillOrders.createdAt} DESC`);

  return orders;
}

// ------- 定时任务（可选）------

// 更新秒杀活动状态（由定时任务调用）
export async function updateSeckillStatuses() {
  const now = new Date();

  // 更新即将开始的活动为进行中
  await db.update(seckillActivities)
    .set({ status: "active", updatedAt: new Date() })
    .where(
      and(
        eq(seckillActivities.status, "upcoming"),
        lte(seckillActivities.startTime, now),
        gt(seckillActivities.endTime, now)
      )
    );

  // 更新已结束的活动为已结束
  await db.update(seckillActivities)
    .set({ status: "ended", updatedAt: new Date() })
    .where(
      and(
        eq(seckillActivities.status, "active"),
        lte(seckillActivities.endTime, now)
      )
    );
}
