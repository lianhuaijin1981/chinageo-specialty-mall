-- 秒杀活动功能 - 数据库迁移SQL
-- 执行前请确保数据库已启动，并在psql或pgAdmin中运行此文件

-- 1. 创建秒杀活动表
CREATE TABLE IF NOT EXISTS seckill_activities (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(32) NOT NULL UNIQUE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seckill_price DECIMAL(10,2) NOT NULL,
  total_stock INTEGER NOT NULL,
  sold_count INTEGER DEFAULT 0 NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming' NOT NULL,
  max_per_user INTEGER DEFAULT 1 NOT NULL,
  current_stock INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS seckill_product_idx ON seckill_activities(product_id);
CREATE INDEX IF NOT EXISTS seckill_status_idx ON seckill_activities(status);
CREATE INDEX IF NOT EXISTS seckill_time_idx ON seckill_activities(start_time, end_time);

-- 2. 创建秒杀订单表
CREATE TABLE IF NOT EXISTS seckill_orders (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(32) NOT NULL UNIQUE,
  activity_id INTEGER NOT NULL REFERENCES seckill_activities(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS seckill_orders_activity_idx ON seckill_orders(activity_id);
CREATE INDEX IF NOT EXISTS seckill_orders_user_idx ON seckill_orders(user_id);
CREATE INDEX IF NOT EXISTS seckill_orders_status_idx ON seckill_orders(status);

-- 3. 插入示例秒杀活动（可选，用于测试）
-- 注意：需要先有商品数据，product_id需要替换为实际的商品ID
/*
INSERT INTO seckill_activities (uuid, product_id, seckill_price, total_stock, current_stock, start_time, end_time, status, max_per_user)
VALUES 
  (replace(gen_random_uuid()::text, '-', ''), 1, 9.99, 100, 100, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '24 hour', 'active', 1),
  (replace(gen_random_uuid()::text, '-', ''), 2, 19.99, 50, 50, NOW() + INTERVAL '1 day', NOW() + INTERVAL '2 day', 'upcoming', 2);
*/

-- 完成提示
SELECT '秒杀活动表创建成功！' AS result;
