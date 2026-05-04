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
      </Routes>
    </Layout>
  );
}
