import { pgEnum, pgTable, serial, varchar, text, integer, decimal, boolean, timestamp, json, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ------- 枚举定义 -------
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "merchant"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paying", "paid", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["wechat", "alipay", "bank_transfer"]);

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
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  phoneIdx: index("users_phone_idx").on(table.phone),
  wechatIdx: index("users_wechat_idx").on(table.wechatOpenid),
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
