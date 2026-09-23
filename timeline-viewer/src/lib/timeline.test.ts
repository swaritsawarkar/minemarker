import { describe, expect, it } from 'vitest';
import { exportEditingNotes, exportMarkerCsv, formatTime, normalizeSession, toTimelineItems } from './timeline';
import { buildCreatorSuggestions, exportReviewCsv, exportSuggestionNotes } from './suggestions';
import type { MineMarkerExport } from '../types';

const sample: MineMarkerExport = {
  project: 'MineMarker',
  schema_version: '1.0',
  mod_version: '3.0.0',
  minecraft_version: '26.1.2',
  session: {
    id: 'sample',
    name: 'sample',
    started_at_local: '2026-05-04T15:30:00',
    stopped_at_local: '2026-05-04T15:40:00',
    duration_seconds: 600,
    video_offset_seconds: 2
  },
  markers: [
    {
      id: 1,
      type: 'manual',
      timestamp_seconds: 10,
      formatted_time: '00:00:10',
      adjusted_timestamp_seconds: 12,
      adjusted_formatted_time: '00:00:12',
      label: 'diamond_ore',
      note: 'note with spaces'
    }
  ],
  events: [
    {
      id: 1,
      type: 'player_state',
      timestamp_seconds: 5,
      formatted_time: '00:00:05',
      adjusted_timestamp_seconds: 7,
      adjusted_formatted_time: '00:00:07',
      event_key: 'low_health',
      importance: 'medium',
      label: 'Low health warning',
      details: { health: '5.0' }
    }
  ]
};

describe('timeline helpers', () => {
  it('formats timestamps', () => {
    expect(formatTime(145)).toBe('00:02:25');
    expect(formatTime(3601)).toBe('01:00:01');
  });

  it('normalizes MineMarker JSON', () => {
    expect(normalizeSession(sample).session.name).toBe('sample');
    expect(() => normalizeSession({ project: 'Other' })).toThrow();
  });

  it('rejects malformed numeric timeline fields before rendering', () => {
    expect(() => normalizeSession({ ...sample, session: { ...sample.session, duration_seconds: '600' } })).toThrow('Session duration');
    expect(() => normalizeSession({ ...sample, markers: [{ ...sample.markers[0], timestamp_seconds: -1 }] })).toThrow('Marker 1 timestamp');
    expect(() => normalizeSession({ ...sample, events: [{ ...sample.events[0], timestamp_seconds: Number.NaN }] })).toThrow('Event 1 timestamp');
    expect(() => normalizeSession({ ...sample, session: { ...sample.session, video_offset_seconds: Number.POSITIVE_INFINITY } })).toThrow('Session video offset');
  });

  it('combines markers and events by adjusted time', () => {
    const items = toTimelineItems(sample, 1);
    expect(items.map((item) => item.type)).toEqual(['low_health', 'manual']);
    expect(items[0].adjustedFormatted).toBe('00:00:06');
  });

  it('exports notes and csv', () => {
    const items = toTimelineItems(sample, 2);
    expect(exportEditingNotes(sample, items)).toContain('diamond_ore');
    expect(exportMarkerCsv(items)).toContain('note with spaces');
  });

  it('creates rule-based creator suggestions', () => {
    const items = toTimelineItems(sample, 2);
    const suggestions = buildCreatorSuggestions(items, 1200);
    expect(suggestions.some((suggestion) => suggestion.kind === 'clip_candidate' && suggestion.priority === 'high')).toBe(true);
    expect(suggestions.some((suggestion) => suggestion.kind === 'boring_gap')).toBe(true);
  });

  it('exports suggestion notes and review csv', () => {
    const items = toTimelineItems(sample, 2);
    const suggestions = buildCreatorSuggestions(items, 1200);
    expect(exportSuggestionNotes(sample, suggestions)).toContain('rule-based');
    expect(exportReviewCsv(items, suggestions)).toContain('clip_candidate');
  });
});
