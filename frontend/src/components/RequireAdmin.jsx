import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function RequireAdmin() {
  const { user, token, loading } = useAuth();

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!token) return <Navigate to="/login" replace />;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}
