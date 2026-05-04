import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerLinks = [
  {
    title: '关于我们',
    links: [
      { label: '品牌故事', path: '/about' },
      { label: '地理标志说明', path: '/about' },
      { label: '资质公示', path: '/about' },
    ],
  },
  {
    title: '购物指南',
    links: [
      { label: '选购攻略', path: '/categories' },
      { label: '配送说明', path: '/about' },
      { label: '支付方式', path: '/about' },
    ],
  },
  {
    title: '售后服务',
    links: [
      { label: '退换货政策', path: '/about' },
      { label: '假一赔十', path: '/about' },
      { label: '联系客服', path: '/about' },
    ],
  },
  {
    title: '联系我们',
    links: [
      { label: '商务合作', path: '/about' },
      { label: '产地入驻', path: '/about' },
      { label: '意见反馈', path: '/about' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1280px] mx-auto px-6 pt-16 pb-8">
        {/* Brand Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h3 className="font-serif text-[28px] md:text-[32px] font-semibold tracking-wider">
            甄选中华地道风物
          </h3>
        </motion.div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-serif text-base font-medium mb-4 text-white">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-[#999999] hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-[#333333] pt-6 text-center">
          <p className="text-xs text-[#666666]">
            &copy; 2024 地道甄选 - 国家地理标志特产商城. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  );
}
