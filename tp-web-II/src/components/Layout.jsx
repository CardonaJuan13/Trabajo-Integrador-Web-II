import { Outlet } from "react-router-dom";
import Encabezado from "./Header.jsx";
import PiePagina from "./Footer.jsx";
import Notificacion from "./Toast.jsx";

export default function Estructura() {
  return (
    <div className="flex min-h-screen flex-col">
      <Encabezado />
      <div className="flex-1">
        <Outlet />
      </div>
      <PiePagina />
      <Notificacion />
    </div>
  );
}