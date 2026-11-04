import { cargarDatos, esperar, guardarDatos, siguienteId } from "./almacen.js";
import { ErrorDependencia, ErrorNoEncontrado } from "./errores.js";
import { exigirAdmin } from "./permisos.js";
import { validarCategoria } from "./validaciones.js";

const contarProductos = (categoria, datos) =>
  datos.productos.filter((producto) => producto.category_id === categoria.id).length;

export async function obtenerCategorias() {
  await esperar();
  const datos = await cargarDatos();
  return datos.categorias.map((categoria) => ({
    ...categoria,
    cantidadProductos: contarProductos(categoria, datos),
  }));
}

export async function crearCategoria(entrada) {
  exigirAdmin();
  await esperar();
  const datos = await cargarDatos();
  const nueva = { id: siguienteId(datos.categorias), ...validarCategoria(entrada, datos) };
  guardarDatos({ ...datos, categorias: [...datos.categorias, nueva] });
  return nueva;
}

export async function actualizarCategoria(id, entrada) {
  exigirAdmin();
  await esperar();
  const datos = await cargarDatos();
  if (!datos.categorias.some((categoria) => categoria.id === id)) {
    throw new ErrorNoEncontrado("La categoría ya no existe.");
  }
  const actualizada = { id, ...validarCategoria(entrada, datos, id) };
  guardarDatos({
    ...datos,
    categorias: datos.categorias.map((categoria) => (categoria.id === id ? actualizada : categoria)),
  });
  return actualizada;
}

export async function eliminarCategoria(id) {
  exigirAdmin();
  await esperar();
  const datos = await cargarDatos();
  const categoria = datos.categorias.find((item) => item.id === id);
  if (!categoria) throw new ErrorNoEncontrado("La categoría ya no existe.");

  const cantidad = contarProductos(categoria, datos);
  if (cantidad > 0) {
    throw new ErrorDependencia(
      `No se puede eliminar «${categoria.title}»: tiene ${cantidad} ${
        cantidad === 1 ? "producto asociado" : "productos asociados"
      }. Reasignalos a otra categoría o eliminalos primero.`
    );
  }
  guardarDatos({ ...datos, categorias: datos.categorias.filter((item) => item.id !== id) });
}
