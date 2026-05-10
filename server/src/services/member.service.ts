import { db } from "../db";
import { users, pointsHistory } from "../schemas/schema";
import { eq, sql, desc, sum } from "drizzle-orm";

// 会员等级配置
export const MEMBER_LEVEL_RULES = {
  normal: {
    name: "普通会员",
    minSpent: 0,
    maxSpent: 999,
    pointsRate: 100, // 100积分 = 1元
    benefits: ["新用户礼包"],
  },
  silver: {
    name: "白银会员",
    minSpent: 1000,
    maxSpent: 4999,
    pointsRate: 80, // 80积分 = 1元
    benefits: ["新用户礼包", "白银专属券", "优先发货"],
  },
  gold: {
    name: "黄金会员",
    minSpent: 5000,
    maxSpent: 999999,
    pointsRate: 50, // 50积分 = 1元
    benefits: ["新用户礼包", "白银专属券", "黄金尊享券", "优先发货", "专属客服", "新品优先购"],
  },
};

// 根据累计消费金额计算会员等级
export function calculateMemberLevel(totalSpent: number): "normal" | "silver" | "gold" {
  if (totalSpent >= MEMBER_LEVEL_RULES.gold.minSpent) {
    return "gold";
  } else if (totalSpent >= MEMBER_LEVEL_RULES.silver.minSpent) {
    return "silver";
  } else {
    return "normal";
  }
}

// 获取用户会员信息
export async function getMemberInfo(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    throw new Error("用户不存在");
  }
  
  // 获取用户积分余额
  const pointsResult = await db.select({
    total: sum(pointsHistory.points),
  }).from(pointsHistory)
    .where(eq(pointsHistory.userId, userId));
  
  const points = pointsResult[0]?.total ? parseInt(pointsResult[0].total) : 0;
  
  // 获取会员等级信息
  const currentLevel = user.memberLevel as "normal" | "silver" | "gold";
  const levelInfo = MEMBER_LEVEL_RULES[currentLevel];
  
  // 计算下一等级信息
  let nextLevel = null;
  let pointsToNextLevel = 0;
  
  if (currentLevel === "normal") {
    nextLevel = "silver";
    pointsToNextLevel = MEMBER_LEVEL_RULES.silver.minSpent - parseFloat(user.totalSpent);
  } else if (currentLevel === "silver") {
    nextLevel = "gold";
    pointsToNextLevel = MEMBER_LEVEL_RULES.gold.minSpent - parseFloat(user.totalSpent);
  }
  
  return {
    memberLevel: currentLevel,
    memberLevelName: levelInfo.name,
    totalSpent: parseFloat(user.totalSpent),
    points,
    benefits: levelInfo.benefits,
    pointsRate: levelInfo.pointsRate,
    nextLevel,
    pointsToNextLevel: Math.max(0, pointsToNextLevel),
    levelRules: MEMBER_LEVEL_RULES,
  };
}

// 更新用户会员等级（在订单完成后调用）
export async function updateMemberLevel(userId: number, orderAmount: number) {
  // 获取用户当前信息
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    throw new Error("用户不存在");
  }
  
  // 更新累计消费金额
  const newTotalSpent = parseFloat(user.totalSpent) + orderAmount;
  
  // 计算新的会员等级
  const newLevel = calculateMemberLevel(newTotalSpent);
  
  // 更新用户表和会员等级
  await db.update(users).set({
    totalSpent: newTotalSpent.toFixed(2),
    memberLevel: newLevel,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(users.id, userId));
  
  // 如果等级发生变化，返回等级变化信息
  const levelChanged = newLevel !== user.memberLevel;
  
  return {
    levelChanged,
    oldLevel: user.memberLevel,
    newLevel,
    totalSpent: newTotalSpent,
  };
}

// 添加积分（在订单完成、签到、评价等行为后调用）
export async function addPoints(data: {
  userId: number;
  points: number;
  source: string;
  referenceId?: number;
  description?: string;
}) {
  const uuid = require("uuid").v4().replace(/-/g, "").substring(0, 32);
  
  // 添加积分记录
  await db.insert(pointsHistory).values({
    uuid,
    userId: data.userId,
    points: data.points,
    type: data.points > 0 ? "earn" : "redeem",
    source: data.source,
    referenceId: data.referenceId,
    description: data.description,
  });
  
  // 更新用户积分余额
  await db.update(users).set({
    points: sql`points + ${data.points}`,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(users.id, data.userId));
  
  return true;
}

// 获取会员权益对比
export function getMemberBenefitsComparison() {
  const levels = ["normal", "silver", "gold"] as const;
  
  return levels.map(level => ({
    level,
    name: MEMBER_LEVEL_RULES[level].name,
    minSpent: MEMBER_LEVEL_RULES[level].minSpent,
    pointsRate: MEMBER_LEVEL_RULES[level].pointsRate,
    benefits: MEMBER_LEVEL_RULES[level].benefits,
  }));
}

// 初始化用户积分（注册时调用）
export async function initUserPoints(userId: number) {
  // 新用户赠送积分
  await addPoints({
    userId,
    points: 100, // 新用户赠送100积分
    source: "signup",
    description: "新用户注册奖励",
  });
  
  return true;
}
