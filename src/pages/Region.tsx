import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  MapPin,
  X,
  SlidersHorizontal,
  ArrowUp,
  Search,
  MessageCircle,
} from 'lucide-react';
import {
  regionAreas,
  products,
  getFeaturedByRegion,
} from '../data/regionData';

/* ─── Types ─── */
interface FilterTag {
  key: string;
  label: string;
  onRemove: () => void;
}

/* ─── Sorting ─── */
type SortOption = 'default' | 'sales' | 'priceAsc' | 'priceDesc' | 'newest';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'default', label: '综合排序' },
  { value: 'sales', label: '销量优先' },
  { value: 'priceAsc', label: '价格从低到高' },
  { value: 'priceDesc', label: '价格从高到低' },
  { value: 'newest', label: '最新上架' },
];

/* ─── Certification types ─── */
const certTypes = ['地理标志保护产品', '地理标志农产品', '地理标志商标'];
const shipTypes = ['产地直发', '自营仓发货'];
const packageTypes = ['礼盒装', '散装', '组合装'];

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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: (index % 5) * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-400"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Tags */}
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
          {product.soldOut && (
            <div className="absolute inset-0 bg-[#F5F2EB]/70 flex items-center justify-center">
              <span
                className="font-serif text-lg text-[#333333]"
                style={{ transform: 'rotate(-5deg)' }}
              >
                已售罄
              </span>
            </div>
          )}
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

/* ─── Featured Panel ─── */
function FeaturedPanel({ areaParam }: { areaParam: string }) {
  const featured = useMemo(() => getFeaturedByRegion(areaParam), [areaParam]);

  return (
    <div
      className="hidden xl:block w-[280px] flex-shrink-0"
      style={{ position: 'sticky', top: 160 }}
    >
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-serif text-lg font-medium text-[#333333] mb-4">
          本区精选
        </h3>
        <div className="space-y-4">
          {featured.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group flex items-center gap-3"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-sm font-medium text-[#333333] truncate group-hover:text-[#2E7D5E] transition-colors">
                  {product.name}
                </h4>
                <p className="text-xs text-[#2E7D5E] mt-0.5">{product.origin}</p>
                <p className="text-sm font-semibold text-[#D43C33] mt-1">
                  ¥{product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <Link
          to="/categories"
          className="flex items-center justify-center gap-1 mt-5 pt-4 border-t border-[#F5F2EB] text-sm text-[#666666] hover:text-[#2E7D5E] transition-colors"
        >
          查看全部
          <ChevronDown size={14} className="-rotate-90" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="w-32 h-32 mb-6 rounded-full bg-[#F8F8F8] flex items-center justify-center">
        <MapPin size={48} className="text-[#C8B6A6]" />
      </div>
      <p className="font-serif text-lg text-[#666666] mb-2">
        该地域暂无收录特产，敬请期待
      </p>
      <p className="text-sm text-[#999999]">
        换个筛选条件，发现更多地道风物
      </p>
    </motion.div>
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

/* ─── Main Region Page ─── */
export default function RegionPage() {
  /* URL search params */
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialArea = params.get('area') || 'north';

  /* State */
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedShip, setSelectedShip] = useState<string | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [displayCount, setDisplayCount] = useState(15);
  const [loading, setLoading] = useState(false);
  const [showCityRow, setShowCityRow] = useState(false);

  /* Area info */
  const currentArea = useMemo(
    () => regionAreas.find((a) => a.param === selectedArea) || regionAreas[0],
    [selectedArea]
  );

  /* Filter logic */
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.region === selectedArea);

    if (selectedProvinces.length > 0) {
      result = result.filter((p) => selectedProvinces.includes(p.province));
    }

    if (selectedCities.length > 0) {
      result = result.filter((p) => selectedCities.includes(p.city));
    }

    if (selectedCerts.length > 0) {
      result = result.filter((p) => p.isGI);
    }

    if (selectedShip) {
      result = result.filter((p) =>
        selectedShip === '产地直发' ? p.isGI : true
      );
    }

    if (selectedPackages.length > 0) {
      result = result.filter((p) =>
        selectedPackages.some((pkg) => {
          if (pkg === '礼盒装') return p.category === 'gift';
          if (pkg === '散装') return p.price < 50;
          if (pkg === '组合装') return p.tags.includes('组合');
          return true;
        })
      );
    }

    /* Sort */
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
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return result;
  }, [
    selectedArea,
    selectedProvinces,
    selectedCities,
    selectedCerts,
    selectedShip,
    selectedPackages,
    sortBy,
  ]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, displayCount),
    [filteredProducts, displayCount]
  );

  const hasMore = displayCount < filteredProducts.length;

  /* Handlers */
  const handleAreaChange = useCallback(
    (param: string) => {
      setSelectedArea(param);
      setSelectedProvinces([]);
      setSelectedCities([]);
      setDisplayCount(15);
      setShowCityRow(false);
    },
    []
  );

  const toggleProvince = useCallback((province: string) => {
    setSelectedProvinces((prev) =>
      prev.includes(province)
        ? prev.filter((p) => p !== province)
        : [...prev, province]
    );
    setSelectedCities([]);
    setDisplayCount(15);
  }, []);

  const toggleCity = useCallback((city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
    setDisplayCount(15);
  }, []);

  const handleLoadMore = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + 15);
      setLoading(false);
    }, 600);
  }, []);

  /* Filter tags */
  const filterTags: FilterTag[] = useMemo(() => {
    const tags: FilterTag[] = [];
    selectedProvinces.forEach((p) =>
      tags.push({
        key: `province-${p}`,
        label: p,
        onRemove: () => toggleProvince(p),
      })
    );
    selectedCities.forEach((c) =>
      tags.push({
        key: `city-${c}`,
        label: c,
        onRemove: () => toggleCity(c),
      })
    );
    selectedCerts.forEach((c) =>
      tags.push({
        key: `cert-${c}`,
        label: c,
        onRemove: () =>
          setSelectedCerts((prev) => prev.filter((x) => x !== c)),
      })
    );
    if (selectedShip) {
      tags.push({
        key: `ship-${selectedShip}`,
        label: selectedShip,
        onRemove: () => setSelectedShip(null),
      });
    }
    selectedPackages.forEach((p) =>
      tags.push({
        key: `pkg-${p}`,
        label: p,
        onRemove: () =>
          setSelectedPackages((prev) => prev.filter((x) => x !== p)),
      })
    );
    return tags;
  }, [
    selectedProvinces,
    selectedCities,
    selectedCerts,
    selectedShip,
    selectedPackages,
    toggleProvince,
    toggleCity,
  ]);

  /* Available cities based on selected provinces */
  const availableCities = useMemo(() => {
    if (selectedProvinces.length === 0) return [];
    const cities: string[] = [];
    selectedProvinces.forEach((prov) => {
      const provinceData = currentArea.provinces.find((p) => p.name === prov);
      if (provinceData) {
        cities.push(...provinceData.cities);
      }
    });
    return [...new Set(cities)];
  }, [selectedProvinces, currentArea]);

  return (
    <div className="min-h-[100dvh] bg-[#F5F2EB] pb-20 md:pb-0">
      {/* ─── Sticky Filter Bar ─── */}
      <div
        className="sticky top-[72px] z-30 border-b border-[#C8B6A6]"
        style={{
          backgroundColor: 'rgba(245, 242, 235, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-3">
          {/* Row 1: Area selection + Sort */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
            {regionAreas.map((area) => (
              <button
                key={area.param}
                onClick={() => handleAreaChange(area.param)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor:
                    selectedArea === area.param ? '#2E7D5E' : '#F8F8F8',
                  color: selectedArea === area.param ? '#FFFFFF' : '#333333',
                }}
              >
                {area.name}
              </button>
            ))}

            <div className="flex-1" />

            {/* Sort Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#C8B6A6] text-sm text-[#333333] hover:border-[#2E7D5E] transition-colors"
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0.9 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0.9 }}
                    transition={{ duration: 0.2 }}
                    style={{ transformOrigin: 'top center' }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-[#C8B6A6]/30 py-2 min-w-[160px] z-40"
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSortMenu(false);
                          setDisplayCount(15);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[#F5F2EB] transition-colors"
                        style={{
                          color: sortBy === opt.value ? '#2E7D5E' : '#333333',
                          fontWeight: sortBy === opt.value ? 500 : 400,
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

          {/* Row 2: Province selection */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 border-t border-[#F5F2EB]">
            <span className="text-xs text-[#999999] flex-shrink-0 mr-1">省份</span>
            {currentArea.provinces.map((prov) => (
              <button
                key={prov.name}
                onClick={() => toggleProvince(prov.name)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border"
                style={{
                  backgroundColor: selectedProvinces.includes(prov.name)
                    ? '#2E7D5E'
                    : '#FFFFFF',
                  color: selectedProvinces.includes(prov.name)
                    ? '#FFFFFF'
                    : '#333333',
                  borderColor: selectedProvinces.includes(prov.name)
                    ? '#2E7D5E'
                    : '#E5E5E5',
                }}
              >
                {prov.name}
              </button>
            ))}
          </div>

          {/* Row 2.5: City selection (conditional) */}
          <AnimatePresence>
            {availableCities.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 border-t border-[#F5F2EB]">
                  <span className="text-xs text-[#999999] flex-shrink-0 mr-1">城市</span>
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => toggleCity(city)}
                      className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border"
                      style={{
                        backgroundColor: selectedCities.includes(city)
                          ? '#2E7D5E'
                          : '#FFFFFF',
                        color: selectedCities.includes(city)
                          ? '#FFFFFF'
                          : '#333333',
                        borderColor: selectedCities.includes(city)
                          ? '#2E7D5E'
                          : '#E5E5E5',
                      }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Row 3: Auxiliary filters */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2 border-t border-[#F5F2EB]">
            {/* Cert type */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#999999] flex-shrink-0">认证</span>
              {certTypes.map((cert) => (
                <button
                  key={cert}
                  onClick={() =>
                    setSelectedCerts((prev) =>
                      prev.includes(cert)
                        ? prev.filter((c) => c !== cert)
                        : [...prev, cert]
                    )
                  }
                  className="px-2.5 py-0.5 rounded-md text-xs transition-all duration-200 border"
                  style={{
                    backgroundColor: selectedCerts.includes(cert)
                      ? '#2E7D5E'
                      : '#FFFFFF',
                    color: selectedCerts.includes(cert)
                      ? '#FFFFFF'
                      : '#333333',
                    borderColor: selectedCerts.includes(cert)
                      ? '#2E7D5E'
                      : '#E5E5E5',
                  }}
                >
                  {cert}
                </button>
              ))}
            </div>

            {/* Ship type */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#999999] flex-shrink-0">发货</span>
              {shipTypes.map((ship) => (
                <button
                  key={ship}
                  onClick={() =>
                    setSelectedShip((prev) => (prev === ship ? null : ship))
                  }
                  className="px-2.5 py-0.5 rounded-md text-xs transition-all duration-200 border"
                  style={{
                    backgroundColor: selectedShip === ship ? '#2E7D5E' : '#FFFFFF',
                    color: selectedShip === ship ? '#FFFFFF' : '#333333',
                    borderColor: selectedShip === ship ? '#2E7D5E' : '#E5E5E5',
                  }}
                >
                  {ship}
                </button>
              ))}
            </div>

            {/* Package type */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#999999] flex-shrink-0">包装</span>
              {packageTypes.map((pkg) => (
                <button
                  key={pkg}
                  onClick={() =>
                    setSelectedPackages((prev) =>
                      prev.includes(pkg)
                        ? prev.filter((p) => p !== pkg)
                        : [...prev, pkg]
                    )
                  }
                  className="px-2.5 py-0.5 rounded-md text-xs transition-all duration-200 border"
                  style={{
                    backgroundColor: selectedPackages.includes(pkg)
                      ? '#2E7D5E'
                      : '#FFFFFF',
                    color: selectedPackages.includes(pkg)
                      ? '#FFFFFF'
                      : '#333333',
                    borderColor: selectedPackages.includes(pkg)
                      ? '#2E7D5E'
                      : '#E5E5E5',
                  }}
                >
                  {pkg}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter tags */}
          <AnimatePresence>
            {filterTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F5F2EB]"
              >
                <span className="text-xs text-[#999999]">已选</span>
                {filterTags.map((tag) => (
                  <motion.button
                    key={tag.key}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 25,
                    }}
                    onClick={tag.onRemove}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F8F8F8] text-xs text-[#333333] hover:bg-[#F5F2EB] transition-colors"
                  >
                    {tag.label}
                    <X size={10} className="text-[#999999]" />
                  </motion.button>
                ))}
                <button
                  onClick={() => {
                    setSelectedProvinces([]);
                    setSelectedCities([]);
                    setSelectedCerts([]);
                    setSelectedShip(null);
                    setSelectedPackages([]);
                  }}
                  className="text-xs text-[#2E7D5E] hover:underline ml-1"
                >
                  清除全部
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6">
          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#666666]">
                共 <span className="text-[#2E7D5E] font-medium">{filteredProducts.length}</span>{' '}
                件特产
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                  {displayedProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
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
                  ) : (
                    <p className="text-sm text-[#999999]">已展示全部商品</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Featured Panel */}
          <FeaturedPanel areaParam={selectedArea} />
        </div>
      </div>

      <FloatingToolbar />
      <MobileBottomNav />
    </div>
  );
}
