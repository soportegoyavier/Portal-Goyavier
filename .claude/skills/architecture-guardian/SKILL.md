---
description: Se aplica al agregar, quitar o modificar un módulo embebido del portal (Phidias, Paz y Salvo, Zaiko) — exige tocar en conjunto index.html, app.js, styles.css y .htaccess, y prohíbe handlers onclick inline por la CSP estricta.
when_to_use: ["agregar un módulo nuevo al portal", "quitar Zaiko/Paz y Salvo/Phidias", "nuevo botón module-card", "agregar dominio a _MODULOS_PERMITIDOS"]
paths: index.html, app.js, styles.css, .htaccess
---

## Descripción

Portal-Goyavier es un launcher estático de 6 archivos sin framework ni build tool. No existe un "registro de módulos" centralizado (un array único `{id, name, url, icon, mode}`) — la lista de los 3 módulos (Phidias, Paz y Salvo, Zaiko Inventario) está duplicada estructuralmente en 4 archivos distintos. Esta skill documenta ese patrón para que cualquier cambio a la lista de módulos toque los 4 archivos de forma consistente.

## Objetivo

Garantizar que agregar, quitar o modificar un módulo embebido mantenga sincronizados los 4 puntos de verdad del repo, y que ningún elemento interactivo nuevo rompa la CSP estricta usando `onclick` inline.

## Cuándo debe utilizarse

- Se pide agregar un módulo nuevo al portal (ej. un cuarto sistema).
- Se pide quitar o deshabilitar temporalmente un módulo existente (Phidias, Paz y Salvo, Zaiko).
- Se modifica el dominio/URL de un módulo existente.
- Se agrega cualquier botón o elemento clicable nuevo en `index.html`.

## Instrucciones detalladas

Al agregar/quitar un módulo, tocar EN CONJUNTO (ejemplo real: commit `df972fe`, que agregó Zaiko Inventario tocando los 4 archivos en el mismo commit):

1. `index.html` — agregar/quitar el `<button class="module-card" id="btn-...">` correspondiente (líneas 27-58 son el patrón existente: ícono, título, descripción, flecha).
2. `app.js` — agregar/quitar el dominio en el array `_MODULOS_PERMITIDOS` (línea 22) Y su bloque `addEventListener` correspondiente dentro del `DOMContentLoaded` (líneas 63-76), que llama a `enterModule(name, url)` o abre en nueva pestaña con `window.open(...)`.
3. `styles.css` — agregar/quitar la clase de ícono `.icon-<nombre>` (líneas 133-135 son el patrón: `.icon-phidias`, `.icon-pazsalvo`, `.icon-zaiko`).
4. `.htaccess` — agregar/quitar el dominio en `frame-src` dentro de la directiva `Content-Security-Policy` (línea 21), si el módulo se va a embeber en iframe.

Omitir uno de estos 4 pasos deja el resto del código "aparentemente correcto" pero el módulo no funciona (ej. si falta el dominio en `.htaccess`, el iframe es bloqueado por CSP aunque `_MODULOS_PERMITIDOS` en `app.js` sí lo permita, y el error solo aparece en la consola del navegador, no en la UI).

No existe hoy un array único de configuración de módulos. Si el usuario pide explícitamente centralizarlo (refactor), es una mejora razonable — pero no lo hagas de forma no solicitada; el proyecto es deliberadamente simple.

## Reglas obligatorias

- Todo elemento interactivo nuevo se conecta vía `addEventListener`, NUNCA `onclick`/`onchange`/`onload` inline en el HTML — la CSP en `.htaccess` usa `script-src 'self'` sin `unsafe-inline` (migración hecha en el commit `ef9caa4`, específicamente para esto). Esto es lo OPUESTO a la convención del proyecto hermano Zaiko (que sí usa `onclick` inline intencionalmente) — no copiar esa convención aquí.
- Todo módulo que se abre embebido (iframe) debe pasar por `enterModule(name, url)` — nunca asignar `src` al iframe directamente desde otro lugar del código.
- Los 4 archivos (`index.html`, `app.js`, `styles.css`, `.htaccess`) deben modificarse en el mismo cambio cuando se agrega o quita un módulo — no dejar un archivo pendiente "para después".

## Criterios de validación

- El nuevo botón tiene un `id` único y un listener `addEventListener('click', ...)` registrado en el bloque `DOMContentLoaded` de `app.js`.
- El dominio del nuevo módulo aparece EXACTAMENTE igual (mismo hostname) en `_MODULOS_PERMITIDOS` (`app.js`) y en `frame-src` (`.htaccess`) si el módulo se embebe en iframe.
- Existe una clase `.icon-<nombre>` en `styles.css` para el nuevo ícono.
- No hay ningún atributo `onclick=`, `onchange=` u otro handler inline en el HTML modificado.

## Checklist final

- [ ] `index.html`: botón agregado/quitado con su ícono, título y descripción.
- [ ] `app.js`: dominio agregado/quitado en `_MODULOS_PERMITIDOS` y su `addEventListener` correspondiente.
- [ ] `styles.css`: clase `.icon-<nombre>` agregada/quitada.
- [ ] `.htaccess`: dominio agregado/quitado en `frame-src` del CSP.
- [ ] Ningún `onclick` inline introducido.
- [ ] Verificación manual: el botón abre el módulo correctamente (o dejó de aparecer, si se quitó).
