import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { AVISO_INICIAR_SESION } from "../../data/toast.js";

export default function ProtectedRoute() {
  const { sesionIniciada } = useAuth();
  const location = useLocation();

  if (!sesionIniciada) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ desde: location.pathname + location.search, aviso: AVISO_INICIAR_SESION }}
      />
    );
  }
  return <Outlet />;
}