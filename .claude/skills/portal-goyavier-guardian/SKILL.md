---
description: Reglas generales del rol del portal como launcher — cada sistema embebido tiene su propio acceso independiente y su propio mecanismo OAuth (Paz y Salvo necesita relay por storage particionado, Zaiko usa Google Identity Services por popup sin relay); hosting es cPanel, no Netlify.
when_to_use: ["qué es Portal-Goyavier", "agregar un sistema nuevo con login", "el portal necesita autenticación propia", "reintroducir netlify.toml"]
paths: index.html, app.js, .htaccess, styles.css
---

## Descripción

Portal-Goyavier es un launcher/portal institucional del Colegio Campestre Goyavier: una página estática de 6 archivos (`index.html`, `app.js`, `styles.css`, `.htaccess`, `logo_goyavier.png`, `.gitignore`) sin framework, sin build tool, sin `package.json` y sin backend propio. Su único trabajo es presentar un menú de 3 sistemas y abrirlos — Phidias en pestaña nueva, Paz y Salvo y Zaiko Inventario embebidos en iframe. El texto del footer (`index.html:64`) lo resume: "Cada sistema tiene su propio acceso independiente".

## Objetivo

Mantener claro el alcance del portal como launcher puro, evitar asumir mecanismos de autenticación incorrectos para módulos nuevos, y no reintroducir configuración de hosting obsoleta (Netlify).

## Cuándo debe utilizarse

- Se pregunta qué es el proyecto o cuál es su alcance.
- Se agrega un sistema nuevo que requiere login dentro del iframe.
- Se propone agregar autenticación propia al portal.
- Se toca cualquier archivo de configuración de hosting (`.htaccess`) o se sugiere agregar `netlify.toml`.

## Instrucciones detalladas

El portal NO tiene autenticación propia ni sesión propia — cada uno de los 3 sistemas maneja su propio login de forma independiente:

- **Phidias**: SaaS externo (`https://colegiogoyavier.phidias.co/`), se abre en pestaña nueva (`window.open`), fuera del control de este repo.
- **Paz y Salvo** (repo hermano `paz-y-salvo`): usa Supabase Auth con flujo implícito de Google. Cuando corre embebido en el iframe del portal, el storage particionado de terceros rompe ese flujo, por lo que Paz y Salvo redirige el resultado del login al portal (top-level), y el portal reenvía el token al iframe vía el relay documentado en la skill `supabase-guardian` (`app.js:1-20`).
- **Zaiko Inventario** (repo hermano `Zaiko`): usa Google Identity Services por popup (`google.accounts.oauth2.initTokenClient`) — el token vuelve directo por callback del popup, sin depender de `localStorage` compartido con el portal. NO necesita el relay de token del portal (confirmado en el commit `df972fe` al agregarlo como módulo).

**Antes de asumir que un módulo nuevo necesita el relay de token existente**, hay que determinar primero qué mecanismo OAuth usa ese módulo. Si usa flujo implícito de Supabase (como Paz y Salvo), probablemente sí lo necesite. Si usa un popup real (como Zaiko), probablemente no.

Hosting: cPanel/Apache, gobernado por `.htaccess` (headers de seguridad + CSP). La configuración de Netlify (`netlify.toml`) fue eliminada deliberadamente en el commit `2e4e669` ("hosting migrado a cPanel") — no reintroducir ese archivo ni configuración equivalente de Netlify salvo que el usuario pida explícitamente volver a ese hosting.

## Reglas obligatorias

- No agregar autenticación propia al portal (login form, sesión, cookies) — el portal no gestiona identidad, cada sistema embebido lo hace por su cuenta.
- No asumir que un módulo nuevo necesita el relay de token de Paz y Salvo sin antes confirmar qué mecanismo OAuth usa.
- No reintroducir `netlify.toml` ni configuración de Netlify — el hosting activo es cPanel vía `.htaccess`.
- Mantener el mensaje de "acceso independiente por sistema" del footer consistente con la realidad: si se agrega un mecanismo de sesión compartida entre el portal y un módulo, ese texto debe revisarse.

## Criterios de validación

- El portal sigue sin gestionar sesión/identidad propia (sin cookies de sesión, sin JWT propio, sin login form).
- Para un módulo nuevo con login, se documentó explícitamente qué mecanismo OAuth usa antes de decidir si necesita relay.
- No existe `netlify.toml` en el repo.

## Checklist final

- [ ] No se agregó autenticación propia al portal.
- [ ] Si el cambio involucra un módulo nuevo con login, se determinó su mecanismo OAuth antes de decidir sobre el relay.
- [ ] No se reintrodujo configuración de Netlify.
- [ ] El mensaje de "acceso independiente por sistema" del footer sigue siendo verdad tras el cambio.
