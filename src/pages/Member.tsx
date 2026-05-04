import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Wheat, Crown, Star, Gift, ShoppingBag,
  MessageSquare, Calendar, ChevronRight, ArrowUp, ArrowDown,
  Ticket, Check, Minus
} from 'lucide-react';

/* ─── Mock Data ─── */
const CURRENT_POINTS = 5280;
const TIERS = [
  {
    key: 'normal',
    name: '普通会员',
    range: '0-999积分',
    min: 0,
    max: 999,
    icon: Leaf,
    color: '#C8B6A6',
  },
  {
    key: 'silver',
    name: '白银会员',
    range: '1000-4999积分',
    min: 1000,
    max: 4999,
    icon: Wheat,
    color: '#8A9BA8',
  },
  {
    key: 'gold',
    name: '黄金会员',
    range: '5000+积分',
    min: 5000,
    max: 99999,
    icon: Crown,
    color: '#D4A843',
  },
];

const CURRENT_TIER = TIERS[2]; // gold

const BENEFITS = [
  { name: '积分抵扣比例', normal: '100:1', silver: '80:1', gold: '50:1' },
  { name: '专属优惠券', normal: 1, silver: 2, gold: 3 },
  { name: '生日礼遇', normal: 0, silver: 1, gold: 2 },
  { name: '优先发货', normal: 0, silver: 1, gold: 1 },
  { name: '专属客服', normal: 0, silver: 0, gold: 1 },
  { name: '新品优先购', normal: 0, silver: 1, gold: 1 },
];

const POINTS_RULES = [
  {
    icon: ShoppingBag,
    title: '消费积分',
    desc: '每消费1元累计1积分',
    sub: '订单完成后自动到账',
  },
  {
    icon: MessageSquare,
    title: '评价积分',
    desc: '评价商品累计10积分/单',
    sub: '图文评价额外+5积分',
  },
  {
    icon: Calendar,
    title: '签到积分',
    desc: '每日签到领积分',
    sub: '连续签到积分递增',
  },
];

const POINTS_HISTORY = [
  { id: 1, type: 'earn', desc: '订单消费奖励', detail: '订单: 20240901001', date: '2024-09-01', value: 256 },
  { id: 2, type: 'earn', desc: '商品评价奖励', detail: '五常大米 5kg', date: '2024-08-28', value: 10 },
  { id: 3, type: 'spend', desc: '积分抵扣订单', detail: '订单: 20240825003', date: '2024-08-25', value: -100 },
  { id: 4, type: 'earn', desc: '每日签到奖励', detail: '连续签到7天', date: '2024-08-24', value: 15 },
  { id: 5, type: 'earn', desc: '订单消费奖励', detail: '订单: 20240820002', date: '2024-08-20', value: 128 },
  { id: 6, type: 'earn', desc: '图文评价奖励', detail: '西湖龙井 250g', date: '2024-08-18', value: 15 },
  { id: 7, type: 'spend', desc: '积分兑换优惠券', detail: '兑换¥20优惠券', date: '2024-08-15', value: -200 },
];

const EXCLUSIVE_COUPONS = [
  { tier: 'normal', name: '新用户礼包', desc: '注册即送¥20优惠券', value: '¥20' },
  { tier: 'silver', name: '白银专属券', desc: '每月发放¥50优惠券', value: '¥50' },
  { tier: 'gold', name: '黄金尊享券', desc: '每月发放¥100优惠券+包邮券', value: '¥100' },
];

/* ─── Count-up Hook ─── */
function useCountUp(target: number, duration = 1500, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return value;
}

/* ─── Animated Number ─── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const animated = useCountUp(value, 1500);
  return (
    <span className="tabular-nums">
      {animated.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Tier Card ─── */
function TierCard({
  tier,
  isCurrent,
  index,
}: {
  tier: typeof TIERS[0];
  isCurrent: boolean;
  index: number;
}) {
  const Icon = tier.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="relative bg-white rounded-xl p-6 flex flex-col items-center text-center"
      style={{
        border: isCurrent ? '2px solid #2E7D5E' : '1px solid #F0EBE3',
        boxShadow: isCurrent ? '0 4px 20px rgba(46,125,94,0.12)' : 'none',
      }}
    >
      {isCurrent && (
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(46, 125, 94, 0.2)',
              '0 0 0 12px rgba(46, 125, 94, 0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-xl"
        />
      )}
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#2E7D5E] text-white text-[10px] rounded-full font-medium">
          当前等级
        </span>
      )}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: `${tier.color}15` }}
      >
        <Icon size={28} style={{ color: tier.color }} />
      </div>
      <h3 className="font-serif text-lg font-semibold text-[#333333] mb-1">{tier.name}</h3>
      <p className="text-xs text-[#666666]">{tier.range}</p>
    </motion.div>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar() {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const progress = Math.min((CURRENT_POINTS / 5000) * 100, 100);

  return (
    <div ref={ref} className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#666666]">当前积分</span>
        <span className="text-sm font-bold text-[#2E7D5E]" style={{ fontFamily: 'Inter, sans-serif' }}>
          {CURRENT_POINTS.toLocaleString()} / 5,000+
        </span>
      </div>
      <div className="h-2 bg-[#F0EBE3] rounded-full overflow-hidden relative">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={animated ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          className="absolute inset-y-0 left-0 bg-[#2E7D5E] rounded-full origin-left"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-[#C8B6A6] mt-2 text-center">
        {CURRENT_POINTS >= 5000 ? '您已达到最高会员等级' : `还需 ${(5000 - CURRENT_POINTS).toLocaleString()} 积分升级至黄金会员`}
      </p>
    </div>
  );
}

/* ─── Benefits Table ─── */
function BenefitsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 text-xs text-[#C8B6A6] font-normal">权益项目</th>
            {TIERS.map((tier) => (
              <th
                key={tier.key}
                className="py-3 px-4 text-center text-xs font-normal"
                style={{
                  color: tier.key === CURRENT_TIER.key ? '#2E7D5E' : '#666666',
                  backgroundColor: tier.key === CURRENT_TIER.key ? 'rgba(46,125,94,0.04)' : 'transparent',
                }}
              >
                {tier.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BENEFITS.map((benefit, index) => (
            <motion.tr
              key={benefit.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="border-t border-[#F0EBE3] hover:bg-[#F8F8F8] transition-colors"
            >
              <td className="py-3.5 px-4 text-sm text-[#333333]">{benefit.name}</td>
              {(['normal', 'silver', 'gold'] as const).map((tierKey) => {
                const val = benefit[tierKey as keyof typeof benefit] as number | string;
                const isCurrentCol = tierKey === CURRENT_TIER.key;
                return (
                  <td
                    key={tierKey}
                    className="py-3.5 px-4 text-center text-sm"
                    style={{
                      backgroundColor: isCurrentCol ? 'rgba(46,125,94,0.04)' : 'transparent',
                    }}
                  >
                    {typeof val === 'string' ? (
                      <span style={{ color: isCurrentCol ? '#2E7D5E' : '#333333', fontWeight: isCurrentCol ? 600 : 400 }}>
                        {val}
                      </span>
                    ) : val === 0 ? (
                      <Minus size={14} className="mx-auto text-[#C8B6A6]" />
                    ) : (
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: val }).map((_, i) => (
                          <Star key={i} size={12} className="text-[#D43C33] fill-[#D43C33]" />
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Points Rules ─── */
function PointsRules() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {POINTS_RULES.map((rule, index) => {
        const Icon = rule.icon;
        return (
          <motion.div
            key={rule.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="bg-white rounded-xl p-6 text-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-12 h-12 rounded-full bg-[#F8F8F8] flex items-center justify-center mx-auto mb-3"
            >
              <Icon size={24} className="text-[#2E7D5E]" />
            </motion.div>
            <h4 className="font-serif text-base font-semibold text-[#333333] mb-1">{rule.title}</h4>
            <p className="text-sm text-[#000000] font-medium mb-0.5">{rule.desc}</p>
            <p className="text-xs text-[#666666]">{rule.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Points Detail ─── */
function PointsDetail() {
  const [tab, setTab] = useState<'all' | 'earn' | 'spend'>('all');
  const filtered = tab === 'all' ? POINTS_HISTORY : POINTS_HISTORY.filter((p) => p.type === tab);
  const totalEarn = POINTS_HISTORY.filter((p) => p.type === 'earn').reduce((s, p) => s + p.value, 0);
  const totalSpend = POINTS_HISTORY.filter((p) => p.type === 'spend').reduce((s, p) => s + Math.abs(p.value), 0);

  const tabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'earn' as const, label: '获得' },
    { key: 'spend' as const, label: '使用' },
  ];

  return (
    <div>
      <div className="bg-white rounded-xl p-6 mb-6 flex items-center justify-between">
        <div>
          <div className="text-4xl md:text-5xl font-bold text-[#D43C33]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {CURRENT_POINTS.toLocaleString()}
          </div>
          <div className="text-sm text-[#666666] mt-1">当前积分</div>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-lg font-bold text-[#2E7D5E]" style={{ fontFamily: 'Inter, sans-serif' }}>
              +{totalEarn.toLocaleString()}
            </div>
            <div className="text-xs text-[#666666]">本月获得</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[#D43C33]" style={{ fontFamily: 'Inter, sans-serif' }}>
              -{totalSpend.toLocaleString()}
            </div>
            <div className="text-xs text-[#666666]">本月使用</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === t.key ? '#2E7D5E' : '#F8F8F8',
              color: tab === t.key ? '#FFFFFF' : '#666666',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {filtered.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="bg-white rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: record.type === 'earn' ? 'rgba(46,125,94,0.1)' : 'rgba(212,60,51,0.1)' }}
                >
                  {record.type === 'earn' ? (
                    <ArrowUp size={14} className="text-[#2E7D5E]" />
                  ) : (
                    <ArrowDown size={14} className="text-[#D43C33]" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#000000]">{record.desc}</div>
                  <div className="text-xs text-[#C8B6A6]">{record.detail}</div>
                  <div className="text-xs text-[#C8B6A6] mt-0.5">{record.date}</div>
                </div>
              </div>
              <div
                className="text-base font-bold"
                style={{
                  color: record.type === 'earn' ? '#2E7D5E' : '#D43C33',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {record.type === 'earn' ? '+' : ''}{record.value}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-center mt-6">
        <button className="px-6 py-2 border border-[#C8B6A6] text-[#666666] text-sm rounded-full hover:bg-[#F8F8F8] transition-colors">
          加载更多
        </button>
      </div>
    </div>
  );
}

/* ─── Exclusive Coupons ─── */
function ExclusiveCoupons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {EXCLUSIVE_COUPONS.map((coupon, index) => {
        const tier = TIERS.find((t) => t.key === coupon.tier)!;
        const isCurrent = coupon.tier === CURRENT_TIER.key;
        return (
          <motion.div
            key={coupon.tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white rounded-xl p-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            style={{
              border: isCurrent ? '2px solid #2E7D5E' : '1px solid #F0EBE3',
            }}
          >
            {isCurrent && (
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#D43C33] text-white text-[10px] rounded-full">
                当前可领
              </span>
            )}
            <div className="pt-6 text-center">
              <div className="text-3xl font-bold text-[#D43C33] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                {coupon.value}
              </div>
              <h4 className="font-serif text-base font-semibold text-[#333333] mb-1">{coupon.name}</h4>
              <p className="text-xs text-[#666666] mb-4">{coupon.desc}</p>
              <button
                className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: isCurrent ? '#2E7D5E' : '#F8F8F8',
                  color: isCurrent ? '#FFFFFF' : '#666666',
                }}
              >
                {isCurrent ? '立即领取' : '升级解锁'}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Main Member Page ─── */
export default function Member() {
  const [showPointsDetail, setShowPointsDetail] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#F5F2EB]">
      {/* Hero / Tier Section */}
      <div
        className="relative py-16 md:py-20"
        style={{ background: 'linear-gradient(to bottom, #F5F2EB, #F8F8F8)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url(/trace-bg.jpg)', backgroundSize: 'cover' }}
        />
        <div className="relative max-w-[960px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#000000] mb-2">
              会员等级
            </h1>
            <p className="text-sm text-[#666666]">越买越省，尊享更多地道特权</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {TIERS.map((tier, index) => (
              <TierCard
                key={tier.key}
                tier={tier}
                isCurrent={tier.key === CURRENT_TIER.key}
                index={index}
              />
            ))}
          </div>

          <ProgressBar />
        </div>
      </div>

      {/* Benefits Comparison */}
      <div className="max-w-[960px] mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-2xl font-semibold text-[#000000] mb-8 text-center"
        >
          等级权益对比
        </motion.h2>
        <div className="bg-white rounded-xl overflow-hidden">
          <BenefitsTable />
        </div>
      </div>

      {/* Points Rules */}
      <div className="bg-[#F8F8F8] py-16">
        <div className="max-w-[960px] mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-2xl font-semibold text-[#000000] mb-8 text-center"
          >
            积分规则
          </motion.h2>
          <PointsRules />
        </div>
      </div>

      {/* Points History Entry */}
      <div className="max-w-[960px] mx-auto px-4 py-12">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onClick={() => setShowPointsDetail(!showPointsDetail)}
          className="w-full bg-white rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
        >
          <div>
            <div className="text-4xl md:text-5xl font-bold text-[#D43C33]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {CURRENT_POINTS.toLocaleString()}
            </div>
            <div className="text-sm text-[#666666] mt-1">当前积分</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#333333]">积分明细</span>
            <motion.div
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={20} className="text-[#666666]" />
            </motion.div>
          </div>
        </motion.button>

        <AnimatePresence>
          {showPointsDetail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="overflow-hidden mt-6"
            >
              <PointsDetail />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exclusive Coupons */}
      <div className="max-w-[960px] mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-2xl font-semibold text-[#000000] mb-8 text-center"
        >
          会员专属活动
        </motion.h2>
        <ExclusiveCoupons />
      </div>
    </div>
  );
}
