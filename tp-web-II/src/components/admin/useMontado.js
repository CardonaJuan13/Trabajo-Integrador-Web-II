import { useEffect, useRef } from "react";

export function useMontado() {
  const montado = useRef(false);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  return montado;
}
