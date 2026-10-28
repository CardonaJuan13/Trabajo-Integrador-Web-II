import { Link } from "react-router-dom";
import {
  useCarrito,
  cambiarCantidad,
  quitarDelCarrito,
  vaciarCarrito,
  formatearPrecio,
} from "../../data/cart.js";

export default function Carrito() {
  const { articulos, total } = useCarrito();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-bold text-beige-800">Tu carrito</h1>

      {articulos.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-beige-700">Tu carrito está vacío.</p>
          <Link
            to="/productos"
            className="mt-4 inline-block rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-beige-700"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 flex flex-col gap-3">
            {articulos.map((articulo) => (
              <li
                key={articulo.id}
                className="flex items-center gap-4 rounded-2xl border border-beige-300 bg-beige-50 p-3 shadow-sm"
              >
                <img
                  src={articulo.imagen}
                  alt={articulo.titulo}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-beige-900">{articulo.titulo}</h2>
                  <p className="text-sm text-beige-700">{formatearPrecio(articulo.precio)} c/u</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label="Restar uno"
                      onClick={() => cambiarCantidad(articulo.id, articulo.cantidad - 1)}
                      className="h-7 w-7 rounded-lg border border-beige-300 font-bold text-beige-800 hover:bg-beige-200"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{articulo.cantidad}</span>
                    <button
                      aria-label="Sumar uno"
                      onClick={() => cambiarCantidad(articulo.id, articulo.cantidad + 1)}
                      className="h-7 w-7 rounded-lg border border-beige-300 font-bold text-beige-800 hover:bg-beige-200"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold text-beige-700">
                    {formatearPrecio(articulo.precio * articulo.cantidad)}
                  </p>
                  <button
                    onClick={() => quitarDelCarrito(articulo.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-beige-300 bg-beige-50 px-4 py-3">
            <span className="text-lg font-semibold text-beige-900">Total</span>
            <strong className="text-2xl text-beige-700">{formatearPrecio(total)}</strong>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={vaciarCarrito}
              className="rounded-lg border border-beige-300 px-4 py-2 text-sm font-semibold text-beige-800 hover:bg-beige-200"
            >
              Vaciar carrito
            </button>
            <Link
              to="/checkout"
              className="rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
            >
              Proceder al pago
            </Link>
          </div>
        </>
      )}
    </main>
  );
}