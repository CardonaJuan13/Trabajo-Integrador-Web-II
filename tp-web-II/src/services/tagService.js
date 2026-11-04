import { cargarDatos, esperar, guardarDatos, siguienteId } from "./almacen.js";
import { ErrorNoEncontrado } from "./errores.js";
import { exigirAdmin } from "./permisos.js";
import { validarTag } from "./validaciones.js";

const contarProductos = (tag, datos) =>
  datos.productos.filter((producto) => producto.tag_ids.includes(tag.id)).length;

export async function obtenerTags() {
  await esperar();
  const datos = await cargarDatos();
  return datos.tags.map((tag) => ({ ...tag, cantidadProductos: contarProductos(tag, datos) }));
}

export async function crearTag(entrada) {
  exigirAdmin();
  await esperar();
  const datos = await cargarDatos();
  const nuevo = { id: siguienteId(datos.tags), ...validarTag(entrada, datos) };
  guardarDatos({ ...datos, tags: [...datos.tags, nuevo] });
  return nuevo;
}

export async function actualizarTag(id, entrada) {
  exigirAdmin();
  await esperar();
  const datos = await cargarDatos();
  if (!datos.tags.some((tag) => tag.id === id)) throw new ErrorNoEncontrado("El tag ya no existe.");
  const actualizado = { id, ...validarTag(entrada, datos, id) };
  guardarDatos({ ...datos, tags: datos.tags.map((tag) => (tag.id === id ? actualizado : tag)) });
  return actualizado;
}

export async function eliminarTag(id) {
  exigirAdmin();
  await esperar();
  const datos = await cargarDatos();
  const tag = datos.tags.find((item) => item.id === id);
  if (!tag) throw new ErrorNoEncontrado("El tag ya no existe.");

  const productosAfectados = contarProductos(tag, datos);
  guardarDatos({
    ...datos,
    tags: datos.tags.filter((item) => item.id !== id),
    productos: datos.productos.map((producto) => ({
      ...producto,
      tag_ids: producto.tag_ids.filter((tagId) => tagId !== id),
    })),
  });
  return { productosAfectados };
}
