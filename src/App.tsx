import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Region from './pages/Region';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Traceability from './pages/Traceability';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Member from './pages/Member';
import About from './pages/About';
import SearchPage from './pages/SearchPage';
import CouponCenter from './pages/CouponCenter';
import MyCoupons from './pages/MyCoupons';
import PointsMall from './pages/PointsMall';
import MyPointsOrders from './pages/MyPointsOrders';
import SeckillList from './pages/SeckillList';
import SeckillDetail from './pages/SeckillDetail';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/region" element={<Region />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/traceability" element={<Traceability />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/member" element={<Member />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/coupons" element={<CouponCenter />} />
        <Route path="/coupons/my" element={<MyCoupons />} />
        <Route path="/points-mall" element={<PointsMall />} />
        <Route path="/points/orders" element={<MyPointsOrders />} />
        <Route path="/seckill" element={<SeckillList />} />
        <Route path="/seckill/:id" element={<SeckillDetail />} />
      </Routes>
    </Layout>
  );
}
