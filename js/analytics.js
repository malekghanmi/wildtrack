// ============================================
// WILDTRACK — Analytics Module
// ============================================

const Analytics = (() => {

  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function compute(animal) {
    const pts = animal.points;
    if (!pts || pts.length === 0) return {};

    // Speed stats
    const speeds = pts.map(p => p.ground_speed || 0).filter(s => s > 0);
    const avgSpeed = speeds.length ? speeds.reduce((a,b) => a+b, 0) / speeds.length : 0;
    const maxSpeed = speeds.length ? Math.max(...speeds) : 0;

    // Total distance
    let totalDist = 0;
    for (let i = 1; i < pts.length; i++) {
      totalDist += haversine(pts[i-1].location_lat, pts[i-1].location_long,
                             pts[i].location_lat, pts[i].location_long);
    }

    // Activity breakdown
    const actCounts = {};
    pts.forEach(p => { actCounts[p.activity] = (actCounts[p.activity] || 0) + 1; });

    // Speed by hour of day
    const byHour = Array(24).fill(null).map(() => ({ sum: 0, count: 0 }));
    pts.forEach(p => {
      const h = p.timestamp ? new Date(p.timestamp).getHours() : null;
      if (h !== null && p.ground_speed) {
        byHour[h].sum += p.ground_speed;
        byHour[h].count++;
      }
    });
    const speedByHour = byHour.map(b => b.count ? +(b.sum / b.count).toFixed(2) : 0);

    // Last position
    const last = pts[pts.length - 1];
    const currentSpeed = last.ground_speed || 0;
    const currentActivity = last.activity || 'unknown';

    // Home range (bounding box area approx)
    const lats = pts.map(p => p.location_lat);
    const lngs = pts.map(p => p.location_long);
    const rangeKm2 = haversine(Math.min(...lats), Math.min(...lngs),
                                Math.max(...lats), Math.max(...lngs));

    return {
      avgSpeed: +avgSpeed.toFixed(1),
      maxSpeed: +maxSpeed.toFixed(1),
      totalDist: +totalDist.toFixed(1),
      pointCount: pts.length,
      actCounts,
      speedByHour,
      currentSpeed: +currentSpeed.toFixed(1),
      currentActivity,
      lastLat: last.location_lat,
      lastLng: last.location_long,
      lastTimestamp: last.timestamp,
      rangeKm2: +rangeKm2.toFixed(0),
    };
  }

  return { compute, haversine };
})();
