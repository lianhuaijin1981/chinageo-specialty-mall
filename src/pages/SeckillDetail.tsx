import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Zap, Clock, AlertCircle, CheckCircle, ShoppingCart, 
  ArrowLeft, Timer, TrendingUp, ShieldCheck 
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
  productDescription: string;
  productImage: string[];
  originalPrice: string;
  productSlug: string;
  specs: Array<{ name: string; value: string }>;
}

const SeckillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<SeckillActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participating, setParticipating] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const [quantity, setQuantity] = useState(1);

  // 每秒更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 获取活动详情
  useEffect(() => {
    if (id) {
      fetchActivityDetail();
      fetchMyOrders();
    }
  }, [id]);

  const fetchActivityDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/api/seckill/${id}`);

      if (response.data.success) {
        setActivity(response.data.data);
      } else {
        setError(response.data.error || "获取活动详情失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await api.get("/api/seckill/orders/my");
      if (response.data.success) {
        setMyOrders(response.data.data);
      }
    } catch (err) {
      // 未登录忽略
    }
  };

  // 参与秒杀
  const handleParticipate = async () => {
    if (!activity) return;

    setParticipating(true);
    setError("");

    try {
      const response = await api.post(`/api/seckill/${activity.id}/participate`, {
        quantity,
      });

      if (response.data.success) {
        alert("🎉 秒杀成功！请在5分钟内完成支付");
        // 刷新详情
        fetchActivityDetail();
        fetchMyOrders();
      } else {
        setError(response.data.error || "秒杀失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "秒杀失败，请重试");
    } finally {
      setParticipating(false);
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

  // 格式化倒计时显示
  const formatCountdown = (cd: { hours: number; minutes: number; seconds: number }) => {
    return `${String(cd.hours).padStart(2, '0')}:${String(cd.minutes).padStart(2, '0')}:${String(cd.seconds).padStart(2, '0')}`;
  };

  // 获取活动状态文本
  const getStatusInfo = () => {
    if (!activity) return null;

    const startCd = getCountdown(activity.startTime);
    const endCd = getCountdown(activity.endTime);

    if (activity.status === "cancelled") {
      return { text: "活动已取消", color: "bg-gray-600", canParticipate: false };
    }

    if (now < new Date(activity.startTime).getTime()) {
      return { 
        text: startCd ? `距开始 ${formatCountdown(startCd)}` : "即将开始", 
        color: "bg-orange-600", 
        canParticipate: false 
      };
    }

    if (now > new Date(activity.endTime).getTime() || activity.status === "ended") {
      return { text: "活动已结束", color: "bg-gray-600", canParticipate: false };
    }

    if (activity.currentStock <= 0) {
      return { text: "已售罄", color: "bg-red-900", canParticipate: false };
    }

    return { 
      text: endCd ? `距结束 ${formatCountdown(endCd)}` : "进行中", 
      color: "bg-red-600", 
      canParticipate: true 
    };
  };

  // 计算进度
  const getProgress = () => {
    if (!activity || activity.totalStock === 0) return 100;
    return Math.round(((activity.totalStock - activity.currentStock) / activity.totalStock) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/seckill")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            返回秒杀列表
          </button>
        </div>
      </div>
    );
  }

  if (!activity) return null;

  const statusInfo = getStatusInfo();
  const userBought = myOrders
    .filter((o: any) => o.activityId === activity.id && ["pending", "paid"].includes(o.status))
    .reduce((sum: number, o: any) => sum + o.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* 顶部状态栏 */}
      <div className={`${statusInfo?.color} text-white py-3 px-4`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">
              {statusInfo?.text}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>已售{activity.soldCount}件</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate("/seckill")}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回秒杀列表
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：商品图片 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                {activity.productImage && activity.productImage[0] ? (
                  <img
                    src={activity.productImage[0]}
                    alt={activity.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingCart className="w-32 h-32 text-red-300" />
                )}
              </div>
            </div>

            {/* 秒杀标签 */}
            <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              秒杀价
            </div>
          </motion.div>

          {/* 右侧：商品信息+秒杀按钮 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {activity.productName}
              </h1>

              {/* 价格对比 */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-red-600">
                  ¥{parseFloat(activity.seckillPrice).toFixed(2)}
                </span>
                {activity.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ¥{parseFloat(activity.originalPrice).toFixed(2)}
                  </span>
                )}
                {activity.originalPrice && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                    省¥{(parseFloat(activity.originalPrice) - parseFloat(activity.seckillPrice)).toFixed(2)}
                  </span>
                )}
              </div>

              {/* 进度条 */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>已售{activity.soldCount}件</span>
                  <span>仅剩{activity.currentStock}件</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>

              {/* 限购提示 */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span>每人限购{activity.maxPerUser}件，您已购买{userBought}件</span>
              </div>

              {/* 数量选择 */}
              {statusInfo?.canParticipate && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm text-gray-600">数量：</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(activity.maxPerUser - userBought, quantity + 1))}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= activity.maxPerUser - userBought}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {/* 秒杀按钮 */}
              <button
                onClick={handleParticipate}
                disabled={!statusInfo?.canParticipate || participating || activity.currentStock <= 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  statusInfo?.canParticipate && activity.currentStock > 0
                    ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {participating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    处理中...
                  </span>
                ) : !statusInfo?.canParticipate ? (
                  statusInfo.text
                ) : activity.currentStock <= 0 ? (
                  "已售罄"
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    立即秒杀
                  </span>
                )}
              </button>

              {/* 提示信息 */}
              {statusInfo?.canParticipate && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  提示：秒杀成功后请在5分钟内完成支付，逾期订单将自动取消
                </p>
              )}
            </div>

            {/* 商品详情 */}
            {activity.productDescription && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3">商品详情</h3>
                <p className="text-gray-600 leading-relaxed">
                  {activity.productDescription}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SeckillDetail;
