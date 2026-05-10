import { db } from "../db";
import { chatSessions, chatMessages, users } from "../schemas/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// 创建或获取聊天会话
export async function getOrCreateSession(userId: number) {
  // 查找用户的活跃会话
  const [existingSession] = await db.select().from(chatSessions).where(
    and(
      eq(chatSessions.userId, userId),
      eq(chatSessions.status, "open")
    )
  ).orderBy(desc(chatSessions.lastMessageAt));
  
  if (existingSession) {
    return existingSession;
  }
  
  // 创建新会话
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);
  const [session] = await db.insert(chatSessions).values({
    uuid,
    userId,
    status: "open",
  }).returning();
  
  // 添加系统欢迎消息
  await addMessage(session.id, session.userId, "system", "欢迎来到客服中心！客服人员将尽快为您服务。");
  
  return session;
}

// 添加消息
export async function addMessage(sessionId: number, senderId: number, senderType: "user" | "admin" | "system", message: string) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);
  
  const [messageRecord] = await db.insert(chatMessages).values({
    uuid,
    sessionId,
    senderId,
    senderType,
    message,
    messageType: "text",
  }).returning();
  
  // 更新会话的最后消息时间
  await db.update(chatSessions).set({
    lastMessageAt: sql`CURRENT_TIMESTAMP`,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(chatSessions.id, sessionId));
  
  return messageRecord;
}

// 获取会话消息列表
export async function getSessionMessages(sessionId: number, limit = 50, offset = 0) {
  return await db.select().from(chatMessages).where(
    eq(chatMessages.sessionId, sessionId)
  ).orderBy(chatMessages.createdAt).limit(limit).offset(offset);
}

// 获取用户的会话和消息
export async function getUserChatHistory(userId: number) {
  // 获取或创建会话
  const session = await getOrCreateSession(userId);
  
  // 获取消息列表
  const messages = await getSessionMessages(session.id);
  
  return {
    session,
    messages,
  };
}

// 标记消息为已读
export async function markMessagesAsRead(sessionId: number, userId: number) {
  await db.update(chatMessages).set({
    readAt: sql`CURRENT_TIMESTAMP`,
  }).where(
    and(
      eq(chatMessages.sessionId, sessionId),
      eq(chatMessages.senderType, "user"), // 只标记用户消息为已读（客服已读）
      // 简化实现，实际需要区分读者
    )
  );
  
  return true;
}

// 关闭会话（用户或客服）
export async function closeSession(sessionId: number) {
  await db.update(chatSessions).set({
    status: "closed",
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(chatSessions.id, sessionId));
  
  // 添加系统消息
  await addMessage(sessionId, 0, "system", "会话已关闭。如果您还有其他问题，欢迎随时联系我们！");
  
  return true;
}

// 获取所有活跃会话（客服端）
export async function getAllActiveSessions() {
  return await db.select({
    session: chatSessions,
    user: {
      id: users.id,
      nickname: users.nickname,
      email: users.email,
    },
  }).from(chatSessions)
    .innerJoin(users, eq(chatSessions.userId, users.id))
    .where(eq(chatSessions.status, "open"))
    .orderBy(desc(chatSessions.lastMessageAt));
}

// 获取会话详情（客服端）
export async function getSessionDetail(sessionId: number) {
  // 获取会话信息
  const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId));
  
  if (!session) {
    throw new Error("会话不存在");
  }
  
  // 获取用户信息
  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  
  // 获取消息列表
  const messages = await getSessionMessages(sessionId, 100);
  
  return {
    session,
    user,
    messages,
  };
}
