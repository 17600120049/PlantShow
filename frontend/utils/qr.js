const PREFIX = 'plantwander://';

function parseQrResult(raw) {
  if (!raw || typeof raw !== 'string') {
    return { type: 'unknown', raw: raw || '' };
  }

  const text = raw.trim();

  if (text.indexOf(PREFIX) === 0) {
    const path = text.slice(PREFIX.length);
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return {
        type: parts[0],
        id: parts[1],
        raw: text
      };
    }
  }

  try {
    const json = JSON.parse(text);
    if (json.type && json.id) {
      return { type: json.type, id: String(json.id), raw: text };
    }
    if (json.type === 'plant' && json.code) {
      return { type: 'plant', id: String(json.code), raw: text };
    }
  } catch (e) {
    // not JSON
  }

  if (/^PW-/i.test(text)) {
    return { type: 'plant', id: text.toUpperCase(), raw: text };
  }

  if (/^\d+$/.test(text)) {
    return { type: 'station', id: text, raw: text };
  }

  return { type: 'unknown', raw: text };
}

function buildPlantQr(plantCode) {
  return PREFIX + 'plant/' + plantCode;
}

function buildStationQr(stationId) {
  return PREFIX + 'station/' + stationId;
}

module.exports = {
  PREFIX,
  parseQrResult,
  buildPlantQr,
  buildStationQr
};
