import { db } from "../db";
import { enterpriseInfo, groupBuyingActivities, groupBuyingOrders, products, users } from "../schemas/schema";
import { eq, and, gt, lt, sql, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// ========== 企业信息管理 ==========

// 创建/更新企业信息
export async function upsertEnterpriseInfo(data: {
  userId: number;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  companyAddress: string;
  businessLicense?: string;
  taxNumber?: string;
  invoiceType?: string;
}) {
  // 检查是否已存在
  const existing = await db
    .select()
    .from(enterpriseInfo)
    .where(eq(enterpriseInfo.userId, data.userId))
    .limit(1);

  if (existing[0]) {
    // 更新
    const [updated] = await db
      .update(enterpriseInfo)
      .set({
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        companyAddress: data.companyAddress,
        businessLicense: data.businessLicense,
        taxNumber: data.taxNumber,
        invoiceType: data.invoiceType || "normal",
        status: "pending", // 重新审核
        updatedAt: new Date(),
      })
      .where(eq(enterpriseInfo.userId, data.userId))
      .returning();

    return updated;
  } else {
    // 创建
    const uuid = uuidv4().replace(/-/g, "").substring(0, 32);
    const [created] = await db
      .insert(enterpriseInfo)
      .values({
        uuid,
        userId: data.userId,
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        companyAddress: data.companyAddress,
        businessLicense: data.businessLicense,
        taxNumber: data.taxNumber,
        invoiceType: data.invoiceType || "normal",
        status: "pending",
      })
      .returning();

    return created;
  }
}

// 获取企业信息
export async function getEnterpriseInfo(userId: number) {
  const [info] = await db
    .select()
    .from(enterpriseInfo)
    .where(eq(enterpriseInfo.userId, userId))
    .limit(1);

  return info || null;
}

// 管理员审核企业信息
export async function verifyEnterprise(enterpriseId: number, approved: boolean, rejectionReason?: string) {
  const [updated] = await db
    .update(enterpriseInfo)
    .set({
      status: approved ? "verified" : "rejected",
      rejectionReason: approved ? null : rejectionReason,
      updatedAt: new Date(),
    })
    .where(eq(enterpriseInfo.id, enterpriseId))
    .returning();

  return updated;
}

// ========== 团购活动管理 ==========

// 创建团购活动（管理员）
export async function createGroupBuyingActivity(data: {
  productId: number;
  groupPrice: number;
  minGroupSize: number;
  maxGroupSize?: number;
  startTime: Date;
  endTime: Date;
  enterpriseOnly?: boolean;
  customPackaging?: boolean;
}) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);

  const [activity] = await db
    .insert(groupBuyingActivities)
    .values({
      uuid,
      productId: data.productId,
      groupPrice: data.groupPrice.toString(),
      minGroupSize: data.minGroupSize,
      maxGroupSize: data.maxGroupSize,
      startTime: data.startTime,
      endTime: data.endTime,
      enterpriseOnly: data.enterpriseOnly || false,
      customPackaging: data.customPackaging || false,
      status: "upcoming",
    })
    .returning();

  return activity;
}

// 获取所有团购活动（管理员）
export async function getAllGroupBuyingActivities() {
  const activities = await db
    .select({
      id: groupBuyingActivities.id,
      uuid: groupBuyingActivities.uuid,
      productId: groupBuyingActivities.productId,
      groupPrice: groupBuyingActivities.groupPrice,
      minGroupSize: groupBuyingActivities.minGroupSize,
      currentGroupSize: groupBuyingActivities.currentGroupSize,
      startTime: groupBuyingActivities.startTime,
      endTime: groupBuyingActivities.endTime,
      status: groupBuyingActivities.status,
      enterpriseOnly: groupBuyingActivities.enterpriseOnly,
      customPackaging: groupBuyingActivities.customPackaging,
      createdAt: groupBuyingActivities.createdAt,
      productName: products.name,
      productImage: products.images,
      originalPrice: products.price,
    })
    .from(groupBuyingActivities)
    .leftJoin(products, eq(groupBuyingActivities.productId, products.id))
    .orderBy(sql`${groupBuyingActivities.createdAt} DESC`);

  return activities;
}

// 获取进行中的团购活动（公开）
export async function getActiveGroupBuyingActivities() {
  const now = new Date();

  const activities = await db
    .select({
      id: groupBuyingActivities.id,
      uuid: groupBuyingActivities.uuid,
      productId: groupBuyingActivities.productId,
      groupPrice: groupBuyingActivities.groupPrice,
      minGroupSize: groupBuyingActivities.minGroupSize,
      currentGroupSize: groupBuyingActivities.currentGroupSize,
      startTime: groupBuyingActivities.startTime,
      endTime: groupBuyingActivities.endTime,
      status: groupBuyingActivities.status,
      enterpriseOnly: groupBuyingActivities.enterpriseOnly,
      customPackaging: groupBuyingActivities.customPackaging,
      productName: products.name,
      productImage: products.images,
      originalPrice: products.price,
      productSlug: products.slug,
    })
    .from(groupBuyingActivities)
    .leftJoin(products, eq(groupBuyingActivities.productId, products.id))
    .where(
      and(
        eq(groupBuyingActivities.status, "active"),
        lt(groupBuyingActivities.startTime, now),
        gt(groupBuyingActivities.endTime, now)
      )
    )
    .orderBy(groupBuyingActivities.startTime);

  return activities;
}

// 获取团购活动详情
export async function getGroupBuyingActivityDetail(activityId: number) {
  const [activity] = await db
    .select({
      id: groupBuyingActivities.id,
      uuid: groupBuyingActivities.uuid,
      productId: groupBuyingActivities.productId,
      groupPrice: groupBuyingActivities.groupPrice,
      minGroupSize: groupBuyingActivities.minGroupSize,
      maxGroupSize: groupBuyingActivities.maxGroupSize,
      currentGroupSize: groupBuyingActivities.currentGroupSize,
      startTime: groupBuyingActivities.startTime,
      endTime: groupBuyingActivities.endTime,
      status: groupBuyingActivities.status,
      enterpriseOnly: groupBuyingActivities.enterpriseOnly,
      customPackaging: groupBuyingActivities.customPackaging,
      productName: products.name,
      productDescription: products.description,
      productImage: products.images,
      originalPrice: products.price,
      productSlug: products.slug,
      specs: products.specs,
    })
    .from(groupBuyingActivities)
    .leftJoin(products, eq(groupBuyingActivities.productId, products.id))
    .where(eq(groupBuyingActivities.id, activityId));

  return activity;
}

// 参团（核心功能）
export async function joinGroupBuying(userId: number, activityId: number, quantity: number = 1, enterpriseId?: number) {
  const now = new Date();

  // 使用事务保证一致性
  const result = await db.transaction(async (tx) => {
    // 1. 查询活动
    const activities = await tx
      .select()
      .from(groupBuyingActivities)
      .where(eq(groupBuyingActivities.id, activityId))
      .forUpdate();

    if (!activities[0]) {
      throw new Error("团购活动不存在");
    }

    const activity = activities[0];

    // 2. 检查活动状态
    if (activity.status !== "active") {
      throw new Error("团购活动未开始或已结束");
    }

    if (now < activity.startTime || now > activity.endTime) {
      throw new Error("团购活动未开始或已结束");
    }

    // 3. 检查企业限制
    if (activity.enterpriseOnly && !enterpriseId) {
      throw new Error("该团购仅限企业用户参与");
    }

    // 4. 检查最大参团数量
    if (activity.maxGroupSize && activity.currentGroupSize + quantity > activity.maxGroupSize) {
      throw new Error("参团数量已达上限");
    }

    // 5. 创建团购订单
    const orderUuid = uuidv4().replace(/-/g, "").substring(0, 32);
    const totalAmount = parseFloat(activity.groupPrice.toString()) * quantity;

    const [order] = await tx
      .insert(groupBuyingOrders)
      .values({
        uuid: orderUuid,
        activityId,
        userId,
        enterpriseId,
        quantity,
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
      })
      .returning();

    // 6. 更新参团数量
    await tx
      .update(groupBuyingActivities)
      .set({
        currentGroupSize: activity.currentGroupSize + quantity,
        updatedAt: now,
      })
      .where(eq(groupBuyingActivities.id, activityId));

    return { order, activity: activities[0] };
  });

  return result;
}

// 获取我的团购订单
export async function getMyGroupBuyingOrders(userId: number) {
  const orders = await db
    .select({
      id: groupBuyingOrders.id,
      uuid: groupBuyingOrders.uuid,
      quantity: groupBuyingOrders.quantity,
      totalAmount: groupBuyingOrders.totalAmount,
      status: groupBuyingOrders.status,
      invoiceTitle: groupBuyingOrders.invoiceTitle,
      paidAt: groupBuyingOrders.paidAt,
      createdAt: groupBuyingOrders.createdAt,
      activityId: groupBuyingActivities.id,
      productName: products.name,
      productImage: products.images,
      groupPrice: groupBuyingActivities.groupPrice,
    })
    .from(groupBuyingOrders)
    .leftJoin(groupBuyingActivities, eq(groupBuyingOrders.activityId, groupBuyingActivities.id))
    .leftJoin(products, eq(groupBuyingActivities.productId, products.id))
    .where(eq(groupBuyingOrders.userId, userId))
    .orderBy(sql`${groupBuyingOrders.createdAt} DESC`);

  return orders;
}

// 支付团购订单
export async function payGroupBuyingOrder(orderId: number, userId: number, invoiceTitle?: string, invoiceTaxNumber?: string) {
  const [order] = await db
    .update(groupBuyingOrders)
    .set({
      status: "paid",
      paidAt: new Date(),
      invoiceTitle,
      invoiceTaxNumber,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(groupBuyingOrders.id, orderId),
        eq(groupBuyingOrders.userId, userId),
        eq(groupBuyingOrders.status, "pending")
      )
    )
    .returning();

  if (!order) {
    throw new Error("订单不存在或已支付");
  }

  return order;
}

// 取消团购订单
export async function cancelGroupBuyingOrder(orderId: number, userId: number) {
  const [order] = await db
    .update(groupBuyingOrders)
    .set({
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(groupBuyingOrders.id, orderId),
        eq(groupBuyingOrders.userId, userId),
        eq(groupBuyingOrders.status, "pending")
      )
    )
    .returning();

  if (!order) {
    throw new Error("订单不存在或已支付");
  }

  // 恢复参团数量
  await db
    .update(groupBuyingActivities)
    .set({
      currentGroupSize: sql`${groupBuyingActivities.currentGroupSize} - ${order.quantity}`,
      updatedAt: new Date(),
    })
    .where(eq(groupBuyingActivities.id, order.activityId));

  return order;
}

// 更新活动状态（管理员）
export async function updateGroupBuyingStatus(activityId: number, status: string) {
  const [activity] = await db
    .update(groupBuyingActivities)
    .set({ status, updatedAt: new Date() })
    .where(eq(groupBuyingActivities.id, activityId))
    .returning();

  return activity;
}
