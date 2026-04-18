import { useContext } from 'react'; // hook de React que permite leer valor actual de un contexto
import { AuthContext } from '../context/AuthContext'; // Contexto que he creado en AuthContext

export function useAuth() { // Defino hook personalizado...
  return useContext(AuthContext); // ... que devuelve valor actual de AuthContext
}