import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { register } from '../services/authService';
import './Register.css';

interface RegisterFormState {
  nickname: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string;
  tipoUsuario: string;
}

const INITIAL_FORM: RegisterFormState = {
  nickname: '',
  password: '',
  confirmPassword: '',
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  tipoUsuario: 'particular',
};

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [form, setForm] = useState<RegisterFormState>(INITIAL_FORM);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const normalizedErrorMessage = useMemo(() => {
    if (!errorMessage) {
      return '';
    }

    try {
      const parsed = JSON.parse(errorMessage) as {
        message?: string;
        errors?: Record<string, string>;
      };

      if (parsed.errors) {
        const firstValidationError = Object.values(parsed.errors)[0];
        if (firstValidationError) {
          return firstValidationError;
        }
      }

      if (parsed.message) {
        if (parsed.message.toLowerCase().includes('nickname ya está en uso')) {
          return 'Ese nickname ya está en uso. Prueba con otro distinto.';
        }

        return parsed.message;
      }
    } catch {
      if (errorMessage.toLowerCase().includes('nickname ya está en uso')) {
        return 'Ese nickname ya está en uso. Prueba con otro distinto.';
      }
    }

    return errorMessage;
  }, [errorMessage]);

  const updateField = (field: keyof RegisterFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    if (!form.nickname.trim()) {
      return 'El nickname es obligatorio.';
    }

    if (!form.nombre.trim()) {
      return 'El nombre es obligatorio.';
    }

    if (!form.apellido.trim()) {
      return 'El apellido es obligatorio.';
    }

    if (!form.email.trim()) {
      return 'El email es obligatorio.';
    }

    if (form.password.length < 4) {
      return 'La contraseña debe tener al menos 4 caracteres.';
    }

    if (form.password !== form.confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    const trimmedNickname = form.nickname.trim();
    const trimmedNombre = form.nombre.trim();
    const trimmedApellido = form.apellido.trim();
    const trimmedEmail = form.email.trim();
    const rawPassword = form.password;

    try {
      await register({
        nickname: trimmedNickname,
        password: rawPassword,
        nombre: trimmedNombre,
        apellido: trimmedApellido,
        email: trimmedEmail,
        fechaNacimiento: form.fechaNacimiento || undefined,
        cuentaActiva: true,
        tipoUsuario: form.tipoUsuario,
        saldo: 0,
        latitud: null,
        longitud: null,
        direccion: null,
      });

      try {
        await login({
          nickname: trimmedNickname,
          password: rawPassword,
        });

        navigate('/', { replace: true });
        return;
      } catch (autoLoginError) {
        console.error('Auto-login after register error:', autoLoginError);

        setSuccessMessage(
          'Cuenta creada correctamente. Ya puedes iniciar sesión con tus credenciales.'
        );
        setForm(INITIAL_FORM);
        return;
      }
    } catch (error) {
      console.error('Register error:', error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('No se ha podido completar el registro.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="main-content-area">
      <section className="auth-shell">
        <div className="auth-card register-card">
          <div className="auth-page-header">
            <h1 className="page-title">REGISTRO</h1>
            <div className="page-title-separator"></div>
            <p className="auth-page-subtitle">
              Crea tu cuenta en ReLab para empezar a explorar y gestionar equipos científicos.
            </p>
          </div>

          {successMessage ? (
            <div className="register-success-panel">
              <p className="register-success-message">{successMessage}</p>

              <Link to="/login" className="register-login-link">
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-card-brand">
                <p className="auth-card-subtitle">
                  Completa tus datos para crear una cuenta nueva como cliente.
                </p>
              </div>

              <form className="register-form" onSubmit={handleSubmit}>
                <div className="register-grid">
                  <div className="login-field">
                    <label htmlFor="register-nickname">Nickname</label>
                    <input
                      id="register-nickname"
                      type="text"
                      value={form.nickname}
                      onChange={(event) => updateField('nickname', event.target.value)}
                      placeholder="Ej. laboratorio_ana"
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="register-email">Email</label>
                    <input
                      id="register-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      placeholder="tuemail@ejemplo.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="register-nombre">Nombre</label>
                    <input
                      id="register-nombre"
                      type="text"
                      value={form.nombre}
                      onChange={(event) => updateField('nombre', event.target.value)}
                      placeholder="Tu nombre"
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="register-apellido">Apellido</label>
                    <input
                      id="register-apellido"
                      type="text"
                      value={form.apellido}
                      onChange={(event) => updateField('apellido', event.target.value)}
                      placeholder="Tu apellido"
                      autoComplete="family-name"
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="register-password">Contraseña</label>
                    <input
                      id="register-password"
                      type="password"
                      value={form.password}
                      onChange={(event) => updateField('password', event.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="register-confirm-password">Repetir contraseña</label>
                    <input
                      id="register-confirm-password"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(event) =>
                        updateField('confirmPassword', event.target.value)
                      }
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="register-fechaNacimiento">
                      Fecha de nacimiento
                    </label>
                    <input
                      id="register-fechaNacimiento"
                      type="date"
                      value={form.fechaNacimiento}
                      onChange={(event) =>
                        updateField('fechaNacimiento', event.target.value)
                      }
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="register-tipoUsuario">Tipo de usuario</label>
                    <select
                      id="register-tipoUsuario"
                      value={form.tipoUsuario}
                      onChange={(event) => updateField('tipoUsuario', event.target.value)}
                      className="register-select"
                    >
                      <option value="particular">Particular</option>
                      <option value="empresa">Empresa</option>
                      <option value="centro_publico">Centro público</option>
                    </select>
                  </div>
                </div>

                {normalizedErrorMessage && (
                  <div className="login-feedback login-feedback-error" role="alert">
                    <p>{normalizedErrorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>

              <div className="auth-card-footer">
                <p>
                  ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}