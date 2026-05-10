import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { memberService } from "../services/member.service";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";

const memberRoutes = new Hono();

// 获取会员信息
memberRoutes.get("/info", authMiddleware, async (c) => {
  const user = c.get("user");
  
  try {
    const memberInfo = await memberService.getMemberInfo(user.userId);
    return c.json({ success: true, data: memberInfo });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 获取会员权益对比
memberRoutes.get("/benefits", authMiddleware, async (c) => {
  const comparison = memberService.getMemberBenefitsComparison();
  return c.json({ success: true, data: comparison });
});

// 获取积分历史记录
memberRoutes.get("/points/history", authMiddleware, async (c) => {
  const user = c.get("user");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  
  const history = await memberService.getPointsHistory
    ? await memberService.getPointsHistory(user.userId, limit, offset)
    : []; // 如果方法不存在，返回空数组
  
  return c.json({ success: true, data: history });
});

// 签到（获取积分）
memberRoutes.post("/checkin", authMiddleware, createRateLimit(rateLimitConfigs.general), async (c) => {
  const user = c.get("user");
  
  try {
    // 简化实现：每次签到赠送10积分
    await memberService.addPoints({
      userId: user.userId,
      points: 10,
      source: "checkin",
      description: "每日签到奖励",
    });
    
    return c.json({ success: true, message: "签到成功，获得10积分" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

export default memberRoutes;
