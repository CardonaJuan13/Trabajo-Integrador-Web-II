import { ErrorHttp, ErrorRed } from "./errores.js";

const MENSAJES_HTTP = {
  401: "Tenés que iniciar sesión para continuar.",
  403: "No tenés permisos para acceder a este recurso.",
  404: "No se encontró el recurso solicitado.",
};

export async function obtenerJSON(url) {
  let respuesta;
  try {
    respuesta = await fetch(url);
  } catch {
    throw new ErrorRed();
  }
  if (!respuesta.ok) {
    throw new ErrorHttp(
      respuesta.status,
      MENSAJES_HTTP[respuesta.status] ?? `Error del servidor (código ${respuesta.status}).`
    );
  }
  try {
    return await respuesta.json();
  } catch {
    throw new ErrorHttp(respuesta.status, "La respuesta del servidor no tiene un formato válido.");
  }
}
