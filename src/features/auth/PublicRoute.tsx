import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const PublicRoute = () => {
  const { uid } = useAuth();
  const token = localStorage.getItem('token');

  if (uid || token) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
};
