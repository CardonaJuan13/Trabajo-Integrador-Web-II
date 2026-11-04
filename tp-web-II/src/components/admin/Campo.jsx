export default function Campo({ etiqueta, error, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-beige-800">
      {etiqueta}
      {children}
      {error && (
        <span role="alert" className="text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
