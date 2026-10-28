export const URL_API = "https://ecommerce.fedegonzalez.com";
const TOKEN = import.meta.env.VITE_API_TOKEN ?? "01020304";
if (!TOKEN) console.error("Falta configurar VITE_API_TOKEN");

export async function obtenerJSON(ruta) {
  const respuesta = await fetch(`${URL_API}${ruta}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!respuesta.ok) throw new Error(`Error de la API ${respuesta.status}`);
  return respuesta.json();
}

export const obtenerProductos = () => obtenerJSON("/products/");
export const obtenerCategorias = () => obtenerJSON("/categories/");
export const obtenerTags = () => obtenerJSON("/tags/");

export function urlImagen(url) {
  if (!url) return "vite.svg";
  if (/^https?:/i.test(url)) return url;
  return `${URL_API}${url.startsWith("/") ? "" : "/"}${url}`;
}
