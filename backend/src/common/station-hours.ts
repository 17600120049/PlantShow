export const FLEXIBLE_HOURS_LABEL = '无固定营业时间';

export type StationHoursMode = 'FIXED' | 'FLEXIBLE';

export type StationOpenStateInput = {
  hours: string;
  hoursMode: StationHoursMode;
  isActive: boolean;
};

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

/** 根据固定营业时间判断当前是否营业中 */
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

export function isFlexibleHoursMode(hoursMode?: StationHoursMode | string | null): boolean {
  return hoursMode === 'FLEXIBLE';
}

export function formatStationHoursDisplay(
  hours: string,
  hoursMode?: StationHoursMode | string | null,
): string {
  if (isFlexibleHoursMode(hoursMode)) {
    return FLEXIBLE_HOURS_LABEL;
  }
  return hours;
}

export function resolveStationIsActive(
  station: StationOpenStateInput,
  now = new Date(),
): boolean {
  if (isFlexibleHoursMode(station.hoursMode)) {
    return station.isActive;
  }
  return isStationOpenByHours(station.hours, now);
}

export function normalizeStationHoursInput(
  hoursMode: StationHoursMode,
  hours?: string,
): { hoursMode: StationHoursMode; hours: string } {
  if (isFlexibleHoursMode(hoursMode)) {
    return {
      hoursMode: 'FLEXIBLE',
      hours: FLEXIBLE_HOURS_LABEL,
    };
  }
  return {
    hoursMode: 'FIXED',
    hours: (hours || '').trim(),
  };
}
