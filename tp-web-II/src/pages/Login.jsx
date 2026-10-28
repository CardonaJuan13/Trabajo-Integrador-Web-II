import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { usuario, sesionIniciada, ingresar, salir } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [nombre, setNombre] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const destino = location.state?.desde ?? "/";

  function enviar(evento) {
    evento.preventDefault();
    try {
      ingresar(nombre, clave);
      setError("");
      setClave("");
      navigate(destino, { replace: true });
    } catch (falla) {
      setError(falla.message);
    }
  }

  if (sesionIniciada) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-beige-800">Sesión iniciada</h1>
        <p className="mt-2 text-beige-700">
          {usuario.nombre} · rol: <strong>{usuario.rol}</strong>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-lg border border-beige-300 px-4 py-2 text-sm font-semibold text-beige-800 hover:bg-beige-200"
          >
            Ir al inicio
          </Link>
          <button
            onClick={salir}
            className="rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-beige-800">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-beige-700">
        Cuentas demo: <strong>admin / 1234</strong> (administrador) y{" "}
        <strong>usuario / 1234</strong> (cliente).
      </p>

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-semibold text-beige-800">
          Usuario
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="username"
            required
            className="rounded-lg border border-beige-300 bg-beige-50 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-beige-800">
          Contraseña
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete="current-password"
            required
            className="rounded-lg border border-beige-300 bg-beige-50 px-3 py-2 font-normal"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="rounded-lg bg-beige-600 px-4 py-2 font-semibold text-white hover:bg-beige-700"
        >
          Ingresar
        </button>
      </form>
    </main>
  );
}