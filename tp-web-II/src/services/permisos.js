import { ErrorHttp, ErrorPermiso } from "./errores.js";

const CLAVE_SESION = "sesionLS";

export function exigirAdmin() {
  let sesion;
  try {
    sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    sesion = null;
  }
  if (!sesion?.usuario) {
    throw new ErrorHttp(401, "Tenés que iniciar sesión para realizar esta acción.");
  }
  if (sesion.rol !== "admin") {
    throw new ErrorPermiso("Solo el administrador puede realizar esta operación.");
  }
}
