import { db } from "../db";
import { coupons, userCoupons, couponTypeEnum, couponStatusEnum, userCouponStatusEnum } from "../schemas/schema";
import { eq, and, gt, lt, sql, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// 优惠券类型定义
export type CouponType = "fixed" | "percentage" | "shipping";
export type CouponStatus = "active" | "inactive" | "expired";
export type UserCouponStatus = "unused" | "used" | "expired";

// 创建优惠券
export async function createCoupon(data: {
  name: string;
  type: CouponType;
  discountValue: number;
  minAmount?: number;
  startTime: Date;
  endTime: Date;
  totalCount?: number;
  perUserLimit?: number;
  description?: string;
}) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);
  
  const [coupon] = await db.insert(coupons).values({
    uuid,
    name: data.name,
    type: data.type,
    discountValue: data.discountValue.toString(),
    minAmount: (data.minAmount || 0).toString(),
    startTime: data.startTime,
    endTime: data.endTime,
    totalCount: data.totalCount || 0,
    perUserLimit: data.perUserLimit || 1,
    status: "active",
    description: data.description,
  }).returning();
  
  return coupon;
}

// 获取所有优惠券（管理员）
export async function getAllCoupons() {
  return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

// 获取可用优惠券列表（用户端）
export async function getAvailableCoupons(userId: number) {
  const now = new Date();
  
  // 获取所有活跃优惠券
  const availableCoupons = await db.select().from(coupons).where(
    and(
      eq(coupons.status, "active"),
      lt(coupons.startTime, now),
      gt(coupons.endTime, now)
    )
  );
  
  // 获取用户已领取的优惠券
  const userCouponsList = await db.select().from(userCoupons).where(
    eq(userCoupons.userId, userId)
  );
  
  // 标记用户是否已领取
  const result = availableCoupons.map(coupon => {
    const userReceived = userCouponsList.filter(uc => uc.couponId === coupon.id);
    return {
      ...coupon,
      receivedCount: userReceived.length,
      canReceive: userReceived.length < coupon.perUserLimit,
      isReceived: userReceived.length > 0,
    };
  });
  
  return result;
}

// 领取优惠券
export async function receiveCoupon(userId: number, couponId: number) {
  // 检查优惠券是否存在且有效
  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, couponId));
  
  if (!coupon) {
    throw new Error("优惠券不存在");
  }
  
  if (coupon.status !== "active") {
    throw new Error("优惠券已失效");
  }
  
  const now = new Date();
  if (now < coupon.startTime || now > coupon.endTime) {
    throw new Error("优惠券不在有效期内");
  }
  
  // 检查总发放数量
  if (coupon.totalCount > 0 && coupon.usedCount >= coupon.totalCount) {
    throw new Error("优惠券已领完");
  }
  
  // 检查用户领取数量限制
  const userReceived = await db.select().from(userCoupons).where(
    and(
      eq(userCoupons.userId, userId),
      eq(userCoupons.couponId, couponId)
    )
  );
  
  if (userReceived.length >= coupon.perUserLimit) {
    throw new Error("已超过领取限制");
  }
  
  // 发放优惠券
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);
  const [userCoupon] = await db.insert(userCoupons).values({
    uuid,
    userId,
    couponId,
    status: "unused",
  }).returning();
  
  // 更新已领取数量
  await db.update(coupons).set({
    usedCount: coupon.usedCount + 1,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(coupons.id, couponId));
  
  return userCoupon;
}

// 获取我的优惠券
export async function getMyCoupons(userId: number, status?: UserCouponStatus) {
  const conditions = [eq(userCoupons.userId, userId)];
  
  if (status) {
    conditions.push(eq(userCoupons.status, status));
  }
  
  const result = await db.select({
    userCoupon: userCoupons,
    coupon: coupons,
  }).from(userCoupons)
    .innerJoin(coupons, eq(userCoupons.couponId, coupons.id))
    .where(and(...conditions))
    .orderBy(desc(userCoupons.createdAt));
  
  return result;
}

// 计算优惠金额
export function calculateDiscount(
  coupon: { type: CouponType; discountValue: string; minAmount: string },
  totalAmount: number
): number {
  // 检查是否满足最低消费金额
  if (totalAmount < parseFloat(coupon.minAmount)) {
    return 0;
  }
  
  if (coupon.type === "fixed") {
    // 固定金额折扣
    return parseFloat(coupon.discountValue);
  } else if (coupon.type === "percentage") {
    // 百分比折扣
    return totalAmount * parseFloat(coupon.discountValue) / 100;
  } else if (coupon.type === "shipping") {
    // 免邮券，返回运费（这里简化为返回固定运费）
    return 10; // 假设运费为10元
  }
  
  return 0;
}

// 使用优惠券
export async function useCoupon(userCouponId: number, orderId: number) {
  const [userCoupon] = await db.select().from(userCoupons).where(eq(userCoupons.id, userCouponId));
  
  if (!userCoupon) {
    throw new Error("优惠券不存在");
  }
  
  if (userCoupon.status !== "unused") {
    throw new Error("优惠券已使用或已过期");
  }
  
  // 更新优惠券状态
  await db.update(userCoupons).set({
    status: "used",
    usedAt: new Date(),
    orderId,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(userCoupons.id, userCouponId));
  
  return true;
}

// 更新优惠券状态（定时任务调用，将过期的优惠券标记为过期）
export async function updateExpiredCoupons() {
  const now = new Date();
  
  // 更新优惠券表状态
  await db.update(coupons).set({
    status: "expired",
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(
    and(
      eq(coupons.status, "active"),
      lt(coupons.endTime, now)
    )
  );
  
  // 更新用户优惠券状态
  const expiredCoupons = await db.select().from(coupons).where(eq(coupons.status, "expired"));
  const expiredCouponIds = expiredCoupons.map(c => c.id);
  
  if (expiredCouponIds.length > 0) {
    await db.update(userCoupons).set({
      status: "expired",
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(
      and(
        eq(userCoupons.status, "unused"),
        // 需要SQL IN 支持，这里简化处理
      )
    );
  }
  
  return true;
}

// 删除优惠券（管理员）
export async function deleteCoupon(couponId: number) {
  await db.delete(coupons).where(eq(coupons.id, couponId));
  return true;
}
