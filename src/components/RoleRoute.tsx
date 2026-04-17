import { Navigate } from 'react-router-dom'; // Necesario para poder redirigir desde el render
import type { ReactNode } from 'react'; // Para tipar children
import type { UserRole } from '../types/User'; // Importo el tipo UserRole
import { useAuth } from '../hooks/useAuth'; // mi hook para acceder a contexto global de autenticación
import { AuthRouteLoading } from './AuthRouteLoading'; // Componente reutilizable para mostrar estado de carga mientras se comprueban permisos

interface RoleRouteProps { // RoleRoute necesita...
  children: ReactNode; // el contenido o página que quiero proteger
  allowedRoles: UserRole[]; // // y la lista de roles que si que pueden acceder
}

export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth(); // Leo lo que necesito del contexto global

  if (isLoading) { // Si la app está restaurando/comprobando la sesión le muestro ese componente con mensaje
    return <AuthRouteLoading message="Comprobando permisos..." />;
  }

  if (!isAuthenticated) { // Si no hay sesión ...
    return <Navigate to="/login" replace />; // ... redirijo a login igual que en ProtectedRoute
  }

  if (!role || !allowedRoles.includes(role)) { // Si hay sesión pero el rol no existe o no es el permitido... 
    return <Navigate to="/" replace />; // ... redirijo al inicio
  }

  return <>{children}</>; // Si ya no está cargando, hay sesión y el rol está permitido --> renderizo contenido protegido
}