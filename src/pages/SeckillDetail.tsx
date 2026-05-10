import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, AlertCircle, CheckCircle, ShoppingBag, Minus, Plus } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function SeckillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout>(null);

  // 倒计时
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/seckill/activities/${id}`);
      if (res.data.success) {
        setActivity(res.data.data);
      } else {
        setError('秒杀活动不存在');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '获取秒杀活动失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  // 计算倒计时
  const getCountdown = () => {
    if (!activity) return null;

    const endTime = new Date(activity.endTime).getTime();
    const diff = endTime - currentTime;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  // 计算进度
  const getProgress = () => {
    if (!activity || activity.totalStock === 0) return 0;
    return Math.round((activity.soldCount / activity.totalStock) * 100);
  };

  // 处理抢购
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!activity) return;

    if (quantity > activity.currentStock) {
      setError('库存不足');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await api.post(`/seckill/activities/${id}/join`, {
        quantity,
      });

      if (res.data.success) {
        setOrderSuccess(true);
        // 刷新数据
        setTimeout(() => {
          fetchData();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '抢购失败');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F2EB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: '#2E7D5E' }}
          />
          <p style={{ color: '#666666' }}>加载中...</p>
        </div>
      </div>
    );
  }

  // 成功状态
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F5F2EB' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
          style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(46, 125, 94, 0.1)' }}
          >
            <CheckCircle size={40} style={{ color: '#2E7D5E' }} />
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: '#333333' }}>
            抢购成功！
          </h2>
          <p className="mb-6" style={{ color: '#666666' }}>
            请在15分钟内完成支付，否则订单将自动取消
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full py-3 rounded-full text-sm font-medium text-white transition-all duration-200 hover:shadow-lg active:scale-95"
              style={{ backgroundColor: '#2E7D5E' }}
            >
              去支付
            </button>
            <button
              onClick={() => {
                setOrderSuccess(false);
                fetchData();
              }}
              className="w-full py-3 rounded-full text-sm font-medium transition-all duration-200"
              style={{ border: '1px solid #C8B6A6', color: '#333333' }}
            >
              继续抢购
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F5F2EB' }}>
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto mb-4" style={{ color: '#C8B6A6' }} />
          <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: '#333333' }}>
            {error || '秒杀活动不存在'}
          </h2>
          <button
            onClick={() => navigate('/seckill')}
            className="mt-6 px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-200"
            style={{ backgroundColor: '#2E7D5E' }}
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const countdown = getCountdown();
  const progress = getProgress();
  const isActive = activity.status === 'active';
  const isUpcoming = activity.status === 'upcoming';
  const isEnded = activity.status === 'ended';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F2EB' }}>
      {/* 倒计时横幅 */}
      {isActive && countdown && (
        <div className="sticky top-16 z-40 py-3 px-4" style={{ backgroundColor: '#D43C33' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-white">
            <Zap size={20} />
            <span className="text-sm font-medium">距结束还剩</span>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 rounded bg-white/20 text-sm font-mono font-bold">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded bg-white/20 text-sm font-mono font-bold">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded bg-white/20 text-sm font-mono font-bold">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：产品图片 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden bg-white"
            style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}
          >
            <div className="aspect-square relative">
              <img
                src={activity.productImage?.[0] || '/product-placeholder.jpg'}
                alt={activity.productName}
                className="w-full h-full object-cover"
              />
              {/* 秒杀标签 */}
              <div className="absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2"
                style={{ backgroundColor: '#D43C33' }}
              >
                <Zap size={16} />
                秒杀价
              </div>
              {/* 进度条 */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/50 flex items-center px-4">
                <div className="flex-1 mr-3">
                  <div className="w-full h-2.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: progress >= 80 ? '#EF4444' : '#F59E0B',
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-white font-medium">
                  已抢 {progress}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* 右侧：秒杀信息 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* 状态标签 */}
            <div className="mb-4">
              {isActive && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: '#D43C33' }}
                >
                  <Zap size={12} />
                  进行中
                </span>
              )}
              {isUpcoming && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: '#6B7280' }}
                >
                  <Clock size={12} />
                  即将开始
                </span>
              )}
              {isEnded && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                >
                  已结束
                </span>
              )}
            </div>

            {/* 产品名称 */}
            <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-4" style={{ color: '#333333' }}>
              {activity.productName}
            </h1>

            {/* 价格信息 */}
            <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold" style={{ color: '#D43C33', fontFamily: 'Inter, sans-serif' }}>
                  ¥{parseFloat(activity.seckillPrice).toFixed(2)}
                </span>
                <span className="text-lg line-through" style={{ color: '#999999', fontFamily: 'Inter, sans-serif' }}>
                  ¥{parseFloat(activity.originalPrice).toFixed(2)}
                </span>
                <span className="text-sm font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: '#FEE2E2', color: '#D43C33' }}
                >
                  省¥{(parseFloat(activity.originalPrice) - parseFloat(activity.seckillPrice)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ color: '#666666' }}>
                <span>已售 {activity.soldCount}</span>
                <span>|</span>
                <span>剩余 {activity.currentStock}</span>
              </div>
            </div>

            {/* 倒计时（即将开始） */}
            {isUpcoming && countdown && (
              <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={20} style={{ color: '#2E7D5E' }} />
                  <span className="font-medium" style={{ color: '#333333' }}>距开始还有</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 rounded-lg bg-gray-100 text-xl font-mono font-bold"
                    style={{ color: '#333333' }}
                  >
                    {String(countdown.hours).padStart(2, '0')}
                  </span>
                  <span style={{ color: '#666666' }}>:</span>
                  <span className="px-3 py-2 rounded-lg bg-gray-100 text-xl font-mono font-bold"
                    style={{ color: '#333333' }}
                  >
                    {String(countdown.minutes).padStart(2, '0')}
                  </span>
                  <span style={{ color: '#666666' }}>:</span>
                  <span className="px-3 py-2 rounded-lg bg-gray-100 text-xl font-mono font-bold"
                    style={{ color: '#333333' }}
                  >
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            {/* 数量选择（进行中） */}
            {isActive && (
              <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
                <p className="text-sm font-medium mb-3" style={{ color: '#333333' }}>
                  购买数量
                  <span className="ml-2 text-xs" style={{ color: '#666666' }}>
                    (每人限购{activity.maxPerUser}件)
                  </span>
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-l-full flex items-center justify-center transition-colors"
                      style={{ border: '1px solid #C8B6A6' }}
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-16 h-10 flex items-center justify-center font-medium"
                      style={{ borderTop: '1px solid #C8B6A6', borderBottom: '1px solid #C8B6A6' }}
                    >
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(Math.min(activity.currentStock, activity.maxPerUser, quantity + 1))}
                      className="w-10 h-10 rounded-r-full flex items-center justify-center transition-colors"
                      style={{ border: '1px solid #C8B6A6' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm" style={{ color: '#666666' }}>
                    小计：¥{(parseFloat(activity.seckillPrice) * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="space-y-3 mt-auto">
              {isActive && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || activity.currentStock === 0}
                  className="w-full py-4 rounded-full text-lg font-bold text-white transition-all duration-200 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: activity.currentStock === 0 ? '#9CA3AF' : '#D43C33' }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      抢购中...
                    </span>
                  ) : activity.currentStock === 0 ? (
                    '已售罄'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingBag size={20} />
                      立即抢购
                    </span>
                  )}
                </button>
              )}

              {isUpcoming && (
                <button
                  onClick={() => {
                    alert('提醒功能开发中，敬请期待！');
                  }}
                  className="w-full py-4 rounded-full text-lg font-medium transition-all duration-200"
                  style={{ border: '2px solid #2E7D5E', color: '#2E7D5E' }}
                >
                  <Clock size={20} className="inline mr-2" />
                  提醒我
                </button>
              )}

              {isEnded && (
                <button
                  disabled
                  className="w-full py-4 rounded-full text-lg font-medium text-white"
                  style={{ backgroundColor: '#9CA3AF' }}
                >
                  活动已结束
                </button>
              )}

              <button
                onClick={() => navigate('/seckill')}
                className="w-full py-3 rounded-full text-sm font-medium transition-all duration-200"
                style={{ border: '1px solid #C8B6A6', color: '#333333' }}
              >
                查看更多秒杀
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
