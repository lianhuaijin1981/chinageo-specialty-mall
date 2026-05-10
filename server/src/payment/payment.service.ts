import { db } from "../db";
import { orders, payments, paymentStatusEnum } from "../schemas/schema";
import { eq } from "drizzle-orm";
import * as wechatPay from "./wechat";
import * as alipay from "./alipay";

export interface CreatePaymentParams {
  orderId: number;
  paymentMethod: "wechat" | "alipay";
  userId: number;
  openid?: string; // 微信支付需要
}

// 创建支付
export async function createPayment(params: CreatePaymentParams): Promise<any> {
  // 1. 获取订单信息
  const order = await db.select().from(orders).where(eq(orders.id, params.orderId)).limit(1);
  
  if (order.length === 0) {
    throw new Error("订单不存在");
  }

  if (order[0].userId !== params.userId) {
    throw new Error("无权操作此订单");
  }

  if (order[0].paymentStatus === "paid") {
    throw new Error("订单已支付");
  }

  const amount = Math.round(parseFloat(order[0].payAmount.toString()) * 100); // 转换为分

  // 2. 根据支付方式调用相应接口
  if (params.paymentMethod === "wechat") {
    const result = await wechatPay.createWechatPayOrder({
      orderId: params.orderId,
      orderNo: order[0].orderNo,
      description: `国家地理标识特产商城 - 订单 ${order[0].orderNo}`,
      amount,
      openid: params.openid,
    });

    if (!result.success) {
      throw new Error(result.message || "微信支付创建失败");
    }

    return {
      paymentMethod: "wechat",
      ...result,
    };
  } else if (params.paymentMethod === "alipay") {
    const result = await alipay.createAlipayOrder({
      orderId: params.orderId,
      orderNo: order[0].orderNo,
      description: `国家地理标识特产商城 - 订单 ${order[0].orderNo}`,
      amount: parseFloat(order[0].payAmount.toString()),
    });

    if (!result.success) {
      throw new Error(result.message || "支付宝创建失败");
    }

    return {
      paymentMethod: "alipay",
      ...result,
    };
  }

  throw new Error("不支持的支付方式");
}

// 处理支付回调
export async function handlePaymentCallback(provider: "wechat" | "alipay", callbackData: any): Promise<boolean> {
  if (provider === "wechat") {
    return await wechatPay.handleWechatPayNotify(callbackData);
  } else if (provider === "alipay") {
    return await alipay.handleAlipayNotify(callbackData);
  }

  return false;
}

// 查询支付状态
export async function queryPaymentStatus(orderNo: string): Promise<string> {
  const order = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
  
  if (order.length === 0) {
    throw new Error("订单不存在");
  }

  if (order[0].paymentMethod === "wechat") {
    const result = await wechatPay.queryWechatPayOrder(orderNo);
    return result.data?.trade_state === "SUCCESS" ? "paid" : "unpaid";
  } else if (order[0].paymentMethod === "alipay") {
    const result = await alipay.queryAlipayOrder(orderNo);
    return result.data?.trade_status === "TRADE_SUCCESS" ? "paid" : "unpaid";
  }

  return "unknown";
}

// 申请退款
export async function refundPayment(orderId: number, reason: string): Promise<boolean> {
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  
  if (order.length === 0) {
    throw new Error("订单不存在");
  }

  if (order[0].status !== "paid" && order[0].status !== "shipped") {
    throw new Error("订单状态不允许退款");
  }

  const amount = Math.round(parseFloat(order[0].payAmount.toString()) * 100);

  if (order[0].paymentMethod === "wechat") {
    return await wechatPay.refundWechatPayOrder({
      orderNo: order[0].orderNo,
      refundAmount: amount,
      reason,
    });
  } else if (order[0].paymentMethod === "alipay") {
    return await alipay.refundAlipayOrder({
      orderNo: order[0].orderNo,
      refundAmount: amount,
      reason,
    });
  }

  throw new Error("不支持的支付方式");
}
