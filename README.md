# MineMarker

MineMarker is a Minecraft creator editing assistant. The current local release is V4: a Fabric client-side mod plus a local timeline viewer with rule-based creator suggestions and review exports.

MineMarker is not a replay or cinematic camera mod. Replay Mod and Flashback already handle replay workflows well. MineMarker focuses on creator editing workflow: clean timestamps, marker notes, Minecraft context, and manual video offset support for recorded footage.

## Current Status

V4 is the creator export workflow release.

Implemented:
- Fabric client mod for Minecraft Java `26.1.2`
- `/minemarker` client commands
- Manual marker sessions
- Quick marker keybind, default `M`
- JSON, TXT, CSV, and session README exports
- Manual video offset
- Simple config at `.minecraft/config/minemarker.json`
- Local unit test coverage for exporter output
- Automatic event detection for player death, dimension changes, and low health
- `/minemarker events on|off|status`
- React/Vite local timeline viewer
- Load MineMarker `session.json`
- Load a local video file
- Click markers/events to jump video playback
- Filter markers/events
- Export `editing_notes.txt` and `editing_markers.csv`
- Rule-based clip, timelapse, and quiet-section suggestions
- Export `editing_suggestions.txt`
- Export `editor_review.csv` for spreadsheet/editor review

Not implemented yet:
- Advancement detection
- Valuable block mined detection
- OBS WebSocket integration
- AI or attention analysis
- Verified editor-native marker import formats

## Verified Target Versions

Checked on 2026-05-04:

- Minecraft Java: `26.1.2`
- Fabric Loader: `0.19.2`
- Fabric API: `0.148.0+26.1.2`
- Fabric Loom: `1.16.1`
- Java: `25`
- Gradle: `9.5.0`

Notes:
- The local machine only had Java 8 on PATH, so V1 was built with a portable Temurin JDK 25 in the local tool cache.
- The Gradle wrapper is included, so future builds can use `minemarker-mod/gradlew.bat`.

## Install

1. Install Minecraft Java `26.1.2`.
2. Install Fabric Loader `0.19.2` for Minecraft `26.1.2`.
3. Download or build MineMarker.
4. Copy the built jar from `minemarker-mod/build/libs/` into your `.minecraft/mods/` folder.
5. Launch Minecraft with the Fabric profile.

The MineMarker mod is client-side. It is intended for singleplayer and may work on servers where client-side Fabric commands/keybinds are allowed. Server compatibility has not been fully tested.

## Build

From the repo root:

```powershell
cd minemarker-mod
$env:JAVA_HOME="$env:USERPROFILE\.cache\minemarker-tools\jdk-25"
.\gradlew.bat clean build
```

If you already have JDK 25 installed, set `JAVA_HOME` to that JDK instead.

Successful build output creates the mod jar under:

```text
minemarker-mod/build/libs/
```

## Timeline Viewer

```powershell
cd timeline-viewer
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Build the viewer:

```powershell
npm run build
```

V4 viewer exports:

- `editing_notes.txt`: filtered timeline notes
- `editing_markers.csv`: filtered marker/event spreadsheet export
- `editing_suggestions.txt`: rule-based creator suggestions
- `editor_review.csv`: combined markers/events/suggestions for review, not verified as direct Premiere or DaVinci import

## Commands

```text
/minemarker start [session_name]
/minemarker mark <label> [note]
/minemarker stop
/minemarker status
/minemarker export
/minemarker offset <seconds>
/minemarker help
/minemarker list
/minemarker undo
/minemarker events on
/minemarker events off
/minemarker events status
```

Examples:

```text
/minemarker start hardcore-ep-3
/minemarker mark diamond_ore found diamonds near lava
/minemarker offset 4.5
/minemarker stop
```

## Keybind

Default key: `M`

Action: adds a manual marker using the configured quick marker label. The default label is `quick_marker`.

The keybind may conflict with other mods. Change it in Minecraft controls if needed.

## Config

MineMarker creates:

```text
.minecraft/config/minemarker.json
```

Config options:

```json
{
  "exportJson": true,
  "exportTxt": true,
  "exportCsv": true,
  "exportReadme": true,
  "defaultVideoOffsetSeconds": 0.0,
  "quickMarkerLabel": "quick_marker",
  "includeCoordinates": true,
  "includeSystemTimestamps": true,
  "autoEventsEnabled": true,
  "detectDeaths": true,
  "detectDimensionChange": true,
  "detectAdvancements": false,
  "detectValuableBlocks": false,
  "detectLowHealth": true,
  "lowHealthThreshold": 6.0
}
```

## Export Files

Exports are saved under:

```text
.minecraft/minemarker/sessions/<session_id>/
```

Each exported session contains:

- `session.json`: source of truth for tools and future timeline viewer
- `markers.txt`: human-readable editing checklist
- `markers.csv`: spreadsheet-friendly marker table
- `README_session.txt`: explanation of the export folder

JSON includes automatic events under the `events` array when event detection is enabled.

## OBS Workflow

1. Start OBS recording.
2. Open Minecraft world/server.
3. Type `/minemarker start episode-1`.
4. Play normally.
5. Use `/minemarker mark diamond_ore found diamonds near lava` whenever something important happens.
6. Type `/minemarker stop` when done.
7. Open exported TXT/CSV/JSON.
8. Use timestamps while editing.
9. If OBS recording started before `/minemarker start`, use `/minemarker offset <seconds>` next time or adjust manually.

Offset rule:
- If the video timestamp is later than the MineMarker timestamp, use a positive offset.
- If the video timestamp is earlier, use a negative offset.

## Troubleshooting

- If `/minemarker mark` says no active session, run `/minemarker start <name>` first.
- If export fails, check that Minecraft can write to `.minecraft/minemarker/sessions/`.
- If the keybind does nothing, check Minecraft controls for a key conflict.
- If build fails with Java errors, confirm `java -version` reports Java 25.

## Roadmap

- V5: OBS sync research and safer integration
- V6: attention analysis only after the core workflow works
