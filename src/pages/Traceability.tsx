import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import {
  ScanLine,
  Search,
  ShieldCheck,
  Factory,
  ClipboardCheck,
  Truck,
  ZoomIn,
  AlertCircle,
  RotateCcw,
  Phone,
  Check,
  Package,
  MapPin,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Types ─── */
interface TraceResult {
  code: string;
  productName: string;
  giCert: {
    name: string;
    number: string;
    type: string;
    origin: string;
    date: string;
    validUntil: string;
    image: string;
  };
  supplier: {
    name: string;
    address: string;
    years: number;
    category: string;
    image: string;
    shipping: string;
  };
  qc: {
    produceDate: string;
    batch: string;
    shelfLife: string;
    agency: string;
    reportImage: string;
    items: { name: string; result: string }[];
  };
  logistics: {
    company: string;
    tracking: string;
    nodes: { time: string; location: string; status: string; completed: boolean }[];
  };
}

/* ─── Mock Data ─── */
const mockResult: TraceResult = {
  code: 'YNPU-2024-883921',
  productName: '云南普洱茶 · 古树熟茶七子饼 357g',
  giCert: {
    name: '普洱茶地理标志保护产品',
    number: 'GI-YN-2023-00456',
    type: '地理标志保护产品',
    origin: '云南省普洱市思茅区',
    date: '2008-05-13',
    validUntil: '长期有效',
    image: '/certificate-sample.svg',
  },
  supplier: {
    name: '思茅区古树茶园合作社',
    address: '云南省普洱市思茅区倚象镇大寨村',
    years: 8,
    category: '普洱茶、滇红茶',
    image: '/region-southwest.jpg',
    shipping: '自营仓直发',
  },
  qc: {
    produceDate: '2024-03-15',
    batch: 'PE2024-SPR-0891',
    shelfLife: '适宜长期存放，越陈越香',
    agency: '云南省产品质量监督检验中心',
    reportImage: '/certificate-sample.svg',
    items: [
      { name: '农残（六六六）', result: '合格' },
      { name: '农残（滴滴涕）', result: '合格' },
      { name: '重金属（铅）', result: '合格' },
      { name: '重金属（砷）', result: '合格' },
      { name: '微生物（大肠杆菌）', result: '合格' },
      { name: '感官品质', result: '优级' },
    ],
  },
  logistics: {
    company: '顺丰速运',
    tracking: 'SF1234567890123',
    nodes: [
      { time: '2024-11-18 14:30', location: '昆明官渡自营仓', status: '已揽收，准备发往下一站', completed: true },
      { time: '2024-11-18 22:15', location: '昆明转运中心', status: '快件已到达昆明转运中心', completed: true },
      { time: '2024-11-19 08:40', location: '成都转运中心', status: '快件运输中', completed: true },
      { time: '2024-11-20 06:20', location: '北京顺义转运中心', status: '快件已到达北京顺义转运中心', completed: true },
      { time: '2024-11-20 14:00', location: '北京市朝阳区', status: '派送中，快递员正在为您派送', completed: false },
      { time: '预计今日', location: '北京市朝阳区', status: '等待签收', completed: false },
    ],
  },
};

const EXAMPLE_CODE = 'YNPU-2024-883921';

/* ─── GSAP Isolated Logistics Timeline ─── */
function LogisticsTimeline({ nodes }: { nodes: TraceResult['logistics']['nodes'] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        const dot = node.querySelector('.logistics-dot');
        if (dot && nodes[i]?.completed) {
          gsap.fromTo(
            dot,
            { scale: 0.8, backgroundColor: '#C8B6A6' },
            {
              scale: 1,
              backgroundColor: '#2E7D5E',
              duration: 0.4,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: node,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    },
    { scope: sectionRef, dependencies: [nodes] }
  );

  return (
    <div ref={sectionRef} className="relative pl-6 md:pl-8">
      {/* Vertical line */}
      <div className="absolute left-2 md:left-3 top-2 bottom-2 w-px" style={{ backgroundColor: '#E5E5E5' }} />

      <div className="space-y-6">
        {nodes.map((node, index) => (
          <div
            key={index}
            ref={(el) => { nodeRefs.current[index] = el; }}
            className="relative flex items-start gap-4"
          >
            {/* Dot */}
            <div
              className="logistics-dot absolute -left-6 md:-left-8 top-1 w-4 h-4 rounded-full border-2 flex-shrink-0 z-10"
              style={{
                borderColor: node.completed ? '#2E7D5E' : '#C8B6A6',
                backgroundColor: node.completed ? '#2E7D5E' : '#FFFFFF',
              }}
            />
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm font-medium" style={{ color: '#333333' }}>{node.time}</span>
                <span className="text-xs" style={{ color: '#999999' }}>{node.location}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: node.completed ? '#2E7D5E' : '#999999' }}>
                {node.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Traceability Page ─── */
export default function Traceability() {
  const [queryMode, setQueryMode] = useState<'scan' | 'input'>('input');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TraceResult | null>(null);
  const [error, setError] = useState<'invalid' | 'network' | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQuery = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      if (code.trim() === EXAMPLE_CODE) {
        setResult(mockResult);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else if (code.trim().toLowerCase() === 'error') {
        setError('network');
      } else {
        setError('invalid');
      }
    }, 1500);
  };

  const handleExampleClick = () => {
    setCode(EXAMPLE_CODE);
    inputRef.current?.focus();
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#F5F2EB' }}>
      {/* ─── Query Input Section ─── */}
      <section
        className="relative min-h-[50vh] flex flex-col items-center justify-center px-4 py-16"
        style={{ minHeight: 'max(50vh, 400px)' }}
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: 'url(/trace-bg.jpg)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(245,242,235,0.8) 0%, rgba(245,242,235,0) 100%)',
          }}
        />

        <div className="relative z-10 w-full max-w-lg">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-3" style={{ color: '#000000' }}>
              溯源查询 · 正品验证
            </h1>
            <p className="text-sm md:text-base" style={{ color: '#666666' }}>
              输入商品溯源码，查看全链路认证信息
            </p>
          </motion.div>

          {/* Query Mode Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center justify-center gap-6 mb-6 relative"
          >
            <button
              onClick={() => setQueryMode('scan')}
              className="relative pb-2 text-sm font-medium transition-colors"
              style={{ color: queryMode === 'scan' ? '#D43C33' : '#999999' }}
            >
              <span className="flex items-center gap-2">
                <ScanLine size={16} /> 扫码查询
              </span>
            </button>
            <button
              onClick={() => setQueryMode('input')}
              className="relative pb-2 text-sm font-medium transition-colors"
              style={{ color: queryMode === 'input' ? '#D43C33' : '#999999' }}
            >
              <span className="flex items-center gap-2">
                <Search size={16} /> 手动输入
              </span>
            </button>
            <motion.div
              className="absolute bottom-0 h-0.5 rounded-full"
              style={{ backgroundColor: '#D43C33', width: 60 }}
              animate={{
                left: queryMode === 'scan' ? 'calc(50% - 130px)' : 'calc(50% + 20px)',
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </motion.div>

          {/* Query Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {queryMode === 'scan' ? (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <button
                    onClick={() => {
                      setCode(EXAMPLE_CODE);
                      setQueryMode('input');
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="w-48 h-48 md:w-56 md:h-56 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                    style={{
                      border: '2px dashed #C8B6A6',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <ScanLine size={40} style={{ color: '#2E7D5E' }} />
                    <span className="text-sm font-medium" style={{ color: '#333333' }}>点击启动相机扫码</span>
                  </button>
                  <p className="text-xs mt-3" style={{ color: '#999999' }}>请将商品包装上的溯源码置于框内</p>
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-center gap-3 w-full max-w-md">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                        placeholder="请输入6-12位溯源码"
                        className="w-full bg-transparent py-3 px-1 text-sm outline-none transition-all duration-300"
                        style={{
                          borderBottom: '2px solid #2E7D5E',
                          color: '#333333',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderBottom = '2px solid #2E7D5E';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderBottom = '1px solid #C8B6A6';
                        }}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                        style={{ backgroundColor: '#C8B6A6' }}
                      />
                    </div>
                    <button
                      onClick={handleQuery}
                      disabled={loading || !code.trim()}
                      className="px-6 py-3 rounded-full text-sm font-medium text-white transition-all duration-200 active:scale-[0.95] disabled:opacity-50"
                      style={{ backgroundColor: '#2E7D5E' }}
                    >
                      {loading ? '查询中...' : '查询'}
                    </button>
                  </div>
                  <button
                    onClick={handleExampleClick}
                    className="text-xs mt-3 hover:underline"
                    style={{ color: '#2E7D5E' }}
                  >
                    示例：{EXAMPLE_CODE}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ─── Loading Skeleton ─── */}
      {loading && (
        <section className="max-w-[1280px] mx-auto px-4 md:px-6 pb-16">
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 h-40 animate-pulse"
                style={{ border: '1px solid rgba(200, 182, 166, 0.2)' }}
              >
                <div className="h-4 rounded w-1/3 mb-3" style={{ backgroundColor: '#F0F0F0' }} />
                <div className="h-3 rounded w-2/3 mb-2" style={{ backgroundColor: '#F5F5F5' }} />
                <div className="h-3 rounded w-1/2" style={{ backgroundColor: '#F5F5F5' }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Error States ─── */}
      <AnimatePresence>
        {error && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1280px] mx-auto px-4 md:px-6 pb-16"
          >
            <div className="bg-white rounded-xl p-8 md:p-12 text-center max-w-md mx-auto" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
              {error === 'invalid' ? (
                <>
                  <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#D43C33' }} />
                  <h3 className="font-serif text-lg font-semibold mb-2" style={{ color: '#333333' }}>溯源码无效</h3>
                  <p className="text-sm mb-6" style={{ color: '#666666' }}>
                    溯源码无效，请核对后重新扫描或输入
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#D43C33' }} />
                  <h3 className="font-serif text-lg font-semibold mb-2" style={{ color: '#333333' }}>查询失败</h3>
                  <p className="text-sm mb-6" style={{ color: '#666666' }}>
                    查询失败，请检查网络后重试
                  </p>
                </>
              )}
              <button
                onClick={() => {
                  setError(null);
                  setCode('');
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-sm"
                style={{ backgroundColor: '#2E7D5E', color: '#FFFFFF' }}
              >
                <RotateCcw size={16} /> {error === 'invalid' ? '重新查询' : '重试'}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── Query Results ─── */}
      <AnimatePresence>
        {result && (
          <motion.section
            ref={resultRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-[1280px] mx-auto px-4 md:px-6 pb-16"
          >
            {/* Product Info Header */}
            <div className="bg-white rounded-xl p-5 mb-4 flex items-center gap-3" style={{ border: '1px solid rgba(200, 182, 166, 0.3)' }}>
              <Package size={20} style={{ color: '#2E7D5E' }} />
              <div>
                <p className="text-xs" style={{ color: '#999999' }}>溯源码：{result.code}</p>
                <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.productName}</p>
              </div>
              <span
                className="ml-auto px-3 py-1 rounded-full text-xs text-white"
                style={{ backgroundColor: '#2E7D5E' }}
              >
                验证通过
              </span>
            </div>

            {/* Card 1: GI Certification */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0 }}
              className="bg-white rounded-xl p-6 mb-4 overflow-hidden"
              style={{ border: '1px solid rgba(200, 182, 166, 0.3)', borderLeft: '4px solid #2E7D5E' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={20} style={{ color: '#2E7D5E' }} />
                <h3 className="font-serif text-lg font-semibold" style={{ color: '#333333' }}>地理标识认证信息</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={() => openLightbox([result.giCert.image], 0)}
                  className="relative flex-shrink-0 w-full md:w-40 h-32 rounded-lg overflow-hidden group"
                >
                  <img src={result.giCert.image} alt="认证证书" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={18} className="text-white" />
                  </div>
                </button>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>认证名称</p>
                    <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.giCert.name}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>认证编号</p>
                    <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.giCert.number}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>认证类型</p>
                    <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.giCert.type}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>产地</p>
                    <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.giCert.origin}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>批准日期</p>
                    <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.giCert.date}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>有效期</p>
                    <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.giCert.validUntil}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(200, 182, 166, 0.2)' }}>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white"
                  style={{ backgroundColor: '#2E7D5E' }}
                >
                  <Check size={14} /> 该商品已通过国家地理标志认证
                </span>
              </div>
            </motion.div>

            {/* Card 2: Supplier Profile */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-white rounded-xl p-6 mb-4 overflow-hidden"
              style={{ border: '1px solid rgba(200, 182, 166, 0.3)', borderLeft: '4px solid #C8B6A6' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Factory size={20} style={{ color: '#C8B6A6' }} />
                <h3 className="font-serif text-lg font-semibold" style={{ color: '#333333' }}>供应商档案</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>供应商名称</p>
                    <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.supplier.name}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>基地地址</p>
                    <p className="text-sm font-medium flex items-start gap-1" style={{ color: '#333333' }}>
                      <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#2E7D5E' }} />
                      {result.supplier.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>合作年限</p>
                    <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.supplier.years}年</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#999999' }}>供货品类</p>
                    <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.supplier.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => openLightbox([result.supplier.image], 0)}
                  className="relative flex-shrink-0 w-full md:w-48 h-32 rounded-lg overflow-hidden group"
                >
                  <img src={result.supplier.image} alt="供应商基地" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={18} className="text-white" />
                  </div>
                </button>
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(200, 182, 166, 0.2)' }}>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ backgroundColor: 'rgba(200, 182, 166, 0.15)', color: '#666666' }}
                >
                  <Truck size={14} /> {result.supplier.shipping}
                </span>
              </div>
            </motion.div>

            {/* Card 3: Production & QC */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="bg-white rounded-xl p-6 mb-4 overflow-hidden"
              style={{ border: '1px solid rgba(200, 182, 166, 0.3)', borderLeft: '4px solid #D43C33' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <ClipboardCheck size={20} style={{ color: '#D43C33' }} />
                <h3 className="font-serif text-lg font-semibold" style={{ color: '#333333' }}>生产与质检</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs" style={{ color: '#999999' }}>生产日期</p>
                  <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.qc.produceDate}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#999999' }}>批次号</p>
                  <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.qc.batch}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#999999' }}>保质期</p>
                  <p className="text-sm font-medium" style={{ color: '#333333' }}>{result.qc.shelfLife}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-xs mb-2" style={{ color: '#999999' }}>质检机构：{result.qc.agency}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {result.qc.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
                        style={{ backgroundColor: 'rgba(46, 125, 94, 0.06)' }}
                      >
                        <Check size={12} style={{ color: '#2E7D5E' }} />
                        <span style={{ color: '#333333' }}>{item.name}</span>
                        <span className="ml-auto font-medium" style={{ color: '#2E7D5E' }}>{item.result}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => openLightbox([result.qc.reportImage], 0)}
                  className="relative flex-shrink-0 w-full md:w-40 h-28 rounded-lg overflow-hidden group"
                >
                  <img src={result.qc.reportImage} alt="质检报告" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={18} className="text-white" />
                  </div>
                </button>
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(200, 182, 166, 0.2)' }}>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ border: '1px solid #D43C33', color: '#D43C33' }}
                >
                  <Check size={14} /> 质检合格
                </span>
              </div>
            </motion.div>

            {/* Card 4: Logistics */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="bg-white rounded-xl p-6 mb-4 overflow-hidden"
              style={{ border: '1px solid rgba(200, 182, 166, 0.3)', borderLeft: '4px solid #333333' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Truck size={20} style={{ color: '#333333' }} />
                <h3 className="font-serif text-lg font-semibold" style={{ color: '#333333' }}>物流轨迹</h3>
              </div>
              <LogisticsTimeline nodes={result.logistics.nodes} />
              <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(200, 182, 166, 0.2)' }}>
                <div className="flex items-center gap-4 text-sm">
                  <span style={{ color: '#666666' }}>物流公司：{result.logistics.company}</span>
                  <span style={{ color: '#666666' }}>运单号：{result.logistics.tracking}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(result.logistics.tracking);
                    alert('运单号已复制到剪贴板');
                  }}
                  className="text-sm px-3 py-1.5 rounded-full transition-all duration-200 hover:shadow-sm"
                  style={{ border: '1px solid #C8B6A6', color: '#333333' }}
                >
                  复制运单号
                </button>
              </div>
            </motion.div>

            {/* ─── Trust Footer ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="py-10 px-6 md:px-8 rounded-xl"
              style={{ backgroundColor: '#F8F8F8' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {[
                  { icon: <ShieldCheck size={28} style={{ color: '#2E7D5E' }} />, title: '官方认证', desc: '国家地理标志认证' },
                  { icon: <Search size={28} style={{ color: '#2E7D5E' }} />, title: '透明可查', desc: '全程溯源追踪' },
                  { icon: <Check size={28} style={{ color: '#2E7D5E' }} />, title: '正品保障', desc: '假一赔十承诺' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + idx * 0.15 }}
                    className="text-center"
                  >
                    <div className="mb-2 flex justify-center">{item.icon}</div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#333333' }}>{item.title}</p>
                    <p className="text-xs" style={{ color: '#999999' }}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-sm mb-3" style={{ color: '#666666' }}>如有疑问，请联系在线客服</p>
                <button
                  onClick={() => alert('客服功能即将上线')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-200 hover:shadow-sm"
                  style={{ border: '1px solid #2E7D5E', color: '#2E7D5E' }}
                >
                  <Phone size={16} /> 联系客服
                </button>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── Lightbox ─── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxImages.map((src) => ({ src }))}
        index={lightboxIndex}
        plugins={[Zoom]}
      />
    </div>
  );
}
