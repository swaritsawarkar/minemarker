# Validation Notes

## Performed

- Queried live Fabric metadata for stable Minecraft versions.
- Queried live Fabric metadata for Fabric Loader versions.
- Checked Fabric API Maven metadata for `26.1.2` builds.
- Checked Fabric Loom Maven metadata.
- Checked Gradle current version metadata.
- Generated a Gradle wrapper for Gradle `9.5.0`.
- Ran `.\gradlew.bat clean build` with Java 25.
- Confirmed Java compilation succeeds.
- Confirmed client Java compilation succeeds.
- Confirmed unit tests pass.
- Confirmed `fabric.mod.json` is processed during build.
- Confirmed export unit test writes JSON, TXT, CSV, and session README.
- Confirmed automatic event export test writes event JSON and TXT event rows.
- Ran timeline viewer unit tests.
- Ran timeline viewer production build.
- Launched local Vite dev server.
- Captured desktop and mobile screenshots with installed Chrome through Playwright fallback.
- Clicked a timeline tick and confirmed selected marker details changed.
- Ran V4 timeline viewer unit tests after adding creator suggestions.
- Ran V4 timeline viewer production build.
- Captured V4 desktop and mobile screenshots with installed Chrome through Playwright fallback.
- Confirmed V4 suggestions panel renders, generated 5 suggestions from the example session, and `Review CSV` button renders.
- Confirmed mobile timeline tick labels are hidden to avoid overlapping timestamps.
- Re-ran `.\gradlew.bat clean build` for the Fabric mod after V4 viewer changes.
- Built V4.1 Windows portable `.exe` with Electron and `electron-builder`.
- Launched the V4.1 portable `.exe` and confirmed it spawned 4 Electron processes with a MineMarker window title after 12 seconds.
- Fixed V4.1.1 Electron asset loading by changing Vite to relative asset paths.

## Not Performed

- In-game Minecraft runtime testing was not performed.
- Server testing was not performed.
- Actual OBS workflow testing was not performed.
- GitHub push was not performed because no `origin` remote is configured.
- Real user video playback with a large recording was not performed.

## Build Result

`.\gradlew.bat clean build` succeeded for V2 after adding automatic event detection.

`npm test` and `npm run build` succeeded for the V3 timeline viewer.

`npm test` and `npm run build` succeeded for the V4 timeline viewer after adding creator suggestions and review exports.

`.\gradlew.bat clean build` still succeeded for the Fabric mod after V4 documentation/viewer changes.

`npm run desktop:build` produced `MineMarker-Timeline-Viewer-4.1.0-Portable-x64.exe`.

`npm run desktop:build` produced `MineMarker-Timeline-Viewer-4.1.1-Portable-x64.exe` after the Electron asset-path fix.

Electron render smoke test passed for V4.1.1 by confirming visible `MineMarker`, `Minecraft Sync`, and `Load JSON` text in the app window.

`.\gradlew.bat clean build` succeeded again before the V4.1.1 release assets were prepared.

V4.2 added an Electron IPC installer that copies the bundled Fabric mod into the default Minecraft mods folder.

V4.2 viewer unit tests and production build passed before the installer and UI commits were made.

V4.2 final validation passed:

- `.\gradlew.bat clean build`
- `npm test`
- `npm run desktop:build`
- packaged Electron installer smoke test with a temporary `%APPDATA%`
- verified installed jar hash: `BB1E23AB599C0B6A7E8234C220A2853E5A7299AA6A07C13A6CDFCB34B9B44634`

V4.3 added desktop latest-session discovery for `.minecraft/minemarker/sessions/*/session.json`.

V4.3 final validation passed:

- `.\gradlew.bat clean build`
- `npm test`
- `npm run desktop:build`
- packaged Electron latest-session smoke test with fake old/new MineMarker session exports
- verified `Load Last Session` loaded `new-session` and did not load `old-session`
