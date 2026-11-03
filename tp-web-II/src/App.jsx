import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./components/Home.jsx";
import Listado from "./components/Listado.jsx";
import Ficha from "./components/Ficha.jsx";
import Carrito from "./components/carrito.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Login from "./pages/Login.jsx";
import Checkout from "./pages/Checkout.jsx";
import Admin from "./pages/Admin.jsx";
import AdminProductos from "./pages/admin/AdminProductos.jsx";
import AdminCategorias from "./pages/admin/AdminCategorias.jsx";
import AdminTags from "./pages/admin/AdminTags.jsx";
import AccesoDenegado from "./pages/AccesoDenegado.jsx";
import NoEncontrada from "./pages/NoEncontrada.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="productos" element={<Listado />} />
            <Route path="productos/:id" element={<Ficha />} />
            <Route path="login" element={<Login />} />
            <Route path="403" element={<AccesoDenegado />} />
            <Route element={<ProtectedRoute />}>
              <Route path="carrito" element={<Carrito />} />
              <Route path="checkout" element={<Checkout />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<Admin />}>
                <Route index element={<Navigate to="productos" replace />} />
                <Route path="productos" element={<AdminProductos />} />
                <Route path="categorias" element={<AdminCategorias />} />
                <Route path="tags" element={<AdminTags />} />
              </Route>
            </Route>
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
