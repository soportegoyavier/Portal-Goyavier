let _currentUrl = '';

// ── OAuth relay: Supabase redirige aquí con #access_token=... tras Google login ──
// Paz y Salvo, cuando está en iframe, envía el redirectTo al portal para evadir
// el storage particionado. El portal extrae el token y lo pasa al iframe via src.
(function () {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const at   = hash.get('access_token');
  const rt   = hash.get('refresh_token');
  if (!at) return;
  try { history.replaceState(null, '', window.location.pathname); } catch (_) {}
  const pysSrc = 'https://zaiko-pazsalvo.colegiogoyavier.edu.co/#access_token=' + encodeURIComponent(at)
    + (rt ? '&refresh_token=' + encodeURIComponent(rt) : '');
  function _relay() { enterModule('Paz y Salvo', pysSrc); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _relay);
  } else {
    _relay();
  }
})();

const _MODULOS_PERMITIDOS = ['zaiko-pazsalvo.colegiogoyavier.edu.co', 'colegiogoyavier.phidias.co', 'zaiko-inventario.colegiogoyavier.edu.co'];

function enterModule(name, url) {
  try {
    const u = new URL(url);
    const ok = u.protocol === 'https:' && _MODULOS_PERMITIDOS.some(d => u.hostname === d || u.hostname.endsWith('.' + d));
    if (!ok) throw new Error('URL no permitida');
  } catch (_) {
    console.error('[Portal] URL de módulo bloqueada:', url);
    return;
  }
  _currentUrl = url;
  document.getElementById('module-label').textContent = name;
  document.getElementById('module-loading').classList.remove('hidden');
  document.getElementById('module-frame').src = url;
  document.getElementById('view-portal').classList.add('hidden');
  document.getElementById('view-module').classList.remove('hidden');
}

function onFrameLoad() {
  document.getElementById('module-loading').classList.add('hidden');
}

function goPortal() {
  document.getElementById('view-module').classList.add('hidden');
  document.getElementById('view-portal').classList.remove('hidden');
  document.getElementById('module-frame').src = '';
  document.getElementById('module-loading').classList.add('hidden');
  _currentUrl = '';
}

function openNewTab() {
  if (_currentUrl) window.open(_currentUrl, '_blank', 'noopener,noreferrer');
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !document.getElementById('view-module').classList.contains('hidden')) {
    goPortal();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('btn-phidias').addEventListener('click', function () {
    window.open('https://colegiogoyavier.phidias.co/', '_blank', 'noopener,noreferrer');
  });
  document.getElementById('btn-pazsalvo').addEventListener('click', function () {
    enterModule('Paz y Salvo', 'https://zaiko-pazsalvo.colegiogoyavier.edu.co/');
  });
  document.getElementById('btn-zaiko').addEventListener('click', function () {
    enterModule('Zaiko Inventario', 'https://zaiko-inventario.colegiogoyavier.edu.co/');
  });
  document.getElementById('btn-calendario').addEventListener('click', function () {
    window.open('https://script.google.com/macros/s/AKfycbzSJQ5roOAdmXFiwN0t57hU8703cuS5w6_L_rLmwaa8T0KZ-fCg7HVVl4jsjaymDak8uA/exec', '_blank', 'noopener,noreferrer');
  });
  document.getElementById('btn-back').addEventListener('click', goPortal);
  document.getElementById('btn-newtab').addEventListener('click', openNewTab);
  document.getElementById('module-frame').addEventListener('load', onFrameLoad);
});
