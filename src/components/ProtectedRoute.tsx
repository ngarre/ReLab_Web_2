import { Navigate } from 'react-router-dom'; // Necesario para poder redirigir desde el render
import type { ReactNode } from 'react'; // Para tipar children
import { useAuth } from '../hooks/useAuth';
import { AuthRouteLoading } from './AuthRouteLoading';

interface ProtectedRouteProps { // Defino que ProtectedRoute ...
  children: ReactNode; // ... recibe una única prop que es children
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth(); // Traigo con mi hook personalizado esos dos estados globales de AuthContext

  if (isLoading) { // Si todavía se está comprobando la sesión se muestra el componente AuthRouteLoading con ese mensaje
    return <AuthRouteLoading message="Comprobando sesión..." />; 
  }

  if (!isAuthenticated) { // Si no se está autenticado se redirige a página de login
    return <Navigate to="/login" replace />; // "replace" evita que el usuario pueda dar a "atrás" y volver a la ruta protegida fallida
  }

  return <>{children}</>; // Si hay sesión devuelvo el contenido protegido
}