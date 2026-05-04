import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Traceability from './pages/Traceability';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-semibold text-[#333333] mb-4">{title}</h1>
        <p className="text-[#666666]">页面建设中，敬请期待...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/region" element={<PlaceholderPage title="地域甄选" />} />
        <Route path="/categories" element={<PlaceholderPage title="全部分类" />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/traceability" element={<Traceability />} />
        <Route path="/cart" element={<PlaceholderPage title="购物车" />} />
        <Route path="/orders" element={<PlaceholderPage title="订单中心" />} />
        <Route path="/profile" element={<PlaceholderPage title="个人中心" />} />
        <Route path="/member" element={<PlaceholderPage title="会员权益" />} />
        <Route path="/about" element={<PlaceholderPage title="品牌承诺" />} />
      </Routes>
    </Layout>
  );
}
