let _currentUrl = '';

function enterModule(name, url) {
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
