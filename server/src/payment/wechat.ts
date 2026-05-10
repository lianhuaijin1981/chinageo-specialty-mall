import { config } from "dotenv";
import { db } from "../db";
import { orders, payments, paymentStatusEnum } from "../schemas/schema";
import { eq } from "drizzle-orm";

config({ path: "../.env" });

const WECHAT_MCH_ID = process.env.WECHAT_MCH_ID!;
const WECHAT_API_V3_KEY = process.env.WECHAT_API_V3_KEY!;
const WECHAT_PRIVATE_KEY_PATH = process.env.WECHAT_PRIVATE_KEY_PATH!;

export interface WechatPayParams {
  orderId: number;
  orderNo: string;
  description: string;
  amount: number; // 单位：分
  openid?: string;
}

export interface WechatPayResult {
  success: boolean;
  prepayId?: string;
  payParams?: {
    appId: string;
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
  };
  message?: string;
}

// 创建微信支付订单（JSAPI支付）
export async function createWechatPayOrder(params: WechatPayParams): Promise<WechatPayResult> {
  try {
    // TODO: 实际调用微信支付 APIv3
    // 这里使用模拟实现
    
    // 1. 构造请求参数
    const requestData = {
      appid: process.env.WECHAT_APP_ID!,
      mchid: WECHAT_MCH_ID,
      description: params.description,
      out_trade_no: params.orderNo,
      notify_url: `${process.env.CLIENT_URL}/api/payments/wechat/notify`,
      amount: {
        total: params.amount,
        currency: "CNY",
      },
      payer: params.openid ? { openid: params.openid } : undefined,
    };

    // TODO: 使用微信支付 SDK 发送请求
    console.log("微信支付请求（模拟）:", requestData);

    // 模拟返回
    const prepayId = `wx_prepay_${Date.now()}`;

    // 2. 生成前端支付参数
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = Math.random().toString(36).substring(2, 15);
    const package_str = `prepay_id=${prepayId}`;
    
    // TODO: 使用微信支付 SDK 生成签名
    const paySign = "mock_pay_sign";

    // 3. 保存支付记录
    await db.insert(payments).values({
      uuid: `pay_${Date.now()}`,
      orderId: params.orderId,
      paymentMethod: "wechat",
      amount: (params.amount / 100).toString(),
      status: "paying",
    });

    return {
      success: true,
      prepayId,
      payParams: {
        appId: process.env.WECHAT_APP_ID!,
        timeStamp: timestamp,
        nonceStr,
        package: package_str,
        signType: "RSA",
        paySign,
      },
    };
  } catch (error: any) {
    console.error("微信支付创建失败:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// 处理微信支付回调
export async function handleWechatPayNotify(notifyData: any): Promise<boolean> {
  try {
    // TODO: 验证签名
    // TODO: 解析回调数据

    const { out_trade_no, transaction_id } = notifyData;

    // 更新订单状态
    await db.update(orders)
      .set({
        status: "paid",
        paymentStatus: "paid",
        paidAt: new Date(),
      })
      .where(eq(orders.orderNo, out_trade_no));

    // 更新支付记录
    await db.update(payments)
      .set({
        status: "paid",
        transactionId,
        paidAt: new Date(),
      })
      .where(eq(payments.orderId, (await db.select().from(orders).where(eq(orders.orderNo, out_trade_no)).limit(1))[0]?.id || 0));

    return true;
  } catch (error) {
    console.error("微信支付回调处理失败:", error);
    return false;
  }
}

// 查询微信支付订单
export async function queryWechatPayOrder(orderNo: string): Promise<any> {
  // TODO: 调用微信支付查询接口
  console.log("查询微信支付订单:", orderNo);
  return {
    success: true,
    data: {
      trade_state: "SUCCESS",
      transaction_id: `wx_txn_${Date.now()}`,
    },
  };
}

// 关闭微信支付订单
export async function closeWechatPayOrder(orderNo: string): Promise<boolean> {
  // TODO: 调用微信支付关闭接口
  console.log("关闭微信支付订单:", orderNo);
  return true;
}

// 申请退款
export async function refundWechatPayOrder(params: {
  orderNo: string;
  refundAmount: number;
  reason: string;
}): Promise<boolean> {
  // TODO: 调用微信支付退款接口
  console.log("申请微信支付退款:", params);
  return true;
}
