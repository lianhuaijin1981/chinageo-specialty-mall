import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, Clock, AlertCircle, CheckCircle, ShoppingCart,
  ArrowLeft, TrendingUp, FileText, ShieldCheck, Truck
} from "lucide-react";
import api from "../services/api";

interface GroupBuyingActivity {
  id: number;
  uuid: string;
  productId: number;
  groupPrice: string;
  minGroupSize: number;
  maxGroupSize?: number;
  currentGroupSize: number;
  startTime: string;
  endTime: string;
  status: string;
  enterpriseOnly: boolean;
  customPackaging: boolean;
  productName: string;
  productDescription: string;
  productImage: string[];
  originalPrice: string;
  productSlug: string;
  specs: Array<{ name: string; value: string }>;
}

const GroupBuyingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<GroupBuyingActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [now, setNow] = useState(Date.now());

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
    }
  }, [id]);

  const fetchActivityDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/api/group-buying/activities/${id}`);

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

  // 参团
  const handleJoin = async () => {
    if (!activity) return;

    setJoining(true);
    setError("");

    try {
      const response = await api.post(`/api/group-buying/activities/${activity.id}/join`, {
        quantity,
      });

      if (response.data.success) {
        alert("🎉 参团成功！请在30分钟内完成支付");
        fetchActivityDetail();
      } else {
        setError(response.data.error || "参团失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "参团失败，请重试");
    } finally {
      setJoining(false);
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

  // 获取活动状态
  const getStatusInfo = () => {
    if (!activity) return null;

    const endCd = getCountdown(activity.endTime);

    if (activity.status === "cancelled") {
      return { text: "活动已取消", color: "bg-gray-600", canJoin: false };
    }

    if (now < new Date(activity.startTime).getTime()) {
      return { text: "即将开始", color: "bg-blue-600", canJoin: false };
    }

    if (now > new Date(activity.endTime).getTime() || activity.status === "ended") {
      return { text: "活动已结束", color: "bg-gray-600", canJoin: false };
    }

    return {
      text: endCd ? `距结束 ${formatCountdown(endCd)}` : "进行中",
      color: "bg-blue-600",
      canJoin: true,
    };
  };

  // 计算成团进度
  const getProgress = () => {
    if (!activity || activity.minGroupSize === 0) return 100;
    return Math.min(100, Math.round((activity.currentGroupSize / activity.minGroupSize) * 100));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            onClick={() => navigate("/group-buying")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            返回团购列表
          </button>
        </div>
      </div>
    );
  }

  if (!activity) return null;

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 顶部状态栏 */}
      <div className={`${statusInfo?.color} text-white py-3 px-4`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">
              {statusInfo?.text}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Users className="w-4 h-4" />
            <span>已参团{activity.currentGroupSize}人</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate("/group-buying")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回团购列表
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：商品图片 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                {activity.productImage && activity.productImage[0] ? (
                  <img
                    src={activity.productImage[0]}
                    alt={activity.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingCart className="w-32 h-32 text-blue-300" />
                )}
              </div>
            </div>

            {/* 团购标签 */}
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              团购价
            </div>

            {/* 企业专享标签 */}
            {activity.enterpriseOnly && (
              <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                企业专享
              </div>
            )}
          </motion.div>

          {/* 右侧：商品信息+参团按钮 */}
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
                <span className="text-4xl font-bold text-blue-600">
                  ¥{parseFloat(activity.groupPrice).toFixed(2)}
                </span>
                {activity.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ¥{parseFloat(activity.originalPrice).toFixed(2)}
                  </span>
                )}
                {activity.originalPrice && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                    省¥{(parseFloat(activity.originalPrice) - parseFloat(activity.groupPrice)).toFixed(2)}
                  </span>
                )}
              </div>

              {/* 成团进度 */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>已参团{activity.currentGroupSize}人</span>
                  <span>最低{activity.minGroupSize}人成团</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
                {activity.currentGroupSize >= activity.minGroupSize && (
                  <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>已成团！</span>
                  </div>
                )}
              </div>

              {/* 特殊标签 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {activity.enterpriseOnly && (
                  <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <FileText className="w-3 h-3" />
                    <span>企业专享</span>
                  </div>
                )}
                {activity.customPackaging && (
                  <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>支持定制包装</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  <Truck className="w-3 h-3" />
                  <span>发票齐全</span>
                </div>
              </div>

              {/* 数量选择 */}
              {statusInfo?.canJoin && (
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
                      onClick={() => setQuantity(Math.min(activity.maxGroupSize || 100, quantity + 1))}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors"
                      disabled={activity.maxGroupSize ? quantity >= activity.maxGroupSize : false}
                    >
                      +
                    </button>
                  </div>
                  {activity.maxGroupSize && (
                    <span className="text-xs text-gray-400">最多{activity.maxGroupSize}件</span>
                  )}
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {/* 参团按钮 */}
              <button
                onClick={handleJoin}
                disabled={!statusInfo?.canJoin || joining}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  statusInfo?.canJoin
                    ? "bg-gradient-to-r from-blue-600 to-indigo- -600 text-white hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {joining ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    处理中...
                  </span>
                ) : !statusInfo?.canJoin ? (
                  statusInfo.text
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    立即参团
                  </span>
                )}
              </button>

              {/* 提示信息 */}
              {statusInfo?.canJoin && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  提示：参团成功后请在30分钟内完成支付，逾期订单将自动取消
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

            {/* 团购说明 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-3">团购说明</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>达到最低成团人数后，所有参团订单自动生效</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>若未成团，支付的款项将原路退回</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>企业用户认证后，可开具增值税专用发票</span>
                </li>
                {activity.customPackaging && (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>支持企业定制包装，请联系客服</span>
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GroupBuyingDetail;
