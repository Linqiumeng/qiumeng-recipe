import { Navigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAsync } from '../../lib/useAsync.js';

export default function RequireAdmin({ children }) {
  const { data, error, loading } = useAsync(() => api.me(), []);
  if (loading) return <p className="status">加载中…</p>;
  if (error) return <p className="status error">{error.message}</p>;
  if (!data.admin) return <Navigate to="/admin/login" replace />;
  return children;
}
