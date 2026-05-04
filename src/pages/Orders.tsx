import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Copy,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  ImagePlus,
  X,
  Circle,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── Types ─── */
type OrderStatus =
  | 'pending_payment'
  | 'pending_shipment'
  | 'shipped'
  | 'completed'
  | 'after_sales';

interface OrderProduct {
  id: string;
  name: string;
  spec: string;
  price: number;
  quantity: number;
  image: string;
}

interface LogisticsNode {
  time: string;
  location: string;
  status: string;
}

interface Order {
  id: string;
  orderNo: string;
  date: string;
  status: OrderStatus;
  products: OrderProduct[];
  total: number;
  shippingFee: number;
  discount: number;
  actualPay: number;
  address: string;
  receiver: string;
  phone: string;
  payMethod?: string;
  logistics?: {
    company: string;
    trackingNo: string;
    nodes: LogisticsNode[];
  };
  afterSalesStatus?: string;
  countdown?: number; // seconds remaining for payment
}

/* ─── Mock Data ─── */
const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    orderNo: 'DD20241201001',
    date: '2024-12-01 14:32',
    status: 'pending_payment',
    products: [
      {
        id: 'p1',
        name: '五常稻花香大米',
        spec: '5kg / 真空包装',
        price: 89.0,
        quantity: 2,
        image: '/product-placeholder.jpg',
      },
      {
        id: 'p2',
        name: '西湖龙井明前茶',
        spec: '250g / 特级',
        price: 268.0,
        quantity: 1,
        image: '/product-placeholder.jpg',
      },
    ],
    total: 446.0,
    shippingFee: 0,
    discount: 20,
    actualPay: 426.0,
    address: '浙江省杭州市西湖区文三路 168 号',
    receiver: '张先生',
    phone: '138****1234',
    countdown: 7200,
  },
  {
    id: '2',
    orderNo: 'DD20241128002',
    date: '2024-11-28 09:15',
    status: 'pending_shipment',
    products: [
      {
        id: 'p3',
        name: '新疆和田大枣',
        spec: '1kg / 礼盒装',
        price: 58.0,
        quantity: 1,
        image: '/product-placeholder.jpg',
      },
    ],
    total: 58.0,
    shippingFee: 12.0,
    discount: 0,
    actualPay: 70.0,
    address: '北京市朝阳区建国路 88 号',
    receiver: '李女士',
    phone: '139****5678',
  },
  {
    id: '3',
    orderNo: 'DD20241120003',
    date: '2024-11-20 16:45',
    status: 'shipped',
    products: [
      {
        id: 'p4',
        name: '云南普洱茶饼',
        spec: '357g / 熟茶',
        price: 158.0,
        quantity: 1,
        image: '/product-placeholder.jpg',
      },
      {
        id: 'p5',
        name: '阳澄湖大闸蟹礼券',
        spec: '公4两母3两 8只',
        price: 388.0,
        quantity: 1,
        image: '/product-placeholder.jpg',
      },
    ],
    total: 546.0,
    shippingFee: 0,
    discount: 30,
    actualPay: 516.0,
    address: '上海市浦东新区陆家嘴环路 1000 号',
    receiver: '王先生',
    phone: '136****9012',
    payMethod: '微信支付',
    logistics: {
      company: '顺丰速运',
      trackingNo: 'SF1234567890',
      nodes: [
        { time: '2024-11-21 08:30', location: '昆明', status: '已揽收' },
        { time: '2024-11-21 14:20', location: '昆明转运中心', status: '运输中' },
        { time: '2024-11-22 06:10', location: '上海', status: '派送中' },
      ],
    },
  },
  {
    id: '4',
    orderNo: 'DD20241110004',
    date: '2024-11-10 11:22',
    status: 'completed',
    products: [
      {
        id: 'p6',
        name: '武夷岩茶大红袍',
        spec: '500g / 特级',
        price: 198.0,
        quantity: 1,
        image: '/product-placeholder.jpg',
      },
    ],
    total: 198.0,
    shippingFee: 12.0,
    discount: 0,
    actualPay: 210.0,
    address: '广东省深圳市福田区深南大道 1001 号',
    receiver: '陈女士',
    phone: '137****3456',
    payMethod: '支付宝',
    logistics: {
      company: '中通快递',
      trackingNo: 'ZT9876543210',
      nodes: [
        { time: '2024-11-11 09:00', location: '武夷山', status: '已揽收' },
        { time: '2024-11-12 15:30', location: '深圳', status: '已签收' },
      ],
    },
  },
  {
    id: '5',
    orderNo: 'DD20241105005',
    date: '2024-11-05 20:18',
    status: 'after_sales',
    products: [
      {
        id: 'p7',
        name: '赣南脐橙',
        spec: '10斤 / 精品果',
        price: 68.0,
        quantity: 2,
        image: '/product-placeholder.jpg',
      },
    ],
    total: 136.0,
    shippingFee: 0,
    discount: 0,
    actualPay: 136.0,
    address: '江苏省南京市鼓楼区中山路 200 号',
    receiver: '刘先生',
    phone: '135****7890',
    payMethod: '微信支付',
    afterSalesStatus: '退款审核中',
  },
  {
    id: '6',
    orderNo: 'DD20241030006',
    date: '2024-10-30 13:50',
    status: 'completed',
    products: [
      {
        id: 'p8',
        name: '东北黑木耳',
        spec: '250g / 野生',
        price: 45.0,
        quantity: 3,
        image: '/product-placeholder.jpg',
      },
    ],
    total: 135.0,
    shippingFee: 12.0,
    discount: 10,
    actualPay: 137.0,
    address: '四川省成都市锦江区人民南路 300 号',
    receiver: '赵女士',
    phone: '133****2468',
    payMethod: '微信支付',
  },
];

/* ─── Constants ─── */
const TABS = [
  { key: 'all' as const, label: '全部' },
  { key: 'pending_payment' as OrderStatus, label: '待付款' },
  { key: 'pending_shipment' as OrderStatus, label: '待发货' },
  { key: 'shipped' as OrderStatus, label: '已发货' },
  { key: 'completed' as OrderStatus, label: '已完成' },
  { key: 'after_sales' as OrderStatus, label: '售后' },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg?: string }
> = {
  pending_payment: { label: '待付款', color: '#D43C33' },
  pending_shipment: { label: '待发货', color: '#C8B6A6' },
  shipped: { label: '已发货', color: '#2E7D5E' },
  completed: { label: '已完成', color: '#333333' },
  after_sales: {
    label: '售后中',
    color: '#FFFFFF',
    bg: '#D43C33',
  },
};

/* ─── Helpers ─── */
function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ─── Progress Bar Component ─── */
function OrderProgressBar({ status }: { status: OrderStatus }) {
  const steps = [
    { key: 'placed', label: '已下单' },
    { key: 'paid', label: '已付款' },
    { key: 'shipped', label: '已发货' },
    { key: 'received', label: '已签收' },
  ];

  const currentStep =
    status === 'pending_payment'
      ? 0
      : status === 'pending_shipment'
      ? 1
      : status === 'shipped'
      ? 2
      : 3;

  return (
    <div className="py-6">
      <div className="flex items-center justify-between relative">
        {/* Connecting lines */}
        <div className="absolute top-[14px] left-[12%] right-[12%] h-[2px] bg-[#C8B6A6]">
          <motion.div
            className="h-full bg-[#2E7D5E]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: currentStep / 3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ transformOrigin: 'left' }}
          />
        </div>

        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;
          return (
            <div
              key={step.key}
              className="flex flex-col items-center relative z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: index * 0.2,
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                }}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center border-2',
                  isActive
                    ? 'bg-[#2E7D5E] border-[#2E7D5E]'
                    : 'bg-white border-[#C8B6A6]'
                )}
              >
                {isActive ? (
                  <CheckCircle size={16} className="text-white" />
                ) : (
                  <Circle size={16} className="text-[#C8B6A6]" />
                )}
              </motion.div>
              <span
                className={cn(
                  'text-xs mt-2',
                  isActive ? 'text-[#2E7D5E]' : 'text-[#C8B6A6]'
                )}
              >
                {step.label}
              </span>
              {isCurrent && (
                <motion.div
                  className="absolute top-0 w-7 h-7 rounded-full border-2 border-[#2E7D5E]"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Logistics Modal ─── */
function LogisticsModal({
  open,
  logistics,
  onClose,
}: {
  open: boolean;
  logistics: Order['logistics'];
  onClose: () => void;
}) {
  if (!logistics) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold text-[#333333]">
                  物流信息
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-[#F5F2EB] rounded-full">
                  <X size={20} className="text-[#666666]" />
                </button>
              </div>
              <div className="bg-[#F8F8F8] rounded-lg p-4 mb-6">
                <p className="text-sm text-[#333333] mb-1">
                  {logistics.company}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-[#666666]">{logistics.trackingNo}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(logistics.trackingNo);
                      alert('已复制运单号');
                    }}
                    className="p-1 hover:bg-[#C8B6A6]/20 rounded"
                  >
                    <Copy size={14} className="text-[#C8B6A6]" />
                  </button>
                </div>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-[#C8B6A6]" />
                {logistics.nodes.map((node, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pb-6 last:pb-0"
                  >
                    <div
                      className={cn(
                        'absolute left-[-17px] top-1 w-3 h-3 rounded-full border-2',
                        i === 0
                          ? 'bg-[#2E7D5E] border-[#2E7D5E]'
                          : 'bg-white border-[#C8B6A6]'
                      )}
                    />
                    <p className="text-sm text-[#333333] font-medium mb-1">
                      {node.status}
                    </p>
                    <p className="text-xs text-[#C8B6A6]">
                      {node.time} · {node.location}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Payment Page ─── */
function PaymentPage({
  order,
  onBack,
  onSuccess,
}: {
  order: Order;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(order.countdown || 900);
  const [method, setMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#F5F2EB] pt-[72px]">
      <div className="max-w-[560px] mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="text-sm text-[#666666] hover:text-[#2E7D5E] mb-6 flex items-center gap-1"
        >
          <ChevronRight size={16} className="rotate-180" />
          返回订单
        </button>

        {/* Countdown */}
        <div className="bg-white rounded-xl p-4 mb-4 flex items-center gap-3">
          <Clock size={18} className="text-[#D43C33]" />
          <p className="text-sm text-[#333333]">
            请在{' '}
            <span className="text-[#D43C33] font-semibold">
              {formatTime(timeLeft)}
            </span>{' '}
            内完成支付，否则订单将自动取消
          </p>
        </div>

        {/* Amount */}
        <div className="text-center py-8">
          <p className="text-sm text-[#666666] mb-2">支付金额</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={order.actualPay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-bold text-[#D43C33]"
            >
              ¥{order.actualPay.toFixed(2)}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Methods */}
        <div className="space-y-3 mb-8">
          {[
            { key: 'wechat' as const, label: '微信支付', icon: CreditCard },
            { key: 'alipay' as const, label: '支付宝', icon: CreditCard },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMethod(m.key)}
              className={cn(
                'w-full bg-white rounded-xl p-4 flex items-center gap-4 border-2 transition-all',
                method === m.key
                  ? 'border-[#2E7D5E] bg-[rgba(46,125,94,0.05)]'
                  : 'border-transparent hover:border-[#C8B6A6]'
              )}
            >
              <m.icon size={24} className="text-[#2E7D5E]" />
              <span className="flex-1 text-left text-sm text-[#333333]">
                {m.label}
              </span>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  method === m.key
                    ? 'border-[#2E7D5E] bg-[#2E7D5E]'
                    : 'border-[#C8B6A6]'
                )}
              >
                {method === m.key && <CheckCircle size={14} className="text-white" />}
              </div>
            </button>
          ))}
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading || timeLeft <= 0}
          className={cn(
            'w-full h-14 rounded-full text-white text-base font-medium transition-all',
            loading || timeLeft <= 0
              ? 'bg-[#C8B6A6] cursor-not-allowed'
              : 'bg-[#2E7D5E] hover:bg-[#256a4e] active:scale-95'
          )}
        >
          {loading ? '支付中...' : timeLeft <= 0 ? '订单已取消' : '确认支付'}
        </button>
      </div>
    </div>
  );
}

/* ─── After-sales Page ─── */
function AfterSalesPage({
  order,
  onBack,
  onSubmit,
}: {
  order: Order;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [type, setType] = useState<'return' | 'exchange' | 'refund'>('refund');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleImageAdd = () => {
    if (images.length >= 6) return;
    setImages((prev) => [...prev, '/product-placeholder.jpg']);
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#F5F2EB] pt-[72px]">
      <div className="max-w-[720px] mx-auto px-6 py-8 pb-24">
        <button
          onClick={onBack}
          className="text-sm text-[#666666] hover:text-[#2E7D5E] mb-6 flex items-center gap-1"
        >
          <ChevronRight size={16} className="rotate-180" />
          返回订单
        </button>

        <h2 className="font-serif text-xl font-semibold text-[#333333] mb-6">
          申请售后
        </h2>

        {/* Order Info */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <p className="text-xs text-[#C8B6A6] mb-2">关联订单</p>
          <div className="flex items-center gap-3">
            <img
              src={order.products[0]?.image}
              alt=""
              className="w-14 h-14 rounded-lg object-cover bg-[#F5F2EB]"
            />
            <div>
              <p className="text-sm text-[#333333]">{order.orderNo}</p>
              <p className="text-xs text-[#C8B6A6]">{order.date}</p>
            </div>
          </div>
        </div>

        {/* Type Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(
            [
              { key: 'return' as const, label: '退货', desc: '退回商品并退款' },
              { key: 'exchange' as const, label: '换货', desc: '更换同款商品' },
              { key: 'refund' as const, label: '退款', desc: '仅退款不退货' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={cn(
                'bg-white rounded-xl p-4 text-center border-2 transition-all active:scale-95',
                type === t.key
                  ? 'border-[#2E7D5E] bg-[rgba(46,125,94,0.05)]'
                  : 'border-transparent hover:border-[#C8B6A6]'
              )}
            >
              <RotateCcw
                size={20}
                className={cn(
                  'mx-auto mb-2',
                  type === t.key ? 'text-[#2E7D5E]' : 'text-[#C8B6A6]'
                )}
              />
              <p className="text-sm font-medium text-[#333333] mb-1">
                {t.label}
              </p>
              <p className="text-xs text-[#C8B6A6]">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Reason */}
        <div className="mb-6">
          <label className="block text-sm text-[#333333] mb-2">售后原因</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm text-[#333333] border border-[#C8B6A6] focus:border-[#2E7D5E] focus:ring-1 focus:ring-[#2E7D5E] outline-none transition-colors"
          >
            <option value="">请选择原因</option>
            <option value="quality">质量问题</option>
            <option value="spec">规格不符</option>
            <option value="damage">物流破损</option>
            <option value="other">其他</option>
          </select>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm text-[#333333] mb-2">问题描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="请详细描述您遇到的问题..."
            className="w-full bg-white rounded-xl px-4 py-3 text-sm text-[#333333] border border-[#C8B6A6] focus:border-[#2E7D5E] focus:ring-1 focus:ring-[#2E7D5E] outline-none transition-colors resize-none"
          />
        </div>

        {/* Images */}
        <div className="mb-8">
          <label className="block text-sm text-[#333333] mb-2">
            上传凭证（最多6张）
          </label>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative w-20 h-20 rounded-lg overflow-hidden"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleImageRemove(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {images.length < 6 && (
              <button
                onClick={handleImageAdd}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-[#C8B6A6] flex flex-col items-center justify-center gap-1 hover:border-[#2E7D5E] hover:bg-[rgba(46,125,94,0.05)] transition-colors"
              >
                <ImagePlus size={20} className="text-[#C8B6A6]" />
                <span className="text-xs text-[#C8B6A6]">上传</span>
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!reason}
          className={cn(
            'w-full h-14 rounded-full text-white text-base font-medium transition-all',
            !reason
              ? 'bg-[#C8B6A6] cursor-not-allowed'
              : 'bg-[#2E7D5E] hover:bg-[#256a4e] active:scale-95'
          )}
        >
          提交申请
        </button>
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-6 w-[360px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg font-semibold text-[#333333] mb-2">
              {title}
            </h3>
            <p className="text-sm text-[#666666] mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 h-11 rounded-full border border-[#C8B6A6] text-[#333333] text-sm font-medium hover:bg-[#F5F2EB] transition-colors"
              >
                取消
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 h-11 rounded-full bg-[#2E7D5E] text-white text-sm font-medium hover:bg-[#256a4e] transition-colors"
              >
                确定
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Order Detail View ─── */
function OrderDetailView({
  order,
  onBack,
  onPay,
  onCancel,
  onAfterSales,
  onConfirmReceipt,
}: {
  order: Order;
  onBack: () => void;
  onPay: (order: Order) => void;
  onCancel: (order: Order) => void;
  onAfterSales: (order: Order) => void;
  onConfirmReceipt: (order: Order) => void;
}) {
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#F5F2EB] pt-[72px]">
      <div className="max-w-[960px] mx-auto px-6 py-8 pb-24">
        <button
          onClick={onBack}
          className="text-sm text-[#666666] hover:text-[#2E7D5E] mb-6 flex items-center gap-1"
        >
          <ChevronRight size={16} className="rotate-180" />
          返回订单列表
        </button>

        {/* Status Header */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: statusConfig.color + '15' }}
              >
                {order.status === 'pending_payment' && <Clock size={20} style={{ color: statusConfig.color }} />}
                {order.status === 'pending_shipment' && <Package size={20} style={{ color: statusConfig.color }} />}
                {order.status === 'shipped' && <Truck size={20} style={{ color: statusConfig.color }} />}
                {order.status === 'completed' && <CheckCircle size={20} style={{ color: statusConfig.color }} />}
                {order.status === 'after_sales' && <AlertCircle size={20} style={{ color: statusConfig.color }} />}
              </div>
              <div>
                <p className="font-serif text-lg font-semibold" style={{ color: statusConfig.color }}>
                  {statusConfig.label}
                </p>
                <p className="text-xs text-[#C8B6A6]">
                  {order.status === 'pending_payment' && '请在倒计时内完成支付'}
                  {order.status === 'pending_shipment' && '商家正在备货中'}
                  {order.status === 'shipped' && '商品运输中，请耐心等待'}
                  {order.status === 'completed' && '订单已完成，感谢您的购买'}
                  {order.status === 'after_sales' && order.afterSalesStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {(order.status === 'pending_shipment' ||
            order.status === 'shipped' ||
            order.status === 'completed') && (
            <OrderProgressBar status={order.status} />
          )}
        </div>

        {/* Logistics Card */}
        {order.logistics && (
          <div className="bg-white rounded-xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={16} className="text-[#2E7D5E]" />
              <span className="text-sm font-medium text-[#333333]">
                物流信息
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]">
                  {order.logistics.company} · {order.logistics.trackingNo}
                </p>
                <p className="text-xs text-[#C8B6A6] mt-1">
                  {order.logistics.nodes[0]?.status} ·{' '}
                  {order.logistics.nodes[0]?.time}
                </p>
              </div>
              <button
                onClick={() => setLogisticsOpen(true)}
                className="flex items-center gap-1 text-sm text-[#2E7D5E] hover:underline"
              >
                查看详情
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Address */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-[#2E7D5E]" />
            <span className="text-sm font-medium text-[#333333]">
              收货地址
            </span>
          </div>
          <p className="text-sm text-[#333333] mb-1">{order.address}</p>
          <p className="text-xs text-[#C8B6A6]">
            {order.receiver} · {order.phone}
          </p>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <p className="text-sm font-medium text-[#333333] mb-4">商品明细</p>
          <div className="space-y-4">
            {order.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F5F2EB] flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm text-[#333333] truncate mb-1">
                    {product.name}
                  </h4>
                  <p className="text-xs text-[#C8B6A6] mb-1">{product.spec}</p>
                  <p className="text-xs text-[#333333]">
                    ¥{product.price.toFixed(2)} × {product.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#D43C33] flex-shrink-0">
                  ¥{(product.price * product.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <p className="text-sm font-medium text-[#333333] mb-4">金额明细</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#666666]">
              <span>商品总金额</span>
              <span>¥{order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>运费</span>
              <span>{order.shippingFee > 0 ? `¥${order.shippingFee.toFixed(2)}` : '免运费'}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#D43C33]">
                <span>优惠券抵扣</span>
                <span>-¥{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-[#F5F2EB] pt-3 flex justify-between items-baseline">
              <span className="text-[#333333] font-medium">实付金额</span>
              <span className="text-xl font-bold text-[#D43C33]">
                ¥{order.actualPay.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <p className="text-sm font-medium text-[#333333] mb-3">订单信息</p>
          <div className="space-y-2 text-xs text-[#666666]">
            <div className="flex justify-between">
              <span>订单编号</span>
              <span className="text-[#333333]">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span>下单时间</span>
              <span className="text-[#333333]">{order.date}</span>
            </div>
            {order.payMethod && (
              <div className="flex justify-between">
                <span>支付方式</span>
                <span className="text-[#333333]">{order.payMethod}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#C8B6A6] z-40">
          <div className="max-w-[960px] mx-auto px-6 h-[72px] flex items-center justify-end gap-3">
            {order.status === 'pending_payment' && (
              <>
                <button
                  onClick={() => onCancel(order)}
                  className="h-10 px-6 rounded-full border border-[#C8B6A6] text-sm text-[#333333] hover:bg-[#F5F2EB] transition-colors active:scale-95"
                >
                  取消订单
                </button>
                <button
                  onClick={() => onPay(order)}
                  className="h-10 px-6 rounded-full bg-[#2E7D5E] text-white text-sm font-medium hover:bg-[#256a4e] transition-colors active:scale-95"
                >
                  立即支付
                </button>
              </>
            )}
            {order.status === 'pending_shipment' && (
              <button
                onClick={() => onCancel(order)}
                className="h-10 px-6 rounded-full border border-[#C8B6A6] text-sm text-[#333333] hover:bg-[#F5F2EB] transition-colors active:scale-95"
              >
                取消订单
              </button>
            )}
            {order.status === 'shipped' && (
              <>
                <button
                  onClick={() => setLogisticsOpen(true)}
                  className="h-10 px-6 rounded-full border border-[#C8B6A6] text-sm text-[#333333] hover:bg-[#F5F2EB] transition-colors active:scale-95"
                >
                  查看物流
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="h-10 px-6 rounded-full bg-[#2E7D5E] text-white text-sm font-medium hover:bg-[#256a4e] transition-colors active:scale-95"
                >
                  确认收货
                </button>
              </>
            )}
            {order.status === 'completed' && (
              <>
                <button
                  onClick={() => onAfterSales(order)}
                  className="h-10 px-6 rounded-full border border-[#C8B6A6] text-sm text-[#333333] hover:bg-[#F5F2EB] transition-colors active:scale-95"
                >
                  申请售后
                </button>
                <Link
                  to="/"
                  className="h-10 px-6 rounded-full bg-[#2E7D5E] text-white text-sm font-medium leading-10 hover:bg-[#256a4e] transition-colors active:scale-95 inline-block text-center"
                >
                  再次购买
                </Link>
              </>
            )}
            {order.status === 'after_sales' && (
              <div className="h-10 px-6 rounded-full bg-[rgba(212,60,51,0.1)] text-sm text-[#D43C33] flex items-center">
                {order.afterSalesStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      <LogisticsModal
        open={logisticsOpen}
        logistics={order.logistics}
        onClose={() => setLogisticsOpen(false)}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="确认收货"
        message="确认已收到商品？确认后订单将标记为已完成。"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onConfirmReceipt(order);
        }}
      />
    </div>
  );
}

/* ─── Main Orders Page ─── */
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('all');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [afterSalesOrder, setAfterSalesOrder] = useState<Order | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; order: Order | null }>({
    open: false,
    order: null,
  });

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TABS.forEach((tab) => {
      if (tab.key === 'all') {
        counts[tab.key] = orders.length;
      } else {
        counts[tab.key] = orders.filter((o) => o.status === tab.key).length;
      }
    });
    return counts;
  }, [orders]);

  const handleCancelOrder = (order: Order) => {
    setCancelDialog({ open: true, order });
  };

  const confirmCancel = () => {
    if (!cancelDialog.order) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelDialog.order!.id
          ? { ...o, status: 'after_sales' as OrderStatus, afterSalesStatus: '已取消' }
          : o
      )
    );
    setCancelDialog({ open: false, order: null });
  };

  const handlePay = (order: Order) => {
    setPaymentOrder(order);
    setSelectedOrder(null);
  };

  const handlePaySuccess = () => {
    if (!paymentOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === paymentOrder.id
          ? { ...o, status: 'pending_shipment' as OrderStatus, countdown: undefined }
          : o
      )
    );
    setPaymentOrder(null);
  };

  const handleAfterSales = (order: Order) => {
    setAfterSalesOrder(order);
    setSelectedOrder(null);
  };

  const handleAfterSalesSubmit = () => {
    if (!afterSalesOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === afterSalesOrder.id
          ? { ...o, status: 'after_sales' as OrderStatus, afterSalesStatus: '退款审核中' }
          : o
      )
    );
    setAfterSalesOrder(null);
  };

  const handleConfirmReceipt = (order: Order) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: 'completed' as OrderStatus } : o
      )
    );
    setSelectedOrder(null);
  };

  /* ─── Payment Page Render ─── */
  if (paymentOrder) {
    return (
      <PaymentPage
        order={paymentOrder}
        onBack={() => setPaymentOrder(null)}
        onSuccess={handlePaySuccess}
      />
    );
  }

  /* ─── After Sales Page Render ─── */
  if (afterSalesOrder) {
    return (
      <AfterSalesPage
        order={afterSalesOrder}
        onBack={() => setAfterSalesOrder(null)}
        onSubmit={handleAfterSalesSubmit}
      />
    );
  }

  /* ─── Order Detail Render ─── */
  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onPay={handlePay}
        onCancel={handleCancelOrder}
        onAfterSales={handleAfterSales}
        onConfirmReceipt={handleConfirmReceipt}
      />
    );
  }

  /* ─── Order List Render ─── */
  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#F5F2EB] pt-[72px]">
      {/* Header */}
      <div className="border-b border-[#C8B6A6]">
        <div className="max-w-[960px] mx-auto px-6 py-6">
          <h1 className="font-serif text-[28px] font-semibold text-black mb-4">
            我的订单
          </h1>

          {/* Tabs */}
          <div className="flex gap-6 overflow-x-auto pb-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative pb-3 text-sm font-medium whitespace-nowrap transition-colors',
                    isActive ? 'text-[#2E7D5E]' : 'text-[#666666] hover:text-[#333333]'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {tab.label}
                    {tabCounts[tab.key] > 0 && (
                      <span
                        className={cn(
                          'min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center px-1',
                          isActive
                            ? 'bg-[#D43C33] text-white'
                            : 'bg-[#C8B6A6]/30 text-[#666666]'
                        )}
                      >
                        {tabCounts[tab.key]}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="order-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2E7D5E]"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="max-w-[960px] mx-auto px-6 py-6 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <Package size={48} className="text-[#C8B6A6] mx-auto mb-4" />
                <p className="font-serif text-lg text-[#666666] mb-2">
                  暂无{activeTab === 'all' ? '' : TABS.find((t) => t.key === activeTab)?.label}订单
                </p>
                <Link
                  to="/"
                  className="text-sm text-[#2E7D5E] hover:underline"
                >
                  去逛逛
                </Link>
              </div>
            ) : (
              filteredOrders.map((order, index) => {
                const statusConfig = STATUS_CONFIG[order.status];
                const totalItems = order.products.reduce(
                  (sum, p) => sum + p.quantity,
                  0
                );

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="bg-white rounded-xl overflow-hidden"
                  >
                    {/* Card Header */}
                    <div
                      className="px-4 py-3 flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#C8B6A6]">
                          {order.orderNo}
                        </span>
                        <span className="text-xs text-[#C8B6A6]">
                          {order.date}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          statusConfig.bg
                            ? 'text-white'
                            : ''
                        )}
                        style={
                          statusConfig.bg
                            ? { backgroundColor: statusConfig.bg, color: statusConfig.color }
                            : { color: statusConfig.color }
                        }
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Products */}
                    <div
                      className="px-4 py-3 flex items-center gap-3 border-t border-[#F5F2EB] cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex -space-x-2">
                        {order.products.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white bg-[#F5F2EB]"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.products.length > 3 && (
                          <div className="w-16 h-16 rounded-lg bg-[#F5F2EB] border-2 border-white flex items-center justify-center text-xs text-[#666666]">
                            +{order.products.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#333333] truncate">
                          {order.products[0].name}
                          {order.products.length > 1 &&
                            ` 等 ${order.products.length} 件商品`}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-[#C8B6A6] flex-shrink-0" />
                    </div>

                    {/* Amount & Actions */}
                    <div className="px-4 py-3 border-t border-[#F5F2EB] flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#666666]">
                          共 {totalItems} 件，合计
                        </span>
                        <span className="text-lg font-bold text-[#D43C33] ml-1">
                          ¥{order.actualPay.toFixed(2)}
                        </span>
                        <span className="text-xs text-[#C8B6A6] ml-1">
                          {order.shippingFee > 0 ? `（含运费¥${order.shippingFee.toFixed(0)}）` : '（免运费）'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'pending_payment' && (
                          <>
                            <button
                              onClick={() => handleCancelOrder(order)}
                              className="h-9 px-4 rounded-full border border-[#C8B6A6] text-xs text-[#333333] hover:bg-[#F5F2EB] transition-colors active:scale-95"
                            >
                              取消订单
                            </button>
                            <button
                              onClick={() => handlePay(order)}
                              className="h-9 px-4 rounded-full bg-[#2E7D5E] text-white text-xs font-medium hover:bg-[#256a4e] transition-colors active:scale-95"
                            >
                              立即支付
                            </button>
                          </>
                        )}
                        {order.status === 'pending_shipment' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="h-9 px-4 rounded-full border border-[#C8B6A6] text-xs text-[#333333] hover:bg-[#F5F2EB] transition-colors active:scale-95"
                          >
                            取消订单
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="h-9 px-4 rounded-full border border-[#C8B6A6] text-xs text-[#333333] hover:bg-[#F5F2EB] transition-colors active:scale-95"
                            >
                              查看物流
                            </button>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="h-9 px-4 rounded-full bg-[#2E7D5E] text-white text-xs font-medium hover:bg-[#256a4e] transition-colors active:scale-95"
                            >
                              确认收货
                            </button>
                          </>
                        )}
                        {order.status === 'completed' && (
                          <>
                            <button
                              onClick={() => handleAfterSales(order)}
                              className="h-9 px-4 rounded-full border border-[#C8B6A6] text-xs text-[#333333] hover:bg-[#F5F2EB] transition-colors active:scale-95"
                            >
                              申请售后
                            </button>
                            <Link
                              to="/"
                              className="h-9 px-4 rounded-full bg-[#2E7D5E] text-white text-xs font-medium hover:bg-[#256a4e] transition-colors active:scale-95 inline-flex items-center"
                            >
                              再次购买
                            </Link>
                          </>
                        )}
                        {order.status === 'after_sales' && (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="h-9 px-4 rounded-full border border-[#C8B6A6] text-xs text-[#333333] hover:bg-[#F5F2EB] transition-colors active:scale-95"
                          >
                            查看进度
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={cancelDialog.open}
        title="取消订单"
        message={
          cancelDialog.order?.status === 'pending_shipment'
            ? '订单已付款，取消需商家审核，确认申请取消？'
            : '确定取消该订单？取消后不可恢复。'
        }
        onCancel={() => setCancelDialog({ open: false, order: null })}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
