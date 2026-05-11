function enterModule(name, url) {
  document.getElementById('module-label').textContent = name;
  document.getElementById('module-frame').src = url;
  document.getElementById('view-portal').classList.add('hidden');
  document.getElementById('view-module').classList.remove('hidden');
}

function goPortal() {
  document.getElementById('view-module').classList.add('hidden');
  document.getElementById('view-portal').classList.remove('hidden');
  document.getElementById('module-frame').src = '';
}
