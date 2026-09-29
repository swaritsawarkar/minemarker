import type { MineMarkerExport, TimelineItem } from '../types';

export function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return [hours, minutes, remaining].map((value) => value.toString().padStart(2, '0')).join(':');
}

export function normalizeSession(data: unknown): MineMarkerExport {
  if (!data || typeof data !== 'object') {
    throw new Error('MineMarker JSON must be an object.');
  }

  const candidate = data as MineMarkerExport;
  if (candidate.project !== 'MineMarker') {
    throw new Error('This does not look like a MineMarker export.');
  }
  if (!candidate.session || !Array.isArray(candidate.markers) || !Array.isArray(candidate.events)) {
    throw new Error('MineMarker export is missing session, markers, or events.');
  }
  assertFiniteNumber(candidate.session.duration_seconds, 'Session duration', false);
  assertFiniteNumber(candidate.session.video_offset_seconds, 'Session video offset', true);
  candidate.markers.forEach((marker, index) => assertFiniteNumber(marker.timestamp_seconds, `Marker ${index + 1} timestamp`, false));
  candidate.events.forEach((event, index) => assertFiniteNumber(event.timestamp_seconds, `Event ${index + 1} timestamp`, false));

  return candidate;
}

function assertFiniteNumber(value: unknown, label: string, allowNegative: boolean): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || (!allowNegative && value < 0)) {
    const range = allowNegative ? 'a finite number' : 'a finite non-negative number';
    throw new Error(`${label} must be ${range}.`);
  }
}

export function toTimelineItems(data: MineMarkerExport, overrideOffset: number): TimelineItem[] {
  const markerItems = data.markers.map((marker): TimelineItem => {
    const adjusted = Math.max(0, marker.timestamp_seconds + overrideOffset);
    return {
      key: `marker-${marker.id}`,
      kind: 'marker',
      id: marker.id,
      label: marker.label,
      note: marker.note || '',
      type: marker.type,
      timestamp: marker.timestamp_seconds,
      adjustedTimestamp: adjusted,
      formatted: marker.formatted_time || formatTime(marker.timestamp_seconds),
      adjustedFormatted: formatTime(adjusted),
      importance: 'manual',
      dimension: marker.dimension,
      position: marker.position,
      source: marker
    };
  });

  const eventItems = data.events.map((event): TimelineItem => {
    const adjusted = Math.max(0, event.timestamp_seconds + overrideOffset);
    return {
      key: `event-${event.id}`,
      kind: 'event',
      id: event.id,
      label: event.label,
      note: event.details ? Object.entries(event.details).map(([key, value]) => `${key}: ${value}`).join(', ') : '',
      type: event.event_key,
      timestamp: event.timestamp_seconds,
      adjustedTimestamp: adjusted,
      formatted: event.formatted_time || formatTime(event.timestamp_seconds),
      adjustedFormatted: formatTime(adjusted),
      importance: event.importance || 'normal',
      dimension: event.dimension,
      position: event.position,
      source: event
    };
  });

  return [...markerItems, ...eventItems].sort((a, b) => a.adjustedTimestamp - b.adjustedTimestamp);
}

export function exportEditingNotes(session: MineMarkerExport, items: TimelineItem[], videoOffsetSeconds: number): string {
  const lines = [
    `MineMarker Editing Notes: ${session.session.name}`,
    `World: ${session.session.world || 'unknown'}`,
    `Player: ${session.session.player || 'unknown'}`,
    `Duration: ${formatTime(session.session.duration_seconds)}`,
    `Video Offset: ${videoOffsetSeconds} seconds`,
    '',
    'Timeline:'
  ];

  for (const item of items) {
    lines.push(`${item.adjustedFormatted} | ${item.kind} | ${item.type} | ${item.label}${item.note ? ` | ${item.note}` : ''}`);
  }

  return `${lines.join('\n')}\n`;
}

export function exportMarkerCsv(items: TimelineItem[]): string {
  const rows = [
    ['id', 'kind', 'type', 'adjusted_timestamp_seconds', 'adjusted_time', 'label', 'note', 'importance', 'dimension']
  ];

  for (const item of items) {
    rows.push([
      String(item.id),
      item.kind,
      item.type,
      String(Math.round(item.adjustedTimestamp * 1000) / 1000),
      item.adjustedFormatted,
      item.label,
      item.note,
      item.importance,
      item.dimension || ''
    ]);
  }

  return rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
