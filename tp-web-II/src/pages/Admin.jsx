import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { restablecerDatos } from "../services/almacen.js";
import Aviso from "../components/admin/Aviso.jsx";
import DialogoConfirmacion from "../components/admin/DialogoConfirmacion.jsx";
import { useMontado } from "../components/admin/useMontado.js";

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
  const montado = useMontado();
  const [version, setVersion] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [reiniciando, setReiniciando] = useState(false);
  const [aviso, setAviso] = useState(null);

  async function restablecer() {
    setReiniciando(true);
    try {
      await restablecerDatos();
      if (!montado.current) return;
      setVersion((actual) => actual + 1);
      setAviso({ tipo: "exito", texto: "Se restablecieron los datos de demostración." });
    } catch (falla) {
      if (montado.current) setAviso({ tipo: "error", texto: falla.message });
    } finally {
      if (montado.current) {
        setReiniciando(false);
        setConfirmando(false);
      }
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-beige-800">Panel de administración</h1>
        <button
          onClick={() => setConfirmando(true)}
          className="rounded-lg border border-beige-300 px-3 py-2 text-sm font-semibold text-beige-800 hover:bg-beige-200"
        >
          Restablecer datos de demostración
        </button>
      </div>
      <p className="mt-2 text-sm text-beige-700">
        Simulación: los cambios se guardan solo en este navegador (localStorage) y no modifican
        ningún archivo ni servidor.
      </p>

      <nav aria-label="Secciones del panel" className="mt-4 flex flex-wrap gap-2">
        {SECCIONES.map((seccion) => (
          <NavLink key={seccion.ruta} to={seccion.ruta} className={estiloPestana}>
            {seccion.titulo}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6">
        {aviso && (
          <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>
            {aviso.texto}
          </Aviso>
        )}
        <Outlet key={version} />
      </div>

      {confirmando && (
        <DialogoConfirmacion
          titulo="Restablecer datos"
          mensaje="Se descartan todos los cambios hechos y se vuelve a los productos, categorías y tags originales."
          textoConfirmar="Restablecer"
          textoOcupado="Restableciendo…"
          ocupado={reiniciando}
          onConfirmar={restablecer}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </main>
  );
}
