// Importo utilidades de Vitest:
// - beforeEach para limpiar antes de cada test
// - describe para agrupar tests
// - expect para comprobaciones
// - it para definir casos concretos
// - vi para mocks
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Importo funciones de React Testing Library:
// - render para montar el componente
// - screen para consultar lo que aparece en pantalla
import { render, screen } from '@testing-library/react';

// Importo piezas del router para simular navegación y rutas dentro del test
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Importo el componente que quiero probar
import { RoleRoute } from './RoleRoute';

// Importo el hook useAuth, que luego voy a mockear
import { useAuth } from '../hooks/useAuth';


// Mockeo el módulo del hook useAuth.
// Así no uso la implementación real del contexto,
// sino que puedo decidir en cada test qué devuelve
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

// Creo una referencia tipada del mock para poder usar mockReturnValue cómodamente (facilita que typescript entienda que useAuth es un mock)
const mockedUseAuth = vi.mocked(useAuth);

// Función auxiliar para no repetir el mismo render completo en todos los tests
function renderRoleRoute() {
    return render(
        <MemoryRouter initialEntries={['/admin-zone']}>
            <Routes>
                <Route
                    path="/admin-zone"
                    element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <div>Zona admin</div>
                        </RoleRoute>
                    }
                />
                <Route path="/login" element={<div>Pantalla login</div>} />
                <Route path="/" element={<div>Página inicio</div>} />
            </Routes>
        </MemoryRouter>
    );
}

// Empiezo el bloque de tests de RoleRoute
describe('RoleRoute', () => {

    // Antes de cada test limpio los mocks para que no se mezclen unos con otros.
    beforeEach(() => {
        vi.clearAllMocks();
    });


    // Caso 1.
    // El sistema todavía está cargando el estado de auth/permisos, así que no debe redirigir ni mostrar contenido final todavía.
    it('muestra estado de carga mientras comprueba permisos', () => {
        mockedUseAuth.mockReturnValue({
            user: null,
            token: null,
            role: null,
            isAuthenticated: false,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderRoleRoute();

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.getByText('Comprobando permisos...')).toBeInTheDocument();
    });

    // Caso 2.
    // Ya no está cargando y no hay autenticación, así que debe ir a login.
    it('redirige al login si el usuario no está autenticado', () => {
        mockedUseAuth.mockReturnValue({
            user: null,
            token: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderRoleRoute();

        expect(screen.getByText('Pantalla login')).toBeInTheDocument();
        expect(screen.queryByText('Zona admin')).not.toBeInTheDocument();
    });

    // Caso 3.
    // El usuario sí está autenticado, pero no tiene el rol correcto. --> Se redirige a Inicio
    it('redirige a inicio si el rol no está permitido', () => {
        mockedUseAuth.mockReturnValue({
            user: {
                id: 2,
                nickname: 'gestor1',
                nombre: 'Ana',
                apellido: 'Gestora',
                email: 'ana@test.com',
                fechaNacimiento: '1995-05-10',
                cuentaActiva: true,
                fechaAlta: '2026-01-01',
                tipoUsuario: 'empresa',
                role: 'GESTOR',
                saldo: 0,
                latitud: null,
                longitud: null,
                direccion: null,
            },
            token: 'fake-token',
            role: 'GESTOR',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderRoleRoute();

        expect(screen.getByText('Página inicio')).toBeInTheDocument();
        expect(screen.queryByText('Zona admin')).not.toBeInTheDocument();
    });

    // Caso 4.
    // El usuario está autenticado y sí tiene el rol correcto. --> Se le permite acceder a Zona de Admin
    it('renderiza el contenido si el rol está permitido', () => {
        mockedUseAuth.mockReturnValue({
            user: {
                id: 1,
                nickname: 'admin1',
                nombre: 'Admin',
                apellido: 'Principal',
                email: 'admin@test.com',
                fechaNacimiento: '1990-01-01',
                cuentaActiva: true,
                fechaAlta: '2026-01-01',
                tipoUsuario: 'particular',
                role: 'ADMIN',
                saldo: 0,
                latitud: null,
                longitud: null,
                direccion: null,
            },
            token: 'fake-token',
            role: 'ADMIN',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderRoleRoute();

        expect(screen.getByText('Zona admin')).toBeInTheDocument();
        expect(screen.queryByText('Página inicio')).not.toBeInTheDocument();
    });
});