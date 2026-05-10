import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Clock, ChevronRight, AlertCircle, CheckCircle, 
  ShoppingCart, Timer, TrendingUp 
} from "lucide-react";
import api from "../services/api";

interface SeckillActivity {
  id: number;
  uuid: string;
  productId: number;
  seckillPrice: string;
  totalStock: number;
  currentStock: number;
  soldCount: number;
  startTime: string;
  endTime: string;
  status: string;
  maxPerUser: number;
  productName: string;
  productImage: string[];
  originalPrice: string;
  productSlug: string;
}

const SeckillList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "upcoming">("active");
  const [activities, setActivities] = useState<SeckillActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  // 每秒更新当前时间（用于倒计时）
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 获取秒杀活动列表
  useEffect(() => {
    fetchActivities();
  }, [activeTab]);

  const fetchActivities = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = activeTab === "active" ? "/api/seckill/active" : "/api/seckill/upcoming";
      const response = await api.get(endpoint);

      if (response.data.success) {
        setActivities(response.data.data);
      } else {
        setError(response.data.error || "获取秒杀活动失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 计算倒计时
  const getCountdown = (targetTime: string) => {
    const diff = new Date(targetTime).getTime() - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, diff };
  };

  // 计算进度百分比
  const getProgress = (sold: number, total: number) => {
    if (total === 0) return 100;
    return Math.round((sold / total) * 100);
  };

  // 跳转到详情页
  const handleActivityClick = (activity: SeckillActivity) => {
    navigate(`/seckill/${activity.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <Zap className="w-8 h-8" />
            <h1 className="text-3xl font-bold">限时秒杀</h1>
          </motion.div>
          <p className="text-red-100 text-sm">超值特惠 · 限时抢购 · 先到先得</p>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "active"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            进行中
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "upcoming"
                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            即将开始
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20">
            <Timer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {activeTab === "active" ? "暂无进行中的秒杀活动" : "暂无即将开始的秒杀活动"}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activities.map((activity, index) => {
                const countdown = activeTab === "upcoming" ? getCountdown(activity.startTime) : null;
                const isEnding = activeTab === "active" && getCountdown(activity.endTime);
                const progress = getProgress(activity.soldCount, activity.totalStock);

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleActivityClick(activity)}
                    className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                  >
                    {/* 商品图片 */}
                    <div className="relative h-48 bg-gradient-to-br from-red-100 to-orange-100 overflow-hidden">
                      {activity.productImage && activity.productImage[0] ? (
                        <img
                          src={activity.productImage[0]}
                          alt={activity.productName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-16 h-16 text-red-300" />
                        </div>
                      )}
                      
                      {/* 折扣标签 */}
                      {activity.originalPrice && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          {Math.round((parseFloat(activity.seckillPrice) / parseFloat(activity.originalPrice)) * 10) / 10}折
                        </div>
                      )}

                      {/* 即将开始倒计时 */}
                      {countdown && (
                        <div className="absolute bottom-3 left-3 right-3 bg-black/70 text-white text-center py-2 rounded-lg">
                          <p className="text-xs mb-1">即将开始</p>
                          <div className="flex justify-center gap-1">
                            <span className="bg-white text-red-600 px-2 py-1 rounded font-mono font-bold text-sm">
                              {String(countdown.hours).padStart(2, '0')}
                            </span>
                            <span className="text-white">:</span>
                            <span className="bg-white text-red-600 px-2 py-1 rounded font-mono font-bold text-sm">
                              {String(countdown.minutes).padStart(2, '0')}
                            </span>
                            <span className="text-white">:</span>
                            <span className="bg-white text-red-600 px-2 py-1 rounded font-mono font-bold text-sm">
                              {String(countdown.seconds).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 商品信息 */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {activity.productName}
                      </h3>

                      {/* 价格 */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-red-600">
                          ¥{parseFloat(activity.seckillPrice).toFixed(2)}
                        </span>
                        {activity.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ¥{parseFloat(activity.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* 进度条 */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>已售{soldCount(activity)}件</span>
                          <span>仅剩{activity.currentStock}件</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* 倒计时/状态 */}
                      {isEnding && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <Timer className="w-3 h-3" />
                          <span>
                            距结束 {formatCountdown(isEnding)}
                          </span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <TrendingUp className="w-3 h-3" />
                          <span>限购{activity.maxPerUser}件</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

// 辅助函数
function soldCount(activity: SeckillActivity): number {
  return activity.soldCount || 0;
}

function formatCountdown(countdown: { hours: number; minutes: number; seconds: number }): string {
  const { hours, minutes, seconds } = countdown;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default SeckillList;
