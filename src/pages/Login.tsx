import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
            navigate('/profile');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await login({ nickname, password });
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
        <h1 className="page-title">Iniciar sesión</h1>
        <div className="page-title-separator"></div>

        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                    <label htmlFor="nickname">Nickname</label>
                    <input
                        id="nickname"
                        type="text"
                        value={nickname}
                        onChange={(event) => setNickname(event.target.value)}
                        placeholder="Introduce tu nickname"
                        required
                    />
                </div>

                <div className="login-field">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Introduce tu contraseña"
                        required
                    />
                </div>

                {errorMessage && <p className="login-error">{errorMessage}</p>}

                <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    </main>
);
}