// ============================================
// WILDTRACK v2 — Advanced AI Prediction Engine
// Combines: Bézier curves + Territory return
// + Circadian patterns + Kalman-inspired filter
// ============================================

const Prediction = (() => {

  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;

  function toRad(d) { return d * RAD; }
  function toDeg(r) { return r * DEG; }

  // ── Haversine distance (km) ─────────────────────────────────────────────
  function dist(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2)**2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // ── Bearing between two points ──────────────────────────────────────────
  function bearing(lat1, lng1, lat2, lng2) {
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δλ = toRad(lng2 - lng1);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  // ── Move a point by (km) in bearing direction ───────────────────────────
  function movePoint(lat, lng, distKm, bearingDeg) {
    const R = 6371;
    const δ = distKm / R;
    const θ = toRad(bearingDeg);
    const φ1 = toRad(lat), λ1 = toRad(lng);
    const φ2 = Math.asin(Math.sin(φ1)*Math.cos(δ) + Math.cos(φ1)*Math.sin(δ)*Math.cos(θ));
    const λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),
                                 Math.cos(δ) - Math.sin(φ1)*Math.sin(φ2));
    return { lat: toDeg(φ2), lng: ((toDeg(λ2) + 540) % 360) - 180 };
  }

  // ── METHOD 1: Weighted bearing (recent movement direction) ──────────────
  function weightedBearing(pts) {
    const n = Math.min(pts.length - 1, 8);
    let sinSum = 0, cosSum = 0, wTotal = 0;
    for (let i = pts.length - 1 - n; i < pts.length - 1; i++) {
      const w = i - (pts.length - 1 - n) + 1;
      const b = bearing(pts[i].location_lat, pts[i].location_long,
                        pts[i+1].location_lat, pts[i+1].location_long);
      sinSum += Math.sin(toRad(b)) * w;
      cosSum += Math.cos(toRad(b)) * w;
      wTotal += w;
    }
    return (toDeg(Math.atan2(sinSum / wTotal, cosSum / wTotal)) + 360) % 360;
  }

  // ── METHOD 2: Territory center (mean home range position) ───────────────
  function territoryCenter(pts) {
    const recent = pts.slice(-Math.min(pts.length, 60));
    const latMean = recent.reduce((s, p) => s + p.location_lat, 0) / recent.length;
    const lngMean = recent.reduce((s, p) => s + p.location_long, 0) / recent.length;
    return { lat: latMean, lng: lngMean };
  }

  // Bearing from current position toward territory center
  function territoryPull(pts) {
    const last = pts[pts.length - 1];
    const center = territoryCenter(pts);
    const d = dist(last.location_lat, last.location_long, center.lat, center.lng);
    const b = bearing(last.location_lat, last.location_long, center.lat, center.lng);
    // Pull strength: stronger when far from territory center
    const pullStrength = Math.min(d / 10, 1.0); // 0–1, maxes at 10km
    return { bearing: b, strength: pullStrength, distKm: d };
  }

  // ── METHOD 3: Circadian speed factor by hour ────────────────────────────
  // Each species has a typical activity profile by hour (0-23)
  const CIRCADIAN = {
    'Lion':             [0.2,0.2,0.3,0.4,0.5,0.4,0.3,0.2,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.2,0.3,0.5,0.8,1.0,1.0,0.9,0.6,0.3],
    'Cheetah':          [0.2,0.1,0.1,0.2,0.4,0.8,1.0,0.9,0.7,0.5,0.3,0.2,0.1,0.2,0.3,0.6,0.9,1.0,0.8,0.5,0.3,0.2,0.2,0.2],
    'Leopard':          [0.3,0.4,0.5,0.6,0.5,0.3,0.2,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.2,0.5,0.8,1.0,1.0,0.9,0.7,0.5,0.4],
    'African Elephant': [0.5,0.4,0.4,0.5,0.6,0.7,0.8,0.9,0.9,0.8,0.7,0.6,0.6,0.7,0.8,0.8,0.9,1.0,1.0,0.9,0.8,0.7,0.6,0.5],
    'Giraffe':          [0.4,0.3,0.3,0.4,0.6,0.8,1.0,0.9,0.7,0.5,0.3,0.2,0.2,0.3,0.5,0.7,0.9,1.0,0.8,0.6,0.5,0.5,0.4,0.4],
    'Bald Eagle':       [0.1,0.1,0.1,0.1,0.2,0.5,0.9,1.0,1.0,0.9,0.8,0.7,0.6,0.7,0.8,0.9,0.8,0.6,0.3,0.1,0.1,0.1,0.1,0.1],
    'Humpback Whale':   [0.7,0.7,0.7,0.7,0.7,0.8,0.9,1.0,1.0,1.0,0.9,0.8,0.8,0.8,0.9,1.0,1.0,0.9,0.8,0.8,0.8,0.7,0.7,0.7],
    'Polar Bear':       [0.4,0.4,0.4,0.5,0.7,0.9,1.0,1.0,0.9,0.8,0.7,0.6,0.5,0.6,0.7,0.8,0.9,0.9,0.8,0.7,0.6,0.5,0.4,0.4],
    'DEFAULT':          [0.5,0.5,0.5,0.5,0.6,0.7,0.8,0.9,1.0,1.0,0.9,0.8,0.7,0.7,0.8,0.9,1.0,1.0,0.9,0.8,0.7,0.6,0.5,0.5],
  };

  function circadianFactor(species) {
    const profile = CIRCADIAN[species] || CIRCADIAN['DEFAULT'];
    const hour = new Date().getHours();
    return profile[hour];
  }

  // ── METHOD 4: Kalman-inspired velocity smoothing ────────────────────────
  function kalmanSmooth(pts) {
    if (pts.length < 4) return { vLat: 0, vLng: 0, uncertainty: 1.0 };
    const n = Math.min(pts.length - 1, 12);
    let vLatSum = 0, vLngSum = 0, wTotal = 0;
    const velocities = [];
    for (let i = pts.length - 1 - n; i < pts.length - 1; i++) {
      const vLat = pts[i+1].location_lat - pts[i].location_lat;
      const vLng = pts[i+1].location_long - pts[i].location_long;
      velocities.push({ vLat, vLng });
    }
    // Exponential weighting
    velocities.forEach((v, i) => {
      const w = Math.exp(0.3 * i);
      vLatSum += v.vLat * w;
      vLngSum += v.vLng * w;
      wTotal += w;
    });
    const vLat = vLatSum / wTotal;
    const vLng = vLngSum / wTotal;

    // Variance of velocities → uncertainty estimate
    const varLat = velocities.reduce((s, v) => s + (v.vLat - vLat)**2, 0) / velocities.length;
    const varLng = velocities.reduce((s, v) => s + (v.vLng - vLng)**2, 0) / velocities.length;
    const uncertainty = Math.min(1.0, Math.sqrt(varLat + varLng) * 200);

    return { vLat, vLng, uncertainty };
  }

  // ── MAIN PREDICT: Combines all 4 methods ────────────────────────────────
  function predict(animal, steps = CONFIG.PREDICT_STEPS) {
    const pts = animal.points;
    if (pts.length < 4) return { points: [], confidence: 0 };

    const species = animal.species || 'DEFAULT';

    // Base speed
    const recentSpeeds = pts.slice(-12).map(p => p.ground_speed || 0).filter(s => s > 0);
    const avgSpeed = recentSpeeds.length
      ? recentSpeeds.reduce((a,b) => a+b, 0) / recentSpeeds.length : 3;

    // Method 1: direction
    const dir1 = weightedBearing(pts);

    // Method 2: territory pull
    const pull = territoryPull(pts);
    const pullFactor = pull.strength * 0.35; // max 35% pull toward territory

    // Method 3: circadian factor
    const cFactor = circadianFactor(species);

    // Method 4: Kalman velocity
    const kalman = kalmanSmooth(pts);

    // Blend direction: mostly inertia, partially territory
    function blendAngle(a1, a2, t) {
      const sin = Math.sin(toRad(a1)) * (1-t) + Math.sin(toRad(a2)) * t;
      const cos = Math.cos(toRad(a1)) * (1-t) + Math.cos(toRad(a2)) * t;
      return (toDeg(Math.atan2(sin, cos)) + 360) % 360;
    }
    const blendedDir = blendAngle(dir1, pull.bearing, pullFactor);

    // Speed adjusted by circadian factor
    const stepDist = Math.max(avgSpeed * cFactor * 0.95, 0.2);

    const last = pts[pts.length - 1];
    let curLat = last.location_lat, curLng = last.location_long;
    const predicted = [];

    // Generate Bézier-like curved path using a control point
    // Control point: push perpendicular to blend direction for natural curve
    const perpDir = (blendedDir + 90) % 360;
    const curveAmp = stepDist * steps * 0.15 * (Math.random() > 0.5 ? 1 : -1);
    const cpDist = (steps / 2) * stepDist;
    const cp = movePoint(curLat, curLng, cpDist, blendedDir);
    // Offset control point perpendicular
    const cpBezier = movePoint(cp.lat, cp.lng, curveAmp, perpDir);

    // Uncertainty ellipse grows with each step
    const baseUncertainty = kalman.uncertainty;

    for (let i = 0; i < steps; i++) {
      const t = (i + 1) / steps;
      // Quadratic Bézier interpolation
      const bLat = (1-t)**2 * curLat   + 2*(1-t)*t * cpBezier.lat + t**2 * (curLat + (cpDist * 2 / 6371) * DEG * Math.cos(toRad(blendedDir)));
      const bLng = (1-t)**2 * curLng   + 2*(1-t)*t * cpBezier.lng + t**2 * (curLng + (cpDist * 2 / 6371) * DEG * Math.sin(toRad(blendedDir)));

      // Apply Kalman velocity at each step (reduces over time)
      const kalmanWeight = Math.max(0, 1 - t * 0.5);
      const fLat = bLat + kalman.vLat * (i+1) * kalmanWeight * 0.3;
      const fLng = bLng + kalman.vLng * (i+1) * kalmanWeight * 0.3;

      // Growing uncertainty radius (km)
      const uncertaintyKm = baseUncertainty * stepDist * (i + 1) * 0.4;

      predicted.push({
        lat: +fLat.toFixed(5),
        lng: +fLng.toFixed(5),
        step: i + 1,
        uncertaintyKm: +uncertaintyKm.toFixed(2)
      });
    }

    // Confidence: combines speed consistency + circadian activity level
    const speedVariance = recentSpeeds.length > 2
      ? recentSpeeds.reduce((a, b) => a + (b - avgSpeed)**2, 0) / recentSpeeds.length : 999;
    const baseConf = Math.max(15, Math.min(92, 92 - speedVariance * 1.5));
    const confidence = +(baseConf * (0.6 + cFactor * 0.4)).toFixed(0);

    const dirLabel = dir1 < 22.5 ? 'N' : dir1 < 67.5 ? 'NE' : dir1 < 112.5 ? 'E' :
                     dir1 < 157.5 ? 'SE' : dir1 < 202.5 ? 'S' : dir1 < 247.5 ? 'SW' :
                     dir1 < 292.5 ? 'W' : 'NW';

    return {
      points: predicted,
      confidence: Math.max(10, Math.min(95, confidence)),
      direction: dirLabel,
      dirDegrees: +dir1.toFixed(0),
      estimatedSpeed: +(stepDist).toFixed(1),
      estimatedDist: +(stepDist * steps).toFixed(1),
      circadianFactor: +cFactor.toFixed(2),
      territoryPullKm: +pull.distKm.toFixed(1),
      kalmanUncertainty: +kalman.uncertainty.toFixed(2),
      method: 'Bézier + Territory + Circadian + Kalman',
    };
  }

  return { predict };
})();
