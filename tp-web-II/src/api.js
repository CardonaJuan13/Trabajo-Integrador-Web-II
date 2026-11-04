export { obtenerProductos } from "./services/productService.js";
export { obtenerCategorias } from "./services/categoryService.js";
export { obtenerTags } from "./services/tagService.js";

export function urlImagen(url) {
  return url || "/sin-imagen.svg";
}
