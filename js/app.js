// ============================================
// WILDTRACK v2 — Main App Controller
// ============================================

let _animals = [];
let _filtered = [];
let _selectedId = null;
let _continentFilter = 'All';
let _searchQuery = '';
let _timeFilter = 0;
let _layerState = { tracks: true, predict: false };

window.addEventListener('load', async () => {
  document.getElementById('loader').style.display = 'none';
  await _launchApp();
});

async function _launchApp() {
  document.getElementById('app').style.display = '';
  MapModule.init();
  _animals = DEMO_DATA;
  _applyTimeFilter(_animals);
  _afterLoad();
}

function _applyTimeFilter(animals) {
  if (_timeFilter === 0) {
    _filtered = animals.map(a => ({ ...a }));
    return;
  }
  const cutoff = new Date(Date.now() - _timeFilter * 24 * 3600 * 1000);
  _filtered = animals.map(a => ({
    ...a,
    points: a.points.filter(p => !p.timestamp || new Date(p.timestamp) >= cutoff)
  })).filter(a => a.points.length > 2);
}

function _afterLoad() {
  const continents = [...new Set(_animals.map(a => a.continent))].sort();
  UI.renderContinentFilters(continents, 'All');
  _filtered.forEach(a => MapModule.addAnimal(a));
  UI.renderAnimalList(_filtered);
  UI.updateStats(_filtered);
  MapModule.fitAll(_filtered);
  UI.toast(`${_filtered.length} animals loaded across ${new Set(_filtered.map(a=>a.continent)).size} continents`, 'success');
}

window.selectAnimal = function(id) {
  _selectedId = id;
  UI.setSelected(id);
  const animal = _filtered.find(a => a.id === id);
  if (!animal) return;
  MapModule.focusAnimal(animal);
  const pred = UI.renderDetail(animal);
  MapModule.showPrediction(animal, pred.points);
  if (!_layerState.predict) {
    _layerState.predict = MapModule.toggleLayer('predict');
    document.getElementById('mc-predict').classList.toggle('active', _layerState.predict);
  }
};

window.filterAnimals = function() {
  _searchQuery = document.getElementById('search').value.toLowerCase();
  _renderFiltered();
};

window.filterByContinent = function(continent) {
  _continentFilter = continent;
  UI.setActiveContinent(continent);
  _renderFiltered();
};

function _renderFiltered() {
  let list = _filtered;
  if (_continentFilter !== 'All') list = list.filter(a => a.continent === _continentFilter);
  if (_searchQuery) list = list.filter(a =>
    (a.name || '').toLowerCase().includes(_searchQuery) ||
    a.species.toLowerCase().includes(_searchQuery)
  );
  UI.renderAnimalList(list, _selectedId);
}

window.toggleLayer = function(name) {
  _layerState[name] = MapModule.toggleLayer(name);
  document.getElementById('mc-' + name).classList.toggle('active', _layerState[name]);
};

window.toggleSatellite = function() {
  const on = MapModule.toggleSatellite();
  document.getElementById('mc-satellite').classList.toggle('active', on);
};

window.fitAll = function() { MapModule.fitAll(_filtered); };

window.animateAll = function() {
  const on = MapModule.animateAll(_filtered);
  const btn = document.getElementById('mc-animate');
  btn.classList.toggle('active', on);
  btn.textContent = on ? '\u23F8' : '\u25B6';
};

window.setTimeFilter = function(days, btn) {
  _timeFilter = days;
  document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  MapModule.clearAll();
  _applyTimeFilter(_animals);
  _filtered.forEach(a => MapModule.addAnimal(a));
  UI.renderAnimalList(_filtered, _selectedId);
  UI.updateStats(_filtered);
};

window.refreshData = async function() {
  const btn = document.querySelector('.refresh-btn');
  btn.classList.add('spinning');
  UI.toast('Refreshing data...', 'info');
  await _sleep(1200);
  btn.classList.remove('spinning');
  if (_selectedId) window.selectAnimal(_selectedId);
  UI.toast('Data refreshed', 'success');
};

window.logout = function() { location.reload(); };
function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
