---
description: Se aplica a cualquier cambio en enterModule() (app.js:24), _MODULOS_PERMITIDOS, el CSP de .htaccess, o el atributo sandbox del iframe — estos son los únicos controles de seguridad del portal y deben mantenerse sincronizados y sin debilitarse.
when_to_use: ["validar URL antes de cargar el iframe", "modificar el CSP", "cambiar sandbox del iframe", "agregar dominio permitido", "el relay de token no debe loggear nada"]
paths: app.js, .htaccess, index.html
---

## Descripción

Portal-Goyavier no tiene backend ni base de datos propia, pero sí tiene controles de seguridad deliberados y ya probados en producción: (1) `enterModule(name, url)` (`app.js:24-39`) valida la URL contra el allowlist `_MODULOS_PERMITIDOS` antes de asignarla al `src` del iframe; (2) la CSP en `.htaccess` restringe `frame-src` a los mismos 3 dominios y bloquea `connect-src`/`form-action`/`object-src`; (3) el atributo `sandbox` del iframe limita lo que el contenido embebido puede hacer; (4) el relay de token OAuth nunca persiste ni loggea el token. Estos controles fueron introducidos deliberadamente (commits `6084aad`, `ab5bde7`, `ef9caa4`) para bloquear "inyección arbitraria de src en iframe" — no son incidentales.

## Objetivo

Que ningún cambio futuro debilite, elimine o bypasee estos controles sin que el usuario lo pida explícitamente y de forma consciente.

## Cuándo debe utilizarse

- Se modifica `enterModule()`, `_MODULOS_PERMITIDOS` o cualquier código que asigne `src` al iframe.
- Se modifica la directiva `Content-Security-Policy` en `.htaccess:21` o cualquier otro header de seguridad (`X-Frame-Options`, `Permissions-Policy`, etc.).
- Se toca el atributo `sandbox` del iframe.
- Se toca el relay de token en `app.js:1-20`.

## Instrucciones detalladas

`enterModule(name, url)` (`app.js:24-39`) es el ÚNICO punto por el que debe pasar cualquier asignación de `src` al iframe. Su validación actual:

```js
const u = new URL(url);
const ok = u.protocol === 'https:' && _MODULOS_PERMITIDOS.some(d => u.hostname === d || u.hostname.endsWith('.' + d));
if (!ok) throw new Error('URL no permitida');
```

Exige protocolo `https:` y que el hostname sea exactamente uno de los 3 dominios de `_MODULOS_PERMITIDOS` o un subdominio de ellos. Si la validación falla, se loggea el intento bloqueado (`console.error('[Portal] URL de módulo bloqueada:', url)`) y la función retorna sin modificar el DOM — nunca se debe quitar este `try/catch` ni relajar la comparación de hostname (ej. usar `.includes()` en vez de comparación exacta de hostname, que sería vulnerable a bypass del tipo `evil.com/zaiko-inventario.colegiogoyavier.edu.co`).

La CSP en `.htaccess` (línea 21) y `_MODULOS_PERMITIDOS` en `app.js` (línea 22) deben listar el mismo conjunto de dominios — son dos capas de la misma defensa (allowlist en JS + `frame-src` en el navegador). Ver también `regression-guardian` para el historial de drift entre ambos.

El `sandbox` del iframe (`index.html:87`) debe revisarse holísticamente antes de cualquier cambio (ver `regression-guardian` para el caso real de `allow-modals`) — no se debe agregar un flag nuevo sin entender su interacción con los demás (ej. `allow-same-origin` junto con `allow-scripts` puede permitir que el contenido embebido escape del sandbox si además controlara su propio origen; esto está mitigado aquí porque el hostname del iframe siempre está fijado por el allowlist, nunca es arbitrario).

## Reglas obligatorias

- Ninguna asignación de `src` al iframe debe evitar pasar por `enterModule()`.
- La comparación de hostname en `enterModule()` debe seguir siendo exacta (`===` o `endsWith('.' + d)`), nunca un `includes()` o regex laxo que permita bypass.
- `_MODULOS_PERMITIDOS` (`app.js`) y `frame-src` (`.htaccess`) deben mantenerse como el mismo conjunto de dominios.
- El relay de token (`app.js:1-20`) nunca debe persistir ni loggear `access_token`/`refresh_token` — solo el resto del flujo (parsear → limpiar → reinyectar).
- No relajar `connect-src 'none'`, `form-action 'none'`, `object-src 'none'` ni `frame-ancestors 'none'` en `.htaccess` sin que el usuario lo pida explícitamente y entienda la implicación.

## Criterios de validación

- `enterModule()` sigue rechazando URLs con protocolo distinto de `https:` o hostname fuera del allowlist.
- No hay ningún nuevo punto en el código que asigne `document.getElementById('module-frame').src` fuera de `enterModule()`/`goPortal()`.
- Los 3 dominios en `_MODULOS_PERMITIDOS` y `frame-src` siguen coincidiendo.
- El token OAuth no aparece en ningún `console.log` ni variable persistida (ver `supabase-guardian`).

## Checklist final

- [ ] Toda carga del iframe pasa por `enterModule()`.
- [ ] Comparación de hostname sigue siendo exacta, sin bypass posible.
- [ ] Dominios sincronizados entre `app.js` y `.htaccess`.
- [ ] `sandbox` revisado holísticamente si se tocó.
- [ ] Ningún header de seguridad de `.htaccess` fue relajado sin pedido explícito del usuario.
