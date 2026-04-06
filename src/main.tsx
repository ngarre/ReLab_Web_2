// "Corrector ortográfico para React.  Avisa en consola si cometo errores o utilizo código antiguo"
import { StrictMode } from 'react'
// Importa la función de la librería react-dom encargada de 
// inicializar y gestionar el árbol de componentes en el navegador.
import { createRoot } from 'react-dom/client'
// Cargo estilos globales de la página
import './index.css'
import App from './App.tsx'

// 1. Busca el contenedor físico en el index.html (id="root").
// 2. Crea la "raíz" de React en ese elemento. El "!" asegura que el elemento existe.
// 3. El método .render() dibuja la aplicación por primera vez.
createRoot(document.getElementById('root')!).render(
  // Modo estricto: ayuda a detectar problemas durante el desarrollo (doble renderizado).
  <StrictMode>
    {/* Componente principal que contiene toda la lógica y páginas de nuestra web */}
    <App />
  </StrictMode>,
)


// Punto de entrada de la aplicación.  Conecta el código de React con el DOM real del navegador, 
// buscando el elemento root en el HTML y renderizando el compoente principal <App /> dentro de él.
