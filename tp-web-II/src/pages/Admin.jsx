import { NavLink, Outlet } from "react-router-dom";

const SECCIONES = [
  { ruta: "productos", titulo: "Productos" },
  { ruta: "categorias", titulo: "Categorías" },
  { ruta: "tags", titulo: "Tags" },
];

const estiloPestana = ({ isActive }) =>
  `rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
    isActive
      ? "border-beige-600 bg-beige-600 text-white"
      : "border-beige-300 bg-beige-50 text-beige-800 hover:bg-beige-200"
  }`;

export default function Admin() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-3xl font-bold text-beige-800">Panel de administración</h1>
      <p className="mt-2 text-sm text-beige-700">
        Los datos se leen y se guardan directamente en la API: los cambios se ven en toda la tienda.
      </p>

      <nav aria-label="Secciones del panel" className="mt-4 flex flex-wrap gap-2">
        {SECCIONES.map((seccion) => (
          <NavLink key={seccion.ruta} to={seccion.ruta} className={estiloPestana}>
            {seccion.titulo}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6">
        <Outlet />
      </div>
    </main>
  );
}
