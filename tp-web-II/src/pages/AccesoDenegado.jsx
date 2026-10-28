import { Link } from "react-router-dom";

export default function AccesoDenegado() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-6xl font-black text-beige-300">403</p>
      <h1 className="mt-2 text-2xl font-bold text-beige-800">Acceso denegado</h1>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
      >
        Volver al inicio
      </Link>
    </main>
  );
}