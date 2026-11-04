import { cargarDatos, esperar, guardarDatos, siguienteId } from "./almacen.js";
import { ErrorNoEncontrado } from "./errores.js";
import { exigirAdmin } from "./permisos.js";
import { validarProducto } from "./validaciones.js";

function armarProducto(producto, datos) {
  return {
    ...producto,
    category: datos.categorias.find((categoria) => categoria.id === producto.category_id) ?? null,
    tags: producto.tag_ids
      .map((id) => datos.tags.find((tag) => tag.id === id))
      .filter(Boolean),
  };
}

export async function obtenerProductos() {
  await esperar();
  const datos = await cargarDatos();
  return datos.productos.map((producto) => armarProducto(producto, datos));
}

export async function crearProducto(entrada) {
  exigirAdmin();
  await esperar();
  const datos = await cargarDatos();
  const nuevo = { id: siguienteId(datos.productos), ...validarProducto(entrada, datos) };
  guardarDatos({ ...datos, productos: [...datos.productos, nuevo] });
  return armarProducto(nuevo, datos);
}

export async function actualizarProducto(id, entrada) {
  exigirAdmin();
  await esperar();
  const datos = await cargarDatos();
  if (!datos.productos.some((producto) => producto.id === id)) {
    throw new ErrorNoEncontrado("El producto ya no existe.");
  }
  const actualizado = { id, ...validarProducto(entrada, datos) };
  guardarDatos({
    ...datos,
    productos: datos.productos.map((producto) => (producto.id === id ? actualizado : producto)),
  });
  return armarProducto(actualizado, datos);
}

export async function eliminarProducto(id) {
  exigirAdmin();
  await esperar();
  const datos = await cargarDatos();
  if (!datos.productos.some((producto) => producto.id === id)) {
    throw new ErrorNoEncontrado("El producto ya no existe.");
  }
  guardarDatos({ ...datos, productos: datos.productos.filter((producto) => producto.id !== id) });
}
