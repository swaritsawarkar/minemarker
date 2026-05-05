# Known Issues

- Build succeeded, but in-game testing was not performed because Minecraft was not launched in this environment.
- V2 detects only stable client-side events: death, dimension change, and low health.
- Advancement detection is not implemented because the stable client-only hook needs more version-specific validation.
- Valuable block mined detection is not implemented because reliable client-only block-break detection needs more version-specific validation.
- Biome is exported as `null` in V1 because stable client-side biome lookup can be version-sensitive.
- Server compatibility is not fully tested. V1 uses client commands/keybinds and should not require server installation, but server behavior may vary.
- The default `M` keybind may conflict with Minecraft or other mods.
- OBS sync is manual. Use `/minemarker offset <seconds>` or adjust timestamps manually while editing.
- V4 `editor_review.csv` is a spreadsheet-friendly review export, not a verified direct Premiere, DaVinci Resolve, or Final Cut marker import.
- V4 suggestions are rule-based and depend on marker/event labels, event keys, importance, and quiet gaps. They are not AI analysis.
- The V4.1 portable `.exe` is unsigned, so Windows may show an unknown publisher warning.
- The V4.1 portable `.exe` is Windows x64 only.
- Timeline viewer browser QA used installed Chrome through a Playwright fallback because the Browser plugin tool was not exposed.
- `npm install` reports moderate advisories in the Vite/dev dependency tree; no force upgrade was applied.
- Local PATH had Java 8 only; building requires Java 25.
- GitHub push is not configured until a remote `origin` URL is provided.
