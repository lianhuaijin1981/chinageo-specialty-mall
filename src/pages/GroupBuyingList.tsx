import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Clock, ChevronRight, AlertCircle, CheckCircle,
  ShoppingCart, TrendingUp, FileText
} from "lucide-react";
import api from "../services/api";

interface GroupBuyingActivity {
  id: number;
  uuid: string;
  productId: number;
  groupPrice: string;
  minGroupSize: number;
  currentGroupSize: number;
  startTime: string;
  endTime: string;
  status: string;
  enterpriseOnly: boolean;
  customPackaging: boolean;
  productName: string;
  productImage: string[];
  originalPrice: string;
  productSlug: string;
}

const GroupBuyingList: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<GroupBuyingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  // 每秒更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 获取团购活动列表
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/group-buying/activities/active");

      if (response.data.success) {
        setActivities(response.data.data);
      } else {
        setError(response.data.error || "获取团购活动失败");
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

    return { hours, minutes, seconds };
  };

  // 格式化倒计时
  const formatCountdown = (cd: { hours: number; minutes: number; seconds: number }) => {
    return `${String(cd.hours).padStart(2, '0')}:${String(cd.minutes).padStart(2, '0')}:${String(cd.seconds).padStart(2, '0')}`;
  };

  // 计算成团进度
  const getProgress = (current: number, min: number) => {
    if (min === 0) return 100;
    return Math.min(100, Math.round((current / min) * 100));
  };

  // 跳转到详情页
  const handleActivityClick = (activity: GroupBuyingActivity) => {
    navigate(`/group-buying/${activity.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold">企业团购</h1>
          </motion.div>
          <p className="text-blue-100 text-sm">集体采购 · 专享低价 · 发票齐全</p>
        </div>
      </div>

      {/* 企业认证入口 */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-800">企业用户专享更低价格</p>
              <p className="text-sm text-gray-500">认证企业信息，享受团购特权+发票服务</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/enterprise-verify")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            企业认证
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {/* 活动列表 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">暂无进行中的团购活动</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activities.map((activity, index) => {
                const countdown = getCountdown(activity.endTime);
                const progress = getProgress(activity.currentGroupSize, activity.minGroupSize);

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
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                      {activity.productImage && activity.productImage[0] ? (
                        <img
                          src={activity.productImage[0]}
                          alt={activity.productName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-16 h-16 text-blue-300" />
                        </div>
                      )}
                      
                      {/* 企业专享标签 */}
                      {activity.enterpriseOnly && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                          企业专享
                        </div>
                      )}

                      {/* 定制包装标签 */}
                      {activity.customPackaging && (
                        <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                          可定制
                        </div>
                      )}

                      {/* 倒计时 */}
                      {countdown && (
                        <div className="absolute bottom-3 left-3 right-3 bg-black/70 text-white text-center py-2 rounded-lg">
                          <p className="text-xs mb-1">距结束</p>
                          <div className="flex justify-center gap-1">
                            <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono font-bold text-sm">
                              {String(countdown.hours).padStart(2, '0')}
                            </span>
                            <span className="text-white">:</span>
                            <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono font-bold text-sm">
                              {String(countdown.minutes).padStart(2, '0')}
                            </span>
                            <span className="text-white">:</span>
                            <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono font-bold text-sm">
                              {String(countdown.seconds).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 商品信息 */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {activity.productName}
                      </h3>

                      {/* 价格 */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-blue-600">
                          ¥{parseFloat(activity.groupPrice).toFixed(2)}
                        </span>
                        {activity.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ¥{parseFloat(activity.originalPrice).toFixed(2)}
                          </span>
                        )}
                        {activity.originalPrice && (
                          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">
                            省¥{(parseFloat(activity.originalPrice) - parseFloat(activity.groupPrice)).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* 成团进度 */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>已参团{activity.currentGroupSize}人</span>
                          <span>最低{minGroupSize(activity)}人成团</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* 企业专享提示 */}
                      {activity.enterpriseOnly && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                          <FileText className="w-3 h-3" />
                          <span>仅限认证企业用户参与</span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <TrendingUp className="w-3 h-3" />
                          <span>已有{activity.currentGroupSize}人参团</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
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
function minGroupSize(activity: GroupBuyingActivity): number {
  return activity.minGroupSize || 10;
}

export default GroupBuyingList;
