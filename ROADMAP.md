# Roadmap

## V1 - Manual Marker Mod

Status: implemented locally.

- Manual session lifecycle
- Manual marker command
- Quick marker keybind
- JSON/TXT/CSV exports
- Manual offset
- Basic config

## V2 - Automatic Minecraft Event Detection

Status: implemented locally for stable client-side events.

- Player death detection
- Dimension change detection
- Low health warning
- Event enable/disable commands and config

Deferred:

- Advancement detection
- Valuable block mined detection
- Totem pop detection
- Boss kill detection
- Rare item pickup detection

## V3 - Local Timeline Viewer

Status: implemented locally.

- Local-only React/Vite viewer
- Load `session.json`
- Load video file
- Show markers/events on a timeline
- Click marker/event to jump video
- Offset adjustment
- Export editing notes and marker CSV

## V4 - Creator Export Workflow

Status: implemented locally.

- Rule-based clip suggestions
- Rule-based timelapse suggestions
- Rule-based quiet-section detection
- Suggestion TXT export
- Combined review CSV export
- Windows portable timeline viewer `.exe` in V4.1

Deferred:

- Verified Premiere/DaVinci/Final Cut marker import templates
- Project save/load
- Clip grouping UI
- Shorts/hook candidate scoring beyond simple rules

## V5 - OBS Sync

Research first:

- Manual offset remains the safe baseline
- OBS WebSocket may be useful
- File creation time comparison may help semi-automated sync

## V6 - Attention Analysis

Only after V1-V3 are working:

- Combine Minecraft events with video attention/drop signals
- Suggest zooms, cuts, timelapses, or short-form candidates
