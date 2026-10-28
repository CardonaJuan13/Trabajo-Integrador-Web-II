import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { obtenerCategorias, obtenerProductos } from "../api.js";
import TarjetaProducto from "./ProductCard.jsx";

const normalizar = (texto) =>
  String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function Listado() {
  const [parametros, setParametros] = useSearchParams();
  const q = parametros.get("q") ?? "";
  const categoria = parametros.get("categoria") ?? "";
  const tag = parametros.get("tag") ?? "";

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [texto, setTexto] = useState(q);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => setTexto(q), [q]);

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

  function actualizar(clave, valor) {
    const nuevos = new URLSearchParams(parametros);
    if (valor) nuevos.set(clave, valor);
    else nuevos.delete(clave);
    setParametros(nuevos, { replace: true });
  }

  function enviarBusqueda(evento) {
    evento.preventDefault();
    actualizar("q", texto.trim());
  }

  const visibles = useMemo(() => {
    const buscado = normalizar(q);
    return productos.filter((producto) => {
      const coincideTexto =
        !buscado || normalizar(`${producto.title} ${producto.description}`).includes(buscado);
      const coincideCategoria =
        !categoria || String(producto.category_id) === String(categoria);
      const coincideTag =
        !tag || (producto.tags ?? []).some((etiqueta) => String(etiqueta.id) === String(tag));
      return coincideTexto && coincideCategoria && coincideTag;
    });
  }, [productos, q, categoria, tag]);

  const categoriaActiva = categorias.find((c) => String(c.id) === String(categoria));
  const etiquetaActiva = tag
    ? productos
        .flatMap((producto) => producto.tags ?? [])
        .find((etiqueta) => String(etiqueta.id) === String(tag))
    : null;
  const hayFiltros = Boolean(q || categoria || tag);

  const estiloBoton = (activo) =>
    `rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
      activo
        ? "border-beige-600 bg-beige-600 text-white"
        : "border-beige-300 bg-beige-50 text-beige-800 hover:bg-beige-200"
    }`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-3xl font-bold text-beige-800">Productos</h1>

      <form onSubmit={enviarBusqueda} className="mt-4 flex max-w-xl gap-2">
        <input
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Buscar por nombre o descripción…"
          aria-label="Buscar productos"
          className="flex-1 rounded-lg border border-beige-300 bg-beige-50 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
        >
          Buscar
        </button>
      </form>

      {cargando && <p className="py-16 text-center text-beige-700">Cargando…</p>}
      {error && <p className="py-16 text-center text-red-600">Error: {error}</p>}

      {!cargando && !error && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={estiloBoton(!categoria)} onClick={() => actualizar("categoria", "")}>
              Todas
            </button>
            {categorias.map((item) => (
              <button
                key={item.id}
                className={estiloBoton(String(item.id) === String(categoria))}
                onClick={() => actualizar("categoria", item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>

          {hayFiltros && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-beige-800">
              <span>Filtros:</span>
              {q && <span className="rounded-full bg-beige-200 px-3 py-1">“{q}”</span>}
              {categoriaActiva && (
                <span className="rounded-full bg-beige-200 px-3 py-1">
                  {categoriaActiva.title}
                </span>
              )}
              {etiquetaActiva && (
                <span className="rounded-full bg-beige-200 px-3 py-1">{etiquetaActiva.title}</span>
              )}
              <Link to="/productos" className="font-semibold text-beige-700 hover:underline">
                Limpiar filtros
              </Link>
            </div>
          )}

          <p className="mt-3 text-sm text-beige-700">{visibles.length} productos</p>

          {visibles.length === 0 ? (
            <p className="py-16 text-center text-beige-700">
              No hay productos que coincidan con los filtros.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {visibles.map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}