import { copyFile, mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const viewerRoot = resolve(scriptDir, '..');
const repoRoot = resolve(viewerRoot, '..');
const modJar = resolve(repoRoot, 'minemarker-mod', 'build', 'libs', 'minemarker-2.0.0.jar');
const bundledJar = resolve(viewerRoot, 'bundled-mod', 'minemarker-2.0.0.jar');

try {
  await stat(modJar);
} catch {
  throw new Error(`MineMarker mod jar was not found at ${modJar}. Build the mod first with: cd minemarker-mod && .\\gradlew.bat build`);
}

await mkdir(dirname(bundledJar), { recursive: true });
await copyFile(modJar, bundledJar);
console.log(`Bundled mod jar: ${bundledJar}`);
