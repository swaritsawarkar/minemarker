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

Planned:

- Player death detection
- Dimension change detection
- Advancement detection if stable client-side
- Valuable block mined detection if stable client-side
- Low health warning
- Event enable/disable commands and config

## V3 - Local Timeline Viewer

Planned:

- Local-only viewer
- Load `session.json`
- Load video file
- Show markers/events on a timeline
- Click marker to jump video
- Offset adjustment
- Export editing notes

## V4 - Creator Export Workflow

Possible:

- Better editing software CSV templates
- Marker categories/colors
- Rule-based clip suggestions
- Rule-based boring section detection
- Shorts and hook candidate exports

## V5 - OBS Sync

Research first:

- Manual offset remains the safe baseline
- OBS WebSocket may be useful
- File creation time comparison may help semi-automated sync

## V6 - Attention Analysis

Only after V1-V3 are working:

- Combine Minecraft events with video attention/drop signals
- Suggest zooms, cuts, timelapses, or short-form candidates

