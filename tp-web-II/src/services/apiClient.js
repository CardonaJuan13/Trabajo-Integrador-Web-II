import { TOKEN, URL_API } from "../api.js";
import { ErrorHttp, ErrorNoEncontrado, ErrorRed, ErrorValidacion } from "./errores.js";

const MENSAJES_HTTP = {
  401: "Tenés que iniciar sesión para continuar.",
  403: "No tenés permisos para acceder a este recurso.",
  404: "No se encontró el recurso solicitado.",
};

// Convierte los errores 422 de FastAPI ({ detail: [{ loc, msg }] }) en errores por campo.
function camposDesdeDetalle(detalle) {
  if (!Array.isArray(detalle)) return null;
  const campos = {};
  for (const item of detalle) {
    const campo = item.loc?.[item.loc.length - 1];
    if (typeof campo === "string" && !campos[campo]) campos[campo] = item.msg;
  }
  return Object.keys(campos).length ? campos : null;
}

async function leerCuerpo(respuesta) {
  const texto = await respuesta.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

/**
 * Hace una petición autenticada a la API.
 * - `cuerpo` se envía como JSON, salvo que sea un FormData (subida de archivos).
 */
export async function peticion(ruta, { metodo = "GET", cuerpo } = {}) {
  const headers = { Authorization: `Bearer ${TOKEN}` };
  let body;
  if (cuerpo instanceof FormData) {
    body = cuerpo;
  } else if (cuerpo !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(cuerpo);
  }

  let respuesta;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, { method: metodo, headers, body });
  } catch {
    throw new ErrorRed();
  }

  const datos = await leerCuerpo(respuesta);
  if (respuesta.ok) {
    if (typeof datos === "string") {
      throw new ErrorHttp(respuesta.status, "La respuesta del servidor no tiene un formato válido.");
    }
    return datos;
  }

  const detalle = datos?.detail;
  if (respuesta.status === 422) {
    const campos = camposDesdeDetalle(detalle);
    if (campos) throw new ErrorValidacion(campos);
  }
  const mensaje =
    typeof detalle === "string"
      ? detalle
      : MENSAJES_HTTP[respuesta.status] ?? `Error del servidor (código ${respuesta.status}).`;
  if (respuesta.status === 404) throw new ErrorNoEncontrado(mensaje);
  throw new ErrorHttp(respuesta.status, mensaje);
}

export const obtenerJSON = (ruta) => peticion(ruta);
