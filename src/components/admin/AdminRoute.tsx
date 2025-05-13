import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute: FC<AdminRouteProps> = ({ children }) => {
  const { session, isAdmin } = useAuth();

  if (!session || !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};