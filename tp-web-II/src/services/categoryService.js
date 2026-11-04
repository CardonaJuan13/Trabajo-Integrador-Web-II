import { peticion } from "./apiClient.js";
import { ErrorDependencia, ErrorNoEncontrado } from "./errores.js";
import { exigirAdmin } from "./permisos.js";
import { validarCategoria } from "./validaciones.js";

const LIMITE = 1000;

const listarCategorias = () => peticion(`/categories/?limit=${LIMITE}`);
const listarProductos = () => peticion(`/products/?limit=${LIMITE}`);

const contarProductos = (categoria, productos) =>
  productos.filter((producto) => producto.category_id === categoria.id).length;

export async function obtenerCategorias() {
  const [categorias, productos] = await Promise.all([listarCategorias(), listarProductos()]);
  return categorias.map((categoria) => ({
    ...categoria,
    cantidadProductos: contarProductos(categoria, productos),
  }));
}

async function subirImagen(id, archivo) {
  if (!archivo) return null;
  const formulario = new FormData();
  formulario.append("file", archivo);
  return peticion(`/categories/${id}/picture`, { metodo: "POST", cuerpo: formulario });
}

export async function crearCategoria(entrada) {
  exigirAdmin();
  const valores = validarCategoria(entrada, { categorias: await listarCategorias() });
  const nueva = await peticion("/categories/", { metodo: "POST", cuerpo: valores });
  return (await subirImagen(nueva.id, entrada.imagen)) ?? nueva;
}

export async function actualizarCategoria(id, entrada) {
  exigirAdmin();
  const valores = validarCategoria(entrada, { categorias: await listarCategorias() }, id);
  const actualizada = await peticion(`/categories/${id}`, { metodo: "PUT", cuerpo: valores });
  return (await subirImagen(id, entrada.imagen)) ?? actualizada;
}

export async function eliminarCategoria(id) {
  exigirAdmin();
  const [categorias, productos] = await Promise.all([listarCategorias(), listarProductos()]);
  const categoria = categorias.find((item) => item.id === id);
  if (!categoria) throw new ErrorNoEncontrado("La categoría ya no existe.");

  const cantidad = contarProductos(categoria, productos);
  if (cantidad > 0) {
    throw new ErrorDependencia(
      `No se puede eliminar «${categoria.title}»: tiene ${cantidad} ${
        cantidad === 1 ? "producto asociado" : "productos asociados"
      }. Reasignalos a otra categoría o eliminalos primero.`
    );
  }
  await peticion(`/categories/${id}`, { metodo: "DELETE" });
}
