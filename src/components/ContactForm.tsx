import { useForm } from 'react-hook-form'; // Librería para el formulario
import './ContactForm.css';

// Definimos qué datos esperamos
interface ContactInputs {
  nombre: string;
  email: string;
  mensaje: string;
}

export const ContactForm = () => {
  const { 
    register, // Función para conectar los inputs con la librería.
    handleSubmit, // Validador que se ejecuta antes de enviar.
    formState: { errors }, // Objeto que contiene los fallos de validación en tiempo real.
    reset // Función para dejar el formulario en blanco.
  } = useForm<ContactInputs>(); // Indicamos que los datos del formulario serán de tipo ContactInputs y los paréntesis vacíos inicializan la configuración por defecto.

  // Definimos la función que establece qué hacer cuando el usuario pulsa "Enviar" y no hay errores
  // "data" contiene todo lo que el usuario ha escrito (nombre, email, ...)
  // ":ContactInputs" hace que TypeScript se asegure de que data tenga todo lo que hemos definido en la interfaz
  const onSubmit = (data: ContactInputs) => {

    // Imprime en la consola del navegador un objeto con las respuestas para verificar que todo viaja bien.
    console.log("Datos del formulario:", data);
    
    // Simulamos el envío guardando en localStorage
    // Navegador sólo entiende texto plano, por eso utilizo JSON.stringify(data)
    // para convertir mi objeto de datos en cadena dee texto
    // Se guarda bajo la etiqueta "ultimo_contacto"
    localStorage.setItem('ultimo_contacto', JSON.stringify(data));
    // Ventana emergente clásica que le confirma al usuario que todo ha ido bien.
    alert("¡Mensaje enviado con éxito! (Simulado)");
    // "reset()" es una función de la librería react-hook-form 
    // que vacía automáticamente todos los campos del formulario.
    reset(); 
  };

  return (
    <section className="contact-section">
      <div className="contact-card">
        <h2 className="contact-title">¿Tienes alguna duda?</h2>
        <p className="contact-subtitle">Contáctanos y te responderemos lo antes posible.</p>
        
        {/* Validaciones con handleSubmit antes de enviar */}
        <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
          {/* Campo Nombre */}
          <div className="form-group">
            <label>Nombre Completo</label>
            <input 
              {...register("nombre", { required: "El nombre es obligatorio" })} 
              placeholder="Tu nombre..."
              className={errors.nombre ? "input-error" : ""}
            />
            {/* Si se produce un error de ese tipo se pinta el texto del error debajo del cuadro */}
            {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
          </div>

          {/* Campo Email */}
          <div className="form-group">
            <label>Email de contacto</label>
            <input 
              {...register("email", { 
                required: "El email es obligatorio",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email no válido"
                }
              })} 
              placeholder="ejemplo@correo.com"
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-msg">{errors.email.message}</span>}
          </div>

          {/* Campo Mensaje */}
          <div className="form-group">
            <label>Mensaje</label>
            <textarea 
              {...register("mensaje", { 
                required: "El mensaje no puede estar vacío",
                minLength: { value: 10, message: "Mínimo 10 caracteres" }
              })} 
              placeholder="¿En qué podemos ayudarte?"
            />
            {errors.mensaje && <span className="error-msg">{errors.mensaje.message}</span>}
          </div>

          <button type="submit" className="submit-btn">Enviar Consulta</button>
        </form>
      </div>
    </section>
  );
};