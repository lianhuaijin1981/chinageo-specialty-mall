import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Ticket, MapPin, ScanLine, Headphones, RotateCcw,
  Crown, Settings, Lock, Smartphone, Shield, Bell, Trash2,
  ChevronRight, Plus, Edit, X, Star, Check, LogOut, ChevronLeft,
  User, Eye, EyeOff, Save, Home, Building2, GraduationCap,
  HelpCircle, FileText, ShoppingBag, MessageSquare
} from 'lucide-react';

/* ─── Mock Data ─── */
const MOCK_USER = {
  avatar: '/product-placeholder.jpg',
  nickname: '山野食客',
  level: '黄金会员',
  points: 5280,
  orders: 12,
  coupons: 3,
  favorites: 8,
};

interface Address {
  id: number;
  name: string;
  phone: string;
  region: string;
  detail: string;
  tag: '家' | '公司' | '学校';
  isDefault: boolean;
}

const MOCK_ADDRESSES: Address[] = [
  { id: 1, name: '张三', phone: '138****8888', region: '北京市朝阳区', detail: '建国路88号SOHO现代城A座1201室', tag: '家', isDefault: true },
  { id: 2, name: '张三', phone: '138****8888', region: '上海市浦东新区', detail: '陆家嘴环路1000号恒生银行大厦28层', tag: '公司', isDefault: false },
  { id: 3, name: '李四', phone: '139****6666', region: '浙江省杭州市西湖区', detail: '文三路478号华星时代广场B座', tag: '学校', isDefault: false },
];

interface Coupon {
  id: number;
  type: 'amount' | 'discount';
  value: number;
  condition: string;
  name: string;
  validity: string;
  scope: string;
  status: 'unused' | 'used' | 'expired';
}

const MOCK_COUPONS: Coupon[] = [
  { id: 1, type: 'amount', value: 20, condition: '满199可用', name: '新用户专享券', validity: '2024.12.31', scope: '全品类可用', status: 'unused' },
  { id: 2, type: 'amount', value: 50, condition: '满399可用', name: '会员生日礼券', validity: '2024.11.15', scope: '生鲜果蔬可用', status: 'unused' },
  { id: 3, type: 'discount', value: 8, condition: '无门槛', name: '限时折扣券', validity: '2024.10.01', scope: '茶饮酒水可用', status: 'used' },
  { id: 4, type: 'amount', value: 10, condition: '满99可用', name: '运费抵扣券', validity: '2024.09.15', scope: '全品类可用', status: 'expired' },
];

interface PointsRecord {
  id: number;
  type: 'earn' | 'spend';
  description: string;
  detail: string;
  date: string;
  value: number;
}

const MOCK_POINTS: PointsRecord[] = [
  { id: 1, type: 'earn', description: '订单消费奖励', detail: '订单号: 20240901001', date: '2024-09-01 14:30', value: 256 },
  { id: 2, type: 'earn', description: '商品评价奖励', detail: '五常大米 5kg', date: '2024-08-28 09:15', value: 10 },
  { id: 3, type: 'spend', description: '积分抵扣订单', detail: '订单号: 20240825003', date: '2024-08-25 20:00', value: -100 },
  { id: 4, type: 'earn', description: '每日签到奖励', detail: '连续签到7天', date: '2024-08-24 08:00', value: 15 },
  { id: 5, type: 'earn', description: '订单消费奖励', detail: '订单号: 20240820002', date: '2024-08-20 16:45', value: 128 },
  { id: 6, type: 'earn', description: '图文评价奖励', detail: '西湖龙井 250g', date: '2024-08-18 11:20', value: 15 },
  { id: 7, type: 'spend', description: '积分兑换优惠券', detail: '兑换¥20优惠券', date: '2024-08-15 10:00', value: -200 },
];

/* ─── Toast Component ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#333333] text-white px-6 py-3 rounded-full text-sm shadow-lg"
    >
      {message}
    </motion.div>
  );
}

/* ─── Toggle Component ─── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors duration-300"
      style={{ backgroundColor: checked ? '#2E7D5E' : '#C8B6A6' }}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      />
    </button>
  );
}

/* ─── Section Back Button ─── */
function SectionHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-[#F8F8F8] transition-colors"
      >
        <ChevronLeft size={20} className="text-[#333333]" />
      </button>
      <h2 className="font-serif text-xl font-semibold text-[#333333]">{title}</h2>
    </div>
  );
}

/* ─── Address Form Modal ─── */
function AddressFormModal({
  address,
  onSave,
  onClose,
}: {
  address?: Address | null;
  onSave: (a: Address) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Address>>(
    address ?? { name: '', phone: '', region: '', detail: '', tag: '家', isDefault: false }
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-[#333333]">
            {address ? '编辑地址' : '新建地址'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[#F8F8F8] rounded-full transition-colors">
            <X size={20} className="text-[#666666]" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            placeholder="收货人姓名"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-b border-[#C8B6A6] focus:border-[#2E7D5E] focus:border-b-2 outline-none py-2 text-sm text-[#333333] transition-colors"
          />
          <input
            placeholder="手机号码"
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border-b border-[#C8B6A6] focus:border-[#2E7D5E] focus:border-b-2 outline-none py-2 text-sm text-[#333333] transition-colors"
          />
          <input
            placeholder="所在地区（省/市/区）"
            value={form.region || ''}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className="w-full border-b border-[#C8B6A6] focus:border-[#2E7D5E] focus:border-b-2 outline-none py-2 text-sm text-[#333333] transition-colors"
          />
          <textarea
            placeholder="详细地址"
            value={form.detail || ''}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
            rows={2}
            className="w-full border-b border-[#C8B6A6] focus:border-[#2E7D5E] focus:border-b-2 outline-none py-2 text-sm text-[#333333] transition-colors resize-none"
          />
          <div className="flex items-center gap-3">
            {(['家', '公司', '学校'] as const).map((tag) => (
              <button
                key={tag}
                onClick={() => setForm({ ...form, tag })}
                className="px-4 py-1.5 rounded-full text-sm border transition-all"
                style={{
                  borderColor: form.tag === tag ? '#2E7D5E' : '#C8B6A6',
                  color: form.tag === tag ? '#2E7D5E' : '#666666',
                  backgroundColor: form.tag === tag ? 'rgba(46,125,94,0.06)' : 'transparent',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#333333]">设为默认地址</span>
            <Toggle
              checked={form.isDefault ?? false}
              onChange={(v) => setForm({ ...form, isDefault: v })}
            />
          </div>
        </div>
        <button
          onClick={() => {
            if (form.name && form.phone && form.region && form.detail) {
              onSave({
                id: address?.id ?? Date.now(),
                name: form.name,
                phone: form.phone,
                region: form.region,
                detail: form.detail,
                tag: form.tag ?? '家',
                isDefault: form.isDefault ?? false,
              });
              onClose();
            }
          }}
          className="w-full mt-6 bg-[#2E7D5E] text-white py-3 rounded-full text-sm font-medium hover:shadow-lg transition-shadow"
        >
          保存
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Confirm Modal ─── */
function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-6 w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-lg font-semibold text-[#333333] mb-2">{title}</h3>
        <p className="text-sm text-[#666666] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full border border-[#C8B6A6] text-[#333333] text-sm font-medium hover:bg-[#F8F8F8] transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full bg-[#D43C33] text-white text-sm font-medium hover:shadow-lg transition-shadow"
          >
            确认
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Member Card ─── */
function MemberCard() {
  const [cardRevealed, setCardRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCardRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={cardRevealed ? { clipPath: 'inset(0 0 0% 0)' } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-xl mb-6"
      style={{
        background: 'linear-gradient(to bottom, #F5F2EB, #F8F8F8)',
      }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'url(/trace-bg.jpg)', backgroundSize: 'cover' }}
      />
      <div className="relative p-6 md:p-8">
        <div className="flex items-start justify-between">
          {/* Left: Avatar + Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={cardRevealed ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#C8B6A6]">
              <img src={MOCK_USER.avatar} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-serif text-xl md:text-2xl font-semibold text-[#000000]">
                {MOCK_USER.nickname}
              </h2>
              <span
                className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: '#2E7D5E' }}
              >
                {MOCK_USER.level}
              </span>
            </div>
          </motion.div>

          {/* Right: Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={cardRevealed ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-right"
          >
            <div className="text-3xl md:text-4xl font-bold text-[#D43C33]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {MOCK_USER.points.toLocaleString()}
            </div>
            <div className="text-xs text-[#666666] mt-1">我的积分</div>
            <button className="text-xs text-[#2E7D5E] mt-1 hover:underline flex items-center gap-0.5 ml-auto">
              积分明细 <ChevronRight size={12} />
            </button>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={cardRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex items-center justify-around mt-6 pt-4"
          style={{ borderTop: '1px solid rgba(200,182,166,0.3)' }}
        >
          {[
            { label: '我的订单', value: MOCK_USER.orders },
            { label: '优惠券', value: MOCK_USER.coupons },
            { label: '我的收藏', value: MOCK_USER.favorites },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="text-center group"
            >
              <div className="text-lg font-bold text-[#000000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.value}
              </div>
              <div className="text-xs text-[#666666] mt-0.5">{item.label}</div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Quick Actions Grid ─── */
function QuickActionsGrid({ onNavigate }: { onNavigate: (section: string) => void }) {
  const items = [
    { icon: Package, label: '我的订单', section: 'orders' },
    { icon: Ticket, label: '优惠券', section: 'coupons', badge: true },
    { icon: MapPin, label: '收货地址', section: 'addresses' },
    { icon: ScanLine, label: '溯源查询', section: 'traceability' },
    { icon: Headphones, label: '在线客服', section: 'service' },
    { icon: RotateCcw, label: '售后中心', section: 'aftersales' },
    { icon: Crown, label: '会员权益', section: 'member' },
    { icon: Settings, label: '设置', section: 'settings' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {items.map((item, index) => (
        <motion.button
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate(item.section)}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#F8F8F8] transition-colors group"
        >
          <div className="relative">
            <item.icon
              size={28}
              className="text-[#333333] group-hover:text-[#2E7D5E] transition-all duration-300 group-hover:-translate-y-1"
            />
            {item.badge && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D43C33] rounded-full" />
            )}
          </div>
          <span className="text-xs text-[#333333] group-hover:text-[#2E7D5E] transition-colors duration-300">
            {item.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Addresses Section ─── */
function AddressesSection({ onBack }: { onBack: () => void }) {
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);
  const [toast, setToast] = useState('');

  const handleSave = (addr: Address) => {
    if (editing) {
      setAddresses(addresses.map((a) => (a.id === addr.id ? addr : a)));
    } else {
      if (addresses.length >= 10) {
        setToast('最多添加10个地址');
        return;
      }
      setAddresses([...addresses, addr]);
    }
    setEditing(null);
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    setDeleting(null);
  };

  const tagIcons = {
    '家': Home,
    '公司': Building2,
    '学校': GraduationCap,
  };

  return (
    <div>
      <SectionHeader title="收货地址" onBack={onBack} />
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#666666]">共 {addresses.length} 个地址</span>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2E7D5E] text-white text-sm rounded-full hover:shadow-lg transition-shadow"
        >
          <Plus size={16} /> 新建地址
        </button>
      </div>
      <div className="space-y-3">
        <AnimatePresence>
          {addresses.map((addr, index) => {
            const TagIcon = tagIcons[addr.tag];
            return (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="bg-white rounded-xl p-4 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-semibold text-[#000000]">{addr.name}</span>
                      <span className="text-sm text-[#666666]">{addr.phone}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-[#2E7D5E] text-white text-[10px] rounded-full">
                          默认
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TagIcon size={14} className="text-[#C8B6A6]" />
                      <span className="text-sm text-[#666666]">
                        {addr.region} {addr.detail}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => { setEditing(addr); setShowForm(true); }}
                      className="p-2 hover:bg-[#F8F8F8] rounded-full transition-colors"
                    >
                      <Edit size={16} className="text-[#666666]" />
                    </button>
                    <button
                      onClick={() => setDeleting(addr)}
                      className="p-2 hover:bg-[#F8F8F8] rounded-full transition-colors"
                    >
                      <Trash2 size={16} className="text-[#666666]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {addresses.length >= 10 && (
        <p className="text-xs text-[#C8B6A6] text-center mt-4">最多添加10个地址</p>
      )}

      <AnimatePresence>
        {showForm && (
          <AddressFormModal
            address={editing}
            onSave={handleSave}
            onClose={() => setShowForm(false)}
          />
        )}
        {deleting && (
          <ConfirmModal
            title="删除地址"
            message={`确认删除 ${deleting.name} 的地址吗？`}
            onConfirm={() => handleDelete(deleting.id)}
            onCancel={() => setDeleting(null)}
          />
        )}
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Coupons Section ─── */
function CouponsSection({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'unused' | 'used' | 'expired'>('unused');
  const filtered = MOCK_COUPONS.filter((c) => c.status === tab);

  const statusColors = {
    unused: '#2E7D5E',
    used: '#C8B6A6',
    expired: '#E0E0E0',
  };

  const statusLabels = {
    unused: '未使用',
    used: '已使用',
    expired: '已过期',
  };

  return (
    <div>
      <SectionHeader title="优惠券" onBack={onBack} />
      <div className="flex gap-2 mb-6">
        {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === key ? '#2E7D5E' : '#F8F8F8',
              color: tab === key ? '#FFFFFF' : '#666666',
            }}
          >
            {statusLabels[key]} ({MOCK_COUPONS.filter((c) => c.status === key).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {filtered.map((coupon, index) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white rounded-xl flex overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              style={{
                opacity: coupon.status === 'expired' ? 0.5 : 1,
              }}
            >
              {/* Left edge color bar */}
              <div
                className="w-1 transition-all duration-300 group-hover:w-1.5"
                style={{ backgroundColor: statusColors[coupon.status] }}
              />
              <div className="flex-1 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-2xl font-bold text-[#D43C33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {coupon.type === 'amount' ? `¥${coupon.value}` : `${coupon.value}折`}
                    </div>
                    <div className="text-xs text-[#666666] mt-0.5">{coupon.condition}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#000000]">{coupon.name}</div>
                    <div className="text-xs text-[#C8B6A6] mt-0.5">有效期至 {coupon.validity}</div>
                    <div className="text-xs text-[#666666] mt-0.5">{coupon.scope}</div>
                  </div>
                </div>
                {coupon.status === 'unused' ? (
                  <button className="px-4 py-1.5 border border-[#2E7D5E] text-[#2E7D5E] text-xs rounded-full hover:bg-[#2E7D5E] hover:text-white transition-colors">
                    去使用
                  </button>
                ) : (
                  <span className="text-xs text-[#C8B6A6]">{statusLabels[coupon.status]}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#C8B6A6] text-sm">暂无优惠券</div>
        )}
      </div>
    </div>
  );
}

/* ─── Points Section ─── */
function PointsSection({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'all' | 'earn' | 'spend'>('all');
  const filtered = tab === 'all' ? MOCK_POINTS : MOCK_POINTS.filter((p) => p.type === tab);
  const totalEarn = MOCK_POINTS.filter((p) => p.type === 'earn').reduce((s, p) => s + p.value, 0);
  const totalSpend = MOCK_POINTS.filter((p) => p.type === 'spend').reduce((s, p) => s + Math.abs(p.value), 0);

  const tabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'earn' as const, label: '获得' },
    { key: 'spend' as const, label: '使用' },
  ];

  return (
    <div>
      <SectionHeader title="积分明细" onBack={onBack} />
      {/* Summary Card */}
      <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-[#D43C33]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {MOCK_USER.points.toLocaleString()}
          </div>
          <div className="text-xs text-[#666666]">当前积分</div>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <div className="font-semibold text-[#2E7D5E]">+{totalEarn}</div>
            <div className="text-xs text-[#666666]">本月获得</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[#D43C33]">-{totalSpend}</div>
            <div className="text-xs text-[#666666]">本月使用</div>
          </div>
        </div>
      </div>
      {/* Tabs */}
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
      {/* List */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {filtered.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="bg-white rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: record.type === 'earn' ? 'rgba(46,125,94,0.1)' : 'rgba(212,60,51,0.1)' }}
                >
                  {record.type === 'earn' ? (
                    <ChevronRight size={16} className="text-[#2E7D5E] rotate-[-90deg]" />
                  ) : (
                    <ChevronRight size={16} className="text-[#D43C33] rotate-90" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#000000]">{record.description}</div>
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
    </div>
  );
}

/* ─── Settings Section ─── */
function SettingsSection({ onBack }: { onBack: () => void }) {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [toast, setToast] = useState('');

  const groups = [
    {
      title: '账户安全',
      items: [
        {
          icon: Lock,
          label: '修改密码',
          action: (
            <button
              onClick={() => setShowPassword(true)}
              className="flex items-center gap-1 text-sm text-[#666666] hover:text-[#2E7D5E] transition-colors"
            >
              修改 <ChevronRight size={14} />
            </button>
          ),
        },
        {
          icon: Smartphone,
          label: '绑定手机',
          action: <span className="text-xs text-[#666666]">138****8888</span>,
        },
        {
          icon: Shield,
          label: '实名认证',
          action: (
            <span className="flex items-center gap-1 text-xs text-[#2E7D5E]">
              <Check size={12} /> 已认证
            </span>
          ),
        },
      ],
    },
    {
      title: '通用设置',
      items: [
        {
          icon: Bell,
          label: '消息通知',
          action: <Toggle checked={notifications} onChange={setNotifications} />,
        },
        {
          icon: FileText,
          label: '营销推送',
          action: <Toggle checked={marketing} onChange={setMarketing} />,
        },
        {
          icon: Trash2,
          label: '清除缓存',
          action: (
            <button
              onClick={() => setToast('缓存已清除')}
              className="text-sm text-[#666666] hover:text-[#D43C33] transition-colors"
            >
              清除
            </button>
          ),
        },
        {
          icon: HelpCircle,
          label: '意见反馈',
          action: <ChevronRight size={16} className="text-[#C8B6A6]" />,
        },
        {
          icon: FileText,
          label: '关于我们',
          action: <ChevronRight size={16} className="text-[#C8B6A6]" />,
        },
      ],
    },
  ];

  return (
    <div>
      <SectionHeader title="设置" onBack={onBack} />
      <div className="space-y-6">
        {groups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1, duration: 0.4 }}
          >
            <h3 className="text-xs text-[#C8B6A6] font-medium mb-2 px-1">{group.title}</h3>
            <div className="bg-white rounded-xl overflow-hidden">
              {group.items.map((item, ii) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: gi * 0.1 + ii * 0.03 }}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F8F8F8] transition-colors cursor-pointer"
                  style={{ borderBottom: ii < group.items.length - 1 ? '1px solid #F5F2EB' : 'none' }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className="text-[#666666]" />
                    <span className="text-sm text-[#333333]">{item.label}</span>
                  </div>
                  {item.action}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full py-3 text-[#D43C33] text-sm font-medium border-t border-b border-[#F5F2EB] hover:bg-[#F8F8F8] transition-colors"
        >
          退出登录
        </button>
      </div>

      <AnimatePresence>
        {showPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowPassword(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-lg font-semibold text-[#333333] mb-4">修改密码</h3>
              <div className="space-y-3">
                <input type="password" placeholder="当前密码" className="w-full border-b border-[#C8B6A6] focus:border-[#2E7D5E] focus:border-b-2 outline-none py-2 text-sm" />
                <input type="password" placeholder="新密码" className="w-full border-b border-[#C8B6A6] focus:border-[#2E7D5E] focus:border-b-2 outline-none py-2 text-sm" />
                <input type="password" placeholder="确认新密码" className="w-full border-b border-[#C8B6A6] focus:border-[#2E7D5E] focus:border-b-2 outline-none py-2 text-sm" />
              </div>
              <button
                onClick={() => { setShowPassword(false); setToast('密码修改成功'); }}
                className="w-full mt-6 bg-[#2E7D5E] text-white py-3 rounded-full text-sm font-medium hover:shadow-lg transition-shadow"
              >
                确认修改
              </button>
            </motion.div>
          </motion.div>
        )}
        {showLogout && (
          <ConfirmModal
            title="退出登录"
            message="确认退出当前账号吗？"
            onConfirm={() => { setShowLogout(false); setToast('已退出登录'); }}
            onCancel={() => setShowLogout(false)}
          />
        )}
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Orders Summary Section ─── */
function OrdersSummary({ onBack }: { onBack: () => void }) {
  const orders = [
    { id: '20240901001', status: '待发货', items: '五常大米 5kg 等2件', total: 256, date: '2024-09-01' },
    { id: '20240825003', status: '已完成', items: '西湖龙井 250g', total: 128, date: '2024-08-25' },
    { id: '20240820002', status: '已完成', items: '新疆葡萄干 500g 等3件', total: 198, date: '2024-08-20' },
  ];

  const statusColors: Record<string, string> = {
    '待发货': '#D43C33',
    '已完成': '#2E7D5E',
    '待付款': '#D43C33',
  };

  return (
    <div>
      <SectionHeader title="我的订单" onBack={onBack} />
      <div className="space-y-3">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="bg-white rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#C8B6A6]">订单号: {order.id}</span>
              <span className="text-xs font-medium" style={{ color: statusColors[order.status] || '#666666' }}>
                {order.status}
              </span>
            </div>
            <div className="text-sm text-[#333333] mb-2">{order.items}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#C8B6A6]">{order.date}</span>
              <span className="text-sm font-bold text-[#D43C33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                ¥{order.total}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Placeholder Section for External Links ─── */
function PlaceholderSection({ title, desc, onBack }: { title: string; desc: string; onBack: () => void }) {
  return (
    <div>
      <SectionHeader title={title} onBack={onBack} />
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F8F8F8] flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={28} className="text-[#C8B6A6]" />
        </div>
        <p className="text-sm text-[#666666] mb-4">{desc}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-[#2E7D5E] text-white text-sm rounded-full hover:shadow-lg transition-shadow"
        >
          返回个人中心
        </button>
      </div>
    </div>
  );
}

/* ─── Main Profile Page ─── */
export default function Profile() {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'addresses': return <AddressesSection onBack={() => setActiveSection('dashboard')} />;
      case 'coupons': return <CouponsSection onBack={() => setActiveSection('dashboard')} />;
      case 'points': return <PointsSection onBack={() => setActiveSection('dashboard')} />;
      case 'settings': return <SettingsSection onBack={() => setActiveSection('dashboard')} />;
      case 'orders': return <OrdersSummary onBack={() => setActiveSection('dashboard')} />;
      case 'traceability': return <PlaceholderSection title="溯源查询" desc="请访问溯源查询页面进行扫码或手动输入溯源码。" onBack={() => setActiveSection('dashboard')} />;
      case 'service': return <PlaceholderSection title="在线客服" desc="客服功能即将上线，敬请期待。" onBack={() => setActiveSection('dashboard')} />;
      case 'aftersales': return <PlaceholderSection title="售后中心" desc="售后功能即将上线，敬请期待。" onBack={() => setActiveSection('dashboard')} />;
      case 'member': return <PlaceholderSection title="会员权益" desc="请访问会员权益页面查看完整会员体系。" onBack={() => setActiveSection('dashboard')} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F2EB]">
      <div className="max-w-[720px] mx-auto px-4 py-6 md:py-10">
        <AnimatePresence mode="wait">
          {activeSection === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MemberCard />
              <QuickActionsGrid onNavigate={setActiveSection} />

              {/* Recent Orders Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="bg-white rounded-xl p-4 mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-base font-semibold text-[#333333]">最近订单</h3>
                  <button
                    onClick={() => setActiveSection('orders')}
                    className="text-xs text-[#2E7D5E] flex items-center gap-0.5 hover:underline"
                  >
                    查看全部 <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: '五常大米 5kg', price: 128, status: '待发货', img: '/product-placeholder.jpg' },
                    { name: '西湖龙井 250g', price: 256, status: '已发货', img: '/product-placeholder.jpg' },
                  ].map((order, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={order.img} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#F8F8F8]" />
                      <div className="flex-1">
                        <div className="text-sm text-[#333333]">{order.name}</div>
                        <div className="text-xs text-[#C8B6A6]">{order.status}</div>
                      </div>
                      <div className="text-sm font-bold text-[#D43C33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ¥{order.price}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Points Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="bg-white rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-base font-semibold text-[#333333]">积分动态</h3>
                  <button
                    onClick={() => setActiveSection('points')}
                    className="text-xs text-[#2E7D5E] flex items-center gap-0.5 hover:underline"
                  >
                    查看全部 <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2">
                  {MOCK_POINTS.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <div className="text-sm text-[#333333]">{p.description}</div>
                        <div className="text-xs text-[#C8B6A6]">{p.date}</div>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: p.type === 'earn' ? '#2E7D5E' : '#D43C33',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {p.type === 'earn' ? '+' : ''}{p.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
