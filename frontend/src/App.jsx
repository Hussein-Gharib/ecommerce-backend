import { Routes, Route } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import RegisterPage from './pages/Register';
import AdminProductFormPage from './pages/AdminProductFormPage';
import RequireAdmin from './components/RequireAdmin';

function App() {
  return (
    <Routes>

      <Route path="/" element={<ProductsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAdmin />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin/products/new" element={<AdminProductFormPage />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
      </Route>
    </Routes>
  );
}

export default App;
