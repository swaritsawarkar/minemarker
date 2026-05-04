# Known Issues

- Build succeeded, but in-game testing was not performed because Minecraft was not launched in this environment.
- V1 has manual markers only. Automatic Minecraft event detection is not implemented yet.
- Biome is exported as `null` in V1 because stable client-side biome lookup can be version-sensitive.
- Server compatibility is not fully tested. V1 uses client commands/keybinds and should not require server installation, but server behavior may vary.
- The default `M` keybind may conflict with Minecraft or other mods.
- OBS sync is manual in V1. Use `/minemarker offset <seconds>` or adjust timestamps manually while editing.
- Editor-native marker formats for Premiere, DaVinci Resolve, and Final Cut are not implemented yet.
- Local PATH had Java 8 only; building requires Java 25.
- GitHub push is not configured until a remote `origin` URL is provided.

