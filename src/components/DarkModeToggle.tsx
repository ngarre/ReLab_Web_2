import { useContext } from "react"; // Importamos el Hook useContext, que sirve para "conectarse" a un almacén de datos global.  
// No recuperamos props sino que accedemos a Estado Global compartido al suscribirnos a Contexto Específico: Evitamos Prop Drilling (que el dato pase por todos los estadios intermedios)
import { ThemeContext } from "../context/ThemeContext"; // Importamos el Contexto específico que creamos para el tema (donde vive el estado 'light' o 'dark').
import { SunIcon, MoonIcon } from "./Icons";

export function DarkModeToggle() {
  // Extraemos (usando destructuring) dos cosas del ThemeContext:
  // 1. theme: El valor actual (si es "light" o "dark").
  // 2. toggleTheme: La función que cambia de uno a otro al llamarla.
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button 
      onClick={toggleTheme} // Al hacer clic, se dispara la función que cambia el estado global.
      className="dark-mode-toggle" 
      title={`Cambiar a modo ${theme === "light" ? "Oscuro" : "Claro"}`} // Atributo dinámico: si el tema actual es claro, el tooltip dirá "Cambiar a modo Oscuro".
    >
      {/* Si theme es "light", muestra el sol; si no (es "dark"), muestra la luna. */}
      {theme === "light" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
