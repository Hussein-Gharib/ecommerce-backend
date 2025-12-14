import { Routes, Route } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
  );
}

export default App;
