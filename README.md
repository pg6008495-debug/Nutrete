# Nutrete — sitio web

Sitio estático (HTML + CSS + JS, sin dependencias ni build). Se sube tal cual a
cualquier hosting: Netlify, Vercel, GitHub Pages, Hostinger, cPanel.

## Ver el sitio en local

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1
```

Después abrir http://localhost:8080

> Se necesita un servidor (no alcanza con abrir `index.html` a mano) porque las
> rutas de imágenes son relativas y el navegador bloquea parte del CSS en `file://`.

## Estructura

```
index.html              todo el contenido y los textos
assets/css/style.css    diseño completo, paleta y fondo cinematográfico
assets/js/main.js       secuencia del hero, menú semanal, formulario
assets/img/             fotos recortadas del catálogo + logo en SVG
serve.ps1               servidor local de desarrollo
```

## Editar sin ayuda de Claude

👉 Leé **`EDITAR-CONTENIDO.md`** — es una guía paso a paso para cambiar el menú y el teléfono vos solo.

Resumen rápido: todo está en `assets/js/contenido.js`, editable con Notepad.

## Dónde tocar cada cosa

| Qué | Dónde |
|---|---|
| **Menú semanal** (cada semana) | **`assets/js/contenido.js`** ← toca solo este |
| **Teléfono de WhatsApp** | **`assets/js/contenido.js`** ← toca solo este |
| Textos de las secciones | `index.html` (necesita Claude) |
| Colores de marca | `assets/css/style.css` (necesita Claude) |
| Fotos del hero | `assets/css/style.css` (necesita Claude) |

## Pendientes antes de publicar

- [ ] Confirmar los datos operativos: mínimo de viandas, horario de cierre de
      pedidos, zona de entrega, plazo de respuesta. Hoy están como supuestos.
- [ ] Definir si se muestran precios (ahora no hay ninguno en el sitio).
- [ ] Reemplazar las fotos por los originales de la cámara. Las actuales salen de
      capturas de pantalla de 576 px de ancho: se recortaron y afinaron, pero en
      pantallas grandes se notan blandas.
- [ ] Revisar los platos del menú semanal — son un ejemplo, no la carta real.
- [ ] Comprar el dominio y conectar el hosting.
