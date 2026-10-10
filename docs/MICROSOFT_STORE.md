# Microsoft Store release checklist

MineMarker has an AppX build path and a GitHub Actions workflow. The package cannot receive its final Store identity until the app name is reserved in Partner Center.

## Required Partner Center values

Open Product management > Product identity and copy these values exactly. They are case-sensitive:

- Package/Identity/Name
- Package/Identity/Publisher
- Package/Properties/PublisherDisplayName

Run the **Build Microsoft Store package** workflow and paste those three values into its inputs. The workflow builds the Fabric mod, runs the viewer tests, creates the AppX, and uploads it as the `MineMarker-Store-AppX` artifact.

## Before submission

- Reserve the product name MineMarker in Partner Center.
- Download and install the workflow artifact on a clean Windows x64 test account.
- Verify first launch, custom Minecraft folder selection, mod installation, latest-session loading, custom JSON loading, local video playback, and all four exports.
- Run the Windows App Certification Kit against the final AppX.
- Capture Store screenshots at 1366x768 or higher without personal paths or data.
- Use `docs/STORE_LISTING.md` for the listing text.
- Publish `docs/PRIVACY.md` at the listed public URL.
- Submit the AppX with no external code-signing step; Microsoft Store signs accepted packages.

## Versioning

Every new Store upload must use a version higher than the previous submission. Update `timeline-viewer/package.json` before rebuilding.
