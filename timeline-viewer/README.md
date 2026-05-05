# MineMarker Timeline Viewer

The V4.3 timeline viewer is a local React + Vite app packaged as a Windows portable Electron `.exe`. The desktop app bundles the MineMarker Fabric mod, can install it into the default Minecraft mods folder with one button, and can load the newest MineMarker session export automatically. It also supports manually loading a custom `session.json`.

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

## Build Portable Windows App

```powershell
npm run desktop:build
```

The generated `.exe` is written to:

```text
timeline-viewer/desktop-dist/MineMarker-Timeline-Viewer-<version>-Portable-x64.exe
```

The portable app is unsigned, so Windows may show an unknown publisher warning.

## Test

```powershell
npm test
```

## Workflow

1. Open the Windows portable `.exe`.
2. Click `Install Minecraft Mod`.
3. Launch Minecraft with Fabric.
4. In Minecraft, run `/minemarker start`, add markers/events, then `/minemarker stop`.
5. Click `Load Last Session` to load the newest exported MineMarker `session.json`, or use `Load Custom Session`.
6. Click `Load Video` and select the matching recording.
7. Adjust `Offset` if the recording started before or after the MineMarker session.
8. Click timeline ticks or list rows to jump the video.
9. Filter by markers, events, or high-priority moments.
10. Review rule-based suggestions for clip candidates, timelapse candidates, and quiet sections.
11. Export `editing_notes.txt`, `editing_markers.csv`, `editing_suggestions.txt`, or `editor_review.csv`.

## How Minecraft Sync Works

V4.3 does not live-connect the desktop app to Minecraft. The desktop app installs the bundled Fabric mod. The Fabric mod records the session and exports files. The desktop app can find the newest `session.json` under `.minecraft/minemarker/sessions/`, or the user can load a custom session.

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
- The portable `.exe` is Windows x64 only and unsigned.
- One-click install uses the default Minecraft directory. Custom launcher directories may still need manual jar placement.
