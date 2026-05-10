import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  createContentCategory,
  getAllContentCategories,
  getContentCategoryBySlug,
  createContentArticle,
  getPublishedArticles,
  getContentArticleDetail,
  incrementViewCount,
  likeContentArticle,
  createContentComment,
  getContentComments,
} from "../services/content.service";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit, rateLimitConfigs } from "../middleware/rateLimit";

const app = new Hono();

// ------- 公开接口 -------

// 获取所有内容分类
app.get("/categories", async (c) => {
  try {
    const categories = await getAllContentCategories();
    return c.json({ success: true, data: categories });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 获取已发布文章列表
app.get("/articles", async (c) => {
  try {
    const categorySlug = c.req.query("category");
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = parseInt(c.req.query("offset") || "0");

    const articles = await getPublishedArticles({
      categorySlug,
      limit,
      offset,
    });

    return c.json({ success: true, data: articles });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 获取文章详情（并增加浏览量）
app.get("/articles/:id", async (c) => {
  try {
    const articleId = parseInt(c.req.param("id"));
    const article = await getContentArticleDetail(articleId);
    
    if (!article) {
      return c.json({ success: false, error: "文章不存在" }, 404);
    }

    // 增加浏览量
    await incrementViewCount(articleId);

    return c.json({ success: true, data: article });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 获取文章评论
app.get("/articles/:id/comments", async (c) => {
  try {
    const articleId = parseInt(c.req.param("id"));
    const comments = await getContentComments(articleId);
    return c.json({ success: true, data: comments });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 点赞文章
app.post("/articles/:id/like", async (c) => {
  try {
    const articleId = parseInt(c.req.param("id"));
    const article = await likeContentArticle(articleId);

    return c.json({
      success: true,
      data: { likeCount: article.likeCount },
      message: "点赞成功",
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// ------- 需要登录的接口 -------

// 发表评论
app.post(
  "/articles/:id/comments",
  authMiddleware,
  createRateLimit({ ...rateLimitConfigs.general, max: 10 }),
  zValidator("json", z.object({
    content: z.string().min(1).max(1000),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      const articleId = parseInt(c.req.param("id"));
      const body = await c.req.valid("json");

      const comment = await createContentComment({
        articleId,
        userId: user.userId,
        content: body.content,
      });

      return c.json({
        success: true,
        data: comment,
        message: "评论发表成功",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// ------- 管理员接口 -------

// 创建内容分类
app.post(
  "/admin/categories",
  authMiddleware,
  zValidator("json", z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100),
    description: z.string().optional(),
    parentId: z.number().min(1).optional(),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      
      if (user.role !== "admin") {
        return c.json({ success: false, error: "无权限" }, 403);
      }

      const body = await c.req.valid("json");
      const category = await createContentCategory(body);

      return c.json({
        success: true,
        data: category,
        message: "分类创建成功",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

// 创建内容文章
app.post(
  "/admin/articles",
  authMiddleware,
  zValidator("json", z.object({
    title: z.string().min(2).max(200),
    content: z.string().min(10),
    summary: z.string().optional(),
    coverImage: z.string().optional(),
    categoryId: z.number().min(1).optional(),
  })),
  async (c) => {
    try {
      const user = c.get("user");
      
      if (user.role !== "admin") {
        return c.json({ success: false, error: "无权限" }, 403);
      }

      const body = await c.req.valid("json");
      const article = await createContentArticle({
        ...body,
        authorId: user.userId,
      });

      return c.json({
        success: true,
        data: article,
        message: "文章发布成功",
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

export { app as contentRoutes };
