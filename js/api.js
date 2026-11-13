// ============================================
// WILDTRACK — Movebank API Module
// ============================================

const API = (() => {
  let _user = null, _pass = null;

  // Encode credentials for Basic Auth
  function _auth() {
    return 'Basic ' + btoa(`${_user}:${_pass}`);
  }

  // Test login by fetching a small study list
  async function testLogin(username, password) {
    _user = username; _pass = password;
    const url = `${CONFIG.MOVEBANK_API}?entity_type=study&format=json&i_am_owner=false&license_type=CC_0`;
    try {
      const resp = await fetch(url, {
        headers: { 'Authorization': _auth() }
      });
      if (resp.status === 401) throw new Error('Invalid credentials');
      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
      return true;
    } catch (e) {
      throw e;
    }
  }

  // Fetch GPS events for a study
  async function fetchStudy(studyId, maxRows = CONFIG.MAX_POINTS) {
    const params = new URLSearchParams({
      entity_type: 'event',
      study_id: studyId,
      sensor_type_id: 653,   // GPS
      format: 'csv',
      max_events_per_individual: maxRows,
      attributes: 'individual_local_identifier,timestamp,location_lat,location_long,ground_speed,heading'
    });
    const url = `${CONFIG.MOVEBANK_API}?${params}`;
    const resp = await fetch(url, { headers: { 'Authorization': _auth() } });
    if (!resp.ok) throw new Error(`Failed to fetch study ${studyId}: ${resp.status}`);
    const text = await resp.text();
    return parseCSV(text);
  }

  // Parse CSV text → array of objects
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const vals = line.split(',');
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim().replace(/"/g, ''); });
      return obj;
    }).filter(r => r['location-lat'] && r['location-long']);
  }

  // Normalize raw Movebank row → standard format
  function normalizeRow(row, study) {
    return {
      timestamp: row['timestamp'] || row['study-local-timestamp'] || '',
      location_lat: parseFloat(row['location-lat'] || 0),
      location_long: parseFloat(row['location-long'] || 0),
      ground_speed: parseFloat(row['ground-speed'] || row['ground_speed'] || 0),
      heading: parseFloat(row['heading'] || 0),
      activity: inferActivity(parseFloat(row['ground-speed'] || 0)),
    };
  }

  function inferActivity(speed) {
    if (speed < 0.5) return 'resting';
    if (speed < 3) return 'walking';
    if (speed < 10) return 'hunting';
    return 'running';
  }

  return { testLogin, fetchStudy, normalizeRow };
})();
