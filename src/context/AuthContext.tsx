import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types/User';
import type { LoginRequest } from '../types/Auth';
import { login as loginRequest, getMyProfile } from '../services/authService'; // A la función login que importo le cambio el nombre para no chocar con la función local login
import {
    clearAuthSession,
    getAuthSession,
    saveAuthSession,
} from '../utils/storage';

interface AuthContextType { // Forma que va a tener el objeto del Contexto
    user: User | null; // Guarda un objeto de tipo User cuando haya sesión
    token: string | null; // Guarda token JWT de la sesión 
    role: UserRole | null; // Guarda rol del usuario 
    isAuthenticated: boolean; // Indica si hay sesión activa o no
    isLoading: boolean; // Indica si el contexto está todavía comprobando la sesión
    login: (credentials: LoginRequest) => Promise<void>; // Defino función que recibe objeto credentials de tipo LoginRequest y devuelve una Promise<void>
    logout: () => void; // Función logout: no recibe parámetros ni devuelve nada
    refreshUser: () => Promise<void>; // Función para refrescar perfil del usuario --> Útil si el usuario edita su perfil
}

export const AuthContext = createContext<AuthContextType>({ // Creamos el objeto Contexto real
    user: null, // valor por defecto de user
    token: null, // valor por defecto de token
    role: null, // valor por defecto de rol
    isAuthenticated: false, // por defecto app asume que no hay sesión activa
    isLoading: true, // por defecto en true porque al arrancar app aún estoy en fase de comprobación
    login: async () => { }, // defino función vacía por defecto para login --> Cuando AuthProvider envuelve la app, sustituye esta función vacía por la real
    logout: () => { }, // mismo que con login
    refreshUser: async () => { }, // mismo que en las otras dos funciones
});

interface AuthProviderProps { // Esta interfaz permite que AuthProvider envuelva toda la aplicación
    children: ReactNode; // Toda la aplicación tendrá acceso al contexto de autenticación
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null); // Estado para guardar usuario autenticado
    const [token, setToken] = useState<string | null>(null); // Estado para guardar JWT
    const [role, setRole] = useState<UserRole | null>(null); // Estado para guardar rol
    const [isLoading, setIsLoading] = useState(true); // Estado para indicar si el contexto todavía está comprobando la sesión

    const loadProfile = async (sessionToken: string, sessionRole: UserRole | null) => { // *Función auxiliar que recibe token y rol ...
        const profile = await getMyProfile(sessionToken); // ... y pide al backend el perfil de dicho usuario

        setToken(sessionToken); // guarda token en estado global
        setRole(sessionRole); // guarda rol en estado global
        setUser(profile); // guarda objeto Usuario con los datos del perfil del usuario
    };

    useEffect(() => { // Efecto para restaurar la sesión, se ejecuta cuando AuthProvider se monta por primera vez
        const restoreSession = async () => { 
            const savedSession = getAuthSession(); // Leo del storage local la sesión guardada

            if (!savedSession) { // Si no hay sesión guardada no hay nada que restaurar y salgo de la función
                setIsLoading(false);
                return;
            }

            try { // Si hay sesión guardada
                await loadProfile(savedSession.token, savedSession.role); // Recupero token + rol y llamo a método loadProfile*
            } catch (error) { // Si algo falla, por ejemplo, token caducado, limpio sesión guardada del storage.
                clearAuthSession();
                setToken(null);
                setRole(null);
                setUser(null);
                console.error('Error restoring auth session:', error);
            } finally {
                setIsLoading(false); // Finalmente vaya bien o mal actualizo estado de isLoading a false
            }
        };

        restoreSession();
    }, []); // Como array de dependencias está vacío, se ejecuta una sola vez al iniciar la app

    const login = async (credentials: LoginRequest) => { // Defino función de login que utilizará el resto de la aplicación, credentials es del tipo LoginRequest (nickname + password)
        try {
            const authResponse = await loginRequest(credentials);  // llamo a endpoint de login de backend a través de función de authService y devuelvo respuesta
            await loadProfile(authResponse.token, authResponse.role); // llamo a mi función auxiliar para recuperar perfil del usuario con token y role recibidos y guardarlos en estado

            saveAuthSession({ // Guardo en storage la sesión
                token: authResponse.token,
                role: authResponse.role,
            });
        } catch (error) {
            console.error('AUTH CONTEXT LOGIN ERROR', error);
            throw error;
        }
    };

    const refreshUser = async () => { // Función para refrescar perfil de usuario ya autenticado
        if (!token) { // Si no hay token no puedo pedir función al backend
            return;
        }

        try {
            const profile = await getMyProfile(token); // llamo al backend y recupero usuario actualizado
            setUser(profile); // guardo estado
        } catch (error) {
            console.error('Error refreshing user profile:', error);
            throw error;
        }
    };

    const logout = () => { // Función para cerrar sesión
        clearAuthSession(); // Limpio sesión del storage
        setToken(null); // Limpio estado React del contexto
        setRole(null); // ""
        setUser(null); // ""
    };

    const contextValue = useMemo( // Es el objeto que realmente compartiré con toda la app a través del contexto --> Uso useMemo para no recrearlo innecesariamente en cada render
        () => ({
            user,
            token,
            role,
            isAuthenticated: !!token, // Calculo isAuthenticated a partir del token, es decir si token tiene valor ponemos true y sino false --> No tengo estado para isAuthenticated sino que se deriva de existencia del token
            isLoading,
            login,
            logout,
            refreshUser,
        }),
        [user, token, role, isLoading] // El objeto contextValue solo se recalcula si cambia alguno de estos valores
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}