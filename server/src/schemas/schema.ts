import { pgEnum, pgTable, serial, varchar, text, integer, decimal, boolean, timestamp, json, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ------- 枚举定义 -------
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "merchant"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paying", "paid", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["wechat", "alipay", "bank_transfer"]);
export const memberLevelEnum = pgEnum("member_level", ["normal", "silver", "gold"]);

// ------- 用户表 -------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email", { length: 100 }).unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  nickname: varchar("nickname", { length: 50 }),
  avatar: text("avatar"),
  role: userRoleEnum("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  wechatOpenid: varchar("wechat_openid", { length: 64 }).unique(),
  wechatUnionid: varchar("wechat_unionid", { length: 64 }),
  lastLoginAt: timestamp("last_login_at"),
  
  // 会员相关字段
  memberLevel: memberLevelEnum("member_level").default("normal").notNull(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0").notNull(),
  points: integer("points").default(0).notNull(),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  phoneIdx: index("users_phone_idx").on(table.phone),
  wechatIdx: index("users_wechat_idx").on(table.wechatOpenid),
  memberLevelIdx: index("users_member_level_idx").on(table.memberLevel),
}));

// ------- 用户地址表 -------
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  province: varchar("province", { length: 50 }).notNull(),
  city: varchar("city", { length: 50 }).notNull(),
  district: varchar("district", { length: 50 }).notNull(),
  detail: text("detail").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ------- 地理标识产区表 -------
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  province: varchar("province", { length: 50 }).notNull(),
  description: text("description"),
  image: text("image"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ------- 商品分类表 -------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  parentId: integer("parent_id").references(() => categories.id),
  image: text("image"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ------- 商品表 -------
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  regionId: integer("region_id").references(() => regions.id),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  specs: json("specs").$type<Array<{ name: string; value: string }>>(),
  images: json("images").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  categoryIdx: index("products_category_idx").on(table.categoryId),
  regionIdx: index("products_region_idx").on(table.regionId),
  priceIdx: index("products_price_idx").on(table.price),
}));

// ------- 购物车表 -------
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userProductIdx: index("cart_user_product_idx").on(table.userId, table.productId),
}));

// ------- 订单表 -------
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  orderNo: varchar("order_no", { length: 32 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  payAmount: decimal("pay_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("unpaid").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  paidAt: timestamp("paid_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  addressSnapshot: json("address_snapshot").$type<{
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
  }>().notNull(),
  remark: text("remark"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdx: index("orders_user_idx").on(table.userId),
  statusIdx: index("orders_status_idx").on(table.status),
  orderNoIdx: index("orders_order_no_idx").on(table.orderNo),
}));

// ------- 订单商品表 -------
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ------- 商品评价表 -------
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  orderId: integer("order_id").references(() => orders.id),
  rating: integer("rating").notNull(), // 1-5星
  content: text("content"),
  images: json("images").$type<string[]>().default([]),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ------- 支付记录表 -------
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("unpaid").notNull(),
  transactionId: varchar("transaction_id", { length: 64 }), // 第三方交易号
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ------- 优惠券表 -------
export const couponTypeEnum = pgEnum("coupon_type", ["fixed", "percentage", "shipping"]);
export const couponStatusEnum = pgEnum("coupon_status", ["active", "inactive", "expired"]);
export const userCouponStatusEnum = pgEnum("user_coupon_status", ["unused", "used", "expired"]);

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  type: couponTypeEnum("type").notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(), // 折扣值（固定金额或折扣百分比）
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).default("0"), // 最低消费金额
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  totalCount: integer("total_count").default(0), // 总发放数量，0表示不限
  usedCount: integer("used_count").default(0).notNull(),
  perUserLimit: integer("per_user_limit").default(1).notNull(), // 每人限领数量
  status: couponStatusEnum("status").default("active").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  statusIdx: index("coupons_status_idx").on(table.status),
  timeIdx: index("coupons_time_idx").on(table.startTime, table.endTime),
}));

// ------- 用户优惠券表 -------
export const userCoupons = pgTable("user_coupons", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  couponId: integer("coupon_id").references(() => coupons.id, { onDelete: "cascade" }).notNull(),
  status: userCouponStatusEnum("status").default("unused").notNull(),
  usedAt: timestamp("used_at"),
  orderId: integer("order_id").references(() => orders.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdx: index("user_coupons_user_idx").on(table.userId),
  couponIdx: index("user_coupons_coupon_idx").on(table.couponId),
  statusIdx: index("user_coupons_status_idx").on(table.status),
}));

// ------- 积分历史记录表 -------
export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  points: integer("points").notNull(), // 正数为获取，负数为消费
  type: varchar("type", { length: 20 }).notNull(), // "earn" | "redeem"
  source: varchar("source", { length: 50 }).notNull(), // "purchase", "signin", "review", "exchange", etc.
  referenceId: integer("reference_id"), // 关联的订单ID或商品ID
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdx: index("points_history_user_idx").on(table.userId),
  typeIdx: index("points_history_type_idx").on(table.type),
  createdAtIdx: index("points_history_created_at_idx").on(table.createdAt),
}));

// ------- 积分兑换商品表 -------
export const pointsProducts = pgTable("points_products", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  image: text("image"),
  pointsCost: integer("points_cost").notNull(), // 兑换所需积分
  stock: integer("stock").default(0).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(), // "active", "inactive", "out_of_stock"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  limitPerUser: integer("limit_per_user").default(1), // 每人限购数量
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  statusIdx: index("points_products_status_idx").on(table.status),
  dateIdx: index("points_products_date_idx").on(table.startDate, table.endDate),
}));

// ------- 积分兑换订单表 -------
export const pointsOrders = pgTable("points_orders", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => pointsProducts.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  totalPoints: integer("total_points").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // "pending", "completed", "cancelled"
  shippingAddress: json("shipping_address").$type<{
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
  }>(),
  trackingNo: varchar("tracking_no", { length: 100 }),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdx: index("points_orders_user_idx").on(table.userId),
  statusIdx: index("points_orders_status_idx").on(table.status),
}));

// ------- 客服聊天会话表 -------
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  adminId: integer("admin_id").references(() => users.id),
  status: varchar("status", { length: 20 }).default("open").notNull(), // "open", "closed"
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdx: index("chat_sessions_user_idx").on(table.userId),
  statusIdx: index("chat_sessions_status_idx").on(table.status),
}));

// ------- 客服聊天消息表 -------
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  sessionId: integer("session_id").references(() => chatSessions.id, { onDelete: "cascade" }).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // "user", "admin"
  message: text("message").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text").notNull(), // "text", "image", "system"
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  sessionIdx: index("chat_messages_session_idx").on(table.sessionId),
  senderIdx: index("chat_messages_sender_idx").on(table.senderId),
  createdAtIdx: index("chat_messages_created_at_idx").on(table.createdAt),
}));

// ------- 秒杀活动表 -------
export const seckillActivities = pgTable("seckill_activities", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  seckillPrice: decimal("seckill_price", { precision: 10, scale: 2 }).notNull(), // 秒杀价格
  totalStock: integer("total_stock").notNull(), // 总库存
  soldCount: integer("sold_count").default(0).notNull(), // 已售数量
  startTime: timestamp("start_time").notNull(), // 开始时间
  endTime: timestamp("end_time").notNull(), // 结束时间
  status: varchar("status", { length: 20 }).default("upcoming").notNull(), // "upcoming", "active", "ended", "cancelled"
  maxPerUser: integer("max_per_user").default(1).notNull(), // 每用户限购数量
  currentStock: integer("current_stock").notNull(), // 当前库存（实时）
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  productIdx: index("seckill_product_idx").on(table.productId),
  statusIdx: index("seckill_status_idx").on(table.status),
  timeIdx: index("seckill_time_idx").on(table.startTime, table.endTime),
}));

// ------- 秒杀订单表 -------
export const seckillOrders = pgTable("seckill_orders", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 32 }).notNull().unique(),
  activityId: integer("activity_id").references(() => seckillActivities.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // "pending", "paid", "cancelled", "timeout"
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  activityIdx: index("seckill_orders_activity_idx").on(table.activityId),
  userIdx: index("seckill_orders_user_idx").on(table.userId),
  statusIdx: index("seckill_orders_status_idx").on(table.status),
}));
