import { useState } from "react";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  obtenerProductos,
} from "../../services/productService.js";
import { obtenerCategorias } from "../../services/categoryService.js";
import { obtenerTags } from "../../services/tagService.js";
import { ErrorValidacion } from "../../services/errores.js";
import { formatearPrecio } from "../../../data/cart.js";
import { urlImagen } from "../../api.js";
import Aviso from "../../components/admin/Aviso.jsx";
import Campo from "../../components/admin/Campo.jsx";
import DialogoConfirmacion from "../../components/admin/DialogoConfirmacion.jsx";
import { useCarga } from "../../components/admin/useCarga.js";
import { useMontado } from "../../components/admin/useMontado.js";

const cargarTodo = async () => {
  const [productos, categorias, tags] = await Promise.all([
    obtenerProductos(),
    obtenerCategorias(),
    obtenerTags(),
  ]);
  return { productos, categorias, tags };
};

const FORMULARIO_VACIO = {
  title: "",
  description: "",
  price: "",
  category_id: "",
  tag_ids: [],
  imagen: "",
};

const estiloEntrada = (error) =>
  `w-full rounded-lg border bg-white px-3 py-2 font-normal text-beige-900 ${
    error ? "border-red-500" : "border-beige-300"
  }`;

export default function AdminProductos() {
  const montado = useMontado();
  const { datos, cargando, error, recargar } = useCarga(cargarTodo);

  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [porBorrar, setPorBorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);

  function abrirNuevo() {
    setEditando("nuevo");
    setFormulario(FORMULARIO_VACIO);
    setErrores({});
    setAviso(null);
  }

  function abrirEdicion(producto) {
    setEditando(producto);
    setFormulario({
      title: producto.title,
      description: producto.description,
      price: String(producto.price),
      category_id: String(producto.category_id),
      tag_ids: producto.tag_ids,
      imagen: producto.pictures?.[0] ?? "",
    });
    setErrores({});
    setAviso(null);
  }

  function cerrarFormulario() {
    setEditando(null);
    setErrores({});
  }

  const cambiar = (campo, valor) => setFormulario((actual) => ({ ...actual, [campo]: valor }));

  function alternarTag(id) {
    setFormulario((actual) => ({
      ...actual,
      tag_ids: actual.tag_ids.includes(id)
        ? actual.tag_ids.filter((tagId) => tagId !== id)
        : [...actual.tag_ids, id],
    }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setErrores({});
    const entrada = {
      title: formulario.title,
      description: formulario.description,
      price: formulario.price,
      category_id: formulario.category_id,
      tag_ids: formulario.tag_ids,
      pictures: formulario.imagen.trim() ? [formulario.imagen] : [],
    };
    try {
      const esNuevo = editando === "nuevo";
      const guardado = esNuevo
        ? await crearProducto(entrada)
        : await actualizarProducto(editando.id, entrada);
      if (!montado.current) return;
      setAviso({
        tipo: "exito",
        texto: `Producto «${guardado.title}» ${esNuevo ? "creado" : "actualizado"} correctamente.`,
      });
      cerrarFormulario();
      recargar();
    } catch (falla) {
      if (!montado.current) return;
      if (falla instanceof ErrorValidacion) setErrores(falla.campos);
      else setAviso({ tipo: "error", texto: falla.message });
    } finally {
      if (montado.current) setGuardando(false);
    }
  }

  async function confirmarBorrado() {
    setBorrando(true);
    try {
      await eliminarProducto(porBorrar.id);
      if (!montado.current) return;
      setAviso({ tipo: "exito", texto: `Producto «${porBorrar.title}» eliminado.` });
      recargar();
    } catch (falla) {
      if (montado.current) setAviso({ tipo: "error", texto: falla.message });
    } finally {
      if (montado.current) {
        setBorrando(false);
        setPorBorrar(null);
      }
    }
  }

  if (cargando) return <p className="py-10 text-center text-beige-700">Cargando productos…</p>;
  if (error)
    return (
      <Aviso tipo="error">
        {error}{" "}
        <button onClick={recargar} className="underline">
          Reintentar
        </button>
      </Aviso>
    );

  const { productos, categorias, tags } = datos;

  return (
    <section>
      {aviso && (
        <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-beige-800">Productos ({productos.length})</h2>
        {!editando && (
          <button
            onClick={abrirNuevo}
            className="rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
          >
            Nuevo producto
          </button>
        )}
      </div>

      {editando && (
        <form
          onSubmit={enviar}
          noValidate
          className="mb-6 rounded-2xl border border-beige-300 bg-beige-50 p-5"
        >
          <h3 className="text-lg font-bold text-beige-800">
            {editando === "nuevo" ? "Nuevo producto" : `Editar producto #${editando.id}`}
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Campo etiqueta="Título" error={errores.title}>
              <input
                value={formulario.title}
                onChange={(e) => cambiar("title", e.target.value)}
                className={estiloEntrada(errores.title)}
              />
            </Campo>
            <Campo etiqueta="Precio" error={errores.price}>
              <input
                type="number"
                min="0"
                step="any"
                value={formulario.price}
                onChange={(e) => cambiar("price", e.target.value)}
                className={estiloEntrada(errores.price)}
              />
            </Campo>
            <Campo etiqueta="Categoría" error={errores.category_id}>
              <select
                value={formulario.category_id}
                onChange={(e) => cambiar("category_id", e.target.value)}
                className={estiloEntrada(errores.category_id)}
              >
                <option value="">Elegí una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.title}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Imagen (dirección, opcional)" error={errores.pictures}>
              <input
                value={formulario.imagen}
                onChange={(e) => cambiar("imagen", e.target.value)}
                placeholder="https://…"
                className={estiloEntrada(errores.pictures)}
              />
            </Campo>
            <div className="md:col-span-2">
              <Campo etiqueta="Descripción" error={errores.description}>
                <textarea
                  rows={3}
                  value={formulario.description}
                  onChange={(e) => cambiar("description", e.target.value)}
                  className={estiloEntrada(errores.description)}
                />
              </Campo>
            </div>
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-semibold text-beige-800">Tags</legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {tags.length === 0 && (
                  <span className="text-sm text-beige-700">Todavía no hay tags creados.</span>
                )}
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 text-sm text-beige-800">
                    <input
                      type="checkbox"
                      checked={formulario.tag_ids.includes(tag.id)}
                      onChange={() => alternarTag(tag.id)}
                    />
                    {tag.title}
                  </label>
                ))}
              </div>
              {errores.tag_ids && (
                <span role="alert" className="text-xs text-red-600">
                  {errores.tag_ids}
                </span>
              )}
            </fieldset>
          </div>
          {Object.keys(errores).length > 0 && (
            <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
              Revisá los campos marcados en el formulario.
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700 disabled:opacity-60"
            >
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={cerrarFormulario}
              disabled={guardando}
              className="rounded-lg border border-beige-300 px-4 py-2 text-sm font-semibold text-beige-800 hover:bg-beige-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {productos.length === 0 ? (
        <p className="py-10 text-center text-beige-700">No hay productos cargados.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-beige-300 bg-beige-50">
          <table className="w-full text-left text-sm text-beige-900">
            <thead className="border-b border-beige-300 bg-beige-200 text-beige-800">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Imagen</th>
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2">Tags</th>
                <th className="px-3 py-2">Precio</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id} className="border-b border-beige-200 last:border-0">
                  <td className="px-3 py-2">{producto.id}</td>
                  <td className="px-3 py-2">
                    <img
                      src={urlImagen(producto.pictures?.[0])}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-3 py-2 font-semibold">{producto.title}</td>
                  <td className="px-3 py-2">{producto.category?.title ?? "—"}</td>
                  <td className="px-3 py-2">
                    {producto.tags.length ? producto.tags.map((tag) => tag.title).join(", ") : "—"}
                  </td>
                  <td className="px-3 py-2">{formatearPrecio(producto.price)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <button
                      onClick={() => abrirEdicion(producto)}
                      aria-label={`Editar ${producto.title}`}
                      className="mr-2 rounded-lg border border-beige-300 px-3 py-1 font-semibold text-beige-800 hover:bg-beige-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setPorBorrar(producto)}
                      aria-label={`Eliminar ${producto.title}`}
                      className="rounded-lg border border-red-300 px-3 py-1 font-semibold text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {porBorrar && (
        <DialogoConfirmacion
          titulo="Eliminar producto"
          mensaje={`¿Seguro que querés eliminar «${porBorrar.title}»? Esta acción no se puede deshacer.`}
          ocupado={borrando}
          onConfirmar={confirmarBorrado}
          onCancelar={() => setPorBorrar(null)}
        />
      )}
    </section>
  );
}
