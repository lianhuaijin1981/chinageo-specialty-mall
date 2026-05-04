import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  Search,
  MessageCircle,
} from 'lucide-react';
import {
  categories,
  products,
  getHotPicksByCategory,
} from '../data/regionData';

/* ─── Types ─── */
type SortOption = 'default' | 'priceAsc' | 'priceDesc' | 'sales';

/* ─── Product Card ─── */
function ProductCard({
  product,
  index,
}: {
  product: (typeof products)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: (index % 4) * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-400 hover:-translate-y-1"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isSelfOperated && (
              <span className="px-2 py-0.5 bg-[#D43C33] text-white text-[10px] font-medium rounded-md">
                平台自营
              </span>
            )}
            {product.isGI && (
              <span className="px-2 py-0.5 bg-[#2E7D5E] text-white text-[10px] font-medium rounded-md">
                国家地理标志
              </span>
            )}
          </div>
        </div>
        <div className="p-3.5">
          <h3 className="font-serif text-sm font-medium text-[#333333] mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-xs text-[#2E7D5E] mb-2 flex items-center gap-1">
            <MapPin size={11} />
            {product.origin}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-[#D43C33] font-sans">
              ¥{product.price}
            </p>
            <p className="text-xs text-[#999999]">已售 {product.sales}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Floating Toolbar ─── */
function FloatingToolbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="fixed right-6 bottom-24 z-40 flex flex-col gap-3"
        >
          <Link
            to="/traceability"
            className="group flex items-center gap-2 bg-white rounded-full px-3 py-2.5 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Search size={18} className="text-[#2E7D5E]" />
            <span className="text-sm text-[#333333] max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 whitespace-nowrap">
              溯源查询
            </span>
          </Link>

          <button
            className="group flex items-center gap-2 bg-white rounded-full px-3 py-2.5 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => alert('客服功能即将上线')}
          >
            <MessageCircle size={18} className="text-[#2E7D5E]" />
            <span className="text-sm text-[#333333] max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 whitespace-nowrap">
              在线客服
            </span>
          </button>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 bg-white rounded-full px-3 py-2.5 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ArrowUp size={18} className="text-[#2E7D5E]" />
            <span className="text-sm text-[#333333] max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 whitespace-nowrap">
              回到顶部
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Mobile Bottom Nav ─── */
function MobileBottomNav() {
  const location = useLocation();
  const tabs = [
    { label: '首页', path: '/' },
    { label: '地域', path: '/region' },
    { label: '分类', path: '/categories' },
    { label: '购物车', path: '/cart' },
    { label: '我的', path: '/profile' },
  ];

  const icons = [
    <svg key="home" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    <svg key="map" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    <svg key="grid" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    <svg key="cart" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    <svg key="user" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#C8B6A6]/30 px-2 py-1.5">
      <div className="flex items-center justify-around">
        {tabs.map((tab, i) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg"
            >
              <span style={{ color: isActive ? '#2E7D5E' : '#999' }}>
                {icons[i]}
              </span>
              <span
                className="text-[10px]"
                style={{ color: isActive ? '#2E7D5E' : '#999' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ─── Main Categories Page ─── */
export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('fresh');
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [displayCount, setDisplayCount] = useState(16);
  const [loading, setLoading] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  const currentCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategory) || categories[0],
    [selectedCategory]
  );

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.category === selectedCategory);

    if (selectedSubs.length > 0) {
      result = result.filter((p) => selectedSubs.includes(p.subCategory));
    }

    switch (sortBy) {
      case 'sales':
        result.sort(
          (a, b) =>
            parseFloat(b.sales.replace(/[^\d.]/g, '')) -
            parseFloat(a.sales.replace(/[^\d.]/g, ''))
        );
        break;
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [selectedCategory, selectedSubs, sortBy]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, displayCount),
    [filteredProducts, displayCount]
  );

  const hasMore = displayCount < filteredProducts.length;

  const hotPicks = useMemo(
    () => getHotPicksByCategory(selectedCategory),
    [selectedCategory]
  );

  const handleCategoryChange = useCallback((id: string) => {
    setSelectedCategory(id);
    setSelectedSubs([]);
    setDisplayCount(16);
    setContentKey((k) => k + 1);
  }, []);

  const toggleSub = useCallback((sub: string) => {
    setSelectedSubs((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
    setDisplayCount(16);
  }, []);

  const handleLoadMore = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + 16);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#F5F2EB] pb-20 md:pb-0">
      {/* ─── Mobile Top Tab Bar ─── */}
      <div className="md:hidden sticky top-[72px] z-30 bg-[rgba(245,242,235,0.95)] backdrop-blur-md border-b border-[#C8B6A6] overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 px-4 py-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
              style={{
                backgroundColor:
                  selectedCategory === cat.id ? '#2E7D5E' : '#F8F8F8',
                color: selectedCategory === cat.id ? '#FFFFFF' : '#333333',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-8">
          {/* ─── Desktop Sidebar ─── */}
          <div className="hidden md:block w-[240px] flex-shrink-0">
            <div className="sticky top-[96px]">
              <div className="space-y-1">
                {categories.map((cat, i) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative text-left"
                    style={{
                      backgroundColor:
                        selectedCategory === cat.id
                          ? 'rgba(46, 125, 94, 0.08)'
                          : 'transparent',
                    }}
                  >
                    {/* Active indicator */}
                    <motion.div
                      className="absolute left-0 w-[3px] bg-[#2E7D5E] rounded-full"
                      style={{
                        height: 40,
                        top: '50%',
                        marginTop: -20,
                      }}
                      initial={false}
                      animate={{
                        opacity: selectedCategory === cat.id ? 1 : 0,
                        y:
                          selectedCategory === cat.id
                            ? (categories.findIndex(
                                (c) => c.id === selectedCategory
                              ) -
                                i) *
                              0
                            : 0,
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />

                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-serif text-sm font-medium truncate"
                        style={{
                          color:
                            selectedCategory === cat.id
                              ? '#2E7D5E'
                              : '#333333',
                        }}
                      >
                        {cat.name}
                      </h4>
                      <p className="text-xs text-[#C8B6A6] mt-0.5">
                        {cat.count}件商品
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Main Content ─── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={contentKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category Hero */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-5 md:p-8 flex flex-col justify-center">
                      <h1 className="font-serif text-2xl md:text-4xl font-semibold text-[#333333] mb-3">
                        {currentCategory.name}
                      </h1>
                      <p className="text-sm md:text-base text-[#666666] leading-relaxed line-clamp-2 mb-4">
                        {currentCategory.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[#999999]">
                          共{' '}
                          <span className="text-[#2E7D5E] font-medium">
                            {filteredProducts.length}
                          </span>{' '}
                          件特产
                        </p>
                        {/* Sort */}
                        <div className="relative">
                          <button
                            onClick={() => setShowSortMenu((v) => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F8F8] text-sm text-[#333333] hover:bg-[#F5F2EB] transition-colors"
                          >
                            <ArrowUpDown size={14} />
                            {sortBy === 'default' && '排序'}
                            {sortBy === 'priceAsc' && '价格从低到高'}
                            {sortBy === 'priceDesc' && '价格从高到低'}
                            {sortBy === 'sales' && '销量优先'}
                            <ChevronDown
                              size={14}
                              className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
                            />
                          </button>
                          <AnimatePresence>
                            {showSortMenu && (
                              <motion.div
                                initial={{ opacity: 0, scaleY: 0.8 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                exit={{ opacity: 0, scaleY: 0.8 }}
                                transition={{ duration: 0.2 }}
                                style={{ transformOrigin: 'top center' }}
                                className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-[#C8B6A6]/30 py-2 min-w-[160px] z-40"
                              >
                                {[
                                  { value: 'default' as SortOption, label: '综合排序' },
                                  { value: 'sales' as SortOption, label: '销量优先' },
                                  { value: 'priceAsc' as SortOption, label: '价格从低到高' },
                                  { value: 'priceDesc' as SortOption, label: '价格从高到低' },
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={() => {
                                      setSortBy(opt.value);
                                      setShowSortMenu(false);
                                      setDisplayCount(16);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#F5F2EB] transition-colors"
                                    style={{
                                      color:
                                        sortBy === opt.value
                                          ? '#2E7D5E'
                                          : '#333333',
                                      fontWeight:
                                        sortBy === opt.value ? 500 : 400,
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-[40%] h-[200px] md:h-[240px] flex-shrink-0">
                      <img
                        src={currentCategory.image}
                        alt={currentCategory.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Hot Picks Strip */}
                {hotPicks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-serif text-base font-medium text-[#333333] mb-3">
                      热门推荐
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                      {hotPicks.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="flex-shrink-0 snap-start flex items-center gap-3 p-3 bg-white rounded-xl border border-[#C8B6A6]/40 hover:border-[#2E7D5E] transition-colors duration-300 w-[240px]"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-sm font-medium text-[#333333] truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-[#2E7D5E] mt-0.5">
                              {product.origin}
                            </p>
                            <p className="text-sm font-semibold text-[#D43C33] mt-1">
                              ¥{product.price}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-category filters */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {currentCategory.subCategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => toggleSub(sub)}
                        className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm transition-all duration-150 border"
                        style={{
                          backgroundColor: selectedSubs.includes(sub)
                            ? '#2E7D5E'
                            : '#FFFFFF',
                          color: selectedSubs.includes(sub)
                            ? '#FFFFFF'
                            : '#333333',
                          borderColor: selectedSubs.includes(sub)
                            ? '#2E7D5E'
                            : '#E5E5E5',
                          transform: selectedSubs.includes(sub)
                            ? 'scale(0.98)'
                            : 'scale(1)',
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                  {displayedProducts.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                    />
                  ))}
                </div>

                {/* Load More */}
                <div className="flex justify-center mt-10">
                  {hasMore ? (
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-8 py-3 rounded-full border border-[#C8B6A6] text-sm text-[#333333] hover:border-[#2E7D5E] hover:text-[#2E7D5E] transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4 text-[#2E7D5E]"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          加载中...
                        </span>
                      ) : (
                        '加载更多'
                      )}
                    </button>
                  ) : displayedProducts.length > 0 ? (
                    <p className="text-sm text-[#999999]">已展示全部商品</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <p className="text-sm text-[#999999]">
                        暂无商品，敬请期待
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <FloatingToolbar />
      <MobileBottomNav />
    </div>
  );
}
