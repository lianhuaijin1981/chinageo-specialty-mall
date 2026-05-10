import { Hono } from 'hono';
import { searchProducts, initSearchIndex, bulkIndexProducts } from '../services/search';
import { authMiddleware } from '../middleware/auth';
import { createRateLimit, rateLimitConfigs, ipBlacklistMiddleware } from '../middleware/rateLimit';

const searchRouter = new Hono();

// 搜索商品（公开接口，应用限流和IP黑名单）
searchRouter.get('/', ipBlacklistMiddleware, createRateLimit(rateLimitConfigs.search), async (c) => {
  try {
    const {
      keyword,
      categoryId,
      regionId,
      minPrice,
      maxPrice,
      page,
      pageSize,
    } = c.req.query();

    const result = await searchProducts({
      keyword,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      regionId: regionId ? parseInt(regionId) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });

    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
});

// 初始化搜索索引（管理员）
searchRouter.post('/init', authMiddleware, async (c) => {
  try {
    await initSearchIndex();
    await bulkIndexProducts();
    return c.json({ success: true, message: '搜索索引初始化成功' });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
});

export default searchRouter;
