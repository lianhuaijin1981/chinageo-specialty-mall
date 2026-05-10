import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radio, Clock, ChevronRight, AlertCircle, Users, Heart
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
  productImage: string[];
}

const LiveList: React.FC = () => {
  const navigate = useNavigate();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 获取直播间列表
  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/live/active");

      if (response.data.success) {
        setStreams(response.data.data);
      } else {
        setError(response.data.error || "获取直播间失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 跳转到直播间
  const handleStreamClick = (stream: LiveStream) => {
    navigate(`/live/${stream.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <Radio className="w-8 h-8" />
            <h1 className="text-3xl font-bold">产地直播</h1>
          </motion.div>
          <p className="text-purple-100 text-sm">实时互动 · 限时特惠 · 产地直发</p>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 mt-6">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {/* 直播间列表 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : streams.length === 0 ? (
          <div className="text-center py-20">
            <Radio className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">暂无进行中的直播</p>
            <p className="text-gray-400 text-sm mt-2">去看看即将开始的直播吧！</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {streams.map((stream, index) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleStreamClick(stream)}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                >
                  {/* 直播间封面 */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                    {stream.thumbnail ? (
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : stream.productImage && stream.productImage[0] ? (
                      <img
                        src={stream.productImage[0]}
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Radio className="w-16 h-16 text-purple-300" />
                      </div>
                    )}
                    
                    {/* 直播中标签 */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      直播中
                    </div>

                    {/* 观看人数 */}
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {stream.viewerCount}
                    </div>

                    {/* 点赞数 */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {stream.likeCount}
                    </div>
                  </div>

                  {/* 直播间信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {stream.title}
                    </h3>

                    {stream.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {stream.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {stream.viewerCount}观看
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {stream.likeCount}点赞
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
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

export default LiveList;
