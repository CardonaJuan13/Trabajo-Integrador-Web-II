# Panel de administración (CRUD) — documentación

## Origen de los datos y persistencia (Modalidad A)

- Los datos iniciales están en `src/data/api-fake.json` (24 productos, 4 categorías y 3 tags) y se leen con `fetch`.
- Crear, editar y eliminar **modifican solo el estado de la aplicación y `localStorage`**. **Los POST/PUT/DELETE no modifican el archivo JSON ni ningún servidor.** Cada navegador tiene su propia copia de los datos.
- Claves de `localStorage`: `datosTienda` (catálogo), `sesionLS` (sesión simulada) y `carritoMuebles` (carrito).
- El botón **"Restablecer datos de demostración"** del panel descarta los cambios y vuelve a leer `api-fake.json`.
- La aplicación no usa ningún token ni llama a la API real.

## Seguridad simulada

Esta aplicación **no tiene seguridad real**; todo es una simulación para la práctica:

- Las cuentas demo y sus contraseñas están escritas en el código (`context/AuthContext.jsx`) y viajan al navegador.
- La sesión vive en `localStorage` y se puede alterar desde las herramientas del navegador.
- `ProtectedRoute` y `AdminRoute` ocultan pantallas, pero no son autorización real.
- Antes de cada operación de administración, la capa de servicio vuelve a validar el rol (`services/permisos.js`). Eso evita que una pantalla mal protegida permita escribir, pero **tampoco reemplaza al servidor**: sin backend, cualquiera puede modificar la sesión.
- En un sistema real, la identidad y el rol los valida un backend, que además guarda cualquier token de acceso en el servidor.

## Cuentas demo y permisos

| Cuenta | Contraseña | Rol |
|---|---|---|
| `admin` | `1234` | Administrador |
| `usuario` | `1234` | Cliente |

| Acción | Visitante | Cliente | Admin |
|---|---|---|---|
| Ver catálogo y detalle | Sí | Sí | Sí |
| Buscar, filtrar y ordenar | Sí | Sí | Sí |
| Agregar al carrito / comprar | Pide iniciar sesión | Sí | Sí |
| CRUD de productos, categorías y tags | No (va a `/login`) | No (va a `/403`) | Sí |

## Organización del código

| Archivo | Responsabilidad |
|---|---|
| `services/apiClient.js` | `fetch` del JSON con control de red, de `response.ok` y del formato de la respuesta |
| `services/almacen.js` | Carga de datos (una sola vez, aunque dos pantallas lo pidan a la vez), `localStorage`, ids nuevos y restablecimiento |
| `services/permisos.js` | `exigirAdmin()`: valida el rol antes de cada escritura |
| `services/validaciones.js` | Reglas de los formularios de productos, categorías y tags |
| `services/productService.js`, `categoryService.js`, `tagService.js` | Operaciones de lectura y CRUD de cada módulo |
| `services/errores.js` | Errores propios: red, HTTP, permisos, no encontrado, dependencia y validación |
| `pages/Admin.jsx` | Panel con pestañas por ruta (`/admin/productos`, `/admin/categorias`, `/admin/tags`) |
| `pages/admin/Admin*.jsx` | Tabla y formulario de cada módulo |
| `components/admin/*` | Aviso, campo de formulario, diálogo de confirmación y hooks de carga |
| `api.js` | Fachada que usa el catálogo (Home, Listado y Ficha) para leer los datos de los servicios |

## Modelo de datos y referencias

- Internamente el producto guarda `{ id, title, description, price, category_id, tag_ids, pictures }`; las categorías, `{ id, title, description, picture }`; los tags, `{ id, title }`.
- Al leer un producto se **resuelven las referencias**: se agregan `category` (objeto) y `tags` (lista de objetos), con la misma forma que devolvía la API. Por eso el catálogo no cambia.
- Cada producto referencia **una categoría** y **cero o más tags**.

### Qué pasa al editar y eliminar (dependencias)

| Acción | Resultado |
|---|---|
| Editar el título de una categoría | Todos sus productos muestran el nombre nuevo, porque la referencia es por `category_id` |
| Cambiar la categoría o los tags de un producto | Se actualizan en la tabla, el detalle, los filtros y la home |
| Eliminar un producto | Se elimina. Los artículos que un cliente ya tenía en su carrito son una copia (título y precio del momento) y se conservan |
| Eliminar una categoría **sin** productos | Se elimina |
| Eliminar una categoría **con** productos | **Se bloquea** con un mensaje que indica cuántos productos tiene. Hay que reasignarlos o eliminarlos primero |
| Eliminar un tag | Se quita de todos los productos que lo tenían y el aviso indica cuántos fueron |
| Editar o eliminar algo que ya no existe | Mensaje "ya no existe" (error 404 simulado) |

## Validaciones de los formularios

| Campo | Regla |
|---|---|
| Producto: título | Obligatorio, de 3 a 80 caracteres |
| Producto: descripción | Obligatoria, de 10 a 600 caracteres |
| Producto: precio | Número mayor a 0 |
| Producto: categoría | Obligatoria, debe existir |
| Producto: tags | Deben existir |
| Imagen (producto y categoría) | Opcional; si se completa, debe empezar con `http://`, `https://` o `/` |
| Categoría: título | Obligatorio, de 2 a 40 caracteres, sin repetir |
| Categoría: descripción | Obligatoria, de 5 a 200 caracteres |
| Tag: título | Obligatorio, de 2 a 30 caracteres, sin repetir |

Los botones de guardar y borrar se deshabilitan mientras la operación está en curso (evita solicitudes duplicadas), y las pantallas no actualizan su estado si se desmontaron antes de que termine la operación.

## Errores comprensibles

| Situación | Mensaje que ve el usuario |
|---|---|
| No hay conexión o el pedido falla | No se pudo conectar. Revisá tu conexión e intentá de nuevo. |
| 401 | Tenés que iniciar sesión para continuar. |
| 403 | No tenés permisos para acceder a este recurso. |
| 404 | No se encontró el recurso solicitado. |
| Otro código | Error del servidor (código N). |
| Respuesta que no es JSON | La respuesta del servidor no tiene un formato válido. |

### Cómo probar que falla el fetch

1. Con la sesión de admin iniciada, abrir las herramientas del navegador (F12) → Application → Local Storage y borrar `datosTienda`.
2. En la pestaña Network, bloquear la URL `api-fake` (o activar "Offline").
3. Recargar la página: el catálogo y el panel muestran el mensaje de error.

## Tabla de pruebas

Las pruebas se ejecutaron con un navegador automatizado (Playwright) sobre la aplicación recién instalada (`npm ci`). Resultado: **44 de 44 casos correctos**. También se verificó que el lint (`npm run lint`) y la compilación (`npm run build`) pasan sin errores, y que la versión compilada carga el catálogo y el panel.

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
| 9 | Imagen con dirección inválida | mensaje de dirección inválida | mensaje visible | Correcto |
| 10 | Administrador crea un producto | aviso de éxito y 25 filas | Producto «Mesa de centro Escandinava» creado correctamente. / filas=25 | Correcto |
| 11 | Fila del producto nuevo | ID 25, Living, Destacado y Oferta | 25 Mesa de centro Escandinava Living Destacado, Oferta $ 150.000 EditarEliminar | Correcto |
| 12 | Recarga conserva el producto creado | 25 | 25 | Correcto |
| 13 | El catálogo muestra el producto nuevo | 1 | 1 | Correcto |
| 14 | Administrador edita categoría, tags y precio | Comedor, Destacado y Nuevo, $160.000 | 25 Mesa de centro Escandinava Comedor Destacado, Nuevo $ 160.000 EditarEliminar | Correcto |
| 15 | El detalle refleja los cambios | categoría Comedor, tag Nuevo, sin Oferta | ok | Correcto |
| 16 | Filtro por la categoría nueva incluye el producto | True | True | Correcto |
| 17 | Filtro por Oferta ya no incluye el producto | False | False | Correcto |
| 18 | Cancelar la confirmación de borrado | 25 | 25 | Correcto |
| 19 | Administrador elimina un producto | 24 filas y aviso | filas=24 / Producto «Mesa de centro Escandinava» eliminado. | Correcto |
| 20 | Detalle de un producto eliminado | No encontramos ese producto. | No encontramos ese producto. | Correcto |
| 21 | Tabla de categorías | 4 | 4 | Correcto |
| 22 | Eliminar una categoría con productos asociados | se bloquea y explica por qué (6 productos) | No se puede eliminar «Living»: tiene 6 productos asociados. Reasignalos a otra categoría o eliminalos primero. | Correcto |
| 23 | Categoría con nombre repetido | Ya existe una categoría con ese nombre. | Ya existe una categoría con ese nombre. | Correcto |
| 24 | Administrador crea una categoría | 5 | 5 | Correcto |
| 25 | Administrador edita una categoría | True | True | Correcto |
| 26 | Eliminar una categoría sin productos | 4 | 4 | Correcto |
| 27 | Renombrar una categoría actualiza los productos | 6 | 6 | Correcto |
| 28 | Tabla de tags | 3 | 3 | Correcto |
| 29 | Administrador crea un tag | 4 | 4 | Correcto |
| 30 | Eliminar un tag asignado a productos | se quita de los productos (8) | Tag «Oferta» eliminado. Se quitó de 8 producto(s). | Correcto |
| 31 | Ningún producto conserva el tag eliminado | 0 | 0 | Correcto |
| 32 | Home: secciones por tag después de los cambios | Destacado y Nuevo (Oferta ya no existe) | Destacado, Nuevo | Correcto |
| 33 | Sesión alterada (rol cliente) intenta borrar | el servicio rechaza la operación y no borra | Solo el administrador puede realizar esta operación. / filas=24 | Correcto |
| 34 | Sin sesión intenta borrar | el servicio pide iniciar sesión | Tenés que iniciar sesión para realizar esta acción. | Correcto |
| 35 | Restablecer datos de demostración | vuelve a 3 tags | 3 | Correcto |
| 36 | Falla de red al pedir los datos | mensaje comprensible (No se pudo conectar) | Error: No se pudo conectar. Revisá tu conexión e intentá de nuevo. | Correcto |
| 37 | El servidor responde 404 | mensaje comprensible (No se encontró el recurso solicitado.) | Error: No se encontró el recurso solicitado. | Correcto |
| 38 | El servidor responde 500 | mensaje comprensible (Error del servidor (código 500).) | Error: Error del servidor (código 500). | Correcto |
| 39 | Respuesta con formato inválido | mensaje comprensible (no tiene un formato válido) | Error: La respuesta del servidor no tiene un formato válido. | Correcto |
| 40 | Recarga conserva el carrito | Carrito (1) | Carrito (1) | Correcto |
| 41 | Orden por precio: menor a mayor | precios crecientes, primero la Silla Eames blanca | Silla Eames blanca / primeros precios [54900, 59900, 74900] | Correcto |
| 42 | Orden por precio: mayor a menor | precios decrecientes | primeros precios [749900, 559900, 459900] | Correcto |
| 43 | Orden combinado con filtro de categoría | 6 productos de Comedor, ordenados | 6 productos [54900, 74900]... | Correcto |
| 44 | Errores de JavaScript durante toda la prueba | 0 | 0 | Correcto |
