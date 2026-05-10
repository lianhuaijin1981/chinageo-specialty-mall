import { compare, hash } from "bcrypt";
import { sign, verify, SignOptions } from "jsonwebtoken";
import { db } from "../db";
import { users, userRoleEnum } from "../schemas/schema";
import { eq } from "drizzle-orm";
import { config } from "dotenv";
import { nanoid } from "nanoid";

config({ path: "../.env" });

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

export interface RegisterDTO {
  username?: string;
  email?: string;
  phone?: string;
  password: string;
  nickname?: string;
}

export interface LoginDTO {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: number;
    uuid: string;
    username: string | null;
    email: string | null;
    phone: string | null;
    nickname: string | null;
    avatar: string | null;
    role: "user" | "admin" | "merchant";
  };
  accessToken: string;
  refreshToken: string;
}

// 注册
export async function register(dto: RegisterDTO): Promise<AuthResult> {
  // 检查用户是否已存在
  if (dto.email) {
    const existing = await db.select().from(users).where(eq(users.email, dto.email)).limit(1);
    if (existing.length > 0) {
      throw new Error("邮箱已被注册");
    }
  }

  if (dto.phone) {
    const existing = await db.select().from(users).where(eq(users.phone, dto.phone)).limit(1);
    if (existing.length > 0) {
      throw new Error("手机号已被注册");
    }
  }

  // 加密密码
  const passwordHash = await hash(dto.password, 10);

  // 创建用户
  const [user] = await db.insert(users).values({
    uuid: nanoid(32),
    username: dto.username,
    email: dto.email,
    phone: dto.phone,
    passwordHash,
    nickname: dto.nickname || dto.username,
    role: "user",
  }).returning();

  // 生成 Token
  const tokens = generateTokens(user.id);

  return {
    user: {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
    },
    ...tokens,
  };
}

// 登录
export async function login(dto: LoginDTO): Promise<AuthResult> {
  // 查找用户
  let user;
  if (dto.email) {
    const result = await db.select().from(users).where(eq(users.email, dto.email)).limit(1);
    user = result[0];
  } else if (dto.phone) {
    const result = await db.select().from(users).where(eq(users.phone, dto.phone)).limit(1);
    user = result[0];
  } else if (dto.username) {
    const result = await db.select().from(users).where(eq(users.username, dto.username)).limit(1);
    user = result[0];
  } else {
    throw new Error("请提供邮箱、手机号或用户名");
  }

  if (!user) {
    throw new Error("用户不存在");
  }

  if (!user.isActive) {
    throw new Error("账号已被禁用");
  }

  // 验证密码
  if (!user.passwordHash) {
    throw new Error("请使用第三方登录");
  }

  const passwordValid = await compare(dto.password, user.passwordHash);
  if (!passwordValid) {
    throw new Error("密码错误");
  }

  // 更新最后登录时间
  await db.update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  // 生成 Token
  const tokens = generateTokens(user.id);

  return {
    user: {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
    },
    ...tokens,
  };
}

// 微信登录
export async function wechatLogin(code: string): Promise<AuthResult> {
  // TODO: 调用微信API获取openid
  const wechatAppId = process.env.WECHAT_APP_ID!;
  const wechatAppSecret = process.env.WECHAT_APP_SECRET!;

  // 这里应该调用微信API，暂时模拟
  const wechatOpenid = `mock_openid_${code}`;

  // 查找或创建用户
  let user = await db.select().from(users).where(eq(users.wechatOpenid, wechatOpenid)).limit(1);
  
  if (user.length === 0) {
    // 创建新用户
    const [newUser] = await db.insert(users).values({
      uuid: nanoid(32),
      wechatOpenid: wechatOpenid,
      nickname: `用户${nanoid(8)}`,
      role: "user",
    }).returning();
    user = [newUser];
  }

  const tokens = generateTokens(user[0].id);

  return {
    user: {
      id: user[0].id,
      uuid: user[0].uuid,
      username: user[0].username,
      email: user[0].email,
      phone: user[0].phone,
      nickname: user[0].nickname,
      avatar: user[0].avatar,
      role: user[0].role,
    },
    ...tokens,
  };
}

// 生成 Token
function generateTokens(userId: number) {
  const payload = { userId };
  const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  const refreshSignOptions: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRES_IN as any };
  
  const accessToken = sign(payload, JWT_SECRET, signOptions);
  const refreshToken = sign(payload, JWT_SECRET, refreshSignOptions);

  return { accessToken, refreshToken };
}

// 验证 Token
export function verifyToken(token: string): { userId: number } {
  try {
    return verify(token, JWT_SECRET) as { userId: number };
  } catch (error) {
    throw new Error("Token 无效或已过期");
  }
}

// 刷新 Token
export function refreshToken(refreshToken: string): { accessToken: string; refreshToken: string } {
  const payload = verifyToken(refreshToken);
  return generateTokens(payload.userId);
}

// 获取用户信息
export async function getUserById(userId: number) {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (result.length === 0) {
    throw new Error("用户不存在");
  }
  const user = result[0];
  return {
    id: user.id,
    uuid: user.uuid,
    username: user.username,
    email: user.email,
    phone: user.phone,
    nickname: user.nickname,
    avatar: user.avatar,
    role: user.role,
  };
}
