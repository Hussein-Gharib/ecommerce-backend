import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // احتمال نستعملو لو حبيت نسجّل ونسجّل دخول مباشرة

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', form);

      await login(form.email, form.password); 

      navigate('/');

    } catch (err) {
      console.error('Register error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Register failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1 style={{ marginBottom: 16 }}>Register</h1>

      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        {error && (
          <p style={{ color: 'red', marginTop: 8 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: 12, fontSize: 14 }}>
        Already have an account?{' '}
        <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
