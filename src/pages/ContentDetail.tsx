import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, AlertCircle, Eye, Heart, Send, MessageCircle, ArrowLeft
} from "lucide-react";
import api from "../services/api";

interface ContentArticle {
  id: number;
  uuid: string;
  title: string;
  content: string;
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
  authorAvatar: string;
}

interface ContentComment {
  id: number;
  uuid: string;
  content: string;
  createdAt: string;
  userId: number;
  userName: string;
  userAvatar: string;
}

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ContentArticle | null>(null);
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 获取文章详情
  useEffect(() => {
    if (id) {
      fetchArticleDetail();
      fetchComments();
    }
  }, [id]);

  const fetchArticleDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/api/content/articles/${id}`);

      if (response.data.success) {
        setArticle(response.data.data);
      } else {
        setError(response.data.error || "获取文章失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/content/articles/${id}/comments`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (err) {
      // 忽略错误
    }
  };

  // 点赞文章
  const handleLike = async () => {
    try {
      const response = await api.post(`/api/content/articles/${id}/like`);
      if (response.data.success) {
        setArticle(prev => prev ? { ...prev, likeCount: response.data.data.likeCount } : null);
      }
    } catch (err) {
      // 忽略错误
    }
  };

  // 发表评论
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(`/api/content/articles/${id}/comments`, {
        content: newComment,
      });

      if (response.data.success) {
        setNewComment("");
        fetchComments(); // 刷新评论列表
      } else {
        setError(response.data.error || "发表失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "发表失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/content")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            返回内容列表
          </button>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      {/* 顶部状态栏 */}
      <div className="bg-green-600 text-white py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-bold">{article.categoryName || "文化内容"}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.viewCount}浏览
            </span>
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-red-300 transition-colors"
            >
              <Heart className="w-4 h-4" />
              {article.likeCount}点赞
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate("/content")}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回内容列表
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：文章内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 文章主体 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              {/* 封面图 */}
              {article.coverImage && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* 标题 */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {article.title}
              </h1>

              {/* 文章元信息 */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {article.authorName || "管理员"}
                </span>
                <span>
                  {new Date(article.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.viewCount}浏览
                </span>
              </div>

              {/* 文章内容 */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </p>
              </div>

              {/* 点赞按钮 */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">{article.likeCount} 人点赞</span>
                </button>
              </div>
            </motion.div>

            {/* 评论区 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                评论 ({comments.length})
              </h3>

              {/* 评论列表 */}
              <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">暂无评论，快来发表第一条评论吧！</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {comment.userName?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{comment.userName || "匿名用户"}</p>
                        <p className="text-sm text-gray-600 mt-1 break-words">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 发表评论 */}
              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg mb-2">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
                  placeholder="发表评论..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={submitting || !newComment.trim()}
                  className={`px-4 py-2 rounded-full transition-all ${
                    submitting || !newComment.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* 右侧：侧边栏 */}
          <div className="space-y-6">
            {/* 作者信息 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-3">作者信息</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center text-white font-bold">
                  {article.authorName?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{article.authorName || "管理员"}</p>
                  <p className="text-sm text-gray-500">内容创作者</p>
                </div>
              </div>
            </div>

            {/* 文章信息 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-3">文章信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">分类</span>
                  <span className="text-gray-800">{article.categoryName || "未分类"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">发布时间</span>
                  <span className="text-gray-800">{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">浏览量</span>
                  <span className="text-gray-800">{article.viewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">点赞数</span>
                  <span className="text-gray-800">{article.likeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
