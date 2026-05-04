import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Award, ScanLine, CheckCircle, MapPin,
  ChevronRight, ExternalLink, ZoomIn, X, Star, Phone, Mail, MapPinned
} from 'lucide-react';

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
function AnimatedNumber({ value, suffix = '', color = '#2E7D5E' }: { value: number; suffix?: string; color?: string }) {
  const animated = useCountUp(value, 1500);
  return (
    <motion.span
      className="tabular-nums font-bold"
      style={{ color, fontFamily: 'Inter, sans-serif' }}
      initial={{ scale: 1.05 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, delay: 1.5 }}
    >
      {animated.toLocaleString()}{suffix}
    </motion.span>
  );
}

/* ─── Stat Card ─── */
function StatCard({ value, suffix, label, sub, color, delay }: {
  value: number;
  suffix?: string;
  label: string;
  sub: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="text-center"
    >
      <div className="text-2xl md:text-3xl mb-1">
        <AnimatedNumber value={value} suffix={suffix} color={color} />
      </div>
      <div className="text-sm text-[#333333] font-medium mb-0.5">{label}</div>
      <div className="text-xs text-[#666666]">{sub}</div>
    </motion.div>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollY = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative h-[60vh] min-h-[500px] overflow-hidden flex items-center justify-center">
      <div ref={parallaxRef} className="absolute inset-0" style={{ willChange: 'transform' }}>
        <img
          src="/about-hero.jpg"
          alt="品牌承诺"
          className="w-full h-[130%] object-cover"
          style={{ marginTop: '-15%' }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)' }}
      />
      <div className="relative z-10 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-4xl md:text-5xl font-semibold text-white mb-4"
        >
          关于地道甄选
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base md:text-lg text-[#F5F2EB] mb-8"
        >
          每一件特产，都经过国家认证的甄选
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          className="px-8 py-3 rounded-full text-white text-sm font-medium border border-white/40 hover:border-white/80 transition-all"
        >
          查看全部资质
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Platform Introduction ─── */
function PlatformIntro() {
  return (
    <div className="max-w-[960px] mx-auto px-4 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-2xl font-semibold text-[#000000] mb-4">
            甄选中华地道风物
          </h2>
          <p className="text-base text-[#666666] leading-[1.8] mb-6">
            地道甄选致力于直连全国地理标志特产供应商，从源头把控品质，让每一份特产都拥有可追溯的"身份证"。
            我们深入产地，与当地农户、合作社建立长期合作，严格筛选符合国家地理标志认证标准的产品，
            为用户带来真正原汁原味的地方特产。
          </p>
          <button className="flex items-center gap-1 text-[#2E7D5E] text-sm font-medium hover:underline">
            了解更多 <ChevronRight size={16} />
          </button>
        </motion.div>

        <div className="grid grid-cols-2 gap-6">
          <StatCard
            value={34}
            suffix="+"
            label="覆盖省份"
            sub="覆盖全国所有省份的地理标志特产"
            color="#2E7D5E"
            delay={0}
          />
          <StatCard
            value={2000}
            suffix="+"
            label="认证商品"
            sub="严格审核的国家地理标志产品"
            color="#2E7D5E"
            delay={0.2}
          />
          <StatCard
            value={500}
            suffix="+"
            label="合作供应商"
            sub="经过实地考察的产地直供伙伴"
            color="#2E7D5E"
            delay={0.4}
          />
          <StatCard
            value={99.2}
            suffix="%"
            label="用户好评率"
            sub="来自真实用户的品质认可"
            color="#D43C33"
            delay={0.6}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── GI Education ─── */
function GIEducation() {
  const cards = [
    {
      icon: ShieldCheck,
      title: '地理标志保护产品',
      desc: '经国家质检总局审核批准，以地理名称命名的产品',
      link: '#',
    },
    {
      icon: Wheat,
      title: '地理标志农产品',
      desc: '经农业农村部登记，源自特定地域的农产品',
      link: '#',
    },
    {
      icon: Award,
      title: '地理标志商标',
      desc: '经国家知识产权局注册，标示商品来源的集体商标',
      link: '#',
    },
  ];

  return (
    <div className="bg-[#F8F8F8] py-24">
      <div className="max-w-[960px] mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-2xl md:text-3xl font-semibold text-[#000000] mb-10 text-center"
        >
          什么是国家地理标志？
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="bg-white rounded-xl overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-1 bg-[#2E7D5E] group-hover:h-1.5 transition-all duration-300" />
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#F8F8F8] flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-[#2E7D5E]" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#333333] mb-2">{card.title}</h3>
                  <p className="text-sm text-[#666666] leading-relaxed mb-4">{card.desc}</p>
                  <button className="flex items-center gap-1 text-[#2E7D5E] text-sm mx-auto hover:underline">
                    了解更多 <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Authenticity Promise ─── */
function AuthenticityPromise() {
  const promises = [
    {
      icon: CheckCircle,
      title: '源头把控',
      desc: '仅对接持有国家地理标志授权的供应商，实地考察产地环境，确保产品来源真实可靠。',
      img: '/certificate-sample.jpg',
    },
    {
      icon: ShieldCheck,
      title: '资质审核',
      desc: '每款商品上架前强制绑定有效地理标识资质证书，未经审核一律不予上架。',
      img: '/certificate-sample.jpg',
    },
    {
      icon: ScanLine,
      title: '全程溯源',
      desc: '一物一码，扫码可查全链路生产、质检、物流信息，让每一份特产都有迹可循。',
      img: '/certificate-sample.jpg',
    },
    {
      icon: Award,
      title: '假一赔十',
      desc: '若发现非正品地理标志特产，平台承诺十倍赔付，用真金白银守护您的信任。',
      img: '/certificate-sample.jpg',
    },
  ];

  return (
    <div className="max-w-[960px] mx-auto px-4 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-serif text-2xl md:text-3xl font-semibold text-[#000000] mb-10 text-center"
      >
        我们的保真承诺
      </motion.h2>
      <div className="space-y-6">
        {promises.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="bg-white rounded-xl p-5 md:p-6 flex items-start gap-4 md:gap-6 hover:shadow-lg transition-shadow"
              style={{ borderLeft: '4px solid #2E7D5E' }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#2E7D5E] flex items-center justify-center shrink-0"
              >
                <Icon size={28} className="text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg md:text-xl font-semibold text-[#333333] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#666666] leading-[1.8]">{item.desc}</p>
              </div>
              <img
                src={item.img}
                alt={item.title}
                className="hidden md:block w-24 h-16 object-cover rounded-lg bg-[#F8F8F8] shrink-0"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Certification Wall ─── */
function CertificationWall() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const certs = [
    { name: '五常大米地理标志保护产品', code: 'GB/T 19266' },
    { name: '西湖龙井地理标志保护产品', code: 'GB/T 18650' },
    { name: '阳澄湖大闸蟹农产品地理标志', code: 'AGI2018-03-2523' },
    { name: '武夷岩茶地理标志保护产品', code: 'GB/T 18745' },
    { name: '新疆哈密瓜地理标志保护产品', code: 'GB/T 23398' },
    { name: '贵州茅台地理标志保护产品', code: 'GB/T 18356' },
    { name: '洞庭碧螺春地理标志保护产品', code: 'GB/T 18957' },
    { name: '赣南脐橙农产品地理标志', code: 'AGI2016-03-2134' },
  ];

  return (
    <div className="bg-[#F5F2EB] py-24">
      <div className="max-w-[960px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#000000] mb-2">
            已备案资质公示
          </h2>
          <p className="text-sm text-[#666666]">以下为我们已审核备案的部分地理标志资质证书</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {certs.map((cert, index) => (
            <motion.div
              key={cert.code}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="group cursor-pointer"
              onClick={() => setLightbox(cert.name)}
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <img
                  src="/certificate-sample.jpg"
                  alt={cert.name}
                  className="w-full h-28 object-cover bg-[#F8F8F8]"
                />
                <div className="p-2.5 text-center">
                  <p className="text-xs text-[#333333] truncate">{cert.name}</p>
                  <p className="text-[10px] text-[#C8B6A6] mt-0.5">{cert.code}</p>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center mt-1">
                <span className="text-[10px] text-[#2E7D5E]">点击放大</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="px-6 py-2 border border-[#C8B6A6] text-[#666666] text-sm rounded-full hover:bg-white hover:border-[#2E7D5E] hover:text-[#2E7D5E] transition-all">
            查看全部资质 →
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setLightbox(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src="/certificate-sample.jpg"
                alt={lightbox}
                className="w-full h-64 object-cover bg-[#F8F8F8]"
              />
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-serif text-base font-semibold text-[#333333]">{lightbox}</h3>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── User Testimonials ─── */
function Testimonials() {
  const testimonials = [
    {
      name: '林小姐',
      level: '黄金会员',
      avatar: '/product-placeholder.jpg',
      content: '在地道甄选买了五常大米，煮出来的米饭特别香，和之前在东北本地吃的一个味道。溯源码扫出来确实是正宗的五常产地，很放心。',
      product: '五常大米 5kg',
      productImg: '/product-placeholder.jpg',
      date: '2024-09-01',
    },
    {
      name: '张先生',
      level: '白银会员',
      avatar: '/product-placeholder.jpg',
      content: '送给客户的西湖龙井礼盒收到了一致好评，包装精美，茶叶品质上乘。平台的发货速度和客服响应都很专业。',
      product: '西湖龙井 250g',
      productImg: '/product-placeholder.jpg',
      date: '2024-08-25',
    },
    {
      name: '王女士',
      level: '黄金会员',
      avatar: '/product-placeholder.jpg',
      content: '作为美食博主，我对比过很多平台的地标特产，地道甄选的选品确实用心，每款产品都有详细的产地介绍和认证信息，值得信赖。',
      product: '阳澄湖大闸蟹',
      productImg: '/product-placeholder.jpg',
      date: '2024-08-18',
    },
    {
      name: '陈先生',
      level: '普通会员',
      avatar: '/product-placeholder.jpg',
      content: '第一次购买地理标志产品，体验超出预期。新疆哈密瓜甜度高、汁水足，物流包装也很到位，没有任何破损。',
      product: '新疆哈密瓜',
      productImg: '/product-placeholder.jpg',
      date: '2024-08-10',
    },
  ];

  return (
    <div className="bg-[#F8F8F8] py-24">
      <div className="max-w-[960px] mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-2xl md:text-3xl font-semibold text-[#000000] mb-10 text-center"
        >
          用户真实评价
        </motion.h2>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-xl p-5 min-w-[280px] md:min-w-[320px] snap-start hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex-shrink-0"
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover bg-[#F8F8F8]" />
                <div>
                  <div className="text-sm font-medium text-[#333333]">{t.name}</div>
                  <span className="text-[10px] px-2 py-0.5 bg-[#2E7D5E] text-white rounded-full">
                    {t.level}
                  </span>
                </div>
              </div>
              <p className="text-sm text-[#666666] leading-[1.7] mb-3 line-clamp-3">{t.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={t.productImg} alt={t.product} className="w-10 h-10 rounded-lg object-cover bg-[#F8F8F8]" />
                  <span className="text-xs text-[#666666] truncate max-w-[100px]">{t.product}</span>
                </div>
                <span className="text-xs text-[#C8B6A6]">{t.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Contact Info ─── */
function ContactSection() {
  return (
    <div className="max-w-[960px] mx-auto px-4 py-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-serif text-2xl font-semibold text-[#000000] mb-8 text-center"
      >
        联系我们
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Phone, label: '客服电话', value: '400-888-6666' },
          { icon: Mail, label: '商务邮箱', value: 'business@didao.com' },
          { icon: MapPinned, label: '公司地址', value: '北京市朝阳区建国路88号' },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[#F8F8F8] flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-[#2E7D5E]" />
              </div>
              <div className="text-xs text-[#666666] mb-1">{item.label}</div>
              <div className="text-sm font-medium text-[#333333]">{item.value}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Bottom CTA ─── */
function BottomCTA() {
  return (
    <div className="bg-[#2E7D5E] py-20">
      <div className="max-w-[960px] mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-2xl md:text-3xl font-semibold text-white mb-3"
        >
          开始甄选你的地道风物
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base text-white/80 mb-8"
        >
          覆盖全国 34 省，2000+ 国家地理标志认证特产
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ backgroundColor: '#F5F2EB', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
          className="px-10 py-3.5 bg-white text-[#000000] text-sm font-medium rounded-full transition-all duration-300"
        >
          立即选购
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Main About Page ─── */
export default function About() {
  return (
    <div className="min-h-[100dvh] bg-[#F5F2EB]">
      <HeroSection />
      <PlatformIntro />
      <GIEducation />
      <AuthenticityPromise />
      <CertificationWall />
      <Testimonials />
      <ContactSection />
      <BottomCTA />
    </div>
  );
}
