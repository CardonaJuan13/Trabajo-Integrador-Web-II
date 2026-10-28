import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { vaciarCarrito } from "../../data/cart.js";

const CLAVE = "sesionLS";

const CUENTAS_DEMO = {
  admin: { usuario: "admin", clave: "1234", rol: "admin", nombre: "Administrador" },
  usuario: { usuario: "usuario", clave: "1234", rol: "cliente", nombre: "Cliente" },
};

const AuthContext = createContext(null);

function leerSesion() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const sesion = JSON.parse(crudo);
    return sesion?.usuario && sesion?.rol ? sesion : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion);

  useEffect(() => {
    if (usuario) localStorage.setItem(CLAVE, JSON.stringify(usuario));
    else localStorage.removeItem(CLAVE);
  }, [usuario]);

  function ingresar(nombreUsuario, clave) {
    const cuenta = CUENTAS_DEMO[String(nombreUsuario).trim().toLowerCase()];
    if (!cuenta || cuenta.clave !== clave) {
      throw new Error("Usuario o contraseña incorrectos.");
    }
    const sesion = { usuario: cuenta.usuario, rol: cuenta.rol, nombre: cuenta.nombre };
    setUsuario(sesion);
    return sesion;
  }

  function salir() {
    vaciarCarrito();
    setUsuario(null);
  }

  const valor = useMemo(
    () => ({
      usuario,
      sesionIniciada: Boolean(usuario),
      esAdmin: usuario?.rol === "admin",
      ingresar,
      salir,
    }),
    [usuario]
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return contexto;
}