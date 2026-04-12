import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/User';
import { useAuth } from '../hooks/useAuth';
import { AuthRouteLoading } from './AuthRouteLoading';

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <AuthRouteLoading message="Comprobando permisos..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}