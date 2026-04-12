import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderProtectedRoute() {
    return render(
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

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('muestra estado de carga mientras comprueba la sesión', () => {
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

        renderProtectedRoute();

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.getByText('Comprobando sesión...')).toBeInTheDocument();
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

        renderProtectedRoute();

        expect(screen.getByText('Pantalla login')).toBeInTheDocument();
        expect(screen.queryByText('Zona privada')).not.toBeInTheDocument();
    });

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
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderProtectedRoute();

        expect(screen.getByText('Zona privada')).toBeInTheDocument();
        expect(screen.queryByText('Pantalla login')).not.toBeInTheDocument();
    });
});