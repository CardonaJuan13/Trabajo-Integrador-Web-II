import { peticion } from "./apiClient.js";
import { exigirAdmin } from "./permisos.js";
import { validarProducto } from "./validaciones.js";

const LIMITE = 1000;

// La API devuelve `tags` como objetos; el panel también necesita sus ids.
const normalizarProducto = (producto) => ({
  ...producto,
  category: producto.category ?? null,
  tags: producto.tags ?? [],
  tag_ids: (producto.tags ?? []).map((tag) => tag.id),
  pictures: producto.pictures ?? [],
});

export async function obtenerProductos() {
  const productos = await peticion(`/products/?limit=${LIMITE}`);
  return productos.map(normalizarProducto);
}

async function datosParaValidar() {
  const [categorias, tags] = await Promise.all([
    peticion(`/categories/?limit=${LIMITE}`),
    peticion(`/tags/?limit=${LIMITE}`),
  ]);
  return { categorias, tags };
}

async function subirImagen(id, archivo) {
  if (!archivo) return null;
  const formulario = new FormData();
  formulario.append("files", archivo);
  return peticion(`/products/${id}/pictures`, { metodo: "POST", cuerpo: formulario });
}

async function obtenerProducto(id) {
  return normalizarProducto(await peticion(`/products/${id}`));
}

export async function crearProducto(entrada) {
  exigirAdmin();
  const valores = validarProducto(entrada, await datosParaValidar());
  const creado = await peticion("/products/", { metodo: "POST", cuerpo: valores });
  if (entrada.imagen) {
    await subirImagen(creado.id, entrada.imagen);
    return obtenerProducto(creado.id);
  }
  return normalizarProducto(creado);
}

export async function actualizarProducto(id, entrada) {
  exigirAdmin();
  const valores = validarProducto(entrada, await datosParaValidar());
  const actualizado = await peticion(`/products/${id}`, { metodo: "PUT", cuerpo: valores });
  if (entrada.imagen) {
    await subirImagen(id, entrada.imagen);
    return obtenerProducto(id);
  }
  return normalizarProducto(actualizado);
}

export async function eliminarProducto(id) {
  exigirAdmin();
  await peticion(`/products/${id}`, { metodo: "DELETE" });
}
