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

## Not Performed

- In-game Minecraft runtime testing was not performed.
- Server testing was not performed.
- Actual OBS workflow testing was not performed.
- GitHub push was not performed because no `origin` remote is configured.

## Build Result

`.\gradlew.bat clean build` succeeded for V2 after adding automatic event detection.
