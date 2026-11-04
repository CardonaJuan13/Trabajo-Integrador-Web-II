const oyentes = new Set();

export const AVISO_INICIAR_SESION = "Es necesario iniciar sesión para comprar productos";

/**
 * Muestra una notificación flotante.
 * - tipo "exito" (por defecto): producto agregado al carrito, con enlace "Ver carrito".
 * - tipo "aviso": mensaje informativo (por ejemplo, pedir que se inicie sesión).
 */
export function mostrarNotificacion(mensaje, { tipo = "exito", titulo } = {}) {
  oyentes.forEach((oyente) => oyente({ mensaje, tipo, titulo, id: Date.now() + Math.random() }));
}

export function suscribirNotificaciones(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}
