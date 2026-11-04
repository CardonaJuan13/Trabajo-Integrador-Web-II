export default function DialogoConfirmacion({
  titulo,
  mensaje,
  textoConfirmar = "Eliminar",
  textoOcupado = "Eliminando…",
  ocupado = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-dialogo"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-beige-300 bg-beige-50 p-6 shadow-xl">
        <h2 id="titulo-dialogo" className="text-lg font-bold text-beige-900">
          {titulo}
        </h2>
        <p className="mt-2 text-sm text-beige-800">{mensaje}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancelar}
            disabled={ocupado}
            className="rounded-lg border border-beige-300 px-4 py-2 text-sm font-semibold text-beige-800 hover:bg-beige-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={ocupado}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {ocupado ? textoOcupado : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
