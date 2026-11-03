export default function Aviso({ tipo, children, onCerrar }) {
  const esError = tipo === "error";
  return (
    <div
      role={esError ? "alert" : "status"}
      className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-semibold ${
        esError
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-beige-400 bg-beige-200 text-beige-900"
      }`}
    >
      <span>{children}</span>
      {onCerrar && (
        <button onClick={onCerrar} aria-label="Cerrar aviso" className="text-lg leading-none opacity-70 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}
