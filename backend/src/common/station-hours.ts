function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + (minute || 0);
}

export function parseHoursRange(hours: string): { start: number; end: number } | null {
  const match = (hours || '').trim().match(/(\d{1,2}:\d{2})\s*[-–~至]\s*(\d{1,2}:\d{2})/);
  if (!match) {
    return null;
  }
  return {
    start: toMinutes(match[1]),
    end: toMinutes(match[2]),
  };
}

/** 根据营业时间判断当前是否营业中 */
export function isStationOpenByHours(hours: string, now = new Date()): boolean {
  const range = parseHoursRange(hours);
  if (!range) {
    return true;
  }

  const current = now.getHours() * 60 + now.getMinutes();
  if (range.start <= range.end) {
    return current >= range.start && current < range.end;
  }

  return current >= range.start || current < range.end;
}
