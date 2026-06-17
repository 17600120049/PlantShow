function toMinutes(time) {
  const parts = time.split(':');
  return Number(parts[0]) * 60 + (Number(parts[1]) || 0);
}

function parseHoursRange(hours) {
  const match = (hours || '').trim().match(/(\d{1,2}:\d{2})\s*[-–~至]\s*(\d{1,2}:\d{2})/);
  if (!match) {
    return null;
  }
  return {
    start: toMinutes(match[1]),
    end: toMinutes(match[2])
  };
}

function isStationOpenByHours(hours, now) {
  const range = parseHoursRange(hours);
  if (!range) {
    return true;
  }

  const date = now || new Date();
  const current = date.getHours() * 60 + date.getMinutes();

  if (range.start <= range.end) {
    return current >= range.start && current < range.end;
  }

  return current >= range.start || current < range.end;
}

function withStationOpenStatus(station) {
  return Object.assign({}, station, {
    isActive: isStationOpenByHours(station.hours)
  });
}

module.exports = {
  isStationOpenByHours,
  withStationOpenStatus
};
