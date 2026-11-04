import { useEffect, useState } from "react";

export function useCarga(funcionCarga) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelado = false;
    funcionCarga()
      .then((datos) => {
        if (!cancelado) setEstado({ datos, cargando: false, error: null });
      })
      .catch((falla) => {
        if (!cancelado) setEstado({ datos: null, cargando: false, error: falla.message });
      });
    return () => {
      cancelado = true;
    };
  }, [funcionCarga, version]);

  return { ...estado, recargar: () => setVersion((actual) => actual + 1) };
}
