import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import {
  Check,
  ShieldCheck,
  MapPin,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Factory,
  ClipboardCheck,
  Truck,
  ZoomIn,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Types ─── */
interface Spec {
  id: string;
  label: string;
  price: number;
  originalPrice: number;
  stock: '充足' | '紧张' | '售罄';
  stockCount: number;
}

interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  images: string[];
  type: 'good' | 'medium' | 'bad';
  helpful: number;
}

interface TimelineNode {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  details: string[];
  image?: string;
}

/* ─── Mock Data ─── */
const productImages = [
  '/product-placeholder.jpg',
  '/culture-1.jpg',
  '/culture-2.jpg',
  '/region-southwest.jpg',
  '/category-tea.jpg',
  '/certificate-sample.svg',
  '/about-hero.jpg',
  '/hero-banner-3.jpg',
];

const specs: Spec[] = [
  { id: '200g', label: '200g 饼茶', price: 128, originalPrice: 168, stock: '充足', stockCount: 256 },
  { id: '357g', label: '357g 饼茶', price: 198, originalPrice: 268, stock: '紧张', stockCount: 12 },
  { id: 'gift', label: '500g 礼盒装', price: 298, originalPrice: 388, stock: '充足', stockCount: 88 },
];

const reviews: Review[] = [
  {
    id: 'r1',
    user: '茶韵悠扬',
    avatar: '/product-placeholder.jpg',
    rating: 5,
    date: '2024-11-15',
    content: '正宗的普洱茶，汤色红浓透亮，入口醇厚回甘。包装精美，送礼体面，自饮也佳。产地溯源信息完整，买得放心。',
    images: ['/product-placeholder.jpg', '/category-tea.jpg'],
    type: 'good',
    helpful: 24,
  },
  {
    id: 'r2',
    user: '山居笔记',
    avatar: '/product-placeholder.jpg',
    rating: 5,
    date: '2024-11-10',
    content: '第二次回购了，茶叶品质稳定。特别喜欢这款茶的陈香，泡个七八泡还有余韵。',
    images: [],
    type: 'good',
    helpful: 18,
  },
  {
    id: 'r3',
    user: '远方客',
    avatar: '/product-placeholder.jpg',
    rating: 4,
    date: '2024-10-28',
    content: '茶叶不错，口感对得起这个价格。物流稍慢了一点，但包装完好无损。',
    images: ['/culture-1.jpg'],
    type: 'medium',
    helpful: 8,
  },
  {
    id: 'r4',
    user: '品茗人',
    avatar: '/product-placeholder.jpg',
    rating: 3,
    date: '2024-10-15',
    content: '味道还可以，但和描述的陈年感有些差距，可能还需要再存放一段时间。',
    images: [],
    type: 'medium',
    helpful: 3,
  },
  {
    id: 'r5',
    user: '匿名用户',
    avatar: '/product-placeholder.jpg',
    rating: 2,
    date: '2024-09-20',
    content: '茶叶碎末较多，性价比一般。',
    images: [],
    type: 'bad',
    helpful: 1,
  },
];

const relatedProducts = [
  { id: 101, name: '武夷山大红袍', origin: '福建武夷山', price: 268, image: '/category-tea.jpg' },
  { id: 102, name: '安溪铁观音', origin: '福建安溪', price: 158, image: '/category-tea.jpg' },
  { id: 103, name: '西湖龙井', origin: '浙江杭州', price: 388, image: '/category-tea.jpg' },
  { id: 104, name: '洞庭碧螺春', origin: '江苏苏州', price: 328, image: '/category-tea.jpg' },
  { id: 105, name: '福鼎白茶', origin: '福建宁德', price: 218, image: '/category-tea.jpg' },
];

/* ─── GSAP Timeline Section (isolated, no Framer Motion inside) ─── */
const timelineData: TimelineNode[] = [
  {
    icon: <Factory size={20} />,
    title: '供应商基地',
    subtitle: '普洱市思茅区有机茶园',
    details: ['基地海拔1800米，年均温度18℃', '种植面积500亩，有机认证', '合作年限：8年'],
    image: '/region-southwest.jpg',
  },
  {
    icon: <Leaf size={20} />,
    title: '采收 / 生产',
    subtitle: '2024年春季采收 · 传统工艺制作',
    details: ['采摘标准：一芽两叶', '杀青→揉捻→晒干→蒸压', '生产批次：PE2024-SPR-0891'],
    image: '/culture-1.jpg',
  },
  {
    icon: <ClipboardCheck size={20} />,
    title: '质检',
    subtitle: '云南省产品质量监督检验中心',
    details: ['农残检测：全部合格', '重金属检测：合格', '微生物检测：合格', '质检报告编号：YNZJ-2024-04521'],
    image: '/certificate-sample.svg',
  },
  {
    icon: <Truck size={20} />,
    title: '直发发货',
    subtitle: '昆明仓发货 · 顺丰速运',
    details: ['发货仓库：昆明官渡自营仓', '发货时效：24小时内', '物流方式：顺丰冷链/常温'],
    image: '/region-southwest.jpg',
  },
];

function Leaf({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M11 20A7 7 0 0 1 9.8 6.5C12.2 3.9 17 2 17 2c0 0-1.9 4.8-4.5 7.2A7 7 0 0 1 11 20Z" />
      <path d="M11 20v-5" />
    </svg>
  );
}

function TraceabilityTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!sectionRef.current || !lineRef.current) return;

      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'bottom 50%',
            scrub: 1,
          },
        }
      );

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        const icon = node.querySelector('.timeline-icon');
        const card = node.querySelector('.timeline-card');

        if (icon) {
          gsap.fromTo(
            icon,
            { scale: 0 },
            {
              scale: 1,
              duration: 0.5,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: node,
                start: 'top 75%',
                toggleActions: 'play none none reverse',
              },
              delay: i * 0.15,
            }
          );
        }

        if (card) {
          gsap.fromTo(
            card,
            { x: 40, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: node,
                start: 'top 75%',
                toggleActions: 'play none none reverse',
              },
              delay: i * 0.15,
            }
          );
        }
      });
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef} className="relative py-16 px-4 max-w-[1280px] mx-auto">
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-12" style={{ color: '#333333' }}>
        从田间到餐桌 · 全程可追溯
      </h2>

      <div className="relative max-w-3xl mx-auto">
        {/* Vertical dashed line background */}
        <div
          className="absolute left-6 md:left-8 top-0 bottom-0 w-px"
          style={{ borderLeft: '1px dashed #C8B6A6' }}
        />

        {/* Animated fill line */}
        <div
          ref={lineRef}
          className="absolute left-6 md:left-8 top-0 bottom-0 w-px origin-top"
          style={{ backgroundColor: '#2E7D5E', transform: 'scaleY(0)' }}
        />

        <div className="space-y-10">
          {timelineData.map((node, index) => (
            <div
              key={index}
              ref={(el) => { nodeRefs.current[index] = el; }}
              className="relative flex items-start gap-4 md:gap-6 pl-16 md:pl-20"
            >
              {/* Icon circle */}
              <div
                className="timeline-icon absolute left-0 md:left-2 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: '#2E7D5E' }}
              >
                {node.icon}
              </div>

              {/* Card */}
              <div
                className="timeline-card bg-white rounded-xl p-5 shadow-sm flex-1"
                style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: '#333333' }}>
                      {node.title}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#2E7D5E' }}>{node.subtitle}</p>
                    <ul className="space-y-1">
                      {node.details.map((detail, dIdx) => (
                        <li key={dIdx} className="text-sm flex items-center gap-2" style={{ color: '#666666' }}>
                          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#C8B6A6' }} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {node.image && (
                    <img
                      src={node.image}
                      alt={node.title}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Product Detail Page ─── */
export default function ProductDetail() {
  const [selectedSpec, setSelectedSpec] = useState<Spec>(specs[0]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'good' | 'medium' | 'bad'>('all');
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [reviewImageOpen, setReviewImageOpen] = useState(false);
  const [reviewImageIndex, setReviewImageIndex] = useState(0);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  const detailsTabRef = useRef<HTMLButtonElement>(null);
  const reviewsTabRef = useRef<HTMLButtonElement>(null);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedImage(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAddToCart = () => {
    setToast(`已将「${selectedSpec.label}」加入购物车`);
  };

  const handleBuyNow = () => {
    setToast('正在跳转至订单确认页...');
  };

  const filteredReviews = reviewFilter === 'all'
    ? reviews
    : reviews.filter((r) => r.type === reviewFilter);

  const reviewStats = {
    total: reviews.length,
    good: reviews.filter((r) => r.type === 'good').length,
    medium: reviews.filter((r) => r.type === 'medium').length,
    bad: reviews.filter((r) => r.type === 'bad').length,
    rate: Math.round((reviews.filter((r) => r.type === 'good').length / reviews.length) * 100),
  };

  const openReviewLightbox = (images: string[], index: number) => {
    setReviewImages(images);
    setReviewImageIndex(index);
    setReviewImageOpen(true);
  };

  const toggleHelpful = (reviewId: string) => {
    setHelpfulReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#F5F2EB' }}>
      {/* ─── Toast ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full text-white text-sm shadow-lg"
            style={{ backgroundColor: '#D43C33' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Gallery + Info (Desktop side-by-side) ─── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-20 pb-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: Gallery */}
          <div className="w-full lg:w-[55%]">
            <div className="relative overflow-hidden rounded-xl bg-white" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                  {productImages.map((img, idx) => (
                    <div key={idx} className="flex-[0_0_100%] min-w-0 relative">
                      <div className="aspect-square relative">
                        <img
                          src={img}
                          alt={`商品图 ${idx + 1}`}
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => {
                            setLightboxIndex(idx);
                            setLightboxOpen(true);
                          }}
                        />
                        <button
                          onClick={() => {
                            setLightboxIndex(idx);
                            setLightboxOpen(true);
                          }}
                          className="absolute bottom-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
                        >
                          <ZoomIn size={18} style={{ color: '#333333' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nav arrows */}
              <button
                onClick={scrollPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronLeft size={20} style={{ color: '#333333' }} />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronRight size={20} style={{ color: '#333333' }} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {productImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollTo(idx)}
                  className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden"
                  style={{
                    border: selectedImage === idx ? '2px solid #2E7D5E' : '2px solid transparent',
                  }}
                >
                  <img src={img} alt={`缩略图 ${idx + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-[45%] flex flex-col">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: '#D43C33' }}
              >
                <Check size={14} /> 平台自营
              </span>
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: '#2E7D5E' }}
              >
                <ShieldCheck size={14} /> 国家地理标志认证
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-xl md:text-2xl font-semibold leading-relaxed mb-3" style={{ color: '#333333' }}>
              云南<span style={{ color: '#2E7D5E' }}>普洱茶</span> · 古树熟茶七子饼
              <br />
              <span className="text-base font-normal" style={{ color: '#666666' }}>产地：云南普洱 · 思茅区</span>
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-3xl md:text-4xl font-bold" style={{ color: '#D43C33', fontFamily: 'Inter, sans-serif' }}>
                ¥{selectedSpec.price}
              </span>
              <span className="text-base line-through" style={{ color: '#C8B6A6', fontFamily: 'Inter, sans-serif' }}>
                ¥{selectedSpec.originalPrice}
              </span>
            </div>

            {/* Sales & Reviews */}
            <div className="flex items-center gap-4 text-sm mb-5" style={{ color: '#666666' }}>
              <span>销量 3,256+</span>
              <span className="w-px h-3" style={{ backgroundColor: '#C8B6A6' }} />
              <button
                onClick={() => {
                  setActiveTab('reviews');
                  document.getElementById('details-reviews')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:underline"
                style={{ color: '#2E7D5E' }}
              >
                评价 {reviewStats.total}
              </button>
            </div>

            {/* Specs */}
            <div className="mb-5">
              <p className="text-sm font-medium mb-2" style={{ color: '#333333' }}>规格选择</p>
              <div className="flex flex-wrap gap-2">
                {specs.map((spec) => (
                  <motion.button
                    key={spec.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedSpec(spec)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                    style={
                      selectedSpec.id === spec.id
                        ? { backgroundColor: '#2E7D5E', color: '#FFFFFF' }
                        : { border: '1px solid #C8B6A6', color: '#333333', backgroundColor: 'transparent' }
                    }
                  >
                    {spec.label}
                    {spec.stock === '售罄' && (
                      <span className="ml-1 text-xs opacity-60">(售罄)</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5 text-sm">
              <span style={{ color: '#666666' }}>库存：</span>
              <span
                style={{
                  color:
                    selectedSpec.stock === '充足'
                      ? '#2E7D5E'
                      : selectedSpec.stock === '紧张'
                        ? '#D43C33'
                        : '#666666',
                }}
              >
                {selectedSpec.stock === '充足'
                  ? '库存充足'
                  : selectedSpec.stock === '紧张'
                    ? `仅剩 ${selectedSpec.stockCount} 件`
                    : '已售罄'}
              </span>
            </div>

            {/* Origin */}
            <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: '#666666' }}>
              <MapPin size={16} style={{ color: '#2E7D5E' }} />
              <span>产地：云南普洱 · 思茅区 · 有机茶园基地</span>
            </div>

            {/* Action Buttons (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                style={{ border: '1px solid #C8B6A6', color: '#333333' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart size={18} /> 加入购物车
                </span>
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 rounded-full text-sm font-medium text-white transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                style={{ backgroundColor: '#2E7D5E' }}
              >
                立即购买
              </button>
            </div>

            {/* Promotion tag */}
            <div className="hidden lg:flex items-center gap-2 mt-3">
              <span
                className="px-3 py-1 rounded-full text-xs text-white"
                style={{ backgroundColor: '#D43C33' }}
              >
                满99减10
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs text-white"
                style={{ backgroundColor: '#D43C33' }}
              >
                新客首单立减15
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── GI Certification Section ─── */}
      <section className="py-12" style={{ backgroundColor: '#F5F2EB' }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <ShieldCheck size={24} style={{ color: '#2E7D5E' }} />
            <h2 className="font-serif text-xl md:text-2xl font-semibold" style={{ color: '#333333' }}>
              国家地理标志认证
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start gap-6"
            style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}
          >
            <button
              onClick={() => setCertModalOpen(true)}
              className="relative flex-shrink-0 w-32 h-24 md:w-40 md:h-32 rounded-lg overflow-hidden group"
            >
              <img
                src="/certificate-sample.svg"
                alt="地理标志认证证书"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={20} className="text-white" />
              </div>
            </button>

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#999999' }}>认证编号</p>
                  <p className="text-sm font-medium" style={{ color: '#333333' }}>GI-YN-2023-00456</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#999999' }}>认证类型</p>
                  <p className="text-sm font-medium" style={{ color: '#333333' }}>地理标志保护产品</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#999999' }}>批准公告</p>
                  <p className="text-sm font-medium" style={{ color: '#333333' }}>国家质检总局 2008年第92号</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#999999' }}>保护范围</p>
                  <p className="text-sm font-medium" style={{ color: '#333333' }}>云南省普洱市思茅区等11县区</p>
                </div>
              </div>
              <button
                onClick={() => setCertModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:shadow-sm"
                style={{ border: '1px solid #C8B6A6', color: '#333333' }}
              >
                <ZoomIn size={16} /> 查看高清资质
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Traceability Timeline (GSAP isolated) ─── */}
      <section className="py-8" style={{ backgroundColor: '#FFFFFF' }}>
        <TraceabilityTimeline />
      </section>

      {/* ─── Product Details & Reviews ─── */}
      <section id="details-reviews" className="py-12" style={{ backgroundColor: '#F5F2EB' }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          {/* Tabs */}
          <div className="relative flex items-center justify-center gap-8 mb-8 border-b" style={{ borderColor: 'rgba(200, 182, 166, 0.3)' }}>
            <button
              ref={detailsTabRef}
              onClick={() => setActiveTab('details')}
              className="relative pb-3 text-base font-medium transition-colors"
              style={{ color: activeTab === 'details' ? '#2E7D5E' : '#999999' }}
            >
              商品详情
            </button>
            <button
              ref={reviewsTabRef}
              onClick={() => setActiveTab('reviews')}
              className="relative pb-3 text-base font-medium transition-colors"
              style={{ color: activeTab === 'reviews' ? '#2E7D5E' : '#999999' }}
            >
              用户评价({reviewStats.total})
            </button>
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 h-0.5 rounded-full"
              style={{ backgroundColor: '#2E7D5E', width: 60 }}
              animate={{
                left: activeTab === 'details'
                  ? (detailsTabRef.current?.offsetLeft ?? 0)
                  : (reviewsTabRef.current?.offsetLeft ?? 0),
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Taste */}
                <div className="bg-white rounded-xl p-6 md:p-8" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
                  <h3 className="font-serif text-lg font-semibold mb-3" style={{ color: '#333333' }}>口感描述</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#666666' }}>
                    汤色红浓透亮，如琥珀般晶莹。入口醇厚顺滑，陈香显著，带有淡淡的枣香与木质香。茶汤饱满，回甘持久，十余泡后仍有余韵。
                    叶底褐红柔软，活性十足，展现出古树茶特有的生命力。
                  </p>
                  <img
                    src="/category-tea.jpg"
                    alt="茶汤"
                    className="w-full max-w-md mx-auto mt-4 rounded-lg shadow-sm"
                  />
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-xl p-6 md:p-8" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
                  <h3 className="font-serif text-lg font-semibold mb-3" style={{ color: '#333333' }}>功效说明</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['温和养胃', '降脂解腻', '抗氧化'].map((b) => (
                      <div key={b} className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(46, 125, 94, 0.06)' }}>
                        <Leaf size={24} style={{ color: '#2E7D5E', margin: '0 auto 8px' }} />
                        <p className="text-sm font-medium" style={{ color: '#333333' }}>{b}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage */}
                <div className="bg-white rounded-xl p-6 md:p-8" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
                  <h3 className="font-serif text-lg font-semibold mb-3" style={{ color: '#333333' }}>冲泡方法</h3>
                  <ol className="space-y-2 text-sm" style={{ color: '#666666' }}>
                    <li>1. 取茶7-8g，用茶针沿饼边缘撬取，保持条索完整。</li>
                    <li>2. 温杯洁具，以100℃沸水快速润茶一次（5秒内出汤，不喝）。</li>
                    <li>3. 再次注水，前三泡10秒出汤，之后每泡延长5秒。</li>
                    <li>4. 建议使用紫砂壶或盖碗冲泡，更能激发茶香。</li>
                  </ol>
                </div>

                {/* Culture Story */}
                <div className="bg-white rounded-xl p-6 md:p-8" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
                  <h3 className="font-serif text-lg font-semibold mb-3" style={{ color: '#333333' }}>地域文化</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#666666' }}>
                    普洱茶因产地旧属云南普洱府而得名。思茅区地处北回归线附近，海拔落差大，立体气候明显，是普洱茶的核心产区之一。
                    当地茶农世代以茶为生，遵循"天人合一"的古法种植理念，不施化肥农药，让茶树在自然山野间自由生长。
                  </p>
                  <img
                    src="/hero-banner-3.jpg"
                    alt="茶园风光"
                    className="w-full max-w-lg mx-auto rounded-lg shadow-sm"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Review Stats */}
                <div className="bg-white rounded-xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: '#D43C33' }}>{reviewStats.rate}%</div>
                    <div className="text-sm mt-1" style={{ color: '#666666' }}>好评率</div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'all', label: '全部', count: reviewStats.total },
                        { key: 'good', label: '好评', count: reviewStats.good },
                        { key: 'medium', label: '中评', count: reviewStats.medium },
                        { key: 'bad', label: '差评', count: reviewStats.bad },
                      ].map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setReviewFilter(f.key as typeof reviewFilter)}
                          className="px-4 py-1.5 rounded-full text-sm transition-all duration-200"
                          style={
                            reviewFilter === f.key
                              ? { backgroundColor: '#2E7D5E', color: '#FFFFFF' }
                              : { backgroundColor: 'rgba(200, 182, 166, 0.15)', color: '#666666' }
                          }
                        >
                          {f.label} ({f.count})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-xl p-5 md:p-6"
                      style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={review.avatar}
                          alt={review.user}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#333333' }}>{review.user}</p>
                          <p className="text-xs" style={{ color: '#999999' }}>{review.date}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < review.rating ? '#D43C33' : 'transparent'}
                              stroke={i < review.rating ? '#D43C33' : '#C8B6A6'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm mb-3" style={{ color: '#666666' }}>{review.content}</p>
                      {review.images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => openReviewLightbox(review.images, idx)}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden"
                            >
                              <img src={img} alt={`晒单图 ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => toggleHelpful(review.id)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                        style={
                          helpfulReviews.has(review.id)
                            ? { backgroundColor: 'rgba(46, 125, 94, 0.1)', color: '#2E7D5E' }
                            : { backgroundColor: '#F8F8F8', color: '#999999' }
                        }
                      >
                        <ThumbsUp size={14} />
                        有用 ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})
                      </button>
                    </div>
                  ))}
                  {filteredReviews.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-sm" style={{ color: '#999999' }}>暂无此类评价</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── Related Products ─── */}
      <section className="py-12" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-center mb-8" style={{ color: '#333333' }}>
            猜你喜欢
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {relatedProducts.map((product) => (
              <a
                key={product.id}
                href={`#/product/${product.id}`}
                className="flex-shrink-0 w-40 md:w-52 group"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-3" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif text-sm font-medium mb-1 group-hover:text-[#2E7D5E] transition-colors" style={{ color: '#333333' }}>
                  {product.name}
                </h3>
                <p className="text-xs mb-1" style={{ color: '#2E7D5E' }}>{product.origin}</p>
                <p className="text-sm font-bold" style={{ color: '#D43C33', fontFamily: 'Inter, sans-serif' }}>
                  ¥{product.price}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mobile Fixed Action Bar ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white px-4 py-3 flex items-center gap-3" style={{ borderTop: '1px solid #C8B6A6', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleAddToCart}
          className="flex-1 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.95]"
          style={{ border: '1px solid #C8B6A6', color: '#333333' }}
        >
          加入购物车
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 py-3 rounded-full text-sm font-medium text-white transition-all duration-200 active:scale-[0.95]"
          style={{ backgroundColor: '#2E7D5E' }}
        >
          立即购买
        </button>
      </div>

      {/* ─── Lightbox for Product Images ─── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={productImages.map((src) => ({ src }))}
        index={lightboxIndex}
        plugins={[Zoom]}
      />

      {/* ─── Lightbox for Review Images ─── */}
      <Lightbox
        open={reviewImageOpen}
        close={() => setReviewImageOpen(false)}
        slides={reviewImages.map((src) => ({ src }))}
        index={reviewImageIndex}
        plugins={[Zoom]}
      />

      {/* ─── Certificate Modal ─── */}
      <AnimatePresence>
        {certModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setCertModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold" style={{ color: '#333333' }}>地理标志认证证书</h3>
                <button
                  onClick={() => setCertModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>
              <img
                src="/certificate-sample.svg"
                alt="地理标志认证证书"
                className="w-full rounded-lg mb-4"
              />
              <div className="space-y-2 text-sm">
                <p><span style={{ color: '#999999' }}>认证名称：</span><span style={{ color: '#333333' }}>普洱茶地理标志保护产品</span></p>
                <p><span style={{ color: '#999999' }}>认证编号：</span><span style={{ color: '#333333' }}>GI-YN-2023-00456</span></p>
                <p><span style={{ color: '#999999' }}>批准机构：</span><span style={{ color: '#333333' }}>国家质量监督检验检疫总局</span></p>
                <p><span style={{ color: '#999999' }}>批准日期：</span><span style={{ color: '#333333' }}>2008年5月13日</span></p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for mobile action bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
