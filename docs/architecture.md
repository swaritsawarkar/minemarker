# MineMarker Architecture

## V2 Shape

MineMarker V2 is a Fabric client-side mod.

Main pieces:

- `MineMarkerClient`: client initializer, config load, command/keybind registration.
- `MineMarkerCommands`: `/minemarker` client command tree.
- `MineMarkerKeybinds`: quick marker keybind.
- `MineMarkerService`: active/last session state and async export dispatch.
- `MarkerSession`: session metadata and marker list.
- `Marker`: manual marker data.
- `MarkerExporter`: JSON/TXT/CSV/session README file writer.
- `ConfigManager`: `.minecraft/config/minemarker.json`.
- `MineMarkerEventDetector`: safe client-side automatic event polling.
- `AutoEvent`: automatic event data model.

## Export Model

`session.json` is the source of truth. TXT and CSV are convenience exports for humans and spreadsheets.

The JSON export writes:

- `project`
- `schema_version`
- `mod_version`
- `minecraft_version`
- `session`
- `markers`
- `events`

V2 and later can populate the `events` array.

## Threading

Commands and keybinds run on the client side. Export writes are dispatched through a single daemon executor so normal file writes do not block the render/game thread longer than necessary.

## Automatic Event Detection

V2 intentionally implements only stable client-side polling:

- player death
- dimension change
- low health

Advancements and mined valuable blocks are deferred until they can be validated without brittle hooks.

V3 reads exported JSON from disk and remains local-only. It does not require an account, cloud service, or backend.

## V3/V4 Timeline Viewer

The timeline viewer is a React + Vite static app.

Main pieces:

- `App.tsx`: shell, file loading, video playback, timeline selection, filters, exports.
- `src/lib/timeline.ts`: timestamp formatting, schema validation, timeline item normalization, notes/CSV export helpers.
- `src/lib/suggestions.ts`: deterministic creator suggestions and review exports.
- `src/types.ts`: MineMarker JSON types.

The viewer uses browser file inputs. It does not upload data or scan the user's disk.

V4 suggestions are intentionally rule-based. They inspect timeline item labels, notes, event keys, importance values, and long quiet gaps. They do not analyze video pixels, audio, or attention signals.
