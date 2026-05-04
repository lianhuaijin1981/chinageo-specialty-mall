import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, ArrowUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingToolbar />
    </div>
  );
}
