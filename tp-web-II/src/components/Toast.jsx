import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { suscribirNotificaciones } from "../../data/toast.js";

export default function Notificacion() {
  const [notificacion, setNotificacion] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => suscribirNotificaciones(setNotificacion), []);

  useEffect(() => {
    if (!notificacion) return;
    const animacion = requestAnimationFrame(() => setVisible(true));
    const temporizadorOcultar = setTimeout(() => setVisible(false), 3000);
    const temporizadorQuitar = setTimeout(() => setNotificacion(null), 3300);
    return () => {
      cancelAnimationFrame(animacion);
      clearTimeout(temporizadorOcultar);
      clearTimeout(temporizadorQuitar);
    };
  }, [notificacion]);

  if (!notificacion) return null;

  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-50">
      <div
        role="status"
        className={`pointer-events-auto flex w-72 items-start gap-3 rounded-xl border border-beige-300 bg-beige-50 px-4 py-3 shadow-lg transition duration-300 ${
          visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
        }`}
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-beige-200 text-sm font-bold text-beige-700">
          ✓
        </span>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-beige-900">Agregado al carrito</p>
          <p className="text-beige-800">{notificacion.mensaje}</p>
          <Link to="/carrito" className="mt-1 inline-block font-semibold text-beige-700 hover:underline">
            Ver carrito
          </Link>
        </div>
        <button
          onClick={() => setVisible(false)}
          aria-label="Cerrar notificación"
          className="text-beige-500 hover:text-beige-700"
        >
          X
        </button>
      </div>
    </div>
  );
}