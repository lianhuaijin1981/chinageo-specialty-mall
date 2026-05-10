import { db } from "../db";
import { contentCategories, contentArticles, contentComments, users } from "../schemas/schema";
import { eq, and, gt, lt, sql, desc, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// ========= 内容分类管理 =========

// 创建内容分类（管理员）
export async function createContentCategory(data: {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
}) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);

  const [category] = await db
    .insert(contentCategories)
    .values({
      uuid,
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentId: data.parentId,
    })
    .returning();

  return category;
}

// 获取所有内容分类
export async function getAllContentCategories() {
  const categories = await db
    .select()
    .from(contentCategories)
    .orderBy(asc(contentCategories.id));

  return categories;
}

// 获取单个内容分类详情
export async function getContentCategoryBySlug(slug: string) {
  const [category] = await db
    .select()
    .from(contentCategories)
    .where(eq(contentCategories.slug, slug))
    .limit(1);

  return category || null;
}

// ========= 内容文章管理 =========

// 创建内容文章（管理员）
export async function createContentArticle(data: {
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  categoryId?: number;
  authorId: number;
}) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);

  const [article] = await db
    .insert(contentArticles)
    .values({
      uuid,
      title: data.title,
      content: data.content,
      summary: data.summary,
      coverImage: data.coverImage,
      categoryId: data.categoryId,
      authorId: data.authorId,
      status: "published",
    })
    .returning();

  return article;
}

// 获取所有已发布文章（公开）
export async function getPublishedArticles(options?: {
  categorySlug?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  let query = db
    .select({
      id: contentArticles.id,
      uuid: contentArticles.uuid,
      title: contentArticles.title,
      summary: contentArticles.summary,
      coverImage: contentArticles.coverImage,
      categoryId: contentArticles.categoryId,
      authorId: contentArticles.authorId,
      status: contentArticles.status,
      viewCount: contentArticles.viewCount,
      likeCount: contentArticles.likeCount,
      createdAt: contentArticles.createdAt,
      categoryName: contentCategories.name,
      categorySlug: contentCategories.slug,
      authorName: users.nickname,
    })
    .from(contentArticles)
    .leftJoin(contentCategories, eq(contentArticles.categoryId, contentCategories.id))
    .leftJoin(users, eq(contentArticles.authorId, users.id))
    .where(eq(contentArticles.status, "published"))
    .orderBy(desc(contentArticles.createdAt))
    .limit(limit)
    .offset(offset);

  // 如果指定了分类，添加筛选
  if (options?.categorySlug) {
    const category = await getContentCategoryBySlug(options.categorySlug);
    if (category) {
      query = db
        .select({
          id: contentArticles.id,
          uuid: contentArticles.uuid,
          title: contentArticles.title,
          summary: contentArticles.summary,
          coverImage: contentArticles.coverImage,
          categoryId: contentArticles.categoryId,
          authorId: contentArticles.authorId,
          status: contentArticles.status,
          viewCount: contentArticles.viewCount,
          likeCount: contentArticles.likeCount,
          createdAt: contentArticles.createdAt,
          categoryName: contentCategories.name,
          categorySlug: contentCategories.slug,
          authorName: users.nickname,
        })
        .from(contentArticles)
        .leftJoin(contentCategories, eq(contentArticles.categoryId, contentCategories.id))
        .leftJoin(users, eq(contentArticles.authorId, users.id))
        .where(
          and(
            eq(contentArticles.status, "published"),
            eq(contentArticles.categoryId, category.id)
          )
        )
        .orderBy(desc(contentArticles.createdAt))
        .limit(limit)
        .offset(offset);
    }
  }

  const articles = await query;
  return articles;
}

// 获取文章详情
export async function getContentArticleDetail(articleId: number) {
  const [article] = await db
    .select({
      id: contentArticles.id,
      uuid: contentArticles.uuid,
      title: contentArticles.title,
      content: contentArticles.content,
      summary: contentArticles.summary,
      coverImage: contentArticles.coverImage,
      categoryId: contentArticles.categoryId,
      authorId: contentArticles.authorId,
      status: contentArticles.status,
      viewCount: contentArticles.viewCount,
      likeCount: contentArticles.likeCount,
      createdAt: contentArticles.createdAt,
      categoryName: contentCategories.name,
      categorySlug: contentCategories.slug,
      authorName: users.nickname,
      authorAvatar: users.avatar,
    })
    .from(contentArticles)
    .leftJoin(contentCategories, eq(contentArticles.categoryId, contentCategories.id))
    .leftJoin(users, eq(contentArticles.authorId, users.id))
    .where(eq(contentArticles.id, articleId))
    .limit(1);

  return article || null;
}

// 增加浏览量
export async function incrementViewCount(articleId: number) {
  const [article] = await db
    .update(contentArticles)
    .set({
      viewCount: sql`${contentArticles.viewCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(contentArticles.id, articleId))
    .returning();

  return article;
}

// 点赞文章
export async function likeContentArticle(articleId: number) {
  const [article] = await db
    .update(contentArticles)
    .set({
      likeCount: sql`${contentArticles.likeCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(contentArticles.id, articleId))
    .returning();

  return article;
}

// ========= 内容评论管理 =========

// 发表评论
export async function createContentComment(data: {
  articleId: number;
  userId: number;
  content: string;
}) {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 32);

  const [comment] = await db
    .insert(contentComments)
    .values({
      uuid,
      articleId: data.articleId,
      userId: data.userId,
      content: data.content,
    })
    .returning();

  return comment;
}

// 获取文章评论
export async function getContentComments(articleId: number) {
  const comments = await db
    .select({
      id: contentComments.id,
      uuid: contentComments.uuid,
      content: contentComments.content,
      createdAt: contentComments.createdAt,
      userId: contentComments.userId,
      userName: users.nickname,
      userAvatar: users.avatar,
    })
    .from(contentComments)
    .leftJoin(users, eq(contentComments.userId, users.id))
    .where(eq(contentComments.articleId, articleId))
    .orderBy(asc(contentComments.createdAt));

  return comments;
}
