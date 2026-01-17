# CleanStore Demo (Descartables + Limpieza)

Este ZIP es un **ejemplo listo para mostrar** al dueño del negocio.
La idea es que él te pase la data real (logo, precios, lista de productos, zonas, etc.) y después lo ajustás.

## Incluye
- **Landing (index.html)**
  - Catálogo con búsqueda, filtro por categoría y orden
  - Carrito
  - Checkout por **WhatsApp** (armado automático del mensaje)
  - Sección Mayoristas, Envíos/Pagos, Contacto
- **Panel Admin (admin.html)**
  - Edita datos del negocio (WhatsApp, dirección, horarios, etc.)
  - Edita productos (agregar / borrar / cambiar precio)
  - Botón **Guardar** (persistencia en DB vía Netlify)
  - Botón Exportar/Importar JSON (útil para pasar lista de productos)
- **Backend (Netlify Function)**
  - Endpoint `GET /api/settings` (trae config)
  - Endpoint `POST /api/settings` (guarda config)
- **SQL (db_init.sql)**
  - Tabla `settings` con un JSONB que guarda *todo* (store + products)

## Probar local (modo demo, sin DB)
Abrí `index.html` directo en el navegador.
- Si no hay DB, el sitio usa datos por defecto.
- El checkout por WhatsApp abre un link a `wa.me/...`.

## Deploy en Netlify (con DB)
1) Crear sitio en Netlify y subir este ZIP.
2) En Netlify, crear una Neon DB (o usar Postgres) y setear la variable:
   - `NETLIFY_DATABASE_URL` (Netlify Neon la completa automáticamente cuando conectás Neon)
3) Ejecutar el SQL de `db_init.sql` en la DB.
4) Abrir `/admin.html` y guardar.

## Qué le pedís al dueño (la “data”)
- Nombre del negocio + eslogan
- Número de WhatsApp (con código de país, ej: 549261...)
- Dirección + horarios
- Zonas de envío / costo
- Formas de pago
- Lista de productos: nombre, categoría, precio, unidad (pack x50, 1L, etc.)

---
Hecho para funcionar simple y rápido, con la misma lógica "landing + admin + api".
