import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { obtenerProductos, urlImagen } from "../api.js";
import { agregarAlCarrito, useCarrito, formatearPrecio } from "../../data/cart.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Ficha() {
  const { id } = useParams();
  const location = useLocation();
  const { sesionIniciada } = useAuth();
  const { articulos } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionada, setSeleccionada] = useState(0);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      try {
        const todos = await obtenerProductos();
        if (cancelado) return;
        setProducto(todos.find((candidato) => String(candidato.id) === String(id)) ?? null);
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
  }, [id]);

  if (cargando) return <p className="py-16 text-center text-beige-700">Cargando…</p>;
  if (error) return <p className="py-16 text-center text-red-600">Error: {error}</p>;
  if (!producto)
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="mb-4 text-beige-700">No encontramos ese producto.</p>
        <Link to="/productos" className="text-sm font-semibold text-beige-700 hover:underline">
          ← Volver a productos
        </Link>
      </main>
    );

  const imagenes = producto.pictures?.length ? producto.pictures : [null];
  const imagenPrincipal = urlImagen(imagenes[seleccionada] ?? imagenes[0]);
  const enCarrito = articulos.find((articulo) => articulo.id === producto.id)?.cantidad ?? 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Link to="/productos" className="text-sm font-semibold text-beige-700 hover:underline">
        ← Volver a productos
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          <img
            src={imagenPrincipal}
            alt={producto.title}
            className="aspect-square w-full rounded-2xl border border-beige-300 object-cover"
          />
          {imagenes.length > 1 && (
            <div className="mt-3 flex gap-2">
              {imagenes.map((imagen, indice) => (
                <button
                  key={indice}
                  onClick={() => setSeleccionada(indice)}
                  aria-label={`Ver imagen ${indice + 1}`}
                >
                  <img
                    src={urlImagen(imagen)}
                    alt=""
                    className={`h-16 w-16 rounded-lg object-cover ${
                      indice === seleccionada
                        ? "ring-2 ring-beige-600"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {producto.category && (
            <Link
              to={`/productos?categoria=${producto.category_id}`}
              className="w-fit rounded-full bg-beige-200 px-3 py-1 text-xs font-semibold text-beige-800 hover:bg-beige-300"
            >
              {producto.category.title}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-beige-900">{producto.title}</h1>
          <p className="text-3xl font-bold text-beige-700">{formatearPrecio(producto.price)}</p>

          {producto.tags?.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {producto.tags.map((etiqueta) => (
                <li key={etiqueta.id ?? etiqueta.title}>
                  <Link
                    to={`/productos?tag=${etiqueta.id}`}
                    className="rounded-full border border-beige-300 px-3 py-1 text-xs text-beige-800 hover:bg-beige-200"
                  >
                    {etiqueta.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="text-beige-800">{producto.description}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {sesionIniciada ? (
              <button
                onClick={() => agregarAlCarrito(producto, imagenPrincipal)}
                className="rounded-lg bg-beige-600 px-6 py-3 font-semibold text-white transition hover:bg-beige-700"
              >
                Agregar al carrito
              </button>
            ) : (
              <Link
                to="/login"
                state={{ desde: location.pathname + location.search }}
                className="rounded-lg bg-beige-600 px-6 py-3 font-semibold text-white transition hover:bg-beige-700"
              >
                Ingresá para comprar
              </Link>
            )}
            {enCarrito > 0 && (
              <Link to="/carrito" className="text-sm font-semibold text-beige-700 hover:underline">
                En tu carrito: {enCarrito} · Ver carrito
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}