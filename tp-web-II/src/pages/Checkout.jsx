import { useState } from "react";
import { Link } from "react-router-dom";
import { useCarrito, vaciarCarrito, formatearPrecio } from "../../data/cart.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Checkout() {
  const { articulos, total } = useCarrito();
  const { usuario } = useAuth();
  const [datos, setDatos] = useState({
    nombre: usuario?.nombre ?? "",
    correo: "",
    direccion: "",
  });
  const [confirmada, setConfirmada] = useState(false);

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!articulos.length) return;
    setConfirmada(true);
    vaciarCarrito();
  }

  if (confirmada) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-5xl font-black text-beige-400">✓</p>
        <h1 className="mt-2 text-2xl font-bold text-beige-800">Compra simulada confirmada</h1>
        <p className="mt-2 text-beige-700">
          Gracias por la compra, {datos.nombre}!. 
        </p>
        <Link
          to="/productos"
          className="mt-6 inline-block rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
        >
          Volver a productos
        </Link>
      </main>
    );
  }

  if (!articulos.length) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-beige-800">No hay nada para comprar</h1>
        <p className="mt-2 text-beige-700">Agregá productos al carrito antes de continuar.</p>
        <Link
          to="/productos"
          className="mt-6 inline-block rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
        >
          Ver productos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-3xl font-bold text-beige-800">Finalizar compra</h1>
      <p className="mt-1 text-sm text-beige-700">
        Compra simulada: no se procesan pagos ni se envían datos a un servidor.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-beige-300 bg-beige-50 p-4">
          <h2 className="text-lg font-bold text-beige-800">Resumen</h2>
          <ul className="mt-3 space-y-2 text-sm text-beige-800">
            {articulos.map((articulo) => (
              <li key={articulo.id} className="flex justify-between gap-3">
                <span>
                  {articulo.titulo} × {articulo.cantidad}
                </span>
                <strong>{formatearPrecio(articulo.precio * articulo.cantidad)}</strong>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-beige-300 pt-3 text-lg font-bold text-beige-700">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
        </section>

        <form
          onSubmit={enviar}
          className="flex flex-col gap-4 rounded-2xl border border-beige-300 bg-beige-50 p-4"
        >
          <label className="flex flex-col gap-1 text-sm font-semibold text-beige-800">
            Nombre y apellido
            <input
              name="nombre"
              value={datos.nombre}
              onChange={cambiar}
              required
              className="rounded-lg border border-beige-300 bg-white px-3 py-2 font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-beige-800">
            Correo electrónico
            <input
              type="email"
              name="correo"
              value={datos.correo}
              onChange={cambiar}
              required
              className="rounded-lg border border-beige-300 bg-white px-3 py-2 font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-beige-800">
            Dirección de entrega
            <input
              name="direccion"
              value={datos.direccion}
              onChange={cambiar}
              required
              className="rounded-lg border border-beige-300 bg-white px-3 py-2 font-normal"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-beige-600 px-4 py-2 font-semibold text-white hover:bg-beige-700"
          >
            Confirmar compra simulada
          </button>
        </form>
      </div>
    </main>
  );
}