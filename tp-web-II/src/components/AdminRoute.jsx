import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminRoute() {
  const { sesionIniciada, esAdmin } = useAuth();
  const location = useLocation();

  if (!sesionIniciada) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ desde: location.pathname + location.search }}
      />
    );
  }
  if (!esAdmin) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}