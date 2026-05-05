import { ChangeEvent, useMemo, useRef, useState } from 'react';
import {
  Clock,
  Download,
  FileJson,
  Filter,
  Gauge,
  Gem,
  Lightbulb,
  ListFilter,
  Play,
  Scissors,
  Skull,
  Upload,
  Video
} from 'lucide-react';
import type { CreatorSuggestion, MineMarkerExport, TimelineItem } from './types';
import { downloadTextFile } from './lib/download';
import { buildCreatorSuggestions, exportReviewCsv, exportSuggestionNotes } from './lib/suggestions';
import { exportEditingNotes, exportMarkerCsv, formatTime, normalizeSession, toTimelineItems } from './lib/timeline';

const fallbackSession: MineMarkerExport = {
  project: 'MineMarker',
  schema_version: '1.0',
  mod_version: '2.0.0',
  minecraft_version: '26.1.2',
  session: {
    id: 'demo',
    name: 'demo-session',
    world: 'Example World',
    player: 'Creator',
    started_at_local: '2026-05-04T15:30:00',
    stopped_at_local: '2026-05-04T16:25:12',
    duration_seconds: 3312,
    video_offset_seconds: 0,
    marker_count: 2
  },
  markers: [
    {
      id: 1,
      type: 'manual',
      timestamp_seconds: 145,
      formatted_time: '00:02:25',
      adjusted_timestamp_seconds: 145,
      adjusted_formatted_time: '00:02:25',
      label: 'diamond_ore',
      note: 'found diamonds near lava',
      created_at_local: '2026-05-04T15:32:25',
      position: { x: 120, y: -54, z: 302 },
      dimension: 'minecraft:overworld',
      biome: null,
      health: 20,
      hunger: 18
    },
    {
      id: 2,
      type: 'manual',
      timestamp_seconds: 487,
      formatted_time: '00:08:07',
      adjusted_timestamp_seconds: 487,
      adjusted_formatted_time: '00:08:07',
      label: 'funny_moment',
      note: 'creeper jumpscare',
      created_at_local: '2026-05-04T15:38:07',
      position: { x: 98, y: 64, z: 241 },
      dimension: 'minecraft:overworld',
      biome: null,
      health: 14,
      hunger: 17
    }
  ],
  events: [
    {
      id: 1,
      type: 'dimension_change',
      timestamp_seconds: 621,
      formatted_time: '00:10:21',
      adjusted_timestamp_seconds: 621,
      adjusted_formatted_time: '00:10:21',
      event_key: 'dimension_changed',
      importance: 'high',
      label: 'Dimension changed',
      details: { from: 'minecraft:overworld', to: 'minecraft:the_nether' },
      created_at_local: '2026-05-04T15:40:21',
      position: { x: 14, y: 72, z: -8 },
      dimension: 'minecraft:the_nether',
      biome: null,
      health: 20,
      hunger: 18
    },
    {
      id: 2,
      type: 'player_state',
      timestamp_seconds: 990,
      formatted_time: '00:16:30',
      adjusted_timestamp_seconds: 990,
      adjusted_formatted_time: '00:16:30',
      event_key: 'low_health',
      importance: 'medium',
      label: 'Low health warning',
      details: { health: '5.0', threshold: '6.0' },
      created_at_local: '2026-05-04T15:46:30',
      position: { x: 33, y: 65, z: -41 },
      dimension: 'minecraft:the_nether',
      biome: null,
      health: 5,
      hunger: 12
    }
  ]
};

type FilterMode = 'all' | 'markers' | 'events' | 'high';

export function App() {
  const [session, setSession] = useState<MineMarkerExport>(fallbackSession);
  const [jsonName, setJsonName] = useState('example-session.json');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('No video loaded');
  const [offset, setOffset] = useState(fallbackSession.session.video_offset_seconds);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedKey, setSelectedKey] = useState<string>('marker-1');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const timelineItems = useMemo(() => toTimelineItems(session, offset), [session, offset]);
  const duration = Math.max(session.session.duration_seconds || 1, ...timelineItems.map((item) => item.adjustedTimestamp), 1);
  const suggestions = useMemo(() => buildCreatorSuggestions(timelineItems, duration), [duration, timelineItems]);
  const filteredItems = useMemo(() => {
    return timelineItems.filter((item) => {
      if (filter === 'markers') return item.kind === 'marker';
      if (filter === 'events') return item.kind === 'event';
      if (filter === 'high') return item.importance === 'high' || /death|diamond|debris|dimension|low_health/.test(`${item.type} ${item.label}`.toLowerCase());
      return true;
    });
  }, [filter, timelineItems]);
  const selected = filteredItems.find((item) => item.key === selectedKey) || filteredItems[0] || timelineItems[0];

  function handleJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    file.text()
      .then((text) => {
        const parsed = normalizeSession(JSON.parse(text));
        setSession(parsed);
        setJsonName(file.name);
        setOffset(parsed.session.video_offset_seconds || 0);
        setSelectedKey(parsed.markers[0] ? `marker-${parsed.markers[0].id}` : parsed.events[0] ? `event-${parsed.events[0].id}` : '');
        setError(null);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load JSON file.'));
  }

  function handleVideo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));
    setVideoName(file.name);
  }

  function jumpTo(item: TimelineItem) {
    setSelectedKey(item.key);
    jumpToSeconds(item.adjustedTimestamp);
  }

  function jumpToSeconds(seconds: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, seconds);
      void videoRef.current.play().catch(() => undefined);
    }
  }

  function jumpToSuggestion(suggestion: CreatorSuggestion) {
    const sourceItem = timelineItems.find((item) => suggestion.sourceKeys.includes(item.key));
    if (sourceItem) {
      jumpTo(sourceItem);
      return;
    }
    jumpToSeconds(suggestion.startSeconds);
  }

  function exportNotes() {
    downloadTextFile('editing_notes.txt', exportEditingNotes(session, filteredItems), 'text/plain;charset=utf-8');
  }

  function exportCsv() {
    downloadTextFile('editing_markers.csv', exportMarkerCsv(filteredItems), 'text/csv;charset=utf-8');
  }

  function exportSuggestions() {
    downloadTextFile('editing_suggestions.txt', exportSuggestionNotes(session, suggestions), 'text/plain;charset=utf-8');
  }

  function exportReview() {
    downloadTextFile('editor_review.csv', exportReviewCsv(timelineItems, suggestions), 'text/csv;charset=utf-8');
  }

  return (
    <main className="app-shell">
      <aside className="sidebar left-panel">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <h1>MineMarker</h1>
            <p>Timeline Viewer</p>
          </div>
        </div>

        <section className="panel stack">
          <h2>Session Files</h2>
          <label className="file-control">
            <FileJson size={18} />
            <span>Load JSON</span>
            <input type="file" accept="application/json,.json" onChange={handleJson} />
          </label>
          <label className="file-control">
            <Video size={18} />
            <span>Load Video</span>
            <input type="file" accept="video/*" onChange={handleVideo} />
          </label>
          <div className="file-meta">
            <strong>{jsonName}</strong>
            <span>{videoName}</span>
          </div>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel stack">
          <div className="section-heading">
            <h2>Offset</h2>
            <Clock size={16} />
          </div>
          <label className="offset-control">
            <span>Seconds</span>
            <input value={offset} type="number" step="0.1" onChange={(event) => setOffset(Number(event.target.value) || 0)} />
          </label>
          <p className="hint">Adjusted timestamps update the timeline and video jumps.</p>
        </section>

        <section className="panel stack">
          <div className="section-heading">
            <h2>Filters</h2>
            <Filter size={16} />
          </div>
          <div className="segmented">
            {(['all', 'markers', 'events', 'high'] as FilterMode[]).map((mode) => (
              <button key={mode} className={filter === mode ? 'active' : ''} onClick={() => setFilter(mode)}>
                {mode}
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{session.session.world || 'Unknown world'}</p>
            <h2>{session.session.name}</h2>
          </div>
          <div className="stats">
            <span>{session.markers.length} markers</span>
            <span>{session.events.length} events</span>
            <span>{suggestions.length} suggestions</span>
            <span>{formatTime(session.session.duration_seconds)}</span>
          </div>
        </header>

        <section className="video-stage">
          {videoUrl ? (
            <video ref={videoRef} src={videoUrl} controls />
          ) : (
            <div className="empty-video">
              <Upload size={42} />
              <strong>Load a local video to sync playback</strong>
              <span>The timeline still works with the example MineMarker JSON.</span>
            </div>
          )}
        </section>

        <section className="timeline-panel">
          <div className="timeline-header">
            <div>
              <h2>Editing Timeline</h2>
              <p>{filteredItems.length} visible timeline items</p>
            </div>
            <div className="timeline-legend">
              <span className="legend manual">Manual</span>
              <span className="legend event">Event</span>
              <span className="legend high">High</span>
            </div>
          </div>
          <div className="timeline-track" aria-label="MineMarker timeline">
            {filteredItems.map((item) => (
              <button
                key={item.key}
                className={`tick ${item.kind} ${item.importance} ${selected?.key === item.key ? 'selected' : ''}`}
                style={{ left: `${Math.min(100, (item.adjustedTimestamp / duration) * 100)}%` }}
                onClick={() => jumpTo(item)}
                title={`${item.adjustedFormatted} ${item.label}`}
              >
                <span>{item.adjustedFormatted}</span>
              </button>
            ))}
          </div>
          <div className="time-scale">
            <span>00:00:00</span>
            <span>{formatTime(duration / 2)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </section>
      </section>

      <aside className="sidebar right-panel">
        <section className="panel selected-panel">
          <div className="section-heading">
            <h2>Selected</h2>
            <Gauge size={16} />
          </div>
          {selected ? (
            <>
              <div className={`selected-badge ${selected.kind}`}>{selected.kind}</div>
              <h3>{selected.label}</h3>
              <p className="selected-time">{selected.adjustedFormatted}</p>
              <p>{selected.note || 'No note'}</p>
              <dl>
                <dt>Type</dt>
                <dd>{selected.type}</dd>
                <dt>Dimension</dt>
                <dd>{selected.dimension || 'unknown'}</dd>
                <dt>Position</dt>
                <dd>{positionLabel(selected.position)}</dd>
              </dl>
            </>
          ) : (
            <p>No timeline item selected.</p>
          )}
        </section>

        <section className="panel event-list">
          <div className="section-heading">
            <h2>Markers & Events</h2>
            <ListFilter size={16} />
          </div>
          <div className="rows">
            {filteredItems.map((item) => (
              <button key={item.key} className={selected?.key === item.key ? 'row active' : 'row'} onClick={() => jumpTo(item)}>
                <span className={`row-icon ${item.kind}`}>{iconFor(item)}</span>
                <span>
                  <strong>{item.label}</strong>
                  <em>{item.adjustedFormatted} - {item.type}</em>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel suggestion-list">
          <div className="section-heading">
            <h2>Suggestions</h2>
            <Lightbulb size={16} />
          </div>
          <div className="rows suggestion-rows">
            {suggestions.length > 0 ? (
              suggestions.slice(0, 7).map((suggestion) => (
                <button key={suggestion.key} className={`row suggestion-row ${suggestion.priority}`} onClick={() => jumpToSuggestion(suggestion)}>
                  <span className={`row-icon ${suggestion.priority}`}>
                    <Scissors size={15} />
                  </span>
                  <span>
                    <strong>{suggestion.title}</strong>
                    <em>{suggestionRange(suggestion)} - {suggestion.kind.replace('_', ' ')}</em>
                  </span>
                </button>
              ))
            ) : (
              <p className="hint">No suggestions generated.</p>
            )}
          </div>
        </section>

        <section className="export-bar">
          <button onClick={exportNotes}>
            <Download size={17} />
            Export Notes
          </button>
          <button onClick={exportCsv}>
            <Download size={17} />
            Export CSV
          </button>
          <button onClick={exportSuggestions}>
            <Download size={17} />
            Suggestions
          </button>
          <button onClick={exportReview}>
            <Download size={17} />
            Review CSV
          </button>
        </section>
      </aside>
    </main>
  );
}

function positionLabel(position?: { x: number | null; y: number | null; z: number | null } | null): string {
  if (!position || position.x === null || position.y === null || position.z === null) {
    return 'unknown';
  }
  return `x=${position.x} y=${position.y} z=${position.z}`;
}

function iconFor(item: TimelineItem) {
  if (/diamond|debris/.test(item.type)) return <Gem size={15} />;
  if (/death/.test(item.type)) return <Skull size={15} />;
  if (item.kind === 'event') return <Gauge size={15} />;
  return <Play size={15} />;
}

function suggestionRange(suggestion: CreatorSuggestion): string {
  if (suggestion.formattedEnd) {
    return `${suggestion.formattedStart}-${suggestion.formattedEnd}`;
  }
  return suggestion.formattedStart;
}
