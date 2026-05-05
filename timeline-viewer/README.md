# MineMarker Timeline Viewer

The V4 timeline viewer is a local React + Vite web app. It loads a MineMarker `session.json` file and a local video file, displays manual markers and automatic events on a timeline, lets the user jump video playback by clicking timeline items, applies a manual offset, filters items, exports editing notes, and generates rule-based creator suggestions.

No backend, cloud account, login, telemetry, or upload service is required.

## Requirements

- Node.js 20+ recommended
- MineMarker exported `session.json`
- Optional local video file

## Install

```powershell
cd timeline-viewer
npm install
```

## Run

```powershell
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

## Build

```powershell
npm run build
```

The static web app is written to `timeline-viewer/dist/`.

## Test

```powershell
npm test
```

## Workflow

1. Click `Load JSON`.
2. Select a MineMarker `session.json`.
3. Click `Load Video`.
4. Select the matching recording.
5. Adjust `Offset` if the recording started before or after the MineMarker session.
6. Click timeline ticks or list rows to jump the video.
7. Filter by markers, events, or high-priority moments.
8. Review rule-based suggestions for clip candidates, timelapse candidates, and quiet sections.
9. Export `editing_notes.txt`, `editing_markers.csv`, `editing_suggestions.txt`, or `editor_review.csv`.

## V4 Exports

- `editing_notes.txt`: filtered timeline notes.
- `editing_markers.csv`: filtered marker/event spreadsheet export.
- `editing_suggestions.txt`: rule-based creator suggestions.
- `editor_review.csv`: combined markers/events/suggestions for review. This is a spreadsheet-friendly review file, not a verified direct Premiere or DaVinci import.

## V4 Limits

- Browser security means files are selected manually; the app does not scan your disk.
- The app does not modify video files.
- Suggestions are deterministic rules based on MineMarker timestamps, labels, event keys, importance, and quiet gaps. They are not AI analysis.
- DaVinci/Premiere-specific marker imports are not verified.
- Large videos depend on browser playback support.
