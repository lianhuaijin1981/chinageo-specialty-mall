import { db } from "../db";
import { liveStreams, liveMessages, livePromotions, products, users } from "../schemas/schema";
import { eq, and, gt, lt, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// ========== 直播间管理 ==========

// 创建直播间（管理员）
export async function createLiveStream(data: {
  title: string;
  description?: string;
  productId?: number;
  startTime: Date;
  endTime?: Date;
}) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, data.streamerId || 1))
    .limit(1);

  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);

  const [live] = await db
    .insert(liveStreams)
    .values({
      uuid,
      title: data.title,
      description: data.description,
      productId: data.productId,
      streamerId: data.streamerId || 1,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "upcoming",
    })
    .returning();

  return live;
}

// 获取所有直播间（管理员）
export async function getAllLiveStreams() {
  const streams = await db
    .select({
      id: liveStreams.id,
      uuid: liveStreams.uuid,
      title: liveStreams.title,
      description: liveStreams.description,
      productId: liveStreams.productId,
      streamerId: liveStreams.streamerId,
      thumbnail: liveStreams.thumbnail,
      status: liveStreams.status,
      startTime: liveStreams.startTime,
      endTime: liveStreams.endTime,
      viewerCount: liveStreams.viewerCount,
      likeCount: liveStreams.likeCount,
      createdAt: liveStreams.createdAt,
      productName: products.name,
      productImage: products.images,
    })
    .from(liveStreams)
    .leftJoin(products, eq(liveStreams.productId, products.id))
    .orderBy(sql`${liveStreams.createdAt} DESC`);

  return streams;
}

// 获取进行中的直播间（公开）
export async function getActiveLiveStreams() {
  const now = new Date();

  const streams = await db
    .select({
      id: liveStreams.id,
      uuid: liveStreams.uuid,
      title: liveStreams.title,
      description: liveStreams.description,
      productId: liveStreams.productId,
      thumbnail: liveStreams.thumbnail,
      status: liveStreams.status,
      startTime: liveStreams.startTime,
      endTime: liveStreams.endTime,
      viewerCount: liveStreams.viewerCount,
      likeCount: liveStreams.likeCount,
      productName: products.name,
      productImage: products.images,
      productSlug: products.slug,
    })
    .from(liveStreams)
    .leftJoin(products, eq(liveStreams.productId, products.id))
    .where(
      and(
        eq(liveStreams.status, "live"),
        lt(liveStreams.startTime, now),
        gt(liveStreams.endTime, now)
      )
    )
    .orderBy(liveStreams.startTime);

  return streams;
}

// 获取直播间详情
export async function getLiveStreamDetail(liveId: number) {
  const [stream] = await db
    .select({
      id: liveStreams.id,
      uuid: liveStreams.uuid,
      title: liveStreams.title,
      description: liveStreams.description,
      productId: liveStreams.productId,
      streamerId: liveStreams.streamerId,
      streamUrl: liveStreams.streamUrl,
      thumbnail: liveStreams.thumbnail,
      status: liveStreams.status,
      startTime: liveStreams.startTime,
      endTime: liveStreams.endTime,
      viewerCount: liveStreams.viewerCount,
      likeCount: liveStreams.likeCount,
      productName: products.name,
      productDescription: products.description,
      productImage: products.images,
      productSlug: products.slug,
      originalPrice: products.price,
    })
    .from(liveStreams)
    .leftJoin(products, eq(liveStreams.productId, products.id))
    .where(eq(liveStreams.id, liveId));

  return stream;
}

// 更新直播间状态（管理员）
export async function updateLiveStreamStatus(liveId: number, status: string) {
  const [stream] = await db
    .update(liveStreams)
    .set({ status, updatedAt: new Date() })
    .where(eq(liveStreams.id, liveId))
    .returning();

  return stream;
}

// 增加观看人数
export async function incrementViewerCount(liveId: number) {
  const [stream] = await db
    .update(liveStreams)
    .set({
      viewerCount: sql`${liveStreams.viewerCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(liveStreams.id, liveId))
    .returning();

  return stream;
}

// 点赞直播间
export async function likeLiveStream(liveId: number) {
  const [stream] = await db
    .update(liveStreams)
    .set({
      likeCount: sql`${liveStreams.likeCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(liveStreams.id, liveId))
    .returning();

  return stream;
}

// ========== 直播聊天 ==========

// 发送消息
export async function sendLiveMessage(liveId: number, userId: number, message: string) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);

  const [msg] = await db
    .insert(liveMessages)
    .values({
      uuid,
      liveId,
      userId,
      message,
      messageType: "text",
    })
    .returning();

  // 同时增加观看人数（活跃用户）
  await incrementViewerCount(liveId);

  return msg;
}

// 发送点赞消息
export async function sendLikeMessage(liveId: number, userId: number) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);

  const [msg] = await db
    .insert(liveMessages)
    .values({
      uuid,
      liveId,
      userId,
      message: "❤️",
      messageType: "like",
    })
    .returning();

  // 增加点赞数
  await likeLiveStream(liveId);

  return msg;
}

// 获取直播消息（轮询）
export async function getLiveMessages(liveId: number, limit: number = 50) {
  const messages = await db
    .select({
      id: liveMessages.id,
      uuid: liveMessages.uuid,
      userId: liveMessages.userId,
      message: liveMessages.message,
      messageType: liveMessages.messageType,
      createdAt: liveMessages.createdAt,
      userName: users.nickname,
      userAvatar: users.avatar,
    })
    .from(liveMessages)
    .leftJoin(users, eq(liveMessages.userId, users.id))
    .where(eq(liveMessages.liveId, liveId))
    .orderBy(sql`${liveMessages.createdAt} DESC`)
    .limit(limit);

  return messages.reverse(); // 按时间正序返回
}

// ========== 直播促销 ==========

// 创建直播促销（管理员）
export async function createLivePromotion(data: {
  liveId: number;
  productId: number;
  promotionPrice: number;
  startTime: Date;
  endTime: Date;
}) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);

  const [promotion] = await db
    .insert(livePromotions)
    .values({
      uuid,
      liveId: data.liveId,
      productId: data.productId,
      promotionPrice: data.promotionPrice.toString(),
      startTime: data.startTime,
      endTime: data.endTime,
      status: "active",
    })
    .returning();

  return promotion;
}

// 获取直播间促销
export async function getLivePromotions(liveId: number) {
  const now = new Date();

  const promotions = await db
    .select({
      id: livePromotions.id,
      uuid: livePromotions.uuid,
      productId: livePromotions.productId,
      promotionPrice: livePromotions.promotionPrice,
      startTime: livePromotions.startTime,
      endTime: livePromotions.endTime,
      status: livePromotions.status,
      productName: products.name,
      productImage: products.images,
      originalPrice: products.price,
    })
    .from(livePromotions)
    .leftJoin(products, eq(livePromotions.productId, products.id))
    .where(
      and(
        eq(livePromotions.liveId, liveId),
        eq(livePromotions.status, "active"),
        lt(livePromotions.startTime, now),
        gt(livePromotions.endTime, now)
      )
    );

  return promotions;
}
