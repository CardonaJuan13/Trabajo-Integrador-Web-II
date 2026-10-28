import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { sesionIniciada } = useAuth();
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
  return <Outlet />;
}