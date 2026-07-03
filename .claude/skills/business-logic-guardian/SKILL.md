---
description: Se aplica cuando se propone agregar lógica de negocio real (préstamos, aprobaciones, PQRS, workflows) a este repo — Portal-Goyavier prácticamente no tiene lógica de negocio propia, solo la lista de módulos permitidos; esa lógica vive en Zaiko y paz-y-salvo.
when_to_use: ["agregar una regla de negocio al portal", "validar datos de un formulario", "lógica de aprobación o workflow", "flujo de préstamos o PQRS en el portal"]
paths: app.js, index.html
---

## Descripción

Portal-Goyavier no tiene lógica de negocio real. No hay formularios de datos, no hay entidades de dominio (préstamos, activos, PQRS, aprobaciones), no hay validaciones de negocio ni cálculos. Toda la "lógica" del repo son 76 líneas en `app.js`: el allowlist de módulos (`_MODULOS_PERMITIDOS`), la función de navegación entre vistas (`enterModule`, `goPortal`, `openNewTab`), y el relay de token OAuth. Eso es todo.

## Objetivo

Evitar que se agregue lógica de negocio real a este repo por error o por conveniencia — esa lógica pertenece a los repos de cada sistema embebido (`Zaiko`, `paz-y-salvo`), no al portal.

## Cuándo debe utilizarse

- Se propone agregar aquí una regla de negocio de un sistema embebido (ej. "que el portal valide si un préstamo está vencido", "que el portal calcule algo de PQRS").
- Se propone agregar un formulario de datos, una tabla, o cualquier entidad de dominio al portal.
- Se propone que el portal llame directamente a la base de datos de Zaiko o Paz y Salvo (Supabase) en vez de dejar que cada sistema embebido gestione sus propios datos.

## Instrucciones detalladas

Si una tarea pide "lógica de negocio" para el portal, lo correcto casi siempre es identificar a cuál de los 3 sistemas embebidos pertenece esa lógica y redirigir el cambio al repo correspondiente:

- Reglas de inventario, activos, préstamos → repo `Zaiko`.
- Reglas de paz y salvo del personal → repo `paz-y-salvo`.
- Reglas académicas / comunicación institucional → Phidias (SaaS externo, fuera de control del equipo).

La única "regla de negocio" legítima de este repo es la lista de qué módulos existen y bajo qué dominio (`_MODULOS_PERMITIDOS`), y esa se gobierna con la skill `architecture-guardian`, no con lógica de dominio nueva.

## Reglas obligatorias

- No agregar entidades de dominio, formularios de datos, ni validaciones de negocio a este repo.
- No agregar llamadas directas a Supabase u otra base de datos desde el portal (mantiene `connect-src 'none'` de la CSP).
- Si una tarea describe lógica de negocio real, señalar al usuario que corresponde al repo del sistema embebido correspondiente en vez de implementarla aquí.

## Criterios de validación

- El repo sigue sin `package.json`, sin cliente de base de datos, sin formularios de captura de datos de negocio.
- `app.js` sigue limitado a: relay de token, allowlist de módulos, navegación entre vistas.

## Checklist final

- [ ] No se agregó ninguna entidad de dominio ni formulario de datos al portal.
- [ ] No se agregaron llamadas de red propias (violaría `connect-src 'none'`).
- [ ] Si la tarea era de lógica de negocio real, se identificó y comunicó el repo correcto (Zaiko / paz-y-salvo / Phidias).
