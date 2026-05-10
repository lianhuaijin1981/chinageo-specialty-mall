import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

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
}

export default function SeckillList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeActivities, setActiveActivities] = useState<SeckillActivity[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<SeckillActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 倒计时更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [activeRes, upcomingRes] = await Promise.all([
        api.get('/seckill/activities/active'),
        api.get('/seckill/activities/upcoming'),
      ]);

      if (activeRes.data.success) {
        setActiveActivities(activeRes.data.data);
      }

      if (upcomingRes.data.success) {
        setUpcomingActivities(upcomingRes.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '获取秒杀活动失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 计算倒计时
  const getCountdown = (startTime: string) => {
    const diff = new Date(startTime).getTime() - currentTime;
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  // 计算进度
  const getProgress = (activity: SeckillActivity) => {
    if (activity.totalStock === 0) return 0;
    return Math.round((activity.soldCount / activity.totalStock) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F2EB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2E7D5E' }} />
          <p style={{ color: '#666666' }}>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F2EB' }}>
      {/* 页面标题区 */}
      <section className="pt-24 pb-12 px-4" style={{ backgroundColor: '#2E7D5E' }}>
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Zap size={48} className="mx-auto mb-4 text-white" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
              限时秒杀
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              精选地理标志产品，超值秒杀价，先到先得！
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 错误提示 */}
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

        {/* 进行中的秒杀 */}
        {activeActivities.length > 0 && (
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: '#333333' }}>
                进行中的秒杀
              </h2>
              <p style={{ color: '#666666' }}>手快有，手慢无！</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeActivities.map((activity, index) => {
                const progress = getProgress(activity);
                const isLowStock = activity.currentStock < 10;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => navigate(`/seckill/${activity.id}`)}
                    className="bg-white rounded-2xl overflow-hidden cursor-pointer group"
                    style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}
                  >
                    {/* 产品图片 */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={activity.productImage?.[0] || '/product-placeholder.jpg'}
                        alt={activity.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* 秒杀标签 */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#D43C33' }}
                      >
                        <Zap size={12} className="inline mr-1" />
                        秒杀
                      </div>
                      {/* 进度条 */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/50 flex items-center px-3">
                        <div className="flex-1 mr-3">
                          <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: progress >= 80 ? '#D43C33' : '#F59E0B',
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-white font-medium">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    {/* 产品信息 */}
                    <div className="p-4">
                      <h3 className="font-serif text-lg font-semibold mb-2 line-clamp-2"
                        style={{ color: '#333333' }}
                      >
                        {activity.productName}
                      </h3>

                      {/* 价格 */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold" style={{ color: '#D43C33', fontFamily: 'Inter, sans-serif' }}>
                          ¥{parseFloat(activity.seckillPrice).toFixed(2)}
                        </span>
                        <span className="text-sm line-through" style={{ color: '#999999', fontFamily: 'Inter, sans-serif' }}>
                          ¥{parseFloat(activity.originalPrice).toFixed(2)}
                        </span>
                      </div>

                      {/* 库存状态 */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: '#666666' }}>
                          已售 {activity.soldCount}
                        </span>
                        {isLowStock ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{ backgroundColor: '#FEE2E2', color: '#D43C33' }}
                          >
                            仅剩 {activity.currentStock} 件
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: '#666666' }}>
                            剩余 {activity.currentStock} 件
                          </span>
                        )}
                      </div>

                      {/* 立即抢购按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAuthenticated) {
                            navigate('/login');
                            return;
                          }
                          navigate(`/seckill/${activity.id}`);
                        }}
                        className="w-full mt-4 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                        style={{ backgroundColor: '#D43C33' }}
                      >
                        立即抢购
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* 即将开始的秒杀 */}
        {upcomingActivities.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: '#333333' }}>
                即将开始
              </h2>
              <p style={{ color: '#666666' }}>提前关注，开抢不错过</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingActivities.map((activity, index) => {
                const countdown = getCountdown(activity.startTime);

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}
                  >
                    <div className="relative aspect-square overflow-hidden opacity-60">
                      <img
                        src={activity.productImage?.[0] || '/product-placeholder.jpg'}
                        alt={activity.productName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Clock size={32} className="mx-auto mb-2" />
                          <p className="text-sm font-medium">即将开始</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-serif text-lg font-semibold mb-2 line-clamp-2"
                        style={{ color: '#333333' }}
                      >
                        {activity.productName}
                      </h3>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold" style={{ color: '#D43C33', fontFamily: 'Inter, sans-serif' }}>
                          ¥{parseFloat(activity.seckillPrice).toFixed(2)}
                        </span>
                      </div>

                      {/* 倒计时 */}
                      {countdown && (
                        <div className="flex items-center gap-2 mb-4">
                          <Clock size={16} style={{ color: '#2E7D5E' }} />
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-1 rounded bg-gray-100 text-sm font-mono font-bold"
                              style={{ color: '#333333' }}
                            >
                              {String(countdown.hours).padStart(2, '0')}
                            </span>
                            <span style={{ color: '#666666' }}>:</span>
                            <span className="px-2 py-1 rounded bg-gray-100 text-sm font-mono font-bold"
                              style={{ color: '#333333' }}
                            >
                              {String(countdown.minutes).padStart(2, '0')}
                            </span>
                            <span style={{ color: '#666666' }}>:</span>
                            <span className="px-2 py-1 rounded bg-gray-100 text-sm font-mono font-bold"
                              style={{ color: '#333333' }}
                            >
                              {String(countdown.seconds).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/seckill/${activity.id}`)}
                        className="w-full py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                        style={{ border: '1px solid #2E7D5E', color: '#2E7D5E' }}
                      >
                        提醒我
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* 空状态 */}
        {!loading && activeActivities.length === 0 && upcomingActivities.length === 0 && (
          <div className="text-center py-20">
            <Zap size={64} className="mx-auto mb-4" style={{ color: '#C8B6A6' }} />
            <h3 className="text-xl font-serif font-semibold mb-2" style={{ color: '#333333' }}>
              暂无秒杀活动
            </h3>
            <p className="mb-6" style={{ color: '#666666' }}>
              关注我们，第一时间获取秒杀信息
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: '#2E7D5E' }}
            >
              去逛逛
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
