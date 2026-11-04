import { ErrorValidacion } from "./errores.js";

const esDireccionImagen = (valor) => /^(https?:\/\/|data:image\/|\/)\S+$/i.test(valor);
const normalizar = (texto) => String(texto ?? "").trim().toLowerCase();

function textoObligatorio(valor, { minimo, maximo }) {
  const texto = String(valor ?? "").trim();
  if (!texto) return { error: "Este campo es obligatorio." };
  if (texto.length < minimo) return { error: `Escribí al menos ${minimo} caracteres.` };
  if (texto.length > maximo) return { error: `No puede superar los ${maximo} caracteres.` };
  return { valor: texto };
}

function revisarImagenes(lista, campos) {
  const imagenes = (lista ?? []).map((item) => String(item ?? "").trim()).filter(Boolean);
  if (imagenes.some((imagen) => !esDireccionImagen(imagen))) {
    campos.pictures = "Ingresá una dirección válida (que empiece con http://, https:// o /).";
  }
  return imagenes;
}

function resolver(campos, valores) {
  if (Object.keys(campos).length > 0) throw new ErrorValidacion(campos);
  return valores;
}

export function validarProducto(entrada, datos) {
  const campos = {};

  const titulo = textoObligatorio(entrada.title, { minimo: 3, maximo: 80 });
  if (titulo.error) campos.title = titulo.error;

  const descripcion = textoObligatorio(entrada.description, { minimo: 10, maximo: 600 });
  if (descripcion.error) campos.description = descripcion.error;

  const precio = Number(entrada.price);
  if (!Number.isFinite(precio) || precio <= 0) campos.price = "Ingresá un precio mayor a 0.";

  const categoriaId = Number(entrada.category_id);
  if (!entrada.category_id || !datos.categorias.some((categoria) => categoria.id === categoriaId)) {
    campos.category_id = "Elegí una categoría existente.";
  }

  const tagIds = [...new Set((entrada.tag_ids ?? []).map(Number))];
  if (tagIds.some((id) => !datos.tags.some((tag) => tag.id === id))) {
    campos.tag_ids = "Alguno de los tags elegidos ya no existe.";
  }

  const pictures = revisarImagenes(entrada.pictures, campos);

  return resolver(campos, {
    title: titulo.valor,
    description: descripcion.valor,
    price: Math.round(precio * 100) / 100,
    category_id: categoriaId,
    tag_ids: tagIds,
    pictures,
  });
}

export function validarCategoria(entrada, datos, idActual = null) {
  const campos = {};

  const titulo = textoObligatorio(entrada.title, { minimo: 2, maximo: 40 });
  if (titulo.error) campos.title = titulo.error;
  else if (
    datos.categorias.some(
      (categoria) => categoria.id !== idActual && normalizar(categoria.title) === normalizar(titulo.valor)
    )
  ) {
    campos.title = "Ya existe una categoría con ese nombre.";
  }

  const descripcion = textoObligatorio(entrada.description, { minimo: 5, maximo: 200 });
  if (descripcion.error) campos.description = descripcion.error;

  const [picture = null] = revisarImagenes(entrada.picture ? [entrada.picture] : [], campos);
  if (campos.pictures) {
    campos.picture = campos.pictures;
    delete campos.pictures;
  }

  return resolver(campos, { title: titulo.valor, description: descripcion.valor, picture });
}

export function validarTag(entrada, datos, idActual = null) {
  const campos = {};

  const titulo = textoObligatorio(entrada.title, { minimo: 2, maximo: 30 });
  if (titulo.error) campos.title = titulo.error;
  else if (
    datos.tags.some((tag) => tag.id !== idActual && normalizar(tag.title) === normalizar(titulo.valor))
  ) {
    campos.title = "Ya existe un tag con ese nombre.";
  }

  return resolver(campos, { title: titulo.valor });
}
