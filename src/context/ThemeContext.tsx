import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';


// Defino qué información va estar presente en toda la app.
// En este caso: el nombre del tema y la función para cambiarlo.
interface ThemeContextType {
  theme: 'light' | 'dark'; // Solo permite estas dos palabras exactas
  toggleTheme: () => void; // Función que no recibe ni devuelve nada 
}

// Valores por defecto: el tema light y la función toggleTheme vacía.
// Están por si los componentes hijos no encontrasen el Provider.
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light', 
  toggleTheme: () => {},  // Valor inicial: es una función vacía por seguridad
});






// Componente que envuelve a toda la App para que todos tengan acceso al tema.
interface ThemeProviderProps {
    children: ReactNode; // "children" son todos los compontentes que hay dentro de la App, son las props que recibe de React
}

export function ThemeProvider({ children }: ThemeProviderProps) { 
    // useState es la MEMORIA que guarda el estado actual.  
    // Uso una función dentro del useState para que la primera vez que se carga la web, se mira en localStorage (memoria del navegador)
    // par coneocer si el usuario ya había elegido un tema antes
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme === 'dark' ? 'dark' : 'light');
    });


    // useEffect es lo que reacciona a lo que tenemos en esa MEMORIA que es useState, cada vez que la variable "theme" cambia
    // este código se ejecuta automáticamente: va al HTML y le pone la etiqueta class="dark" o class="light".
    useEffect(() => {
        document.body.className = theme;
    }, [theme]); // En el array de dependencias establecemos que solo se ejecute este código cuando la variable Theme cambie


    // funciona como INTERRUPTOR, es la lógica para alternar entre los dos estados.
    const toggleTheme = () => {
        // React hace que ese parámetro que le paso como currentTheme sea el estado actual, así que me devuelve el estado actual para poder cambiarlo
        setTheme(currentTheme => {
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme); // Guardamos la elección para la próxima visita
            return newTheme; // Actualizamos la "memoria" (el estado)
        });
    };

    // Conteiene el valor actual de useState(theme) y la función para cambiarlo (toggleTheme)
    // Con ThemeContextType aseguro a TypeScript que este objeto cumple exactamente con el molde (la interfaz) que he definido arriba
    const contextValue: ThemeContextType = {
        theme, 
        toggleTheme, 
    };

    return (
        // Los componentes hijos siempre tratan de coger el valor de Provider, el contextValue con los datos actualizados, 
        // si no se encuentra se coge el createContext (los datos por defecto)
        // ThemeContext.Provider permite "emitir" información hacía abajo
        // Children represneta toda mi aplicación
        <ThemeContext.Provider value={contextValue}>
            {children} 
        </ThemeContext.Provider>
    );
}