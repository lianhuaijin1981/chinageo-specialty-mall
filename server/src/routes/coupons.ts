import { Hono } from "hono";
import { z } from "zod";
import { couponService } from "../services/coupon.service";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";

const couponRoutes = new Hono();

// 获取所有优惠券（管理员）
couponRoutes.get("/", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const coupons = await couponService.getAllCoupons();
  return c.json({ success: true, data: coupons });
});

// 获取可用优惠券列表（用户端）
couponRoutes.get("/available", authMiddleware, createRateLimit(rateLimitConfigs.general), async (c) => {
  const user = c.get("user");
  const coupons = await couponService.getAvailableCoupons(user.userId);
  return c.json({ success: true, data: coupons });
});

// 领取优惠券
couponRoutes.post("/receive", authMiddleware, createRateLimit(rateLimitConfigs.payment), async (c) => {
  const user = c.get("user");
  const { couponId } = await c.req.json();
  
  if (!couponId) {
    return c.json({ success: false, message: "缺少couponId" }, 400);
  }
  
  try {
    const userCoupon = await couponService.receiveCoupon(user.userId, couponId);
    return c.json({ success: true, data: userCoupon, message: "领取成功" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 获取我的优惠券
couponRoutes.get("/my", authMiddleware, async (c) => {
  const user = c.get("user");
  const status = c.req.query("status") as "unused" | "used" | "expired" | undefined;
  
  const coupons = await couponService.getMyCoupons(user.userId, status);
  return c.json({ success: true, data: coupons });
});

// 创建优惠券（管理员）
couponRoutes.post("/", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const body = await c.req.json();
  
  try {
    const coupon = await couponService.createCoupon(body);
    return c.json({ success: true, data: coupon, message: "创建成功" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

// 删除优惠券（管理员）
couponRoutes.delete("/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (user.role !== "admin") {
    return c.json({ success: false, message: "无权限" }, 403);
  }
  
  const id = parseInt(c.req.param("id"));
  
  try {
    await couponService.deleteCoupon(id);
    return c.json({ success: true, message: "删除成功" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
});

export default couponRoutes;
