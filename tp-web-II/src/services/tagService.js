import { peticion } from "./apiClient.js";
import { exigirAdmin } from "./permisos.js";
import { validarTag } from "./validaciones.js";

const LIMITE = 1000;

const listarTags = () => peticion(`/tags/?limit=${LIMITE}`);
const listarProductos = () => peticion(`/products/?limit=${LIMITE}`);

const contarProductos = (tag, productos) =>
  productos.filter((producto) => (producto.tags ?? []).some((item) => item.id === tag.id)).length;

export async function obtenerTags() {
  const [tags, productos] = await Promise.all([listarTags(), listarProductos()]);
  return tags.map((tag) => ({ ...tag, cantidadProductos: contarProductos(tag, productos) }));
}

export async function crearTag(entrada) {
  exigirAdmin();
  const valores = validarTag(entrada, { tags: await listarTags() });
  return peticion("/tags/", { metodo: "POST", cuerpo: valores });
}

export async function actualizarTag(id, entrada) {
  exigirAdmin();
  const valores = validarTag(entrada, { tags: await listarTags() }, id);
  return peticion(`/tags/${id}`, { metodo: "PUT", cuerpo: valores });
}

export async function eliminarTag(id) {
  exigirAdmin();
  const productos = await listarProductos();
  const productosAfectados = contarProductos({ id }, productos);
  await peticion(`/tags/${id}`, { metodo: "DELETE" });
  return { productosAfectados };
}
