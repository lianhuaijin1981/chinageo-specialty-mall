import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Leaf, MapPin } from 'lucide-react';

/* ─── Hero Carousel ─── */
const banners = [
  {
    image: '/hero-banner-1.jpg',
    title: '寻味中华 · 地道风物',
    subtitle: '每一件特产，都承载着一方水土的记忆与温度',
    cta: '立即探索',
  },
  {
    image: '/hero-banner-2.jpg',
    title: '中秋献礼 · 匠心礼盒',
    subtitle: '精选各地地理标志好物，传递浓浓佳节情意',
    cta: '选购礼盒',
  },
  {
    image: '/hero-banner-3.jpg',
    title: '产地直供 · 鲜达餐桌',
    subtitle: '从茶园到茶杯，从果园到果篮，48小时原产地直达',
    cta: '发现好物',
  },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    setDragStart(clientX);
  }, []);

  const handleDragEnd = useCallback(
    (clientX: number) => {
      if (dragStart === null) return;
      const diff = dragStart - clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          setCurrent((prev) => (prev + 1) % banners.length);
        } else {
          setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
        }
      }
      setDragStart(null);
    },
    [dragStart]
  );

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      style={{ height: '85vh' }}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseUp={(e) => handleDragEnd(e.clientX)}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={banners[current].image}
            alt={banners[current].title}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Text Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1280px] mx-auto px-6 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-xl"
            >
              <h2 className="font-serif text-[40px] md:text-[48px] font-semibold text-white leading-tight mb-4 drop-shadow-lg">
                {banners[current].title}
              </h2>
              <p className="text-base md:text-lg text-[#F5F2EB] mb-8 drop-shadow">
                {banners[current].subtitle}
              </p>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 bg-white text-black font-medium text-sm px-8 py-3 rounded-full hover:bg-black hover:text-white transition-all duration-300"
              >
                {banners[current].cta}
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="transition-all duration-500 ease-out"
            style={{
              width: i === current ? 80 : 40,
              height: 2,
              backgroundColor: i === current ? '#D43C33' : 'rgba(245, 242, 235, 0.5)',
            }}
            aria-label={`切换到第${i + 1}张banner`}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Region Explorer ─── */
const regions = [
  { name: '华北', provinces: '京津冀晋蒙', image: '/region-north.jpg', param: 'north' },
  { name: '华东', provinces: '江浙沪皖闽赣鲁台', image: '/region-east.jpg', param: 'east' },
  { name: '华南', provinces: '粤桂琼港澳', image: '/region-south.jpg', param: 'south' },
  { name: '西南', provinces: '川渝云贵藏', image: '/region-southwest.jpg', param: 'southwest' },
  { name: '西北', provinces: '陕甘青宁新', image: '/region-northwest.jpg', param: 'northwest' },
  { name: '华中', provinces: '豫鄂湘', image: '/region-central.jpg', param: 'central' },
];

function RegionExplorer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 bg-[#F5F2EB]">
      <div className="max-w-[1280px] mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-[28px] md:text-[32px] font-semibold text-[#333333]">
            寻味九州 · 地域甄选
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {regions.map((region, i) => (
            <motion.div
              key={region.param}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
            >
              <Link
                to={`/region?area=${region.param}`}
                className="group relative block overflow-hidden rounded-xl aspect-[3/2]"
              >
                <img
                  src={region.image}
                  alt={region.name}
                  className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.08]"
                />
                <div
                  className="absolute inset-0 transition-opacity duration-600"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%)',
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <motion.h3
                    className="font-serif text-xl md:text-2xl font-semibold text-white mb-1 transition-transform duration-500 group-hover:-translate-y-2"
                  >
                    {region.name}
                  </motion.h3>
                  <p className="text-xs md:text-sm text-white/80">
                    {region.provinces.length}省特产
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Promise ─── */
const trustItems = [
  '国家地理标志认证',
  '产地溯源可查',
  '假一赔十',
  '48小时产地直发',
];

function TrustPromise() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1280px] mx-auto px-6" ref={ref}>
        <div className="flex flex-col lg:flex-row items-stretch gap-0 overflow-hidden rounded-xl">
          {/* Left Image */}
          <motion.div
            className="lg:w-[55%] relative min-h-[300px] lg:min-h-[480px]"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/hero-banner-1.jpg"
              alt="地理标志特产合集"
              className="w-full h-full object-cover absolute inset-0"
            />
          </motion.div>

          {/* Right Content */}
          <motion.div
            className="lg:w-[45%] flex flex-col justify-center p-8 md:p-16 bg-white"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center self-start px-4 py-1.5 rounded-full bg-[#C8B6A6]/20 text-[#333333] text-sm font-medium mb-6">
              平台自营 · 正品保真
            </span>
            <h2 className="font-serif text-[24px] md:text-[32px] font-semibold text-[#333333] leading-snug mb-8">
              每一份特产，都有国家认证的出身
            </h2>

            <div className="space-y-5 mb-8">
              {trustItems.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full border border-[#C8B6A6] flex items-center justify-center">
                    <Check size={14} className="text-[#2E7D5E]" />
                  </span>
                  <span className="text-[#333333] text-sm md:text-base">{item}</span>
                </motion.div>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-[#333333] text-sm font-medium hover:text-[#2E7D5E] transition-colors group"
            >
              查看全部资质
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Seasonal Picks ─── */
const seasonalProducts = [
  { name: '阳澄湖大闸蟹', origin: '江苏·苏州', price: '¥298', image: '/category-fresh.jpg', tag: '当季' },
  { name: '五常稻花香米', origin: '黑龙江·五常', price: '¥128', image: '/category-grain.jpg', tag: '当季' },
  { name: '西湖龙井', origin: '浙江·杭州', price: '¥368', image: '/category-tea.jpg', tag: '当季' },
  { name: '云南野生菌菇', origin: '云南·楚雄', price: '¥168', image: '/category-fresh.jpg', tag: '当季' },
  { name: '新疆阿克苏苹果', origin: '新疆·阿克苏', price: '¥88', image: '/category-fresh.jpg', tag: '当季' },
  { name: '福建铁观音', origin: '福建·安溪', price: '¥218', image: '/category-tea.jpg', tag: '当季' },
];

function SeasonalPicks() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 bg-[#F8F8F8]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-[28px] md:text-[32px] font-semibold text-[#333333]">
            不时不食 · 当季风物
          </h2>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {seasonalProducts.map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex-shrink-0 w-[260px] md:w-[280px] snap-start"
            >
              <Link to={`/product/${i + 1}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-400 hover:-translate-y-1">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#D43C33] text-white text-xs font-medium rounded-md">
                    {product.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-base font-medium text-[#333333] mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#2E7D5E] mb-2 flex items-center gap-1">
                    <MapPin size={12} />
                    {product.origin}
                  </p>
                  <p className="text-lg font-semibold text-[#D43C33] font-sans">
                    {product.price}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Top Sellers ─── */
const topProducts = [
  { rank: 1, name: '五常稻花香米', origin: '黑龙江', price: '¥128', sales: '月销 2.3万+', image: '/category-grain.jpg' },
  { rank: 2, name: '阳澄湖大闸蟹礼券', origin: '江苏', price: '¥398', sales: '月销 1.8万+', image: '/category-fresh.jpg' },
  { rank: 3, name: '西湖龙井明前茶', origin: '浙江', price: '¥568', sales: '月销 1.5万+', image: '/category-tea.jpg' },
  { rank: 4, name: '云南普洱茶饼', origin: '云南', price: '¥218', sales: '月销 1.2万+', image: '/category-tea.jpg' },
  { rank: 5, name: '新疆和田大枣', origin: '新疆', price: '¥68', sales: '月销 9千+', image: '/category-fresh.jpg' },
  { rank: 6, name: '四川郫县豆瓣酱', origin: '四川', price: '¥35', sales: '月销 8千+', image: '/product-placeholder.jpg' },
  { rank: 7, name: '广西柳州螺蛳粉', origin: '广西', price: '¥45', sales: '月销 7千+', image: '/category-snack.jpg' },
  { rank: 8, name: '宁夏中宁枸杞', origin: '宁夏', price: '¥88', sales: '月销 6千+', image: '/category-tonic.jpg' },
  { rank: 9, name: '福建武夷岩茶', origin: '福建', price: '¥328', sales: '月销 5千+', image: '/category-tea.jpg' },
  { rank: 10, name: '山西老陈醋', origin: '山西', price: '¥58', sales: '月销 4千+', image: '/product-placeholder.jpg' },
];

function TopSellers() {
  const [activeTop, setActiveTop] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 bg-[#F5F2EB]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sticky */}
          <div className="lg:w-[40%]">
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-serif text-[28px] md:text-[36px] font-semibold text-[#333333] mb-2">
                  风物榜单
                </h2>
                <p className="text-[#666666] text-sm mb-6">实时热销，口碑之选</p>
              </motion.div>

              <motion.div
                className="relative rounded-xl overflow-hidden aspect-[4/5]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeTop}
                    src={topProducts[activeTop].image}
                    alt={topProducts[activeTop].name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D43C33] text-white text-xs font-medium rounded-full mb-3">
                    <Leaf size={12} /> TOP {topProducts[activeTop].rank}
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-white mb-1">
                    {topProducts[activeTop].name}
                  </h3>
                  <p className="text-white/80 text-sm">{topProducts[activeTop].origin}</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right List */}
          <div className="lg:w-[60%]" ref={listRef}>
            <div className="space-y-3">
              {topProducts.slice(1).map((product, i) => (
                <motion.div
                  key={product.rank}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  onMouseEnter={() => setActiveTop(i + 1)}
                  className="group"
                >
                  <Link
                    to={`/product/${product.rank}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white hover:shadow-md transition-all duration-300"
                  >
                    <span
                      className="font-serif text-[36px] md:text-[48px] font-thin w-12 md:w-16 text-center leading-none transition-transform duration-300 group-hover:scale-110"
                      style={{ color: '#C8B6A6' }}
                    >
                      {product.rank}
                    </span>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 md:w-[60px] md:h-[60px] rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm md:text-base font-medium text-[#333333] truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#2E7D5E]">{product.origin}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base md:text-lg font-semibold text-[#D43C33] font-sans">
                        {product.price}
                      </p>
                      <p className="text-xs text-[#999999]">{product.sales}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Gift Collections ─── */
const giftCollections = [
  { name: '中秋团圆礼盒', tag: '节日礼盒', image: '/category-gift.jpg' },
  { name: '商务甄选礼盒', tag: '商务礼盒', image: '/category-tonic.jpg' },
  { name: '家庭分享礼盒', tag: '家庭礼盒', image: '/category-grain.jpg' },
];

function GiftCollections() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-[28px] md:text-[32px] font-semibold text-[#333333]">
            礼盒专场
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {giftCollections.map((gift, i) => (
            <motion.div
              key={gift.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
            >
              <Link
                to="/categories"
                className="group block bg-white rounded-xl border border-[#C8B6A6] p-3 hover:border-[#2E7D5E] transition-colors duration-500"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
                  />
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-serif text-lg font-medium text-[#333333] mb-1">
                    {gift.name}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-[#C8B6A6]/15 text-[#333333] text-xs rounded-full">
                    {gift.tag}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Culture Stories ─── */
const cultureStories = [
  {
    image: '/culture-1.jpg',
    title: '非遗传承：一双巧手守护千年味道',
    excerpt: '在贵州深山的苗寨里，72岁的杨奶奶仍在用祖传的手工技艺制作酸汤。每一坛酸汤都要经过108天的自然发酵...',
  },
  {
    image: '/culture-2.jpg',
    title: '古法酿造：时间是最好的调味师',
    excerpt: '浙江绍兴的酱园里，数千只酱缸整齐排列。三伏晒酱、三九天抽油，传承三百余年的酿造技艺...',
  },
  {
    image: '/culture-3.jpg',
    title: '高原馈赠：云端牧场的纯净奶香',
    excerpt: '海拔4000米的青藏高原，牦牛在纯净的雪域上自由漫步。这里的每一滴牦牛奶，都带着蓝天白云的味道...',
  },
];

function CultureStories() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      className="py-24 relative"
      style={{
        backgroundImage: 'url(/trace-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'multiply',
        backgroundColor: 'rgba(245, 242, 235, 0.97)',
      }}
      ref={ref}
    >
      <div className="max-w-[1280px] mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-[28px] md:text-[32px] font-semibold text-[#333333]">
            风物志 · 读懂一味特产
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cultureStories.map((story, i) => (
            <motion.article
              key={story.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-800"
                />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-medium text-[#333333] mb-2 line-clamp-1">
                  {story.title}
                </h3>
                <p className="text-sm text-[#666666] leading-relaxed line-clamp-3 mb-4">
                  {story.excerpt}
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1 text-sm text-[#333333] hover:text-[#2E7D5E] transition-colors group/link"
                >
                  阅读全文
                  <ChevronRight size={14} className="transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Mobile Bottom Nav ─── */
function MobileBottomNav() {
  const location = useLocation();
  const tabs = [
    { icon: HomeIcon, label: '首页', path: '/' },
    { icon: MapPinIcon, label: '地域', path: '/region' },
    { icon: GridIcon, label: '分类', path: '/categories' },
    { icon: CartIcon, label: '购物车', path: '/cart' },
    { icon: UserIcon, label: '我的', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#C8B6A6]/30 px-2 py-1.5">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg"
            >
              <Icon size={20} color={isActive ? '#2E7D5E' : '#999'} />
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

/* Simple SVG icon components for mobile nav */
function HomeIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function MapPinIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function GridIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function CartIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function UserIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/* ─── Home Page ─── */
export default function Home() {
  return (
    <div className="pb-16 md:pb-0">
      <HeroCarousel />
      <RegionExplorer />
      <TrustPromise />
      <SeasonalPicks />
      <TopSellers />
      <GiftCollections />
      <CultureStories />
      <MobileBottomNav />
    </div>
  );
}
