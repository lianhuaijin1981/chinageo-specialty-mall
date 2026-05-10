import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, Clock, AlertCircle, Users, Heart, Send, ShoppingCart,
  ArrowLeft, Tv, MessageCircle
} from "lucide-react";
import api from "../services/api";

interface LiveStream {
  id: number;
  uuid: string;
  title: string;
  description: string;
  productId: number;
  thumbnail: string;
  status: string;
  startTime: string;
  endTime: string;
  viewerCount: number;
  likeCount: number;
  productName: string;
  productDescription: string;
  productImage: string[];
  productSlug: string;
  originalPrice: string;
}

interface LiveMessage {
  id: number;
  uuid: string;
  userId: number;
  message: string;
  messageType: string;
  createdAt: string;
  userName: string;
  userAvatar: string;
}

const LiveRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取直播间详情
  useEffect(() => {
    if (id) {
      fetchStreamDetail();
      fetchMessages();
    }
  }, [id]);

  // 轮询消息（3秒间隔）
  useEffect(() => {
    if (!stream || stream.status !== "live") return;

    const interval = setInterval(() => {
      fetchMessages();
      // 模拟增加观看人数
      setStream(prev => prev ? { ...prev, viewerCount: prev.viewerCount + Math.floor(Math.random() * 3) } : null);
    }, 3000);

    return () => clearInterval(interval);
  }, [stream]);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchStreamDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/api/live/${id}`);

      if (response.data.success) {
        setStream(response.data.data);
      } else {
        setError(response.data.error || "获取直播间失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/live/${id}/messages`);
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (err) {
      // 忽略错误
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    setError("");

    try {
      const response = await api.post(`/api/live/${id}/messages`, {
        message: newMessage,
      });

      if (response.data.success) {
        setNewMessage("");
        fetchMessages(); // 刷新消息列表
      } else {
        setError(response.data.error || "发送失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "发送失败，请重试");
    } finally {
      setSending(false);
    }
  };

  // 点赞
  const handleLike = async () => {
    if (liking) return;

    setLiking(true);

    try {
      await api.post(`/api/live/${id}/like`);
      setStream(prev => prev ? { ...prev, likeCount: prev.likeCount + 1 } : null);
      fetchMessages(); // 刷新消息列表（会显示点赞消息）
    } catch (err) {
      // 忽略错误
    } finally {
      setTimeout(() => setLiking(false), 1000); // 防抖
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error && !stream) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/live")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            返回直播列表
          </button>
        </div>
      </div>
    );
  }

  if (!stream) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* 顶部状态栏 */}
      <div className={`${stream.status === "live" ? "bg-red-600" : "bg-gray-600"} text-white py-3 px-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stream.status === "live" ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="font-bold">直播中</span>
              </>
            ) : (
              <span className="font-bold">未开播</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {stream.viewerCount}观看
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {stream.likeCount}点赞
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate("/live")}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回直播列表
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：直播画面 + 聊天 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 直播画面（模拟） */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-2xl overflow-hidden relative"
              style={{ aspectRatio: "16/9" }}
            >
              {stream.status === "live" ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                  <div className="text-center text-white">
                    <Tv className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold">{stream.title}</p>
                    <p className="text-sm opacity-75 mt-2">直播画面区域（实际项目中接入直播流）</p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {stream.viewerCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {stream.likeCount}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center text-white">
                    <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">直播未开始</p>
                  </div>
                </div>
              )}

              {/* 点赞按钮（浮动） */}
              <button
                onClick={handleLike}
                disabled={liking || stream.status !== "live"}
                className={`absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  stream.status === "live"
                    ? "bg-white text-red-600 hover:scale-110 active:scale-90"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Heart className={`w-5 h-5 ${liking ? "animate-pulse" : ""}`} />
                <span className="font-bold">{stream.likeCount}</span>
              </button>
            </motion.div>

            {/* 直播间信息 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {stream.title}
              </h1>
              {stream.description && (
                <p className="text-gray-600 mb-4">{stream.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  开始时间：{new Date(stream.startTime).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 直播促销商品（如果有） */}
            {stream.productId && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  直播促销商品
                </h3>
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                  {stream.productImage && stream.productImage[0] && (
                    <img
                      src={stream.productImage[0]}
                      alt={stream.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{stream.productName}</p>
                    {stream.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        原价：¥{parseFloat(stream.originalPrice).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/product/${stream.productSlug}`)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                  >
                    查看商品
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：聊天区 */}
          <div className="bg-white rounded-2xl shadow-lg flex flex-col" style={{ height: "600px" }}>
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">直播间聊天</h3>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${
                      msg.messageType === "like" ? "justify-center" : ""
                    }`}
                  >
                    {msg.messageType === "like" ? (
                      <div className="text-center text-pink-500 text-sm py-1">
                        ❤️ {msg.userName} 点赞了直播间
                      </div>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {msg.userName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">{msg.userName || "匿名用户"}</p>
                          <div className="bg-gray-100 rounded-lg px-3 py-2 inline-block">
                            <p className="text-sm text-gray-800 break-words">{msg.message}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区 */}
            <div className="p-4 border-t border-gray-100">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg mb-2">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="说点什么..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                  disabled={stream.status !== "live"}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim() || stream.status !== "live"}
                  className={`px-4 py-2 rounded-full transition-all ${
                    sending || !newMessage.trim() || stream.status !== "live"
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              {stream.status !== "live" && (
                <p className="text-xs text-gray-400 text-center mt-2">直播未开始，暂不能聊天</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRoom;
