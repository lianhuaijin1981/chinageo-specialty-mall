import { config } from "dotenv";
import AlipaySdk from "alipay-sdk";
import { db } from "../db";
import { orders, payments } from "../schemas/schema";
import { eq } from "drizzle-orm";

config({ path: "../.env" });

// 初始化支付宝 SDK
const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
  gateway: process.env.ALIPAY_GATEWAY || "https://openapi.alipaydev.com/gateway.do",
});

export interface AlipayParams {
  orderId: number;
  orderNo: string;
  description: string;
  amount: number; // 单位：元
  returnUrl?: string;
}

export interface AlipayResult {
  success: boolean;
  payUrl?: string; // 支付跳转 URL（电脑网站支付）
  tradeNo?: string;
  message?: string;
}

// 创建支付宝支付订单（电脑网站支付）
export async function createAlipayOrder(params: AlipayParams): Promise<AlipayResult> {
  try {
    // 构造请求参数
    const requestData = {
      out_trade_no: params.orderNo,
      total_amount: params.amount.toFixed(2),
      subject: params.description,
      product_code: "FAST_INSTANT_TRADE_PAY",
      return_url: params.returnUrl || `${process.env.CLIENT_URL}/payment/result`,
      notify_url: `${process.env.SERVER_URL}/api/payments/alipay/notify`,
    };

    // 调用支付宝API - 电脑网站支付
    const result = await alipaySdk.exec(
      "alipay.trade.page.pay",
      requestData
    );

    // result是一个URL，直接返回
    return {
      success: true,
      payUrl: result as string,
      tradeNo: `alipay_${Date.now()}`,
    };
  } catch (error: any) {
    console.error("支付宝支付创建失败:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// 创建支付宝支付订单（手机网站支付 / APP 支付）
export async function createAlipayWapOrder(params: AlipayParams): Promise<AlipayResult> {
  try {
    const requestData = {
      out_trade_no: params.orderNo,
      total_amount: params.amount.toFixed(2),
      subject: params.description,
      product_code: "QUICK_WAP_WAY",
      quit_url: `${process.env.CLIENT_URL}/payment/cancel`,
      return_url: params.returnUrl || `${process.env.CLIENT_URL}/payment/result`,
      notify_url: `${process.env.SERVER_URL}/api/payments/alipay/notify`,
    };

    // 调用支付宝API - 手机网站支付
    const result = await alipaySdk.exec(
      "alipay.trade.wap.pay",
      requestData
    );

    return {
      success: true,
      payUrl: result as string,
    };
  } catch (error: any) {
    console.error("支付宝手机支付创建失败:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// 处理支付宝支付回调
export async function handleAlipayNotify(notifyData: any): Promise<boolean> {
  try {
    // 1. 验证签名
    const signVerified = alipaySdk.checkNotifySign(notifyData);
    
    if (!signVerified) {
      console.error("支付宝回调签名验证失败");
      return false;
    }

    const { out_trade_no, trade_no, trade_status } = notifyData;

    // 2. 只有支付成功才更新订单
    if (trade_status === "TRADE_SUCCESS" || trade_status === "TRADE_FINISHED") {
      // 更新订单状态
      await db.update(orders)
        .set({
          status: "paid",
          paymentStatus: "paid",
          paidAt: new Date(),
        })
        .where(eq(orders.orderNo, out_trade_no));

      // 更新支付记录
      const order = await db.select().from(orders).where(eq(orders.orderNo, out_trade_no)).limit(1);
      if (order.length > 0) {
        await db.update(payments)
          .set({
            status: "paid",
            transactionId: trade_no,
            paidAt: new Date(),
          })
          .where(eq(payments.orderId, order[0].id));
      }
    }

    return true;
  } catch (error) {
    console.error("支付宝回调处理失败:", error);
    return false;
  }
}

// 查询支付宝支付订单
export async function queryAlipayOrder(orderNo: string): Promise<any> {
  try {
    // 调用支付宝查询接口
    const result = await alipaySdk.exec("alipay.trade.query", {
      out_trade_no: orderNo,
    });

    const data = result as any;
    
    return {
      success: true,
      data: {
        trade_status: data.trade_status,
        trade_no: data.trade_no,
        total_amount: data.total_amount,
      },
    };
  } catch (error: any) {
    console.error("查询支付宝订单失败:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// 申请支付宝退款
export async function refundAlipayOrder(params: {
  orderNo: string;
  refundAmount: number;
  reason: string;
}): Promise<boolean> {
  try {
    // 1. 获取支付记录
    const order = await db.select().from(orders).where(eq(orders.orderNo, params.orderNo)).limit(1);
    if (order.length === 0) {
      throw new Error("订单不存在");
    }

    // 2. 调用支付宝退款接口
    const refundNo = `refund_${Date.now()}`;
    const result = await alipaySdk.exec("alipay.trade.refund", {
      out_trade_no: params.orderNo,
      refund_amount: (params.refundAmount / 100).toFixed(2),
      refund_reason: params.reason,
      out_request_no: refundNo,
    });

    const data = result as any;

    // 3. 检查退款结果
    if (data.code === "10000" && data.msg === "Success") {
      // 更新订单状态
      await db.update(orders)
        .set({
          status: "refunded",
          paymentStatus: "refunded",
        })
        .where(eq(orders.orderNo, params.orderNo));

      // 更新支付记录
      await db.update(payments)
        .set({
          status: "refunded",
          refundId: data.trade_no,
          refundedAt: new Date(),
        })
        .where(eq(payments.orderId, order[0].id));

      return true;
    }

    console.error("支付宝退款失败:", data);
    return false;
  } catch (error: any) {
    console.error("支付宝退款失败:", error);
    return false;
  }
}
