# CleanStore Demo (Descartables + Limpieza)

Sitio demo estático listo para Netlify (sin npm).

## Deploy en Netlify
- Build command: (vacío)
- Publish directory: `.`

## Datos
- Catálogo: `data/products.json`
- Config (marca/whatsapp/envíos): está en el front como fallback y se puede leer desde `/.netlify/functions/api?kind=settings`.

## Admin
Abrí `/admin.html` para editar productos/config y exportar/importar JSON.

> Nota: en modo demo, el endpoint `POST` de la function no persiste (Netlify Functions son stateless). El admin sirve para generar el JSON final y reemplazar `data/products.json`.
