import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileJson,
  Filter,
  FolderOpen,
  Gauge,
  Gem,
  HardDriveDownload,
  Lightbulb,
  ListFilter,
  Play,
  RefreshCw,
  Scissors,
  Skull,
  Upload,
  Video
} from 'lucide-react';
import type { CreatorSuggestion, DesktopModStatus, MineMarkerExport, TimelineItem } from './types';
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

type InstallState = {
  status: DesktopModStatus | null;
  loading: boolean;
  message: string;
  error: string | null;
};

type SessionLoadState = {
  loading: boolean;
  message: string;
  error: string | null;
  latestPath: string | null;
};

export function App() {
  const [session, setSession] = useState<MineMarkerExport>(fallbackSession);
  const [jsonName, setJsonName] = useState('example-session.json');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('No video loaded');
  const [offset, setOffset] = useState(fallbackSession.session.video_offset_seconds);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedKey, setSelectedKey] = useState<string>('marker-1');
  const [error, setError] = useState<string | null>(null);
  const [installState, setInstallState] = useState<InstallState>({
    status: null,
    loading: false,
    message: window.mineMarkerDesktop ? 'Checking Minecraft install...' : 'Desktop installer is available in the portable app.',
    error: null
  });
  const [sessionLoadState, setSessionLoadState] = useState<SessionLoadState>({
    loading: false,
    message: window.mineMarkerDesktop ? 'Load the newest session after you stop recording.' : 'Use custom session loading in the web viewer.',
    error: null,
    latestPath: null
  });
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

  useEffect(() => {
    void refreshModStatus();
  }, []);

  async function refreshModStatus() {
    if (!window.mineMarkerDesktop) {
      setInstallState((current) => ({
        ...current,
        loading: false,
        message: 'Run the Windows .exe to install the Minecraft mod automatically.',
        error: null
      }));
      return;
    }

    setInstallState((current) => ({ ...current, loading: true, error: null }));
    try {
      const status = await window.mineMarkerDesktop.getModStatus();
      setInstallState({
        status,
        loading: false,
        message: status.installed ? 'MineMarker mod is installed.' : 'MineMarker mod is ready to install.',
        error: status.bundled ? null : 'Bundled mod jar is missing from this app build.'
      });
    } catch (reason) {
      setInstallState({
        status: null,
        loading: false,
        message: 'Could not check the Minecraft mods folder.',
        error: reason instanceof Error ? reason.message : 'Unknown installer error.'
      });
    }
  }

  async function installMod() {
    if (!window.mineMarkerDesktop) {
      setInstallState((current) => ({
        ...current,
        message: 'Automatic install only works in the Windows .exe.',
        error: null
      }));
      return;
    }

    setInstallState((current) => ({ ...current, loading: true, error: null }));
    try {
      const status = await window.mineMarkerDesktop.installMod();
      setInstallState({
        status,
        loading: false,
        message: status.message || 'MineMarker mod installed.',
        error: null
      });
    } catch (reason) {
      setInstallState((current) => ({
        ...current,
        loading: false,
        message: 'Install failed.',
        error: reason instanceof Error ? reason.message : 'Unknown installer error.'
      }));
    }
  }

  async function openModsFolder() {
    if (!window.mineMarkerDesktop) return;
    await window.mineMarkerDesktop.openModsFolder();
  }

  function handleJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    file.text()
      .then((text) => {
        loadSessionText(text, file.name);
        setError(null);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load JSON file.'));
  }

  function loadSessionText(text: string, sourceName: string, sourcePath?: string) {
    const parsed = normalizeSession(JSON.parse(text));
    setSession(parsed);
    setJsonName(sourceName);
    setOffset(parsed.session.video_offset_seconds || 0);
    setSelectedKey(parsed.markers[0] ? `marker-${parsed.markers[0].id}` : parsed.events[0] ? `event-${parsed.events[0].id}` : '');
    setSessionLoadState({
      loading: false,
      message: `Loaded ${parsed.session.name}`,
      error: null,
      latestPath: sourcePath || null
    });
  }

  async function loadLatestSession() {
    if (!window.mineMarkerDesktop) {
      setSessionLoadState({
        loading: false,
        message: 'Load Last Session works in the Windows .exe.',
        error: null,
        latestPath: null
      });
      return;
    }

    setSessionLoadState((current) => ({ ...current, loading: true, error: null }));
    try {
      const latest = await window.mineMarkerDesktop.getLatestSession();
      if (!latest.found || !latest.content) {
        setSessionLoadState({
          loading: false,
          message: `No MineMarker session found in ${latest.sessionsDirectory}`,
          error: null,
          latestPath: null
        });
        return;
      }

      loadSessionText(latest.content, latest.sessionId || 'latest-session.json', latest.sessionPath);
    } catch (reason) {
      setSessionLoadState((current) => ({
        ...current,
        loading: false,
        message: 'Could not load the latest session.',
        error: reason instanceof Error ? reason.message : 'Unknown latest session error.'
      }));
    }
  }

  async function openSessionsFolder() {
    if (!window.mineMarkerDesktop) return;
    await window.mineMarkerDesktop.openSessionsFolder();
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
    downloadTextFile('editing_notes.txt', exportEditingNotes(session, filteredItems, offset), 'text/plain;charset=utf-8');
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
            <p>Creator Timeline OS</p>
          </div>
        </div>

        <section className="panel stack sync-panel setup-panel">
          <div className="section-heading">
            <h2>Setup</h2>
            {installState.status?.installed ? <CheckCircle2 size={16} /> : <HardDriveDownload size={16} />}
          </div>
          <button className="primary-install" disabled={installState.loading || !window.mineMarkerDesktop} onClick={installMod}>
            {installState.loading ? <RefreshCw size={17} /> : installState.status?.installed ? <CheckCircle2 size={17} /> : <HardDriveDownload size={17} />}
            {installState.status?.installed ? 'Reinstall Fabric Mod' : 'Install Minecraft Mod'}
          </button>
          <div className={installState.error ? 'install-status error-status' : 'install-status'}>
            {installState.error ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            <span>{installState.error || installState.message}</span>
          </div>
          {installState.status?.modsDirectory && (
            <button className="text-action" onClick={openModsFolder}>
              <FolderOpen size={15} />
              Open mods folder
            </button>
          )}
          <ol className="sync-steps">
            <li>Click install once. The app copies the mod into `.minecraft/mods`.</li>
            <li>Run `/minemarker start`, add markers, then `/minemarker stop`.</li>
            <li>Load the exported `session.json` and your OBS video here.</li>
          </ol>
        </section>

        <section className="panel stack">
          <h2>Session Files</h2>
          <button className="file-control load-last-control" disabled={sessionLoadState.loading || !window.mineMarkerDesktop} onClick={loadLatestSession}>
            <RefreshCw size={18} />
            <span>{sessionLoadState.loading ? 'Loading Latest Session' : 'Load Last Session'}</span>
          </button>
          <label className="file-control">
            <FileJson size={18} />
            <span>Load Custom Session</span>
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
          <div className={sessionLoadState.error ? 'install-status error-status' : 'install-status session-status'}>
            {sessionLoadState.error ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            <span>{sessionLoadState.error || sessionLoadState.message}</span>
          </div>
          {window.mineMarkerDesktop && (
            <button className="text-action" onClick={openSessionsFolder}>
              <FolderOpen size={15} />
              Open sessions folder
            </button>
          )}
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
