# Portal-Goyavier

Launcher institucional del Colegio Campestre Goyavier. Página estática de 6 archivos
(`index.html`, `app.js`, `styles.css`, `.htaccess`, `logo_goyavier.png`, `.gitignore`) —
sin framework, sin build tool, sin `package.json`, sin backend ni base de datos propia.
Presenta un menú de 3 tarjetas y abre 3 sistemas externos: **Phidias** (pestaña nueva),
**Paz y Salvo** y **Zaiko Inventario** (embebidos en iframe, repos hermanos `paz-y-salvo`
y `Zaiko`). Hosting: Apache/cPanel vía `.htaccess` (Netlify fue retirado, no reintroducir).

## Skills obligatorias

Antes de finalizar cualquier cambio relevante en este repo, Claude debe aplicar
automáticamente las skills en `.claude/skills/`. Su contenido especializado (rutas,
funciones, commits citados) prevalece sobre lo que se resume aquí — este archivo solo
referencia, no duplica ese detalle:

- **architecture-guardian** — patrón "4 archivos deben tocarse juntos" al agregar/quitar un módulo embebido; prohíbe `onclick` inline.
- **regression-guardian** — evita repetir el bug real de `sandbox` sin `allow-modals` y el drift de dominios entre `app.js` y `.htaccess`.
- **supabase-guardian** — alcance del relay de token OAuth en `app.js` (único punto de contacto con Supabase; el esquema real vive en `paz-y-salvo`).
- **ui-guardian** — patrón de markup de las 3 tarjetas + topbar + spinner; conexión de eventos siempre vía `addEventListener`.
- **security-guardian** — `enterModule()`/`_MODULOS_PERMITIDOS` como único punto de validación de URL antes de cargar el iframe; sincronía con la CSP.
- **business-logic-guardian** — este repo no debe acumular lógica de negocio real; esa lógica vive en `Zaiko` y `paz-y-salvo`.
- **portal-goyavier-guardian** — rol del portal como launcher puro; el mecanismo OAuth difiere por módulo embebido (determinarlo antes de asumir el relay).

Claude Code descubre estas skills automáticamente por su ubicación en `.claude/skills/`;
no requieren registro adicional.
