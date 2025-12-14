import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        setItems(res.data.data || []);
      } catch (err) {
        console.error('Cart error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token, navigate]);

  const refreshCart = async () => {
    const res = await api.get('/cart');
    setItems(res.data.data || []);
  };

  const updateQty = async (itemId, qty) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity: qty });
      refreshCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      refreshCart();
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      refreshCart();
      setMsg('Cart cleared');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading cart...</p>;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate('/')}>← Back</button>

      <h1>Your Cart</h1>

      {msg && <p style={{ color: 'green' }}>{msg}</p>}

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li key={item.id} style={{ marginBottom: 16, borderBottom: '1px solid #ddd', paddingBottom: 12 }}>
                <h3>{item.name}</h3>
                <p>{item.price} $</p>

                <button onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{ marginLeft: 12, color: 'red' }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <h2>Total: {total.toFixed(2)} $</h2>
          <button onClick={clearCart}>Clear Cart</button>
        </>
      )}
    </div>
  );
};

export default CartPage; 
