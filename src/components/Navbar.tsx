import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';

const navLinks = [
  { label: '首页', path: '/' },
  { label: '地域甄选', path: '/region' },
  { label: '时令专题', path: '/categories' },
  { label: '文化溯源', path: '/traceability' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: 72,
        backgroundColor: scrolled ? 'rgba(245, 242, 235, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #C8B6A6' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Left: Logo + Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="地道甄选"
            className="w-8 h-8"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span
            className="font-serif text-lg font-semibold tracking-wide"
            style={{ color: scrolled ? '#333333' : '#FFFFFF' }}
          >
            地道甄选
          </span>
        </Link>

        {/* Center: Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative font-serif text-[15px] font-medium py-2 group"
                style={{ color: scrolled ? '#333333' : '#FFFFFF' }}
              >
                {link.label}
                <span
                  className="absolute bottom-0 left-1/2 h-[2px] bg-[#D43C33] transition-all duration-300 ease-out"
                  style={{
                    width: isActive ? '100%' : '0%',
                    transform: 'translateX(-50%)',
                  }}
                />
                <span className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-[#D43C33] group-hover:w-full transition-all duration-300 ease-out transform -translate-x-1/2" />
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Cart, Avatar */}
        <div className="flex items-center gap-5">
          <button
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
            aria-label="搜索"
          >
            <Search size={20} style={{ color: scrolled ? '#333333' : '#FFFFFF' }} />
          </button>

          <Link to="/cart" className="relative p-2 rounded-full hover:bg-black/5 transition-colors">
            <ShoppingCart size={20} style={{ color: scrolled ? '#333333' : '#FFFFFF' }} />
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#D43C33] text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
              3
            </span>
          </Link>

          <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-[#C8B6A6] flex items-center justify-center">
            <img
              src="/product-placeholder.jpg"
              alt="用户"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
