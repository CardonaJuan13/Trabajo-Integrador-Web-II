import { useState } from "react";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  obtenerCategorias,
} from "../../services/categoryService.js";
import { ErrorValidacion } from "../../services/errores.js";
import { urlImagen } from "../../api.js";
import Aviso from "../../components/admin/Aviso.jsx";
import Campo from "../../components/admin/Campo.jsx";
import DialogoConfirmacion from "../../components/admin/DialogoConfirmacion.jsx";
import { useCarga } from "../../components/admin/useCarga.js";
import { useMontado } from "../../components/admin/useMontado.js";

const FORMULARIO_VACIO = { title: "", description: "", picture: "" };

const estiloEntrada = (error) =>
  `w-full rounded-lg border bg-white px-3 py-2 font-normal text-beige-900 ${
    error ? "border-red-500" : "border-beige-300"
  }`;

export default function AdminCategorias() {
  const montado = useMontado();
  const { datos: categorias, cargando, error, recargar } = useCarga(obtenerCategorias);

  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [porBorrar, setPorBorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);

  function abrirNueva() {
    setEditando("nueva");
    setFormulario(FORMULARIO_VACIO);
    setErrores({});
    setAviso(null);
  }

  function abrirEdicion(categoria) {
    setEditando(categoria);
    setFormulario({
      title: categoria.title,
      description: categoria.description,
      picture: categoria.picture ?? "",
    });
    setErrores({});
    setAviso(null);
  }

  function cerrarFormulario() {
    setEditando(null);
    setErrores({});
  }

  const cambiar = (campo, valor) => setFormulario((actual) => ({ ...actual, [campo]: valor }));

  async function enviar(evento) {
    evento.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setErrores({});
    try {
      const esNueva = editando === "nueva";
      const guardada = esNueva
        ? await crearCategoria(formulario)
        : await actualizarCategoria(editando.id, formulario);
      if (!montado.current) return;
      setAviso({
        tipo: "exito",
        texto: `Categoría «${guardada.title}» ${esNueva ? "creada" : "actualizada"} correctamente.`,
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
      await eliminarCategoria(porBorrar.id);
      if (!montado.current) return;
      setAviso({ tipo: "exito", texto: `Categoría «${porBorrar.title}» eliminada.` });
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

  if (cargando) return <p className="py-10 text-center text-beige-700">Cargando categorías…</p>;
  if (error)
    return (
      <Aviso tipo="error">
        {error}{" "}
        <button onClick={recargar} className="underline">
          Reintentar
        </button>
      </Aviso>
    );

  return (
    <section>
      {aviso && (
        <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-beige-800">Categorías ({categorias.length})</h2>
        {!editando && (
          <button
            onClick={abrirNueva}
            className="rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
          >
            Nueva categoría
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
            {editando === "nueva" ? "Nueva categoría" : `Editar categoría #${editando.id}`}
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Campo etiqueta="Título" error={errores.title}>
              <input
                value={formulario.title}
                onChange={(e) => cambiar("title", e.target.value)}
                className={estiloEntrada(errores.title)}
              />
            </Campo>
            <Campo etiqueta="Imagen (dirección, opcional)" error={errores.picture}>
              <input
                value={formulario.picture}
                onChange={(e) => cambiar("picture", e.target.value)}
                placeholder="https://…"
                className={estiloEntrada(errores.picture)}
              />
            </Campo>
            <div className="md:col-span-2">
              <Campo etiqueta="Descripción" error={errores.description}>
                <textarea
                  rows={2}
                  value={formulario.description}
                  onChange={(e) => cambiar("description", e.target.value)}
                  className={estiloEntrada(errores.description)}
                />
              </Campo>
            </div>
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

      {categorias.length === 0 ? (
        <p className="py-10 text-center text-beige-700">No hay categorías cargadas.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-beige-300 bg-beige-50">
          <table className="w-full text-left text-sm text-beige-900">
            <thead className="border-b border-beige-300 bg-beige-200 text-beige-800">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Imagen</th>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2">Descripción</th>
                <th className="px-3 py-2">Productos</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id} className="border-b border-beige-200 last:border-0">
                  <td className="px-3 py-2">{categoria.id}</td>
                  <td className="px-3 py-2">
                    <img
                      src={urlImagen(categoria.picture)}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-3 py-2 font-semibold">{categoria.title}</td>
                  <td className="px-3 py-2">{categoria.description}</td>
                  <td className="px-3 py-2">{categoria.cantidadProductos}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <button
                      onClick={() => abrirEdicion(categoria)}
                      aria-label={`Editar ${categoria.title}`}
                      className="mr-2 rounded-lg border border-beige-300 px-3 py-1 font-semibold text-beige-800 hover:bg-beige-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setPorBorrar(categoria)}
                      aria-label={`Eliminar ${categoria.title}`}
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
          titulo="Eliminar categoría"
          mensaje={
            porBorrar.cantidadProductos > 0
              ? `«${porBorrar.title}» tiene ${porBorrar.cantidadProductos} producto(s) asociado(s) y no se podrá eliminar mientras los tenga.`
              : `¿Seguro que querés eliminar «${porBorrar.title}»? Esta acción no se puede deshacer.`
          }
          ocupado={borrando}
          onConfirmar={confirmarBorrado}
          onCancelar={() => setPorBorrar(null)}
        />
      )}
    </section>
  );
}
