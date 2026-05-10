import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, ChevronRight, AlertCircle, Eye, Heart
} from "lucide-react";
import api from "../services/api";

interface ContentArticle {
  id: number;
  uuid: string;
  title: string;
  summary: string;
  coverImage: string;
  categoryId: number;
  authorId: number;
  status: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  categoryName: string;
  categorySlug: string;
  authorName: string;
}

const ContentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") || undefined;

  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 获取文章列表
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [categorySlug]);

  const fetchArticles = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/content/articles", {
        params: {
          category: categorySlug,
          limit: 20,
          offset: 0,
        }
      });

      if (response.data.success) {
        setArticles(response.data.data);
      } else {
        setError(response.data.error || "获取文章列表失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/content/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      // 忽略错误
    }
  };

  // 跳转到文章详情
  const handleArticleClick = (article: ContentArticle) => {
    navigate(`/content/${article.id}`);
  };

  // 按分类筛选
  const handleCategoryFilter = (slug?: string) => {
    if (slug) {
      navigate(`/content?category=${slug}`);
    } else {
      navigate("/content");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl font-bold">文化内容</h1>
          </motion.div>
          <p className="text-green-100 text-sm">GI文化 · 美食食谱 · 养生知识</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 分类筛选 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => handleCategoryFilter()}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              !categorySlug
                ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.slug)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                categorySlug === cat.slug
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 文章列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">暂无文章内容</p>
            <p className="text-gray-400 text-sm mt-2">去看看其他分类吧！</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleArticleClick(article)}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                >
                  {/* 封面图 */}
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-teal-100 overflow-hidden">
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-green-300" />
                      </div>
                    )}

                    {/* 分类标签 */}
                    {article.categoryName && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {article.categoryName}
                      </div>
                    )}
                  </div>

                  {/* 文章信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {article.title}
                    </h3>

                    {article.summary && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {article.likeCount}
                        </span>
                        <span>
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ContentList;
