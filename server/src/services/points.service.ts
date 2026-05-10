import { db } from "../db";
import { pointsHistory, pointsProducts, pointsOrders, users } from "../schemas/schema";
import { eq, and, gt, lt, sql, desc, sum } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// 获取用户总积分
export async function getUserPoints(userId: number): Promise<number> {
  const result = await db.select({
    total: sum(pointsHistory.points),
  }).from(pointsHistory)
    .where(eq(pointsHistory.userId, userId));
  
  return result[0]?.total ? parseInt(result[0].total) : 0;
}

// 添加积分记录
export async function addPoints(data: {
  userId: number;
  points: number;
  type: "earn" | "redeem";
  source: string;
  referenceId?: number;
  description?: string;
}) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);
  
  const [record] = await db.insert(pointsHistory).values({
    uuid,
    userId: data.userId,
    points: data.points,
    type: data.type,
    source: data.source,
    referenceId: data.referenceId,
    description: data.description,
  }).returning();
  
  return record;
}

// 获取积分历史记录
export async function getPointsHistory(userId: number, limit = 50, offset = 0) {
  return await db.select().from(pointsHistory)
    .where(eq(pointsHistory.userId, userId))
    .orderBy(desc(pointsHistory.createdAt))
    .limit(limit)
    .offset(offset);
}

// 获取积分商品列表（用户端）
export async function getPointsProducts() {
  const now = new Date();
  
  return await db.select().from(pointsProducts).where(
    and(
      eq(pointsProducts.status, "active"),
      lt(pointsProducts.startDate, now),
      gt(pointsProducts.endDate, now)
    )
  ).orderBy(desc(pointsProducts.createdAt));
}

// 获取积分商品详情
export async function getPointsProduct(productId: number) {
  const [product] = await db.select().from(pointsProducts).where(eq(pointsProducts.id, productId));
  return product;
}

// 创建积分兑换订单
export async function createPointsOrder(data: {
  userId: number;
  productId: number;
  quantity: number;
  shippingAddress: any;
}) {
  // 检查商品是否存在且有效
  const product = await getPointsProduct(data.productId);
  
  if (!product) {
    throw new Error("商品不存在");
  }
  
  if (product.status !== "active") {
    throw new Error("商品已下架");
  }
  
  const now = new Date();
  if (now < product.startDate || now > product.endDate) {
    throw new Error("商品不在兑换期内");
  }
  
  if (product.stock < data.quantity) {
    throw new Error("库存不足");
  }
  
  // 检查用户限购数量
  const userOrders = await db.select().from(pointsOrders).where(
    and(
      eq(pointsOrders.userId, data.userId),
      eq(pointsOrders.productId, data.productId)
    )
  );
  
  if (userOrders.length >= product.limitPerUser) {
    throw new Error("已超过限购数量");
  }
  
  // 检查用户积分是否足够
  const userPoints = await getUserPoints(data.userId);
  const totalPoints = product.pointsCost * data.quantity;
  
  if (userPoints < totalPoints) {
    throw new Error("积分不足");
  }
  
  // 创建订单
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);
  const [order] = await db.insert(pointsOrders).values({
    uuid,
    userId: data.userId,
    productId: data.productId,
    quantity: data.quantity,
    totalPoints,
    shippingAddress: data.shippingAddress,
    status: "pending",
  }).returning();
  
  // 扣减用户积分
  await addPoints({
    userId: data.userId,
    points: -totalPoints,
    type: "redeem",
    source: "exchange",
    referenceId: order.id,
    description: `兑换商品：${product.name}`,
  });
  
  // 扣减商品库存
  await db.update(pointsProducts).set({
    stock: product.stock - data.quantity,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(pointsProducts.id, data.productId));
  
  return order;
}

// 获取用户兑换订单列表
export async function getPointsOrders(userId: number) {
  const result = await db.select({
    order: pointsOrders,
    product: pointsProducts,
  }).from(pointsOrders)
    .innerJoin(pointsProducts, eq(pointsOrders.productId, pointsProducts.id))
    .where(eq(pointsOrders.userId, userId))
    .orderBy(desc(pointsOrders.createdAt));
  
  return result;
}

// 更新订单状态（管理员）
export async function updatePointsOrderStatus(orderId: number, status: string, trackingNo?: string) {
  const updateData: any = {
    status,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  };
  
  if (status === "completed") {
    updateData.completedAt = new Date();
  }
  
  if (trackingNo) {
    updateData.trackingNo = trackingNo;
  }
  
  await db.update(pointsOrders).set(updateData).where(eq(pointsOrders.id, orderId));
  
  return true;
}

// 获取所有积分商品（管理员）
export async function getAllPointsProducts() {
  return await db.select().from(pointsProducts).orderBy(desc(pointsProducts.createdAt));
}

// 创建积分商品（管理员）
export async function createPointsProduct(data: {
  name: string;
  description?: string;
  image?: string;
  pointsCost: number;
  stock: number;
  startDate: Date;
  endDate: Date;
  limitPerUser?: number;
}) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);
  
  const [product] = await db.insert(pointsProducts).values({
    uuid,
    name: data.name,
    description: data.description,
    image: data.image,
    pointsCost: data.pointsCost,
    stock: data.stock,
    startDate: data.startDate,
    endDate: data.endDate,
    limitPerUser: data.limitPerUser || 1,
    status: "active",
  }).returning();
  
  return product;
}

// 更新积分商品（管理员）
export async function updatePointsProduct(productId: number, data: any) {
  await db.update(pointsProducts).set({
    ...data,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(pointsProducts.id, productId));
  
  return true;
}

// 删除积分商品（管理员）
export async function deletePointsProduct(productId: number) {
  await db.delete(pointsProducts).where(eq(pointsProducts.id, productId));
  return true;
}
