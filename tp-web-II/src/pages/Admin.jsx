import { Link, useSearchParams } from "react-router-dom";

const SECCIONES = [
  { id: "productos", titulo: "Productos", detalle: "Alta, edición y baja de productos." },
  { id: "categorias", titulo: "Categorías", detalle: "Alta, edición y baja de categorías." },
  { id: "tags", titulo: "Tags", detalle: "Alta, edición y baja de etiquetas." },
];

export default function Admin() {
  const [parametros, setParametros] = useSearchParams();
  const activa = parametros.get("tab") ?? "productos";
  const seccion = SECCIONES.find((item) => item.id === activa) ?? SECCIONES[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-3xl font-bold text-beige-800">Panel de administración</h1>
      <nav className="mt-4 flex flex-wrap gap-2">
        {SECCIONES.map((item) => (
          <button
            key={item.id}
            onClick={() => setParametros({ tab: item.id }, { replace: true })}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              item.id === seccion.id
                ? "border-beige-600 bg-beige-600 text-white"
                : "border-beige-300 bg-beige-50 text-beige-800 hover:bg-beige-200"
            }`}
          >
            {item.titulo}
          </button>
        ))}
      </nav>
      <section className="mt-6 rounded-2xl border border-beige-300 bg-beige-50 p-6">
        <h2 className="text-xl font-bold text-beige-800">{seccion.titulo}</h2>
        <p className="mt-1 text-beige-700">{seccion.detalle}</p>
      </section>
    </main>
  );
}