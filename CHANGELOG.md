# Changelog

## v4.0.0 - Creator Export Workflow

Added:
- Rule-based creator suggestions in the timeline viewer.
- Clip candidate suggestions for deaths, diamonds, ancient debris, dimension changes, low health, and similar high-impact moments.
- Timelapse candidate suggestions for build/mining style manual markers.
- Quiet-section suggestions for long gaps without MineMarker markers or events.
- Export `editing_suggestions.txt`.
- Export `editor_review.csv` for spreadsheet-based edit review.
- Example V4 suggestion and review exports.

Not added:
- AI attention analysis.
- Verified direct Premiere, DaVinci Resolve, or Final Cut marker import.
- OBS sync automation.
- Packaged portable `.exe`.

## v3.0.0 - Local Timeline Viewer

Added:
- React + Vite local timeline viewer.
- Local `session.json` loading.
- Local video file loading.
- Timeline ticks for markers and events.
- Click marker/event to jump video playback.
- Offset input for manual video sync.
- Filters for all, markers, events, and high-priority moments.
- Export `editing_notes.txt`.
- Export `editing_markers.csv`.
- Viewer unit tests and production build.

Not added:
- Portable desktop executable.
- Premiere/DaVinci marker templates.
- Project save/load.

## v2.0.0 - Automatic Event Detection

Added:
- Automatic event model and JSON export under `events`.
- Client-side detection for player death, dimension changes, and low health.
- `/minemarker events on`, `/minemarker events off`, and `/minemarker events status`.
- Event detection config flags.
- TXT export `Events:` section.
- Unit test coverage for event export.

Not added:
- Advancement detection.
- Valuable block mined detection.
- Totem, boss kill, or item pickup detection.

## v1.0.0 - Manual Marker Mod

Added:
- Fabric client-side MineMarker mod targeting Minecraft Java `26.1.2`.
- `/minemarker` command tree for manual editing markers.
- Session start, stop, status, export, offset, help, list, and undo commands.
- Quick marker keybind, default `M`.
- JSON, TXT, CSV, and session README exports.
- Simple local config file.
- Example exports.
- Unit tests for export generation and timestamp formatting.

Not added:
- Automatic event detection.
- Timeline viewer.
- OBS integration.
- AI/attention analysis.
