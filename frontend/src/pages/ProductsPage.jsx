import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartMsg, setCartMsg] = useState('');
  const [cartError, setCartError] = useState('');

  const [adminForm, setAdminForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category_id: '',
  });
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data || []);
      } catch (err) {
        console.error('❌ Error fetching products:', err);
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
      return navigate('/login');
    }

    try {
      await api.post('/cart', { productId, quantity: 1 });
      setCartMsg('Product added to cart ✅');
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add to cart';
      setCartError(msg);
    }
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = (product) => {
    setAdminError('');
    setCartMsg('');

    setAdminForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price != null ? String(product.price) : '',
      stock: product.stock != null ? String(product.stock) : '',
      image_url: product.image_url || '',
      category_id: product.category_id != null ? String(product.category_id) : '',
    });

    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!user || user.role !== 'admin') return;

    const ok = window.confirm('Delete this product?');
    if (!ok) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to delete product';
      setAdminError(msg);
    }
  };

  const handleCreateOrUpdateProduct = async (e) => {
    e.preventDefault();
    setAdminError('');
    setCartMsg('');

    if (!user || user.role !== 'admin') {
      setAdminError('Only admins can create/update products');
      return;
    }

    try {
      setAdminLoading(true);

      const payload = {
        name: adminForm.name,
        description: adminForm.description || null,
        price: Number(adminForm.price),
        stock: adminForm.stock === '' ? 0 : Number(adminForm.stock),
        image_url: adminForm.image_url || null,
        category_id: adminForm.category_id || null,
      };

      let res;

      if (editingId) {
        res = await api.put(`/products/${editingId}`, payload);
        const updated = res.data.data;

        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p))
        );
      } else {
        res = await api.post('/products', payload);
        setProducts((prev) => [res.data.data, ...prev]);
      }

      setAdminForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
        category_id: '',
      });
      setEditingId(null);
    } catch (err) {
      console.error('❌ Error saving product:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save product';
      setAdminError(msg);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAdminError('');
    setAdminForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
      category_id: '',
    });
  };

  if (loadingProducts) {
    return <p style={{ padding: 20 }}>Loading products...</p>;
  }

  return (
    <div className="page" style={{ padding: 20 }}>
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
                Hi, {user.name}
                {user.role === 'admin' ? ' (admin)' : ''}
              </span>
              <button onClick={() => navigate('/cart')}>Cart</button>
              <button onClick={logout} className="btn-ghost">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}>Login</button>
              <button onClick={() => navigate('/register')} className="btn-ghost">
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {cartMsg && <p className="info" style={{ marginBottom: 8 }}>{cartMsg}</p>}
      {cartError && <p className="error" style={{ marginBottom: 8 }}>{cartError}</p>}

      {user && user.role === 'admin' && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12 }}>
            {editingId ? 'Edit product' : 'Create new product'}
          </h2>

          {adminError && (
            <p className="error" style={{ marginBottom: 8 }}>
              {adminError}
            </p>
          )}

          <form
            onSubmit={handleCreateOrUpdateProduct}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={adminForm.name}
                onChange={handleAdminChange}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={adminForm.price}
                onChange={handleAdminChange}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={adminForm.stock}
                onChange={handleAdminChange}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label>Image URL</label>
              <input
                type="text"
                name="image_url"
                value={adminForm.image_url}
                onChange={handleAdminChange}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label>Category ID (optional)</label>
              <input
                type="text"
                name="category_id"
                value={adminForm.category_id}
                onChange={handleAdminChange}
              />
            </div>

            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <label>Description</label>
              <textarea
                name="description"
                value={adminForm.description}
                onChange={handleAdminChange}
                rows={3}
                style={{
                  resize: 'vertical',
                  padding: 8,
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                }}
              />
            </div>

            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              {editingId && (
                <button type="button" className="btn-ghost" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}

              <button type="submit" disabled={adminLoading}>
                {adminLoading
                  ? 'Saving...'
                  : editingId
                  ? 'Update product'
                  : 'Create product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div
          className="grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <h3>{p.name}</h3>

              {p.image_url && (
                <div className="product-image-wrapper">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="product-image"
                  />
                </div>
              )}

              <p style={{ fontSize: 14, color: '#555' }}>{p.description}</p>

              <p>
                <strong>{p.price} $</strong>
              </p>

              <p style={{ fontSize: 12, color: '#777' }}>
                {p.category ? `Category: ${p.category}` : 'No category'}
              </p>

              <p style={{ fontSize: 12, color: '#777' }}>
                Stock: {p.stock}
              </p>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => handleAddToCart(p.id)} style={{ flex: 1 }}>
                  Add to cart
                </button>

                {user && user.role === 'admin' && (
                  <>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => handleEditClick(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => handleDeleteProduct(p.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
