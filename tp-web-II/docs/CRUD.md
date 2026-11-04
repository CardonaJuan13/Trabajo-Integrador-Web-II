# Panel de administración (CRUD) — documentación

## Origen de los datos

- **Todos los datos se traen de la API de la materia** (`https://ecommerce.fedegonzalez.com`). **No se usa ningún archivo JSON local**: el antiguo `src/data/api-fake.json` y la copia en `localStorage` se eliminaron.
- El panel lee y escribe con los endpoints de la API, siempre con el encabezado `Authorization: Bearer <token>`:

| Módulo | Leer | Crear | Editar | Eliminar | Imagen |
|---|---|---|---|---|---|
| Productos | `GET /products/` | `POST /products/` | `PUT /products/{id}` | `DELETE /products/{id}` | `POST /products/{id}/pictures` |
| Categorías | `GET /categories/` | `POST /categories/` | `PUT /categories/{id}` | `DELETE /categories/{id}` | `POST /categories/{id}/picture` |
| Tags | `GET /tags/` | `POST /tags/` | `PUT /tags/{id}` | `DELETE /tags/{id}` | — |

- **Los cambios hechos en el panel son reales**: quedan guardados en la API (en los datos del token configurado) y se ven en el catálogo (Inicio, Productos y Detalle), en cualquier navegador.
- La API guarda los datos **por token**: cada token tiene su propio catálogo.
- `localStorage` solo se usa para la sesión simulada (`sesionLS`) y el carrito (`carritoMuebles`).
- El token se toma de `src/api.js` (por defecto) o de la variable `VITE_API_TOKEN` en un archivo `.env`.

## Seguridad simulada

Esta aplicación **no tiene seguridad real**; todo es una simulación para la práctica:

- Las cuentas demo y sus contraseñas están escritas en el código (`context/AuthContext.jsx`) y viajan al navegador.
- La sesión vive en `localStorage` y se puede alterar desde las herramientas del navegador.
- `ProtectedRoute` y `AdminRoute` ocultan pantallas, pero no son autorización real.
- Antes de cada operación del panel, la capa de servicio vuelve a validar el rol (`services/permisos.js`). Eso evita que una pantalla mal protegida permita escribir, pero **tampoco reemplaza al servidor**: sin backend, cualquiera puede modificar la sesión.
- Como el panel escribe en la API real, **cualquiera que tenga el token puede crear, editar o borrar datos** aunque no tenga el rol de administrador en la aplicación.
- El token de la API que usan el catálogo y el panel está en el código del front (`src/api.js`), por lo que no es secreto. En un sistema real, la identidad, el rol y cualquier token de acceso los maneja un backend.

## Cuentas demo y permisos

| Cuenta | Contraseña | Rol |
|---|---|---|
| `admin` | `1234` | Administrador |
| `usuario` | `1234` | Cliente |

| Acción | Visitante | Cliente | Admin |
|---|---|---|---|
| Ver catálogo y detalle | Sí | Sí | Sí |
| Buscar, filtrar y ordenar | Sí | Sí | Sí |
| Agregar al carrito / comprar / entrar al carrito | Pide iniciar sesión y muestra el aviso «Es necesario iniciar sesión para comprar productos» | Sí | Sí |
| CRUD de productos, categorías y tags | No (va a `/login`) | No (va a `/403`) | Sí |

## Organización del código

| Archivo | Responsabilidad |
|---|---|
| `services/apiClient.js` | `peticion()`: `fetch` autenticado a la API (GET, POST, PUT, DELETE y subida de archivos) con control de red, de `response.ok`, del formato de la respuesta y de los errores de validación (422) |
| `services/permisos.js` | `exigirAdmin()`: valida el rol antes de cada escritura |
| `services/validaciones.js` | Reglas de los formularios de productos, categorías y tags |
| `services/productService.js`, `categoryService.js`, `tagService.js` | Lectura y CRUD de cada módulo contra la API |
| `services/errores.js` | Errores propios: red, HTTP, permisos, no encontrado, dependencia y validación |
| `pages/Admin.jsx` | Panel con pestañas por ruta (`/admin/productos`, `/admin/categorias`, `/admin/tags`) |
| `pages/admin/Admin*.jsx` | Tabla y formulario de cada módulo |
| `components/admin/*` | Aviso, campo de formulario, diálogo de confirmación y hooks de carga |
| `api.js` | URL de la API, token, lecturas del catálogo y `urlImagen`. La capa de servicios del panel toma de acá la URL y el token |

## Modelo de datos y referencias

- La API devuelve el producto como `{ id, title, description, price, category_id, pictures, category, tags }`, con la categoría y los tags ya resueltos. El panel agrega `tag_ids` (a partir de `tags`) para el formulario.
- Al crear o editar un producto se envían `{ title, description, price, category_id, tag_ids }`; las categorías, `{ title, description }`; los tags, `{ title }`.
- Las imágenes **no se envían como dirección**: la API solo acepta archivos, que se suben en un segundo pedido después de guardar.
- Cada producto referencia **una categoría** y **cero o más tags**.

### Qué pasa al editar y eliminar (dependencias)

| Acción en el panel | Resultado |
|---|---|
| Editar el título de una categoría | Todos sus productos muestran el nombre nuevo, porque la referencia es por `category_id` |
| Cambiar la categoría o los tags de un producto | Se actualizan en las tablas del panel |
| Eliminar un producto | Se elimina de la API y deja de verse en el catálogo. Los artículos que un cliente ya tenía en su carrito son una copia y se conservan |
| Eliminar una categoría **sin** productos | Se elimina |
| Eliminar una categoría **con** productos | **Se bloquea** (antes de llamar a la API) con un mensaje que indica cuántos productos tiene. Hay que reasignarlos o eliminarlos primero |
| Eliminar un tag | Se quita de todos los productos que lo tenían y el aviso indica cuántos fueron |
| Editar o eliminar algo que ya no existe | La API responde 404 y se muestra su mensaje (por ejemplo, «Producto no encontrado») |

## Validaciones de los formularios

| Campo | Regla |
|---|---|
| Producto: título | Obligatorio, de 3 a 80 caracteres |
| Producto: descripción | Obligatoria, de 10 a 600 caracteres |
| Producto: precio | Número mayor a 0 |
| Producto: categoría | Obligatoria, debe existir |
| Producto: tags | Deben existir |
| Imagen (producto y categoría) | Opcional; archivo de imagen de hasta 5 MB. Se sube a la API después de guardar el resto de los datos |
| Categoría: título | Obligatorio, de 2 a 40 caracteres, sin repetir |
| Categoría: descripción | Obligatoria, de 5 a 200 caracteres |
| Tag: título | Obligatorio, de 2 a 30 caracteres, sin repetir |

Las validaciones se hacen en el navegador antes de llamar a la API. Si igual la API rechaza los datos (error 422), sus mensajes se muestran en el campo correspondiente.

Los botones de guardar y borrar se deshabilitan mientras la operación está en curso (evita solicitudes duplicadas), y las pantallas no actualizan su estado si se desmontaron antes de que termine la operación.

## Errores comprensibles en el panel

| Situación | Mensaje que ve el usuario |
|---|---|
| No hay conexión o el pedido falla | No se pudo conectar. Revisá tu conexión e intentá de nuevo. |
| 401 | Tenés que iniciar sesión para continuar. |
| 403 | No tenés permisos para acceder a este recurso. |
| 404 | El mensaje de la API o, si no trae, «No se encontró el recurso solicitado.» |
| 422 (datos inválidos) | Mensaje de la API en el campo del formulario |
| Otro código | El mensaje de la API o, si no trae, «Error del servidor (código N).» |
| Respuesta que no es JSON | La respuesta del servidor no tiene un formato válido. |

En el catálogo, si la API responde con error, la pantalla muestra "Error de la API" seguido del código; si no hay conexión, muestra el motivo que informa el navegador.

### Cómo probar que falla el fetch del panel

1. Con la sesión de admin iniciada, abrir las herramientas del navegador (F12).
2. En la pestaña Network, bloquear la URL `ecommerce.fedegonzalez.com` (o activar "Offline").
3. Recargar el panel: muestra el mensaje de error con un botón "Reintentar".

## Tabla de pruebas del panel

Las pruebas se ejecutaron con un navegador automatizado (Playwright) sobre la **versión anterior del panel**, que trabajaba con una copia local de los datos. Al pasar el panel a la API se quitaron los casos que ya no aplican (restablecer datos, imagen por dirección y conservar cambios locales al recargar). **Hay que volver a ejecutar estas pruebas contra la API**: los números de filas y los ids dependen de los datos cargados en el token. Las pruebas del catálogo, el login y el carrito están en el [README](../../README.md#pruebas-realizadas).

| N.º | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| 1 | Visitante intenta entrar a /admin | redirige a /login | /login | Correcto |
| 2 | Visitante intenta entrar a /admin/productos | redirige a /login | /login | Correcto |
| 3 | Cliente intenta entrar a /admin/productos | redirige a /403 | /403 | Correcto |
| 4 | Cliente intenta entrar a /admin/tags | redirige a /403 | /403 | Correcto |
| 5 | Administrador entra a /admin | redirige a /admin/productos | /admin/productos | Correcto |
| 6 | Tabla de productos (datos iniciales) | 24 | 24 | Correcto |
| 7 | Guardar el formulario vacío | muestra errores y no guarda | 5 mensajes, filas=24 | Correcto |
| 8 | Precio negativo | Ingresá un precio mayor a 0. | Ingresá un precio mayor a 0. | Correcto |
| 10 | Administrador crea un producto | aviso de éxito y 25 filas | Producto «Mesa de centro Escandinava» creado correctamente. / filas=25 | Correcto |
| 11 | Fila del producto nuevo | ID 25, Living, Destacado y Oferta | 25 Mesa de centro Escandinava Living Destacado, Oferta $ 150.000 EditarEliminar | Correcto |
| 13 | Administrador edita categoría, tags y precio | Comedor, Destacado y Nuevo, $160.000 | 25 Mesa de centro Escandinava Comedor Destacado, Nuevo $ 160.000 EditarEliminar | Correcto |
| 14 | Cancelar la confirmación de borrado | 25 | 25 | Correcto |
| 15 | Administrador elimina un producto | 24 filas y aviso | filas=24 / Producto «Mesa de centro Escandinava» eliminado. | Correcto |
| 16 | Tabla de categorías | 4 | 4 | Correcto |
| 17 | Eliminar una categoría con productos asociados | se bloquea y explica por qué (6 productos) | No se puede eliminar «Living»: tiene 6 productos asociados. Reasignalos a otra categoría o eliminal… | Correcto |
| 18 | Categoría con nombre repetido | Ya existe una categoría con ese nombre. | Ya existe una categoría con ese nombre. | Correcto |
| 19 | Administrador crea una categoría | 5 | 5 | Correcto |
| 20 | Administrador edita una categoría | True | True | Correcto |
| 21 | Eliminar una categoría sin productos | 4 | 4 | Correcto |
| 22 | Renombrar una categoría actualiza los productos | 6 | 6 | Correcto |
| 23 | Tabla de tags | 3 | 3 | Correcto |
| 24 | Administrador crea un tag | 4 | 4 | Correcto |
| 25 | Eliminar un tag asignado a productos | se quita de los productos (8) | Tag «Oferta» eliminado. Se quitó de 8 producto(s). | Correcto |
| 26 | Ningún producto conserva el tag eliminado | 0 | 0 | Correcto |
| 27 | Sesión alterada (rol cliente) intenta borrar | el servicio rechaza la operación y no borra | Solo el administrador puede realizar esta operación. / filas=24 | Correcto |
| 28 | Sin sesión intenta borrar | el servicio pide iniciar sesión | Tenés que iniciar sesión para realizar esta acción. | Correcto |
| 30 | Falla de red al pedir los datos del panel | mensaje comprensible (No se pudo conectar) | No se pudo conectar. Revisá tu conexión e intentá de nuevo. | Correcto |
| 31 | El servidor responde 404 (panel) | mensaje comprensible (No se encontró el recurso solicitado.) | No se encontró el recurso solicitado. | Correcto |
| 32 | El servidor responde 500 (panel) | mensaje comprensible (Error del servidor (código 500).) | Error del servidor (código 500). | Correcto |
| 33 | Respuesta con formato inválido (panel) | mensaje comprensible (no tiene un formato válido) | La respuesta del servidor no tiene un formato válido. | Correcto |
| 34 | Errores de JavaScript durante estas pruebas | 0 | 0 | Correcto |
