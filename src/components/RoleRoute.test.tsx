import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoleRoute } from './RoleRoute';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

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

describe('RoleRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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