---
description: Se aplica al tocar el relay de token OAuth en app.js (líneas 1-20) que reenvía access_token/refresh_token de Supabase al iframe de Paz y Salvo — este repo no tiene cliente Supabase propio, solo este mecanismo de paso.
when_to_use: ["tocar el relay de token", "access_token en el hash de la URL", "el login de Paz y Salvo no funciona dentro del iframe", "agregar Supabase al portal"]
paths: app.js
---

## Descripción

Portal-Goyavier NO tiene cliente Supabase propio, ni `@supabase/supabase-js`, ni variables de entorno, ni llamadas de red propias (la CSP en `.htaccess` tiene `connect-src 'none'`). El único punto de contacto con Supabase es un relay pasivo de token OAuth en `app.js` líneas 1-20. El esquema, las tablas y la lógica real de autenticación de Supabase viven en el repo hermano `paz-y-salvo`, no aquí.

## Objetivo

Preservar exactamente el comportamiento del relay de token: parsear el hash de la URL, limpiarlo del historial, reinyectarlo en el `src` del iframe — sin agregar persistencia, logging, ni lógica adicional de Supabase en este repo.

## Cuándo debe utilizarse

- Se propone modificar el IIFE de `app.js` líneas 6-20 (el relay de token).
- Se reporta que el login de Google para Paz y Salvo no funciona cuando se usa dentro del iframe del portal.
- Se sugiere "agregar Supabase al portal" o guardar el token en algún storage del portal.

## Instrucciones detalladas

El mecanismo actual (verificado en `app.js:1-20`):

1. Al cargar la página, se parsea `window.location.hash` con `URLSearchParams` buscando `access_token` y `refresh_token`.
2. Si no hay `access_token`, la función retorna de inmediato (no hace nada) — este es el caso normal (carga directa del portal, sin redirect de Supabase).
3. Si hay token, se limpia el hash de la URL vía `history.replaceState(null, '', window.location.pathname)` — nunca queda el token visible en la barra de direcciones ni en el historial del navegador.
4. El token se reinyecta como fragmento (`#access_token=...&refresh_token=...`) en la URL que se pasa a `enterModule('Paz y Salvo', pysSrc)`, que a su vez lo asigna como `src` del iframe.

Esto existe porque Supabase Auth (usado por Paz y Salvo) usa el flujo implícito, y cuando Paz y Salvo corre dentro de un iframe de terceros el storage particionado del navegador rompe ese flujo — por eso Paz y Salvo redirige el resultado de Google login al portal (el top-level frame), y el portal se lo reenvía.

## Reglas obligatorias

- El portal NUNCA debe persistir el token (`localStorage`, `sessionStorage`, cookies) ni loggearlo (`console.log`, analítica, etc.) — solo parsear → limpiar → reinyectar.
- Cualquier cambio a este mecanismo debe preservar ese orden exacto: leer del hash, limpiar con `history.replaceState`, pasar al iframe.
- No agregar un cliente Supabase (`@supabase/supabase-js` u otro SDK) a este repo — no aplica a un launcher estático sin build tool.
- No asumir que Zaiko necesita este mismo relay: Zaiko usa Google Identity Services por popup (`google.accounts.oauth2.initTokenClient`), un mecanismo distinto que no depende de este relay (ver skill `portal-goyavier-guardian`).

## Criterios de validación

- El token no aparece en ningún `console.log`, variable persistida, ni se escribe a storage.
- Tras el relay, la URL visible del navegador no contiene el token (`history.replaceState` se ejecuta antes de cualquier otra cosa).
- El repo sigue sin `package.json`, sin SDK de Supabase, sin llamadas `fetch`/`XHR` propias.

## Checklist final

- [ ] El relay sigue el orden parsear → limpiar del historial → reinyectar en el iframe.
- [ ] No se agregó persistencia ni logging del token.
- [ ] No se agregó un cliente Supabase a este repo.
- [ ] Se confirmó que el cambio no afecta a Zaiko (mecanismo OAuth distinto, sin relay).
