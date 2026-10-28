import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerCategorias, obtenerProductos, urlImagen } from "../api.js";
import TarjetaProducto from "./ProductCard.jsx";

export default function Inicio() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      try {
        const [listaProductos, listaCategorias] = await Promise.all([
          obtenerProductos(),
          obtenerCategorias(),
        ]);
        if (cancelado) return;
        setProductos(listaProductos);
        setCategorias(listaCategorias);
      } catch (falla) {
        if (!cancelado) setError(falla.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  function buscar(evento) {
    evento.preventDefault();
    const texto = busqueda.trim();
    navigate(texto ? `/productos?q=${encodeURIComponent(texto)}` : "/productos");
  }

  const secciones = [];
  const indice = new Map();
  for (const producto of productos) {
    for (const etiqueta of producto.tags ?? []) {
      if (!indice.has(etiqueta.id)) {
        const seccion = { ...etiqueta, productos: [] };
        indice.set(etiqueta.id, seccion);
        secciones.push(seccion);
      }
      indice.get(etiqueta.id).productos.push(producto);
    }
  }
  const destacadas = secciones.slice(0, 3);
  const primeros = productos.slice(0, 8);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <section className="mb-8 rounded-2xl border border-beige-300 bg-beige-50 px-6 py-8">
        <h1 className="text-3xl font-bold text-beige-700">Bienvenido a MuebleMundo</h1>
        <p className="mt-2 text-beige-800">
          Muebles de todas las variedades. Aprovechá nuestras ofertas y los nuevos productos.
        </p>
        <form onSubmit={buscar} className="mt-4 flex max-w-xl gap-2">
          <input
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar productos…"
            aria-label="Buscar productos"
            className="flex-1 rounded-lg border border-beige-300 bg-white px-3 py-2 text-beige-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
          >
            Buscar
          </button>
        </form>
      </section>

      {cargando && <p className="py-16 text-center text-beige-700">Cargando…</p>}
      {error && <p className="py-16 text-center text-red-600">Error: {error}</p>}

      {!cargando && !error && (
        <>
          <h2 className="mb-3 text-lg font-bold text-beige-700">Categorías</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categorias.map((categoria) => (
              <Link
                key={categoria.id}
                to={`/productos?categoria=${categoria.id}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-beige-300 bg-beige-50 p-4 text-center transition hover:border-beige-400 hover:shadow-md"
              >
                <img
                  src={urlImagen(categoria.picture)}
                  alt={categoria.title}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-beige-900">{categoria.title}</span>
              </Link>
            ))}
          </div>

          {destacadas.length === 0 ? (
            <>
              <h2 className="mb-3 mt-10 text-lg font-bold text-beige-700">Productos</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {primeros.map((producto) => (
                  <TarjetaProducto key={producto.id} producto={producto} />
                ))}
              </div>
            </>
          ) : (
            destacadas.map((seccion) => (
              <section key={seccion.id} className="mt-10">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-beige-700">{seccion.title}</h2>
                  <Link
                    to={`/productos?tag=${seccion.id}`}
                    className="text-sm font-semibold text-beige-700 hover:underline"
                  >
                    Ver todos
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {seccion.productos.slice(0, 4).map((producto) => (
                    <TarjetaProducto key={producto.id} producto={producto} />
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}
    </main>
  );
}