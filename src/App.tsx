import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import MyProducts from "./pages/MyProducts";
import { RoleRoute } from "./components/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="app-layout">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route
                path="/users"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <Users />
                  </RoleRoute>
                }
              />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-products"
                element={
                  <ProtectedRoute>
                    <MyProducts />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
