export interface Position {
  x: number | null;
  y: number | null;
  z: number | null;
}

export interface MineMarkerMarker {
  id: number;
  type: 'manual' | string;
  timestamp_seconds: number;
  formatted_time: string;
  adjusted_timestamp_seconds: number;
  adjusted_formatted_time: string;
  label: string;
  note: string;
  created_at_local?: string | null;
  position?: Position | null;
  dimension?: string | null;
  biome?: string | null;
  health?: number | null;
  hunger?: number | null;
}

export interface MineMarkerEvent {
  id: number;
  type: string;
  timestamp_seconds: number;
  formatted_time: string;
  adjusted_timestamp_seconds: number;
  adjusted_formatted_time: string;
  event_key: string;
  importance: 'high' | 'medium' | 'low' | string;
  label: string;
  details?: Record<string, string>;
  created_at_local?: string | null;
  position?: Position | null;
  dimension?: string | null;
  biome?: string | null;
  health?: number | null;
  hunger?: number | null;
}

export interface MineMarkerSession {
  id: string;
  name: string;
  world?: string | null;
  player?: string | null;
  started_at_local: string;
  stopped_at_local?: string | null;
  duration_seconds: number;
  video_offset_seconds: number;
  marker_count?: number;
}

export interface MineMarkerExport {
  project: string;
  schema_version: string;
  mod_version: string;
  minecraft_version: string;
  session: MineMarkerSession;
  markers: MineMarkerMarker[];
  events: MineMarkerEvent[];
}

export type TimelineKind = 'marker' | 'event';

export interface TimelineItem {
  key: string;
  kind: TimelineKind;
  id: number;
  label: string;
  note: string;
  type: string;
  timestamp: number;
  adjustedTimestamp: number;
  formatted: string;
  adjustedFormatted: string;
  importance: string;
  dimension?: string | null;
  position?: Position | null;
  source: MineMarkerMarker | MineMarkerEvent;
}
