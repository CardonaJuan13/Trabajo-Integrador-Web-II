import { useState } from "react";
import { actualizarTag, crearTag, eliminarTag, obtenerTags } from "../../services/tagService.js";
import { ErrorValidacion } from "../../services/errores.js";
import Aviso from "../../components/admin/Aviso.jsx";
import Campo from "../../components/admin/Campo.jsx";
import DialogoConfirmacion from "../../components/admin/DialogoConfirmacion.jsx";
import { useCarga } from "../../components/admin/useCarga.js";
import { useMontado } from "../../components/admin/useMontado.js";

const estiloEntrada = (error) =>
  `w-full rounded-lg border bg-white px-3 py-2 font-normal text-beige-900 ${
    error ? "border-red-500" : "border-beige-300"
  }`;

export default function AdminTags() {
  const montado = useMontado();
  const { datos: tags, cargando, error, recargar } = useCarga(obtenerTags);

  const [editando, setEditando] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [porBorrar, setPorBorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);

  function abrirNuevo() {
    setEditando("nuevo");
    setTitulo("");
    setErrores({});
    setAviso(null);
  }

  function abrirEdicion(tag) {
    setEditando(tag);
    setTitulo(tag.title);
    setErrores({});
    setAviso(null);
  }

  function cerrarFormulario() {
    setEditando(null);
    setErrores({});
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setErrores({});
    try {
      const esNuevo = editando === "nuevo";
      const guardado = esNuevo
        ? await crearTag({ title: titulo })
        : await actualizarTag(editando.id, { title: titulo });
      if (!montado.current) return;
      setAviso({
        tipo: "exito",
        texto: `Tag «${guardado.title}» ${esNuevo ? "creado" : "actualizado"} correctamente.`,
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
      const { productosAfectados } = await eliminarTag(porBorrar.id);
      if (!montado.current) return;
      setAviso({
        tipo: "exito",
        texto: `Tag «${porBorrar.title}» eliminado. Se quitó de ${productosAfectados} producto(s).`,
      });
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

  if (cargando) return <p className="py-10 text-center text-beige-700">Cargando tags…</p>;
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
        <h2 className="text-xl font-bold text-beige-800">Tags ({tags.length})</h2>
        {!editando && (
          <button
            onClick={abrirNuevo}
            className="rounded-lg bg-beige-600 px-4 py-2 text-sm font-semibold text-white hover:bg-beige-700"
          >
            Nuevo tag
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
            {editando === "nuevo" ? "Nuevo tag" : `Editar tag #${editando.id}`}
          </h3>
          <div className="mt-4 max-w-md">
            <Campo etiqueta="Título" error={errores.title}>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className={estiloEntrada(errores.title)}
              />
            </Campo>
          </div>
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

      {tags.length === 0 ? (
        <p className="py-10 text-center text-beige-700">No hay tags cargados.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-beige-300 bg-beige-50">
          <table className="w-full text-left text-sm text-beige-900">
            <thead className="border-b border-beige-300 bg-beige-200 text-beige-800">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Tag</th>
                <th className="px-3 py-2">Productos</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-beige-200 last:border-0">
                  <td className="px-3 py-2">{tag.id}</td>
                  <td className="px-3 py-2 font-semibold">{tag.title}</td>
                  <td className="px-3 py-2">{tag.cantidadProductos}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <button
                      onClick={() => abrirEdicion(tag)}
                      aria-label={`Editar ${tag.title}`}
                      className="mr-2 rounded-lg border border-beige-300 px-3 py-1 font-semibold text-beige-800 hover:bg-beige-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setPorBorrar(tag)}
                      aria-label={`Eliminar ${tag.title}`}
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
          titulo="Eliminar tag"
          mensaje={`¿Seguro que querés eliminar «${porBorrar.title}»? Se quitará de ${porBorrar.cantidadProductos} producto(s). Esta acción no se puede deshacer.`}
          ocupado={borrando}
          onConfirmar={confirmarBorrado}
          onCancelar={() => setPorBorrar(null)}
        />
      )}
    </section>
  );
}
