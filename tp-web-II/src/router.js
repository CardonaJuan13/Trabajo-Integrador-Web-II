import { useSyncExternalStore } from "react";

function suscribirse(avisar) {
  window.addEventListener("hashchange", avisar);
  return () => window.removeEventListener("hashchange", avisar);
}
const obtenerHash = () => window.location.hash;

export function useRuta() {
  const hash = useSyncExternalStore(suscribirse, obtenerHash);
  const [rutaCruda, consulta = ""] = hash.replace(/^#/, "").split("?");
  return { ruta: rutaCruda || "/", parametros: new URLSearchParams(consulta) };
}

export function navegar(destino) {
  window.location.hash = destino;
}

