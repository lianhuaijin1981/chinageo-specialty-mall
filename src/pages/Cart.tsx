import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Plus,
  Minus,
  Check,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── Types ─── */
interface CartItem {
  id: string;
  name: string;
  spec: string;
  origin: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock: number;
  image: string;
  selected: boolean;
  invalid?: boolean;
  invalidReason?: string;
}

/* ─── Mock Data ─── */
const INITIAL_ITEMS: CartItem[] = [
  {
    id: '1',
    name: '五常稻花香大米',
    spec: '5kg / 真空包装',
    origin: '黑龙江 · 五常',
    price: 89.0,
    originalPrice: 108.0,
    quantity: 2,
    stock: 10,
    image: '/product-placeholder.jpg',
    selected: true,
  },
  {
    id: '2',
    name: '西湖龙井明前茶',
    spec: '250g / 特级',
    origin: '浙江 · 杭州',
    price: 268.0,
    quantity: 1,
    stock: 5,
    image: '/product-placeholder.jpg',
    selected: true,
  },
  {
    id: '3',
    name: '新疆和田大枣',
    spec: '1kg / 礼盒装',
    origin: '新疆 · 和田',
    price: 58.0,
    originalPrice: 78.0,
    quantity: 1,
    stock: 0,
    image: '/product-placeholder.jpg',
    selected: false,
    invalid: true,
    invalidReason: '已售罄',
  },
  {
    id: '4',
    name: '云南普洱茶饼',
    spec: '357g / 熟茶',
    origin: '云南 · 普洱',
    price: 158.0,
    quantity: 1,
    stock: 8,
    image: '/product-placeholder.jpg',
    selected: false,
  },
  {
    id: '5',
    name: '阳澄湖大闸蟹礼券',
    spec: '公4两母3两 8只',
    origin: '江苏 · 苏州',
    price: 388.0,
    originalPrice: 468.0,
    quantity: 1,
    stock: 3,
    image: '/product-placeholder.jpg',
    selected: false,
  },
];

/* ─── Toast Component ─── */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#333333] text-white px-4 py-2.5 rounded-full text-sm shadow-lg flex items-center gap-2"
        >
          <AlertCircle size={16} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Delete Confirm Dialog ─── */
function DeleteDialog({
  open,
  count,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  count: number;
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
            <h3 className="font-serif text-lg font-semibold text-[#333333] mb-4">
              确定删除选中的 {count} 件商品？
            </h3>
            <p className="text-sm text-[#666666] mb-6">删除后无法恢复，请确认操作</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 h-11 rounded-full border border-[#C8B6A6] text-[#333333] text-sm font-medium hover:bg-[#F5F2EB] transition-colors"
              >
                取消
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 h-11 rounded-full bg-[#D43C33] text-white text-sm font-medium hover:bg-[#b83028] transition-colors"
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

/* ─── Checkbox Component ─── */
function Checkbox({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
        checked
          ? 'bg-[#2E7D5E] border-[#2E7D5E]'
          : 'border-[#C8B6A6] bg-transparent',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Check size={12} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ─── Main Page ─── */
export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [invalidExpanded, setInvalidExpanded] = useState(false);

  const validItems = useMemo(() => items.filter((i) => !i.invalid), [items]);
  const invalidItems = useMemo(() => items.filter((i) => i.invalid), [items]);

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2200);
  }, []);

  const selectedCount = validItems.filter((i) => i.selected).length;
  const totalCount = validItems.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  const totalAmount = useMemo(() => {
    return validItems
      .filter((i) => i.selected)
      .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [validItems]);

  const shippingFee = totalAmount >= 99 ? 0 : 12;
  const finalAmount = totalAmount + shippingFee;

  const toggleSelectAll = () => {
    const newSelected = !allSelected;
    setItems((prev) =>
      prev.map((item) =>
        item.invalid ? item : { ...item, selected: newSelected }
      )
    );
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && !item.invalid
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const changeQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.invalid) return item;
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) {
          showToast('该商品库存不足');
          return item;
        }
        return { ...item, quantity: newQty };
      })
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleBatchDelete = () => {
    const selectedIds = validItems.filter((i) => i.selected).map((i) => i.id);
    if (selectedIds.length === 0) return;
    setDeleteDialogOpen(true);
  };

  const confirmBatchDelete = () => {
    setItems((prev) => prev.filter((i) => !i.selected || i.invalid));
    setDeleteDialogOpen(false);
    setIsEditMode(false);
  };

  const removeInvalid = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  /* ─── Empty State ─── */
  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100dvh-72px)] bg-[#F5F2EB] flex flex-col items-center justify-center pt-[72px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6"
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              className="mx-auto"
            >
              <path
                d="M20 55C20 55 15 45 20 35C25 25 35 20 40 20C45 20 55 25 60 35C65 45 60 55 60 55"
                stroke="#C8B6A6"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M25 55H55"
                stroke="#C8B6A6"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M30 55V65H50V55"
                stroke="#C8B6A6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="35" cy="40" r="2" fill="#C8B6A6" />
              <circle cx="45" cy="40" r="2" fill="#C8B6A6" />
              <path
                d="M38 48C38 48 40 50 42 48"
                stroke="#C8B6A6"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
          <h2 className="font-serif text-xl text-[#333333] mb-2">
            购物车还是空的
          </h2>
          <p className="text-sm text-[#C8B6A6] mb-8">
            甄选几件心仪的风物吧
          </p>
          <Link
            to="/"
            className="inline-block h-12 px-8 rounded-full bg-[#2E7D5E] text-white text-sm font-medium leading-[48px] hover:bg-[#256a4e] transition-colors"
          >
            去逛逛
          </Link>
        </motion.div>

        {/* Recommended Strip */}
        <div className="w-full mt-16 bg-[#F8F8F8] py-12">
          <div className="max-w-[960px] mx-auto px-6">
            <h3 className="font-serif text-lg text-[#333333] mb-6">为你推荐</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Link
                  key={i}
                  to={`/product/${i}`}
                  className="bg-white rounded-xl p-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-full aspect-square rounded-lg bg-[#F5F2EB] mb-3 overflow-hidden">
                    <img
                      src="/product-placeholder.jpg"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-[#333333] truncate mb-1">
                    {['武夷岩茶', '赣南脐橙', '东北黑木耳', '安溪铁观音'][i - 1]}
                  </p>
                  <p className="text-base font-semibold text-[#D43C33]">
                    ¥{(58 + i * 40).toFixed(0)}.00
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#F5F2EB] pt-[72px]">
      {/* Page Header */}
      <div className="border-b border-[#C8B6A6]">
        <div className="max-w-[960px] mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="font-serif text-[28px] font-semibold text-black">
              购物车
            </h1>
            <span className="text-sm text-[#666666]">
              共 {validItems.length} 件商品
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="text-sm text-[#666666] hover:text-[#2E7D5E] transition-colors"
          >
            {isEditMode ? '完成' : '编辑'}
          </button>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-6 pb-32">
        {/* Valid Items */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {validItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: '-100%' }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  layout: { duration: 0.3 },
                }}
                className="bg-white rounded-xl p-4 flex items-center gap-4"
              >
                {/* Checkbox */}
                <Checkbox
                  checked={item.selected}
                  onChange={() => toggleItem(item.id)}
                />

                {/* Product Image */}
                <div className="w-[100px] h-[100px] rounded-lg overflow-hidden flex-shrink-0 bg-[#F5F2EB]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base text-[#333333] truncate mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#C8B6A6] mb-1">{item.spec}</p>
                  <p className="text-xs text-[#2E7D5E]">{item.origin}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-[#C8B6A6] rounded-lg overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => changeQuantity(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F2EB] transition-colors active:scale-90"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} className="text-[#333333]" />
                  </button>
                  <div className="w-9 h-8 flex items-center justify-center text-sm text-[#333333]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={item.quantity}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.quantity}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <button
                    onClick={() => changeQuantity(item.id, 1)}
                    className={cn(
                      'w-8 h-8 flex items-center justify-center transition-colors active:scale-90',
                      item.quantity >= item.stock
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-[#F5F2EB]'
                    )}
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus size={14} className="text-[#333333]" />
                  </button>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0 w-[80px]">
                  {item.originalPrice && (
                    <p className="text-xs text-[#C8B6A6] line-through">
                      ¥{item.originalPrice.toFixed(2)}
                    </p>
                  )}
                  <p className="text-lg font-semibold text-[#D43C33]">
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 hover:text-[#D43C33] text-[#C8B6A6] transition-colors flex-shrink-0 active:scale-95"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Invalid Items Section */}
        {invalidItems.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setInvalidExpanded(!invalidExpanded)}
              className="flex items-center gap-2 text-sm text-[#666666] mb-3 hover:text-[#333333] transition-colors"
            >
              <motion.div
                animate={{ rotate: invalidExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={16} />
              </motion.div>
              已失效商品（{invalidItems.length}）
            </button>
            <AnimatePresence>
              {invalidExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden space-y-3"
                >
                  {invalidItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-4 flex items-center gap-4 opacity-60"
                    >
                      <div className="w-5 flex-shrink-0" />
                      <div className="w-[100px] h-[100px] rounded-lg overflow-hidden flex-shrink-0 bg-[#F5F2EB] grayscale">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-base text-[#333333] truncate mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#C8B6A6] mb-1">
                          {item.spec}
                        </p>
                        <p className="text-xs text-[#D43C33]">
                          {item.invalidReason}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-[#C8B6A6] line-through">
                          ¥{item.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeInvalid(item.id)}
                        className="text-sm text-[#C8B6A6] hover:text-[#D43C33] transition-colors flex-shrink-0"
                      >
                        移除
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Recommended Strip */}
        <div className="mt-12 -mx-6 px-6 py-8 bg-[#F8F8F8]">
          <h3 className="font-serif text-lg text-[#333333] mb-4">为你推荐</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Link
                key={i}
                to={`/product/${i}`}
                className="bg-white rounded-xl p-3 hover:shadow-md transition-shadow"
              >
                <div className="w-full aspect-square rounded-lg bg-[#F5F2EB] mb-3 overflow-hidden">
                  <img
                    src="/product-placeholder.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-[#333333] truncate mb-1">
                  {['武夷岩茶', '赣南脐橙', '东北黑木耳', '安溪铁观音'][i - 1]}
                </p>
                <p className="text-base font-semibold text-[#D43C33]">
                  ¥{(58 + i * 40).toFixed(0)}.00
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#C8B6A6] z-40">
        <div className="max-w-[960px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onChange={toggleSelectAll}
              />
              <span className="text-sm text-[#333333]">全选</span>
            </div>

            {isEditMode && selectedCount > 0 && (
              <button
                onClick={handleBatchDelete}
                className="text-sm text-[#D43C33] hover:underline"
              >
                删除选中
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-[#333333]">合计:</span>
                <motion.span
                  key={finalAmount}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-[#D43C33]"
                >
                  ¥{finalAmount.toFixed(2)}
                </motion.span>
              </div>
              <p className="text-xs text-[#C8B6A6]">
                {shippingFee > 0
                  ? `不含运费，结算时计算（满¥99免运费，差¥${(99 - totalAmount).toFixed(0)}）`
                  : '已享免运费'}
              </p>
            </div>
            <button
              disabled={selectedCount === 0}
              className={cn(
                'h-12 px-8 rounded-full text-white text-sm font-medium transition-all active:scale-95',
                selectedCount > 0
                  ? 'bg-[#2E7D5E] hover:bg-[#256a4e]'
                  : 'bg-[#C8B6A6] cursor-not-allowed'
              )}
            >
              去结算{selectedCount > 0 ? `（${selectedCount}）` : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <DeleteDialog
        open={deleteDialogOpen}
        count={selectedCount}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={confirmBatchDelete}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
