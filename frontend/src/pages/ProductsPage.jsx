import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartMsg, setCartMsg] = useState('');
  const [cartError, setCartError] = useState('');

  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    setCartMsg('');
    setCartError('');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', { productId, quantity: 1 });
      setCartMsg('Product added to cart ✅');
      setTimeout(() => setCartMsg(''), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add to cart';
      setCartError(msg);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!user || user.role !== 'admin') return;
    if (!window.confirm('Delete this product?')) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingProducts) return <p style={{ padding: 20 }}>Loading products...</p>;

  return (
    <div style={{ padding: 20 }}>
      {/* HEADER */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1>Ecommerce-FullStack</h1>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? (
            <>
              <span>
                Hi, {user.name} {user.role === 'admin' && '(admin)'}
              </span>

              {/* Admin buttons */}
              {user.role === 'admin' && (
                <>
                  <button onClick={() => navigate('/admin/products/new')}>
                    ➕ Add Product
                  </button>

                  <button onClick={() => navigate('/cart')}>Cart</button>
                </>
              )}

              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}>Login</button>
              <button onClick={() => navigate('/register')}>Register</button>
            </>
          )}
        </div>
      </header>

      {/* Messages */}
      {cartMsg && <p style={{ color: 'lightgreen' }}>{cartMsg}</p>}
      {cartError && <p style={{ color: 'crimson' }}>{cartError}</p>}

      {/* PRODUCTS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 18,
              padding: 20,
              background:
                'linear-gradient(180deg, rgba(17,24,39,0.8), rgba(0,0,0,0.9))',
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <h2 style={{ marginTop: 0 }}>{p.name}</h2>

            {p.image_url && (
              <div
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.15)',
                  marginBottom: 10,
                }}
              >
                <img
                  src={p.image_url}
                  alt={p.name}
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'contain',
                    padding: 10,
                  }}
                />
              </div>
            )}

            <p style={{ opacity: 0.7 }}>{p.description}</p>
            <h3>{p.price} $</h3>
            <p>Stock: {p.stock}</p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {/* Add to cart (not admin) */}
              {user?.role !== 'admin' && (
                <button
                  onClick={() => handleAddToCart(p.id)}
                  disabled={p.stock === 0}
                  style={{
                    height: 36,
                    padding: '0 14px',
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 700,
                    border: '1px solid rgba(99,102,241,0.4)',
                    background:
                      p.stock === 0
                        ? 'rgba(99,102,241,0.3)'
                        : 'rgba(99,102,241,0.75)',
                    color: 'white',
                    cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Add to cart
                </button>
              )}

              {/* Admin buttons */}
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                    style={{
                      height: 36,
                      padding: '0 14px',
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 700,
                      border: '1px solid rgba(99,102,241,0.4)',
                      background: 'rgba(99,102,241,0.6)',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    style={{
                      height: 36,
                      padding: '0 14px',
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 800,
                      border: '1px solid rgba(99,102,241,0.4)',
                      background: 'rgba(99,102,241,0.6)',
                      color: '#ff4d4f',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
