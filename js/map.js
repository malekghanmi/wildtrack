// ============================================
// WILDTRACK v2 — Map Module (no emoji markers)
// ============================================

const MapModule = (() => {
  let _map, _baseTile, _satelliteTile, _isSatellite = false;
  let _layers = { tracks: true, predict: false, heat: false };
  let _trackGroups  = {};
  let _predictGroups = {};
  let _markers = {};
  let _animTimer = null, _animating = false;

  const TILE_SAT    = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const TILE_LABELS = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
  const TILE_TOPO   = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
  let _labelTile = null;

  const ACT_COLOR = {
    resting:  '#2d3a4a', walking:  '#74b9ff', grazing:  '#00cec9',
    foraging: '#55efc4', climbing: '#a29bfe', hunting:  '#ff6b35',
    running:  '#8b1a1a', soaring:  '#a08c5b', perching: '#636e72',
    swimming: '#2d6a4f', cruising: '#40916c', feeding:  '#52796f',
    bathing:  '#74a08a', playing:  '#9e8a70', migrating:'#355e4e',
    sleeping: '#4a4e69', diving:   '#0652DD',
  };
  function _actColor(act) { return ACT_COLOR[act] || '#74b9ff'; }

  function init() {
    _map = L.map('map', { center: [10, 20], zoom: 3, zoomControl: false, attributionControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(_map);
    L.control.attribution({ prefix: '© Esri · WildTrack' }).addTo(_map);
    _baseTile  = L.tileLayer(TILE_SAT,    { maxZoom: 18 }).addTo(_map);
    _labelTile = L.tileLayer(TILE_LABELS, { maxZoom: 18, zIndex: 10 }).addTo(_map);
    _satelliteTile = L.tileLayer(TILE_TOPO, { maxZoom: 18 });
  }

  function toggleSatellite() {
    _isSatellite = !_isSatellite;
    if (_isSatellite) {
      _map.removeLayer(_baseTile);
      if (_labelTile) _map.removeLayer(_labelTile);
      _satelliteTile.addTo(_map);
    } else {
      _map.removeLayer(_satelliteTile);
      _baseTile.addTo(_map);
      if (_labelTile) _labelTile.addTo(_map);
    }
    return _isSatellite;
  }

  function toggleLayer(name) {
    _layers[name] = !_layers[name];
    if (name === 'tracks')
      Object.values(_trackGroups).forEach(g => _layers.tracks ? _map.addLayer(g) : _map.removeLayer(g));
    if (name === 'predict')
      Object.values(_predictGroups).forEach(g => _layers.predict ? _map.addLayer(g) : _map.removeLayer(g));
    return _layers[name];
  }

  function addAnimal(animal) {
    const pts = animal.points;
    if (!pts || pts.length === 0) return;
    const trackGroup = L.layerGroup();

    for (let i = 1; i < pts.length; i++) {
      const color = _actColor(pts[i].activity);
      L.polyline(
        [[pts[i-1].location_lat, pts[i-1].location_long],
         [pts[i].location_lat,   pts[i].location_long]],
        { color, weight: 2.0, opacity: 0.7 }
      ).addTo(trackGroup);
    }

    L.circleMarker([pts[0].location_lat, pts[0].location_long], {
      radius: 4, color: animal.color, fillColor: animal.color, fillOpacity: 0.4, weight: 1
    }).addTo(trackGroup);

    const last = pts[pts.length - 1];
    // Use first letter of name as marker — no emoji
    const initial = (animal.name || animal.species || '?')[0].toUpperCase();
    const icon = L.divIcon({
      html: `<div class="wt-marker" style="background:${animal.color}33;border:2px solid ${animal.color};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-size:11px;font-weight:700;color:${animal.color}">${initial}</div>`,
      className: '', iconSize: [34,34], iconAnchor: [17,17]
    });
    const marker = L.marker([last.location_lat, last.location_long], { icon })
      .bindPopup(_buildPopup(animal, last))
      .on('click', () => window.selectAnimal(animal.id));
    marker.addTo(trackGroup);

    _markers[animal.id]     = marker;
    _trackGroups[animal.id] = trackGroup;
    if (_layers.tracks) trackGroup.addTo(_map);
  }

  function showPrediction(animal, predictedPoints) {
    if (_predictGroups[animal.id]) _map.removeLayer(_predictGroups[animal.id]);
    const group = L.layerGroup();
    const last = animal.points[animal.points.length - 1];
    if (!predictedPoints || predictedPoints.length === 0) return;

    const latlngs = [
      [last.location_lat, last.location_long],
      ...predictedPoints.map(p => [p.lat, p.lng])
    ];
    L.polyline(latlngs, {
      color: '#2d6a4f', weight: 1.5, opacity: 0.9, dashArray: '10 6', lineJoin: 'round'
    }).addTo(group);

    predictedPoints.forEach((p, i) => {
      const opacity = Math.max(0.12, 0.7 - i * 0.055);
      const r = Math.max(3, 7 - i * 0.4);

      if (p.uncertaintyKm > 0) {
        L.circle([p.lat, p.lng], {
          radius: p.uncertaintyKm * 1000,
          color: '#2d6a4f', fillColor: '#2d6a4f',
          fillOpacity: Math.max(0.02, 0.08 - i * 0.005),
          weight: 0.5, opacity: Math.max(0.05, 0.2 - i * 0.015),
          dashArray: '4 4'
        }).addTo(group);
      }

      L.circleMarker([p.lat, p.lng], {
        radius: r, color: '#2d6a4f', fillColor: '#2d6a4f',
        fillOpacity: opacity, weight: 1.5
      }).bindTooltip(
        `<b>Predicted +${p.step}h</b><br>${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}<br>+/-${p.uncertaintyKm} km`,
        { className: 'wt-tooltip' }
      ).addTo(group);
    });

    _predictGroups[animal.id] = group;
    if (_layers.predict) group.addTo(_map);
  }

  function _buildPopup(animal, point) {
    const spd = point.ground_speed ? point.ground_speed.toFixed(1) : '--';
    const ts  = point.timestamp ? new Date(point.timestamp).toLocaleTimeString() : '--';
    // Photo from animal.photo (local) or config
    const photoSrc = animal.photo || (CONFIG.SPECIES_PHOTOS && CONFIG.SPECIES_PHOTOS[animal.species]) || null;
    const imgHtml = photoSrc
      ? `<img src="${photoSrc}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px" onerror="this.style.display='none'">`
      : '';
    return `<div class="popup-inner">
      ${imgHtml}
      <div class="popup-title">${animal.name || animal.id}</div>
      <div class="popup-row"><span>Species</span><span>${animal.species}</span></div>
      <div class="popup-row"><span>Speed</span><span>${spd} km/h</span></div>
      <div class="popup-row"><span>Activity</span><span>${point.activity || '--'}</span></div>
      <div class="popup-row"><span>Time</span><span>${ts}</span></div>
      <div class="popup-row"><span>Lat/Lng</span><span>${point.location_lat.toFixed(3)}, ${point.location_long.toFixed(3)}</span></div>
    </div>`;
  }

  function focusAnimal(animal) {
    const last = animal.points[animal.points.length - 1];
    _map.setView([last.location_lat, last.location_long], 7, { animate: true });
    if (_markers[animal.id]) _markers[animal.id].openPopup();
  }

  function fitAll(animals) {
    const pts = [];
    animals.forEach(a => a.points.forEach(p => pts.push([p.location_lat, p.location_long])));
    if (pts.length) _map.fitBounds(L.latLngBounds(pts), { padding: [40,40] });
  }

  function animateAll(animals) {
    if (_animating) {
      clearInterval(_animTimer); _animating = false;
      animals.forEach(a => {
        const last = a.points[a.points.length - 1];
        if (_markers[a.id]) _markers[a.id].setLatLng([last.location_lat, last.location_long]);
      });
      return false;
    }
    _animating = true;
    const indices = {};
    animals.forEach(a => { indices[a.id] = 0; });
    _animTimer = setInterval(() => {
      let allDone = true;
      animals.forEach(a => {
        const i = indices[a.id];
        if (i < a.points.length - 1) {
          allDone = false;
          const p = a.points[i];
          if (_markers[a.id]) _markers[a.id].setLatLng([p.location_lat, p.location_long]);
          indices[a.id]++;
        }
      });
      if (allDone) { clearInterval(_animTimer); _animating = false; }
    }, CONFIG.ANIMATION_INTERVAL);
    return true;
  }

  function clearAnimal(id) {
    if (_trackGroups[id])   { _map.removeLayer(_trackGroups[id]);   delete _trackGroups[id]; }
    if (_predictGroups[id]) { _map.removeLayer(_predictGroups[id]); delete _predictGroups[id]; }
    delete _markers[id];
  }
  function clearAll() { Object.keys(_trackGroups).forEach(clearAnimal); }

  return { init, toggleSatellite, toggleLayer, addAnimal, showPrediction,
           focusAnimal, fitAll, animateAll, clearAnimal, clearAll };
})();
