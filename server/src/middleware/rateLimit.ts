import { Context, Next } from 'hono';
import { redis } from '../db';
import { config } from 'dotenv';

config({ path: '../.env' });

interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  max: number; // 最大请求数
  message?: string;
  skipSuccessfulRequests?: boolean;
}

// 限流中间件工厂
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    max,
    message = '请求过于频繁，请稍后再试',
    skipSuccessfulRequests = false,
  } = config;

  return async (c: Context, next: Next) => {
    try {
      // 获取客户端IP
      const ip = c.req.header('x-forwarded-for') || 
                c.req.header('x-real-ip') || 
                'unknown';
      
      // 获取请求路径作为key的一部分
      const path = c.req.path;
      const key = `rate_limit:${ip}:${path}`;
      
      // 使用Redis的滑动窗口计数器
      const current = await redis.incr(key);
      
      if (current === 1) {
        // 第一次请求，设置过期时间
        await redis.pexpire(key, windowMs);
      }
      
      if (current > max) {
        return c.json({
          success: false,
          message,
          retryAfter: await redis.pttl(key),
        }, 429);
      }
      
      // 继续处理请求
      await next();
      
      // 如果跳过成功请求，且响应成功，则减少计数
      if (skipSuccessfulRequests && c.res.status < 400) {
        await redis.decr(key);
      }
    } catch (error) {
      console.error('限流中间件错误:', error);
      // 限流失败时不阻塞请求
      await next();
    }
  };
}

// 预设的限流配置
export const rateLimitConfigs = {
  // 通用接口：1分钟10次
  general: {
    windowMs: 60 * 1000,
    max: 10,
  },
  // 登录接口：5分钟5次
  login: {
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: '登录尝试次数过多，请5分钟后再试',
  },
  // 支付接口：1分钟3次
  payment: {
    windowMs: 60 * 1000,
    max: 3,
    message: '支付请求过于频繁，请稍后再试',
  },
  // 搜索接口：1分钟20次
  search: {
    windowMs: 60 * 1000,
    max: 20,
  },
  // 注册接口：1小时3次
  register: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: '注册次数过多，请1小时后再试',
  },
  // 秒杀接口：10秒1次（严格限流防刷）
  seckill: {
    windowMs: 10 * 1000,
    max: 1,
    message: '秒杀请求过于频繁，请稍后再试',
  },
};

// IP黑名单中间件
export async function ipBlacklistMiddleware(c: Context, next: Next) {
  try {
    const ip = c.req.header('x-forwarded-for') || 
              c.req.header('x-real-ip') || 
              'unknown';
    
    const isBlacklisted = await redis.sismember('ip_blacklist', ip);
    
    if (isBlacklisted) {
      return c.json({
        success: false,
        message: '您的IP已被封禁，请联系管理员',
      }, 403);
    }
    
    await next();
  } catch (error) {
    console.error('IP黑名单检查错误:', error);
    await next();
  }
}

// 添加IP到黑名单
export async function addToBlacklist(ip: string, duration?: number) {
  await redis.sadd('ip_blacklist', ip);
  if (duration) {
    // 如果指定了时长，使用临时黑名单
    await redis.expire(`ip_blacklist:${ip}`, duration);
  }
}

// 从黑名单移除IP
export async function removeFromBlacklist(ip: string) {
  await redis.srem('ip_blacklist', ip);
}

// 获取黑名单列表
export async function getBlacklist() {
  return await redis.smembers('ip_blacklist');
}
