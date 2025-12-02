import { getToken } from '@/utils/auth';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  if (!getToken()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
