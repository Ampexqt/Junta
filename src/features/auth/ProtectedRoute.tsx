import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { uid, role } = useAuth();
  const token = localStorage.getItem('token');

  // If No UID and No Token (Double check for hydration/cache)
  if (!uid && !token) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
