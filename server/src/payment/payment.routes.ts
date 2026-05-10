import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as paymentService from "./payment.service";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";

const app = new Hono();

// ------- 创建支付 -------
app.post("/create", authMiddleware, createRateLimit(rateLimitConfigs.payment), zValidator("json", z.object({
  orderId: z.number().int().positive(),
  paymentMethod: z.enum(["wechat", "alipay"]),
})), async (c) => {
  try {
    const userId = c.get("userId");
    const { orderId, paymentMethod } = await c.req.json();

    const result = await paymentService.createPayment({
      orderId,
      paymentMethod,
      userId,
    });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message,
    }, 400);
  }
});

// ------- 微信支付回调 -------
app.post("/wechat/notify", async (c) => {
  try {
    const notifyData = await c.req.json(); // TODO: 实际应该解析 XML
    const success = await paymentService.handlePaymentCallback("wechat", notifyData);

    if (success) {
      // 微信要求返回特定格式
      return c.text(`
        <xml>
          <return_code><![CDATA[SUCCESS]]></return_code>
          <return_msg><![CDATA[OK]]></return_msg>
        </xml>
      `);
    } else {
      return c.text(`
        <xml>
          <return_code><![CDATA[FAIL]]></return_code>
          <return_msg><![CDATA[处理失败]]></return_msg>
        </xml>
      `);
    }
  } catch (error: any) {
    return c.text(`
      <xml>
        <return_code><![CDATA[FAIL]]></return_code>
        <return_msg><![CDATA[${error.message}]]></return_msg>
      </xml>
    `);
  }
});

// ------- 支付宝回调 -------
app.post("/alipay/notify", async (c) => {
  try {
    const notifyData = await c.req.parseBody();
    const success = await paymentService.handlePaymentCallback("alipay", notifyData);

    if (success) {
      return c.text("success");
    } else {
      return c.text("fail");
    }
  } catch (error: any) {
    return c.text("fail");
  }
});

// ------- 查询支付状态 -------
app.get("/status/:orderNo", authMiddleware, async (c) => {
  try {
    const orderNo = c.req.param("orderNo");
    const status = await paymentService.queryPaymentStatus(orderNo);

    return c.json({
      success: true,
      data: { status },
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message,
    }, 400);
  }
});

// ------- 申请退款（需要认证）-------
app.post("/refund", authMiddleware, zValidator("json", z.object({
  orderId: z.number().int().positive(),
  reason: z.string().min(1),
})), async (c) => {
  try {
    const userId = c.get("userId");
    // TODO: 验证订单属于当前用户

    const { orderId, reason } = await c.req.json();
    const success = await paymentService.refundPayment(orderId, reason);

    return c.json({
      success,
      message: success ? "退款申请已提交" : "退款申请失败",
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message,
    }, 400);
  }
});

export { app as paymentRoutes };
