# MineMarker Architecture

## V1 Shape

MineMarker V1 is a Fabric client-side mod.

Main pieces:

- `MineMarkerClient`: client initializer, config load, command/keybind registration.
- `MineMarkerCommands`: `/minemarker` client command tree.
- `MineMarkerKeybinds`: quick marker keybind.
- `MineMarkerService`: active/last session state and async export dispatch.
- `MarkerSession`: session metadata and marker list.
- `Marker`: manual marker data.
- `MarkerExporter`: JSON/TXT/CSV/session README file writer.
- `ConfigManager`: `.minecraft/config/minemarker.json`.

## Export Model

`session.json` is the source of truth. TXT and CSV are convenience exports for humans and spreadsheets.

V1 writes:

- `project`
- `schema_version`
- `mod_version`
- `minecraft_version`
- `session`
- `markers`
- `events`

The `events` array exists but is empty until V2.

## Threading

Commands and keybinds run on the client side. Export writes are dispatched through a single daemon executor so normal file writes do not block the render/game thread longer than necessary.

## Future Boundaries

V2 should add event detection without breaking the V1 marker schema.

V3 should read exported JSON from disk and remain local-only. It should not require an account, cloud service, or backend unless video handling truly requires one.

