import { Link, NavLink } from "react-router-dom";
import { useCarrito } from "../../data/cart.js";
import { useAuth } from "../context/AuthContext.jsx";

const claseEnlace = ({ isActive }) =>
  `text-sm font-semibold transition ${
    isActive ? "text-beige-600 underline" : "text-beige-800 hover:text-beige-600"
  }`;

export default function Encabezado() {
  const { cantidadTotal } = useCarrito();
  const { usuario, sesionIniciada, esAdmin, salir } = useAuth();

  return (
    <header className="border-b border-beige-300 bg-beige-50">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-beige-700">
            MuebleMundo
          </Link>
          <div className="flex items-center gap-4">
            <NavLink to="/" end className={claseEnlace}>
              Inicio
            </NavLink>
            <NavLink to="/productos" className={claseEnlace}>
              Productos
            </NavLink>
            {esAdmin && (
              <NavLink to="/admin" className={claseEnlace}>
                Admin
              </NavLink>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/carrito"
            className="rounded-lg bg-beige-50 px-4 py-2 text-sm font-semibold text-beige-800 shadow-sm transition hover:bg-beige-200"
          >
            Carrito ({cantidadTotal})
          </Link>
          {sesionIniciada ? (
            <>
              <span className="text-sm text-beige-800">Logueado como "{usuario.nombre}"</span>
              <button
                onClick={salir}
                className="rounded-lg border border-beige-300 px-3 py-2 text-sm font-semibold text-beige-800 hover:bg-beige-200"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-beige-300 px-3 py-2 text-sm font-semibold text-beige-800 hover:bg-beige-200"
            >
              Ingresar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}