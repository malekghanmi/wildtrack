// ============================================
// WILDTRACK v2 — UI Module (no emoji, real photos, descriptions)
// ============================================

const UI = (() => {
  let _charts = {};

  // ─── Activity colour map ───────────────────────────────────────────────
  function _actColor(act) {
    const m = {
      resting:'#2d3a4a',  sleeping:'#4a4e69',  walking:'#74b9ff',
      hunting:'#8b1a1a',  running:'#a0522d',   grazing:'#2d6a4f',
      soaring:'#ffd166',  gliding:'#fdcb6e',   swimming:'#0984e3',
      cruising:'#a29bfe', feeding:'#fd79a8',   climbing:'#e17055',
      foraging:'#55efc4', bathing:'#81ecec',   diving:'#0652DD',
      migrating:'#40916c',playing:'#a08c5b',   drinking:'#52796f',
    };
    return m[act] || '#7a9ab8';
  }

  // ─── Animal list ────────────────────────────────────────────────────────
  function renderAnimalList(animals, selected = null) {
    const list = document.getElementById('animal-list');
    list.innerHTML = '';
    const _c = document.getElementById('animal-count'); if (_c) _c.textContent = animals.length;

    animals.forEach(animal => {
      const stats = Analytics.compute(animal);
      const actColor = _actColor(stats.currentActivity);
      const card = document.createElement('div');
      card.className = 'animal-card' + (animal.id === selected ? ' selected' : '');
      card.dataset.id = animal.id;
      card.style.setProperty('--ac', animal.color);

            card.innerHTML = `
        <div class="ac-info">
          <div class="ac-name">${animal.name || animal.id}</div>
          <div class="ac-meta">${animal.species}</div>
          <div class="ac-continent">${animal.continent}</div>
        </div>
        <div class="ac-speed">
          <div class="ac-spd-val" style="color:${animal.color}">${stats.currentSpeed}</div>
          <div class="ac-spd-unit">km/h</div>
          <div class="ac-activity" style="color:${actColor};font-size:8px">${stats.currentActivity}</div>
        </div>
        <div class="ac-status-dot" style="background:${actColor}"></div>
      `;
      card.addEventListener('click', () => window.selectAnimal(animal.id));
      list.appendChild(card);
    });
  }

  function setSelected(id) {
    document.querySelectorAll('.animal-card').forEach(c =>
      c.classList.toggle('selected', c.dataset.id === id)
    );
  }

  function renderContinentFilters(continents, active) {
    const row = document.getElementById('continent-filters');
    row.innerHTML = '';
    ['All', ...continents].forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (c === active ? ' active' : '');
      btn.textContent = c;
      btn.addEventListener('click', () => window.filterByContinent(c));
      row.appendChild(btn);
    });
  }

  function setActiveContinent(name) {
    document.querySelectorAll('.filter-btn').forEach(b =>
      b.classList.toggle('active', b.textContent === name)
    );
  }

  function updateStats(animals) {
    const species    = new Set(animals.map(a => a.species)).size;
    const pts        = animals.reduce((s, a) => s + (a.points ? a.points.length : 0), 0);
    const continents = new Set(animals.map(a => a.continent)).size;
    _animCount('ts-animals',   animals.length);
    _animCount('ts-species',   species);
    _animCount('ts-points',    pts);
    _animCount('ts-continents',continents);
  }

  function _animCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseInt(el.textContent.replace(/,/g,'')) || 0;
    const diff  = target - start;
    const steps = 24; let i = 0;
    const t = setInterval(() => {
      i++;
      el.textContent = Math.round(start + diff * (i/steps)).toLocaleString();
      if (i >= steps) clearInterval(t);
    }, 25);
  }

  // ─── Detail panel ───────────────────────────────────────────────────────
  function renderDetail(animal) {
    const stats = Analytics.compute(animal);
    const pred  = Prediction.predict(animal);
    const el    = document.getElementById('detail-content');
    const actColor = _actColor(stats.currentActivity);

    const photoSrc = animal.photo || (CONFIG.SPECIES_PHOTOS && CONFIG.SPECIES_PHOTOS[animal.species]) || null;
    const initial  = (animal.name || animal.species || '?')[0].toUpperCase();
    const photoHtml = photoSrc
      ? `<div class="dh-photo"><img src="${photoSrc}" alt="${animal.species}"
           style="width:100%;height:100%;object-fit:cover"
           onerror="this.parentElement.style.background='#f5f4f0';this.style.display='none'"></div>`
      : `<div class="dh-photo" style="background:#f5f4f0;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:${animal.color}">${initial}</div>`;

    el.innerHTML = `
      <!-- HERO -->
      <div class="detail-hero">
        ${photoHtml}
        <div class="dh-info">
          <div class="dh-name">${animal.name || animal.id}</div>
          <div class="dh-species">${animal.species}</div>
          <div class="dh-continent">${animal.continent}</div>
          <span class="dh-activity" style="background:${actColor}18;border:1px solid ${actColor}44;color:${actColor}">
            ${(stats.currentActivity || 'active').toUpperCase()}
          </span>
        </div>
      </div>

      <!-- DESCRIPTION -->
      ${animal.description ? `
      <div class="dp-section">
        <div class="dp-section-title">ABOUT THIS SPECIES</div>
        <div class="dp-description">${animal.description}</div>
        ${animal.study ? `<div style="margin-top:8px;font-size:10px;color:var(--text-muted);font-family:'DM Mono',monospace;letter-spacing:0.5px">SOURCE: ${animal.study}</div>` : ''}
      </div>` : ''}

      <!-- STATS -->
      <div class="dp-section">
        <div class="dp-section-title">STATISTICS</div>
        <div class="stat-grid-4">
          <div class="stat-box-3d">
            <div class="sb-val" style="color:${animal.color}">${stats.avgSpeed}</div>
            <div class="sb-lbl">AVG km/h</div>
          </div>
          <div class="stat-box-3d">
            <div class="sb-val" style="color:#8b1a1a">${stats.maxSpeed}</div>
            <div class="sb-lbl">MAX km/h</div>
          </div>
          <div class="stat-box-3d">
            <div class="sb-val" style="color:var(--neon-green)">${stats.totalDist}</div>
            <div class="sb-lbl">DIST km</div>
          </div>
          <div class="stat-box-3d">
            <div class="sb-val" style="color:var(--neon-purple)">${stats.pointCount}</div>
            <div class="sb-lbl">GPS PTS</div>
          </div>
        </div>
      </div>

      <!-- SPEED CHART -->
      <div class="dp-section">
        <div class="dp-section-title">SPEED OVER TIME</div>
        <div class="chart-container">
          <canvas id="speed-chart" height="100"></canvas>
        </div>
      </div>

      <!-- ACTIVITY -->
      <div class="dp-section">
        <div class="dp-section-title">ACTIVITY BREAKDOWN</div>
        <div class="activity-rows" id="act-rows"></div>
      </div>

      <!-- AI PREDICTION ENGINE -->
      <div class="dp-section">
        <div class="dp-section-title">AI PREDICTION ENGINE</div>
        <div class="prediction-panel">
          <div class="pp-method-badge">${pred.method || 'Bézier + Territory + Circadian + Kalman'}</div>

          <div class="pp-confidence-ring">
            <svg viewBox="0 0 100 100" class="conf-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f4ff14" stroke-width="8"/>
              <circle cx="50" cy="50" r="42" fill="none"
                stroke="${pred.confidence > 70 ? '#2d6a4f' : pred.confidence > 45 ? '#a08c5b' : '#8b1a1a'}"
                stroke-width="8"
                stroke-dasharray="${(2 * Math.PI * 42).toFixed(2)}"
                stroke-dashoffset="${(2 * Math.PI * 42 * (1 - pred.confidence/100)).toFixed(2)}"
                stroke-linecap="round"
                transform="rotate(-90 50 50)"/>
              <text x="50" y="47" text-anchor="middle" fill="${pred.confidence > 70 ? '#2d6a4f' : pred.confidence > 45 ? '#a08c5b' : '#8b1a1a'}"
                font-size="18" font-weight="bold" font-family="DM Mono,monospace">${pred.confidence}%</text>
              <text x="50" y="61" text-anchor="middle" fill="#8898a8" font-size="7.5"
                font-family="Exo 2,sans-serif" letter-spacing="1">CONFIDENCE</text>
            </svg>
          </div>

          <div class="pp-grid">
            <div class="pp-row">
              <span class="pp-key">Direction</span>
              <span class="pp-val" style="color:var(--neon-cyan)">${pred.direction} (${pred.dirDegrees}&deg;)</span>
            </div>
            <div class="pp-row">
              <span class="pp-key">Est. Speed</span>
              <span class="pp-val" style="color:var(--neon-green)">${pred.estimatedSpeed} km/h</span>
            </div>
            <div class="pp-row">
              <span class="pp-key">Next ${CONFIG.PREDICT_STEPS}h Range</span>
              <span class="pp-val" style="color:var(--neon-yellow)">${pred.estimatedDist} km</span>
            </div>
            <div class="pp-row">
              <span class="pp-key">Circadian</span>
              <span class="pp-val" style="color:var(--neon-pink)">${Math.round(pred.circadianFactor * 100)}% active</span>
            </div>
            <div class="pp-row">
              <span class="pp-key">Territory pull</span>
              <span class="pp-val" style="color:var(--neon-purple)">${pred.territoryPullKm} km</span>
            </div>
            <div class="pp-row">
              <span class="pp-key">Uncertainty</span>
              <span class="pp-val" style="color:var(--text-muted)">+/-${pred.points && pred.points.length ? pred.points[pred.points.length-1].uncertaintyKm : 0} km</span>
            </div>
          </div>

          <div class="pp-methods">
            <div class="pm-title">METHODS COMBINED</div>
            <div class="pm-list">
              <span class="pm-tag">Bézier Curve</span>
              <span class="pm-tag">Territory Return</span>
              <span class="pm-tag">Circadian Clock</span>
              <span class="pm-tag">Kalman Filter</span>
            </div>
          </div>
        </div>
      </div>

      <!-- GPS COORDS -->
      <div class="dp-section">
        <div class="dp-section-title">LAST KNOWN POSITION</div>
        <div class="gps-coords">
          LAT: ${stats.lastLat ? stats.lastLat.toFixed(5) : '--'}<br>
          LNG: ${stats.lastLng ? stats.lastLng.toFixed(5) : '--'}<br>
          TIME: ${stats.lastTimestamp ? new Date(stats.lastTimestamp).toLocaleString() : '--'}<br>
          HOME RANGE: ~${stats.rangeKm2} km&sup2;
        </div>
      </div>
    `;

    _renderActivityBars(stats.actCounts, animal.color);
    setTimeout(() => _renderSpeedChart(animal, stats), 80);
    return pred;
  }

  function _renderActivityBars(actCounts, color) {
    const container = document.getElementById('act-rows');
    if (!container) return;
    const total = Object.values(actCounts).reduce((a,b) => a+b, 0) || 1;
    container.innerHTML = Object.entries(actCounts)
      .sort((a,b) => b[1]-a[1])
      .map(([act, count]) => {
        const pct = Math.round(count / total * 100);
        const c   = _actColor(act);
        return `<div class="act-row">
          <div class="act-name">${act}</div>
          <div class="act-track"><div class="act-bar" style="width:${pct}%;background:${c}"></div></div>
          <div class="act-pct">${pct}%</div>
        </div>`;
      }).join('');
  }

  function _renderSpeedChart(animal, stats) {
    const canvas = document.getElementById('speed-chart');
    if (!canvas) return;
    if (_charts.speed) { _charts.speed.destroy(); _charts.speed = null; }
    const pts    = animal.points.slice(-40);
    const labels = pts.map((_, i) => i % 8 === 0 ? `T-${pts.length - i}h` : '');
    const speeds = pts.map(p => p.ground_speed || 0);
    _charts.speed = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: speeds,
          borderColor: animal.color,
          backgroundColor: animal.color + '18',
          borderWidth: 2, pointRadius: 0, fill: true, tension: 0.4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#8898a8', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
          y: { ticks: { color: '#8898a8', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' }, beginAtZero: true }
        },
        animation: { duration: 600 }
      }
    });
  }

  function toast(msg, type = 'info') {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.className = `toast ${type}`;
    t.textContent = msg;
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => t.classList.remove('show'), 3400);
  }

  function setMapLoading(show) {
    const el = document.getElementById('map-loading');
    if (el) el.style.display = show ? 'flex' : 'none';
  }

  function setLoaderProgress(pct, msg) {
    const fill = document.getElementById('loader-fill');
    if (fill) fill.style.width = pct + '%';
    if (msg) {
      const st = document.getElementById('loader-status');
      if (st) st.textContent = msg;
    }
  }

  return {
    renderAnimalList, setSelected, renderContinentFilters, setActiveContinent,
    updateStats, renderDetail, toast, setMapLoading, setLoaderProgress
  };
})();
