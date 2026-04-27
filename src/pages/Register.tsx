// Importo hooks de React:
import { useEffect, useMemo, useState } from 'react';

// Importo:
// - Link para navegación declarando un enlace en el JSX --> es el usuario el que hace clic
// - useNavigate para navegar por código --> navegación que ocurre como consecuencia de lógica de código
import { Link, useNavigate } from 'react-router-dom';

// Importo el hook de autenticación global para saber
// si ya hay sesión activa y para poder hacer login automático
import { useAuth } from '../hooks/useAuth';

// Importo el servicio que registra un usuario nuevo en el backend
import { register } from '../services/authService';

// Importo un icono reutilizable para el input de fecha
import { CalendarIcon } from '../components/Icons';

import './Register.css';

// Defino la forma del estado local del formulario de registro
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

// Defino el estado inicial del formulario.
// Esto me sirve tanto al arrancar como para resetear el formulario si hace falta.
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

// Defino el componente de página Register
export default function Register() {
  // Hook para navegar a otra ruta desde código
  const navigate = useNavigate();
 
  // Del contexto de auth obtengo:
  // - isAuthenticated para saber si ya hay sesión activa
  // - login para intentar iniciar sesión automáticamente tras registrarse
  const { isAuthenticated, login } = useAuth();

   // Estado con todos los campos del formulario
  const [form, setForm] = useState<RegisterFormState>(INITIAL_FORM);

  // Estado para mostrar mensajes de error
  const [errorMessage, setErrorMessage] = useState('');

  // Estado para mostrar mensajes de éxito
  const [successMessage, setSuccessMessage] = useState('');

  // Estado para saber si el formulario se está enviando
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si el usuario ya está autenticado, no tiene sentido estar en registro.
  // Lo redirijo al inicio.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  
  // Calculo una versión "normalizada" del mensaje de error.
  // La idea es adaptar errores del backend a mensajes más claros para el usuario.
  const normalizedErrorMessage = useMemo(() => {
    if (!errorMessage) {
       // Si no hay error, devuelvo cadena vacía
      return '';
    }

    try {
      // Intento interpretar el error como JSON,
      // por si el backend ha devuelto una estructura tipo:
      // { message: "...", errors: { campo: "mensaje" } }
      const parsed = JSON.parse(errorMessage) as {
        message?: string;
        errors?: Record<string, string>;
      };

      // Si hay un objeto de errores de validación,
      // cojo el primero y lo devuelvo
      if (parsed.errors) {
        const firstValidationError = Object.values(parsed.errors)[0];
        if (firstValidationError) {
          return firstValidationError;
        }
      }

       // Si hay un mensaje general en el error parseado
      if (parsed.message) {
        // Si detecto el caso de nickname duplicado,
        // lo traduzco a un texto más amigable
        if (parsed.message.toLowerCase().includes('nickname ya está en uso')) {
          return 'Ese nickname ya está en uso. Prueba con otro distinto.';
        }

        // Si no, devuelvo el mensaje tal cual
        return parsed.message;
      }
    } catch {
      // Si el error no era JSON válido, intento igualmente detectar
      // el caso de nickname duplicado en texto plano
      if (errorMessage.toLowerCase().includes('nickname ya está en uso')) {
        return 'Ese nickname ya está en uso. Prueba con otro distinto.';
      }
    }

    // Si no he podido transformarlo, devuelvo el error original
    return errorMessage;
  }, [errorMessage]);

  
  // Función auxiliar para actualizar un campo concreto del formulario
  const updateField = (field: keyof RegisterFormState, value: string) => {
    // Actualizo el campo que ha cambiado y conservo el resto
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

     // Si había error visible, lo limpio cuando el usuario vuelve a escribir
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Validación básica del formulario antes de enviarlo
  const validateForm = () => {
    // ompruebo que nickname no esté vacío
    if (!form.nickname.trim()) {
      return 'El nickname es obligatorio.';
    }

    // Compruebo que nombre no esté vacío
    if (!form.nombre.trim()) {
      return 'El nombre es obligatorio.';
    }

    // Compruebo que apellido no esté vacío
    if (!form.apellido.trim()) {
      return 'El apellido es obligatorio.';
    }

    // Compruebo que email no esté vacío
    if (!form.email.trim()) {
      return 'El email es obligatorio.';
    }

    // Compruebo longitud mínima de contraseña
    if (form.password.length < 4) {
      return 'La contraseña debe tener al menos 4 caracteres.';
    }

      // Compruebo que password y confirmPassword coinciden
    if (form.password !== form.confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }

    // Si todo está bien, devuelvo string vacío
    return '';
  };

  // Handler del submit del formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
     // Evito el submit HTML clásico que recargaría la página
    event.preventDefault();

    // Limpio mensajes previos
    setErrorMessage('');
    setSuccessMessage('');

    // Ejecuto validación local
    const validationError = validateForm();

    // Si hay error de validación, lo muestro y corto el envío
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Activo el estado de envío
    setIsSubmitting(true);

    // Preparo versiones "limpias" de algunos campos
    const trimmedNickname = form.nickname.trim();
    const trimmedNombre = form.nombre.trim();
    const trimmedApellido = form.apellido.trim();
    const trimmedEmail = form.email.trim();
    
    // Guardo la contraseña tal cual porque no tiene trim
    const rawPassword = form.password;

    try {
      // Llamo al servicio de registro con el payload esperado por el backend
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
        // Si el registro ha ido bien, intento hacer login automático
        await login({
          nickname: trimmedNickname,
          password: rawPassword,
        });

        // Si el login automático funciona, mando al usuario al inicio
        navigate('/', { replace: true });
        return;
      } catch (autoLoginError) {
        // Si el auto-login falla, lo registro en consola
        console.error('Auto-login after register error:', autoLoginError);

        // Pero igualmente informo de que la cuenta sí se ha creado
        setSuccessMessage(
          'Cuenta creada correctamente. Ya puedes iniciar sesión con tus credenciales.'
        );

        // Reseteo el formulario
        setForm(INITIAL_FORM);
        return;
      }
    } catch (error) {
      // Si falla el registro, lo registro en consola
      console.error('Register error:', error);

      // Si es una instancia de Error, uso su mensaje
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
         // Si no, muestro un mensaje genérico
        setErrorMessage('No se ha podido completar el registro.');
      }
    } finally {
      // Pase lo que pase, desactivo el estado de envío
      setIsSubmitting(false);
    }
  };

  // Render principal de la página
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

          {/* Si hay mensaje de éxito, muestro el panel de éxito con enlace para ir a Login (esto solo ocurre si no funciona auto-login)
              en lugar del formulario */}
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

              {/* Formulario */}
              <form className="register-form" onSubmit={handleSubmit}>
                <div className="register-grid">
                  <div className="login-field">

                     {/* Campo nickname */}
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

                   {/* Campo email */}
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

                  {/* Campo nombre */}
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

                   {/* Campo apellido */}
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

                  {/* Campo contraseña */}
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

                   {/* Campo repetir contraseña */}
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
                  
                  {/* Campo fecha de nacimiento */}
                  <div className="login-field">
                    <label htmlFor="register-fechaNacimiento">
                      Fecha de nacimiento
                    </label>

                    <div className="date-input-shell">
                      <input
                        id="register-fechaNacimiento"
                        type="date"
                        value={form.fechaNacimiento}
                        onChange={(event) =>
                          updateField('fechaNacimiento', event.target.value)
                        }
                        className="date-input-with-icon"
                      />
                      <CalendarIcon className="date-input-icon" size={18} />
                    </div>
                  </div>

                   {/* Select de tipo de usuario */}
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

                 {/* Si existe error normalizado, lo muestro como feedback */}
                {normalizedErrorMessage && (
                  <div className="login-feedback login-feedback-error" role="alert">
                    <p>{normalizedErrorMessage}</p>
                  </div>
                )}

                {/* Botón submit */}
                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>

              {/* Enlace para ir a login si ya tiene cuenta */}
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