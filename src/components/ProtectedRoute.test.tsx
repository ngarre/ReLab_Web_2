// Importo utilidades de Vitest:
// - describe para agrupar tests
// - expect para comprobaciones
// - it para casos concretos
// - vi para mocks
// - beforeEach para limpiar antes de cada test
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Importo funciones de React Testing Library:
// - render para montar el componente en un entorno de test
// - screen para buscar elementos renderizados en pantalla
import { render, screen } from '@testing-library/react';

// Importo piezas del router para simular navegación y rutas dentro del test
// MemoryRouter es como un navegador falso para tests
// - No usa la barra real del navegador
// - Mantiene historial en memoria
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Importo el componente que quiero probar
import { ProtectedRoute } from './ProtectedRoute';

// Importo el hook useAuth, que luego voy a mockear
import { useAuth } from '../hooks/useAuth';


// Mockeo el módulo del hook useAuth.
// Así evito usar el contexto real y puedo decidir en cada test
// qué estado de autenticación quiero simular.
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

// Convierto useAuth en una versión reconocida por Vitest como mock (facilita que typescript entienda que useAuth es un mock)
const mockedUseAuth = vi.mocked(useAuth);

// Función auxiliar para no repetir el render completo en cada test
function renderProtectedRoute() {
    return render( // Empiezo a renderizar el árbol React del test.
        // Monto un router en memoria y le digo "La URL inicial del test será /privada".  Así simulo que usuario intenta entrar en ruta protegida
        <MemoryRouter initialEntries={['/privada']}> 
            <Routes> 
                <Route
                    path="/privada"
                    element={
                        <ProtectedRoute>
                            <div>Zona privada</div>
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<div>Pantalla login</div>} />
            </Routes>
        </MemoryRouter>
    );
}


// Empiezo el bloque de tests de ProtectedRoute
describe('ProtectedRoute', () => {

    // Antes de cada test limpio los mocks
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Caso 1.
    // Mientras auth aún está cargando, ProtectedRoute no debe redirigir ni renderizar el contenido privado.  Debe mostrar loading
    it('muestra estado de carga mientras comprueba la sesión', () => {
        // Aquí defino qué devolverá useAuth en este test
        mockedUseAuth.mockReturnValue({
            user: null,
            token: null,
            role: null,
            isAuthenticated: false,
            isLoading: true, // useAuth está cargando
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        // Renderizo el componente en este escenario
        renderProtectedRoute();

        // Compruebo que aparece el estado de carga esperado --> ProtectedRoute está mostrando el componente de loading y no está avanzando aún a login ni a contenido privado
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.getByText('Comprobando sesión...')).toBeInTheDocument();
    });


    // Caso 2.
    // Ya no está cargando y no hay sesión.  Entonces debe redirigir a login
    it('redirige al login si el usuario no está autenticado', () => {
        mockedUseAuth.mockReturnValue({
            user: null,
            token: null,
            role: null,
            isAuthenticated: false, // no hay sesión
            isLoading: false, // useAuth ya no está cargando
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        // Renderizo el escenario
        renderProtectedRoute();

        // Compruebo que aparece la pantalla de login y que NO aparece el contenido protegido
        expect(screen.getByText('Pantalla login')).toBeInTheDocument();
        expect(screen.queryByText('Zona privada')).not.toBeInTheDocument();
    });

    // Caso 3.
    // Si hay sesión válida debe dejar pasar y mostrar el contenido privado
    it('renderiza el contenido protegido si hay sesión activa', () => {
        mockedUseAuth.mockReturnValue({
            user: {
                id: 1,
                nickname: 'natalia',
                nombre: 'Natalia',
                apellido: 'Prueba',
                email: 'natalia@test.com',
                fechaNacimiento: '2000-01-01',
                cuentaActiva: true,
                fechaAlta: '2026-01-01',
                tipoUsuario: 'particular',
                role: 'CLIENTE',
                saldo: 0,
                latitud: null,
                longitud: null,
                direccion: null,
            },
            token: 'fake-token',
            role: 'CLIENTE',
            isAuthenticated: true, // Estoy autenticada
            isLoading: false, // No siguen cargando los datos de useAuth
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        // Renderizo el escenario autenticado
        renderProtectedRoute();

        // Aparece el contenido privado y NO aparece la pantalla de login
        expect(screen.getByText('Zona privada')).toBeInTheDocument();
        expect(screen.queryByText('Pantalla login')).not.toBeInTheDocument();
    });
});