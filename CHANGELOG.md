# Changelog

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
