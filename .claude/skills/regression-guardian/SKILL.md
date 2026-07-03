---
description: Se aplica antes de tocar el atributo sandbox del iframe (index.html:87) o los dominios permitidos (_MODULOS_PERMITIDOS en app.js / frame-src en .htaccess) — documenta el bug real de allow-modals faltante y el drift real Netlify→cPanel para evitar repetirlos.
when_to_use: ["cambiar sandbox del iframe", "el logout no funciona dentro del iframe", "confirm/alert no aparece en el módulo embebido", "agregar dominio a frame-src o _MODULOS_PERMITIDOS"]
paths: app.js, .htaccess, index.html
---

## Descripción

Este repo ya tuvo dos regresiones reales documentadas en su historial de git: (1) el atributo `sandbox` del iframe sin `allow-modals`, que rompió silenciosamente el logout en dos módulos embebidos, y (2) drift entre los dominios permitidos en `app.js` y `.htaccess` durante la migración de Netlify a cPanel. Esta skill existe para que no se repitan.

## Objetivo

Evitar reintroducir la regresión de `sandbox` sin `allow-modals`, y evitar que `_MODULOS_PERMITIDOS` (`app.js`) y `frame-src` (`.htaccess`) queden desincronizados.

## Cuándo debe utilizarse

- Se propone modificar el atributo `sandbox` del `<iframe id="module-frame">` en `index.html:87`.
- Se agrega, quita o cambia un dominio en `_MODULOS_PERMITIDOS` (`app.js:22`) o en `frame-src` de la CSP (`.htaccess:21`).
- Se reporta que algo "no funciona solo dentro del iframe del portal" pero sí funciona abriendo el módulo aparte (síntoma clásico de un problema de `sandbox`).
- Se toca cualquier configuración de hosting (`.htaccess`).

## Instrucciones detalladas

**Caso `sandbox`** (bug real, commit `234d0cd`): el iframe tenía `sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-downloads"` sin `allow-modals`. Sin ese flag, los navegadores bloquean SILENCIOSAMENTE `confirm()/alert()/prompt()` dentro del iframe — no lanzan error, `confirm()` simplemente devuelve `false`. Como el logout en Zaiko empieza con `if (!confirm(...)) return;`, el logout no funcionaba desde el portal (pero sí afuera, sin iframe/sandbox de por medio). Zaiko usa estos diálogos en 14 sitios y Paz y Salvo en 22 — cualquiera de esos flujos puede romperse igual si se retira `allow-modals`.

Antes de modificar `sandbox`, hay que revisar de forma HOLÍSTICA qué funcionalidad de CADA módulo embebido depende de qué flag — no agregar parches aditivos reactivos cada vez que algo falla. El valor actual y correcto es:

```
sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-downloads allow-modals"
```

Si se quita cualquiera de estos 6 flags sin verificar contra el código real de Zaiko/paz-y-salvo qué depende de él, se puede reintroducir un bug silencioso (sin errores en consola, solo comportamiento incorrecto).

**Caso dominios permitidos**: durante la migración Netlify→cPanel (commits `ef9caa4`/`2e4e669`) hubo drift real entre las URLs de `_MODULOS_PERMITIDOS` y las de `frame-src`. Los 3 dominios deben coincidir EXACTAMENTE (mismo hostname, sin protocolo) en ambos archivos:
- `zaiko-pazsalvo.colegiogoyavier.edu.co`
- `colegiogoyavier.phidias.co`
- `zaiko-inventario.colegiogoyavier.edu.co`

Cualquier cambio de dominio (ej. cambio de subdominio) debe aplicarse en `app.js` y `.htaccess` en el MISMO cambio, nunca por separado.

## Reglas obligatorias

- Nunca quitar `allow-modals` del `sandbox` del iframe sin verificar explícitamente que ningún módulo embebido usa `confirm()/alert()/prompt()`.
- Nunca agregar un flag nuevo a `sandbox` sin justificar qué funcionalidad concreta lo requiere (revisión holística, no parche reactivo).
- Los dominios en `_MODULOS_PERMITIDOS` (`app.js`) y en `frame-src` (`.htaccess`) deben ser un conjunto idéntico siempre — cualquier cambio que toque uno debe verificar el otro.
- No reintroducir `netlify.toml` ni configuración de Netlify — el hosting es cPanel/Apache (`.htaccess`) desde el commit `2e4e669`.

## Criterios de validación

- El `sandbox` del iframe sigue incluyendo los 6 flags actuales, salvo cambio explícitamente solicitado y justificado.
- Los dominios en `app.js` y `.htaccess` forman el mismo conjunto de 3 hostnames.
- No existe archivo `netlify.toml` en el repo tras el cambio.
- Si se reporta un bug de "funciona afuera pero no en el iframe", la primera hipótesis a descartar es un flag faltante en `sandbox`.

## Checklist final

- [ ] `sandbox` del iframe revisado holísticamente, no parchado aditivamente.
- [ ] Dominios de `_MODULOS_PERMITIDOS` y `frame-src` verificados como idénticos.
- [ ] No se reintrodujo `netlify.toml` ni config de Netlify.
- [ ] Si el cambio toca `sandbox`, se verificó contra el código real de Zaiko/paz-y-salvo qué depende de cada flag.
