import { obtenerJSON } from "./apiClient.js";
import { exigirAdmin } from "./permisos.js";

const urlSemilla = new URL("../data/api-fake.json", import.meta.url).href;
const CLAVE_DATOS = "datosTienda";
const LATENCIA_MS = 200;

export const esperar = (ms = LATENCIA_MS) => new Promise((resolver) => setTimeout(resolver, ms));

let datos = null;
let cargaEnCurso = null;

function leerGuardados() {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE_DATOS));
    const valido =
      crudo &&
      Array.isArray(crudo.productos) &&
      Array.isArray(crudo.categorias) &&
      Array.isArray(crudo.tags);
    return valido ? crudo : null;
  } catch {
    return null;
  }
}

function persistir(nuevosDatos) {
  datos = nuevosDatos;
  localStorage.setItem(CLAVE_DATOS, JSON.stringify(nuevosDatos));
}

export function cargarDatos() {
  if (datos) return Promise.resolve(datos);
  if (!cargaEnCurso) {
    cargaEnCurso = (async () => {
      const guardados = leerGuardados();
      if (guardados) {
        datos = guardados;
      } else {
        persistir(await obtenerJSON(urlSemilla));
      }
      return datos;
    })().finally(() => {
      cargaEnCurso = null;
    });
  }
  return cargaEnCurso;
}

export function guardarDatos(nuevosDatos) {
  persistir(nuevosDatos);
}

export function siguienteId(lista) {
  return lista.reduce((mayor, elemento) => Math.max(mayor, elemento.id), 0) + 1;
}

export async function restablecerDatos() {
  exigirAdmin();
  const semilla = await obtenerJSON(urlSemilla);
  persistir(semilla);
}

window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVE_DATOS) datos = null;
});
