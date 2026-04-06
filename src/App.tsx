// Importo herramientas de navegación de React Router
import { BrowserRouter, Route, Routes } from "react-router-dom";
// Importo el Contexto Global (para el modo oscuro)
import { ThemeProvider } from "./context/ThemeContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";

function App() { 
  return (
    /* Envoltorio principal que permite la navegación sin recargar la página */
    <BrowserRouter>
    {/* Proveedor de contexto que "reparte" el estado del modo oscuro a toda la app */}
      <ThemeProvider>
        {/* Contenedor principal para aplicar estilos globales de CSS */}
        <div className="app-layout">
          {/*Header y Footer son componentes fijos: Se muestran en todas las páginas porque están fuera de <Routes> */}
          <Header />
          {/* Routes: Actúa como un interruptor que decide qué página mostrar según la URL actual */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/users" element={<Users />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>

          <Footer />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
