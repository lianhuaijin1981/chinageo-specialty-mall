import { config } from "dotenv";
import { db } from "../db";
import { orders, payments, paymentStatusEnum } from "../schemas/schema";
import { eq } from "drizzle-orm";
import WxPay from "wxpay-v3";

config({ path: "../.env" });

const WECHAT_MCH_ID = process.env.WECHAT_MCH_ID!;
const WECHAT_API_V3_KEY = process.env.WECHAT_API_V3_KEY!;
const WECHAT_PRIVATE_KEY_PATH = process.env.WECHAT_PRIVATE_KEY_PATH!;
const WECHAT_CERT_PATH = process.env.WECHAT_CERT_PATH!;
const WECHAT_APP_ID = process.env.WECHAT_APP_ID!;

// 初始化微信支付SDK
const wxpay = new WxPay({
  appid: WECHAT_APP_ID,
  mchid: WECHAT_MCH_ID,
  publicKey: WECHAT_CERT_PATH, // 平台证书路径
  privateKey: WECHAT_PRIVATE_KEY_PATH, // 商户私钥路径
  key: WECHAT_API_V3_KEY, // APIv3密钥
});

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
    // 1. 构造请求参数
    const requestData = {
      appid: WECHAT_APP_ID,
      mchid: WECHAT_MCH_ID,
      description: params.description,
      out_trade_no: params.orderNo,
      notify_url: `${process.env.SERVER_URL}/api/payments/wechat/notify`,
      amount: {
        total: params.amount,
        currency: "CNY",
      },
      payer: params.openid ? { openid: params.openid } : undefined,
    };

    // 2. 调用微信支付APIv3创建订单
    const result = await wxpay.request({
      method: "POST",
      url: "/v3/pay/transactions/jsapi",
      data: requestData,
    });

    const prepayId = result.prepay_id;

    // 3. 生成前端支付参数（JSAPI）
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = Math.random().toString(36).substring(2, 15);
    const package_str = `prepay_id=${prepayId}`;
    
    // 生成签名
    const paySign = wxpay.generateSignature({
      appId: WECHAT_APP_ID,
      timeStamp: timestamp,
      nonceStr: nonceStr,
      package: package_str,
    });

    // 4. 保存支付记录
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
        appId: WECHAT_APP_ID,
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
    // 1. 验证签名
    const signature = notifyData.headers?.['wechatpay-signature'];
    const timestamp = notifyData.headers?.['wechatpay-timestamp'];
    const nonce = notifyData.headers?.['wechatpay-nonce'];
    
    const body = notifyData.body;
    const verified = wxpay.verifySignature({
      timestamp,
      nonce,
      body: JSON.stringify(body),
      signature,
    });

    if (!verified) {
      console.error("微信支付回调签名验证失败");
      return false;
    }

    // 2. 解析回调数据
    const { out_trade_no, transaction_id, trade_state } = body.resource;
    
    // 解密数据（APIv3回调数据是加密的）
    const decryptedData = wxpay.decryptNotifyData(body.resource);
    const { out_trade_no: orderNo, transaction_id: txnId } = decryptedData;

    // 3. 只有支付成功才更新订单
    if (trade_state === "SUCCESS") {
      // 更新订单状态
      await db.update(orders)
        .set({
          status: "paid",
          paymentStatus: "paid",
          paidAt: new Date(),
        })
        .where(eq(orders.orderNo, orderNo));

      // 更新支付记录
      const order = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
      if (order.length > 0) {
        await db.update(payments)
          .set({
            status: "paid",
            transactionId: txnId,
            paidAt: new Date(),
          })
          .where(eq(payments.orderId, order[0].id));
      }
    }

    return true;
  } catch (error) {
    console.error("微信支付回调处理失败:", error);
    return false;
  }
}

// 查询微信支付订单
export async function queryWechatPayOrder(orderNo: string): Promise<any> {
  try {
    // 调用微信支付查询接口
    const result = await wxpay.request({
      method: "GET",
      url: `/v3/pay/transactions/out-trade-no/${orderNo}?mchid=${WECHAT_MCH_ID}`,
    });

    return {
      success: true,
      data: {
        trade_state: result.trade_state,
        transaction_id: result.transaction_id,
        trade_state_desc: result.trade_state_desc,
      },
    };
  } catch (error: any) {
    console.error("查询微信支付订单失败:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// 关闭微信支付订单
export async function closeWechatPayOrder(orderNo: string): Promise<boolean> {
  try {
    // 调用微信支付关闭接口
    await wxpay.request({
      method: "POST",
      url: `/v3/pay/transactions/out-trade-no/${orderNo}/close`,
      data: {
        mchid: WECHAT_MCH_ID,
      },
    });

    // 更新订单状态
    await db.update(orders)
      .set({
        status: "cancelled",
        paymentStatus: "closed",
      })
      .where(eq(orders.orderNo, orderNo));

    return true;
  } catch (error: any) {
    console.error("关闭微信支付订单失败:", error);
    return false;
  }
}

// 申请退款
export async function refundWechatPayOrder(params: {
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

    // 2. 调用微信支付退款接口
    const refundNo = `refund_${Date.now()}`;
    const result = await wxpay.request({
      method: "POST",
      url: "/v3/refund/domestic/refunds",
      data: {
        out_trade_no: params.orderNo,
        out_refund_no: refundNo,
        reason: params.reason,
        amount: {
          refund: params.refundAmount,
          total: Math.round(parseFloat(order[0].payAmount.toString()) * 100),
          currency: "CNY",
        },
      },
    });

    // 3. 更新订单状态
    await db.update(orders)
      .set({
        status: "refunded",
        paymentStatus: "refunded",
      })
      .where(eq(orders.orderNo, params.orderNo));

    // 4. 更新支付记录
    await db.update(payments)
      .set({
        status: "refunded",
        refundId: result.refund_id,
        refundedAt: new Date(),
      })
      .where(eq(payments.orderId, order[0].id));

    return true;
  } catch (error: any) {
    console.error("微信支付退款失败:", error);
    return false;
  }
}
