---
description: Se aplica al modificar el markup del portal (las 3 module-card en index.html), la topbar del iframe (#view-module) o el spinner (#module-loading) — todo elemento interactivo nuevo debe usar addEventListener, nunca onclick inline.
when_to_use: ["agregar una tarjeta al portal", "cambiar el spinner de carga", "modificar la topbar del iframe", "nuevo botón en el portal", "cambiar colores o animaciones"]
paths: index.html, styles.css, app.js
---

## Descripción

La UI de Portal-Goyavier es deliberadamente mínima: sin componentes, sin tablas, sin filtros, sin formularios de datos. Solo 3 piezas: (1) un menú de 3 tarjetas (`index.html:27-58`), (2) una vista de módulo a pantalla completa (`#view-module`, con topbar y `<iframe>`), y (3) un spinner de carga (`#module-loading`). Font Awesome 6.5.0 vía CDN da los íconos; el CSS usa variables custom en `:root` (`--blue`, `--blue-dark`, `--blue-deep`, `--blue-mid`, `--blue-light`) y dos animaciones (`fadeUp`, `spin`).

## Objetivo

Que cualquier elemento de UI nuevo (ej. una 4ª tarjeta de módulo) siga el mismo patrón de markup, estilo y conexión de eventos que ya existe, sin introducir un componente/librería nueva ni handlers inline.

## Cuándo debe utilizarse

- Se agrega una tarjeta de módulo nueva (4º sistema) al portal.
- Se modifica la topbar (`module-topbar`), el botón de volver (`back-btn`) o el de nueva pestaña (`newtab-btn`).
- Se ajusta el spinner de carga (`module-loading`, `loading-ring`) o sus estados (`hidden`).
- Se cambia la paleta de colores o las animaciones existentes.

## Instrucciones detalladas

Patrón de una tarjeta (`index.html:27-36`, repetido igual para las 3 existentes):

```html
<button class="module-card" id="btn-<nombre>">
  <div class="module-card-icon icon-<nombre>" aria-hidden="true">
    <i class="fa fa-<icono-fontawesome>"></i>
  </div>
  <div class="module-card-body">
    <div class="module-card-title">Título</div>
    <div class="module-card-desc">Descripción corta</div>
  </div>
  <i class="fa fa-arrow-right module-card-arrow" aria-hidden="true"></i>
</button>
```

Una tarjeta nueva sigue exactamente esta estructura de 3 `div`/`i` internos y se conecta en `app.js` dentro del bloque `DOMContentLoaded` con `document.getElementById('btn-<nombre>').addEventListener('click', function () { enterModule('Nombre', 'https://dominio/'); });` (o `window.open(...)` si se abre en pestaña nueva, como Phidias).

La vista `#view-module` (`index.html:71-88`) tiene: `module-topbar` (con `back-btn`, `topbar-title` mostrando el nombre del módulo activo vía `module-label`, y `newtab-btn`), `module-loading` (visible mientras el iframe carga, oculto por `onFrameLoad()` al disparar el evento `load` del iframe), y el `<iframe id="module-frame">`. El toggle entre vistas usa la clase `.hidden` (`display: none !important`) sobre `#view-portal` y `#view-module` — no se crean ni destruyen elementos del DOM, solo se ocultan/muestran.

Colores: usar las variables de `:root` en `styles.css:1-8` (`--blue`, `--blue-dark`, `--blue-deep`, `--blue-mid`, `--blue-light`) en vez de hardcodear hex nuevos, salvo que se pida explícitamente un color fuera de la paleta institucional.

## Reglas obligatorias

- Todo elemento interactivo nuevo se conecta con `addEventListener`, nunca `onclick`/`onchange` inline (ver también `architecture-guardian` — esto es requisito de la CSP en `.htaccess`).
- Las transiciones de vista usan la clase `.hidden`, no `display:none` inline ni frameworks de routing.
- Los íconos nuevos deben venir de Font Awesome 6.5.0 (ya cargado vía CDN en `index.html:9`) — no agregar otra librería de íconos.
- Mantener accesibilidad existente: `aria-label`, `aria-hidden="true"` en íconos decorativos, `role="main"`/`role="status"` como ya están usados.

## Criterios de validación

- Una tarjeta nueva tiene la misma estructura DOM (icon/body/arrow) que las 3 existentes.
- El nuevo botón tiene un listener registrado, no un atributo `onclick`.
- No se introdujo ningún framework de UI (React, Vue, etc.) ni build tool — el proyecto sigue siendo HTML/CSS/JS plano.
- El spinner y la topbar siguen comportándose igual: `module-loading` se oculta solo cuando el iframe dispara `load`.

## Checklist final

- [ ] Markup de la tarjeta nueva sigue el patrón de las 3 existentes (icon/body/arrow).
- [ ] Conexión vía `addEventListener` en `app.js`, sin `onclick` inline.
- [ ] Ícono tomado de Font Awesome 6.5.0 (ya cargado por CDN).
- [ ] Colores tomados de las variables `:root` existentes cuando sea posible.
- [ ] Atributos de accesibilidad (`aria-*`, `role`) preservados o replicados.
