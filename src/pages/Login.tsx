import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const normalizedErrorMessage = useMemo(() => {
        if (!errorMessage) {
            return '';
        }

        const normalized = errorMessage.toLowerCase();

        if (normalized.includes('cuenta desactivada')) {
            return 'Tu cuenta está desactivada. Ponte en contacto con el administrador para reactivarla.';
        }

        if (normalized.includes('credenciales incorrectas')) {
            return 'Nickname o contraseña incorrectos.';
        }

        return errorMessage;
    }, [errorMessage]);

    const isDisabledAccountError = normalizedErrorMessage
        .toLowerCase()
        .includes('cuenta está desactivada');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await login({
                nickname: nickname.trim(),
                password,
            });

            navigate('/profile');
        } catch (error) {
            console.error('Login error:', error);

            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('No se ha podido iniciar sesión.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="main-content-area">
            <section className="auth-shell">
                <div className="auth-card auth-card-login">
                    <div className="auth-page-header">
                        <h1 className="page-title">INICIAR SESIÓN</h1>
                        <div className="page-title-separator"></div>
                        <p className="auth-page-subtitle">
                            Accede a tu cuenta para gestionar productos, categorías y tu área personal dentro de la plataforma.
                        </p>
                    </div>

                    <div className="auth-card-brand">
                        <p className="auth-card-subtitle">
                            Introduce tus credenciales para continuar.
                        </p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="nickname">Nickname</label>
                            <input
                                id="nickname"
                                type="text"
                                value={nickname}
                                onChange={(event) => {
                                    setNickname(event.target.value);
                                    if (errorMessage) setErrorMessage('');
                                }}
                                placeholder="Introduce tu nickname"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    if (errorMessage) setErrorMessage('');
                                }}
                                placeholder="Introduce tu contraseña"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {normalizedErrorMessage && (
                            <div
                                className={`login-feedback ${isDisabledAccountError ? 'login-feedback-disabled' : 'login-feedback-error'
                                    }`}
                                role="alert"
                            >
                                <p>{normalizedErrorMessage}</p>

                                {isDisabledAccountError && (
                                    <span className="login-feedback-help">
                                        Si crees que es un error, solicita la reactivación de tu cuenta.
                                    </span>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="auth-card-footer">
                        <p>
                            ¿Aún no tienes cuenta?{' '}
                            <Link to="/register">Regístrate aquí</Link>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}