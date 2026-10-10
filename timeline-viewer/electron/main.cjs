const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const MOD_FILE_NAME = 'minemarker-2.0.0.jar';
const SETTINGS_FILE_NAME = 'settings.json';

function createWindow() {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1040,
    minHeight: 720,
    backgroundColor: '#070b0d',
    title: 'MineMarker',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  window.setMenuBarVisibility(false);
  window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
}

function getDefaultMinecraftDirectory() {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, '.minecraft');
  }
  if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Application Support', 'minecraft');
  return path.join(os.homedir(), '.minecraft');
}

function getSettingsPath() {
  return path.join(app.getPath('userData'), SETTINGS_FILE_NAME);
}

async function readSettings() {
  try {
    const parsed = JSON.parse(await fs.readFile(getSettingsPath(), 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeSettings(settings) {
  await fs.mkdir(path.dirname(getSettingsPath()), { recursive: true });
  await fs.writeFile(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8');
}

async function getMinecraftDirectory() {
  const settings = await readSettings();
  return typeof settings.minecraftDirectory === 'string' && settings.minecraftDirectory.trim()
    ? path.resolve(settings.minecraftDirectory)
    : getDefaultMinecraftDirectory();
}

async function getPaths() {
  const minecraftDirectory = await getMinecraftDirectory();
  return {
    minecraftDirectory,
    modsDirectory: path.join(minecraftDirectory, 'mods'),
    sessionsDirectory: path.join(minecraftDirectory, 'minemarker', 'sessions')
  };
}

function getBundledModPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'bundled-mod', MOD_FILE_NAME)
    : path.join(__dirname, '..', 'bundled-mod', MOD_FILE_NAME);
}

async function getModStatus() {
  const paths = await getPaths();
  const installedPath = path.join(paths.modsDirectory, MOD_FILE_NAME);
  const bundledPath = getBundledModPath();
  const [installed, bundled] = await Promise.all([
    fs.access(installedPath).then(() => true).catch(() => false),
    fs.access(bundledPath).then(() => true).catch(() => false)
  ]);
  return { installed, bundled, installedPath, bundledPath, ...paths };
}

async function openDirectory(directory) {
  await fs.mkdir(directory, { recursive: true });
  const message = await shell.openPath(directory);
  if (message) throw new Error(message);
}

ipcMain.handle('minemarker:get-mod-status', getModStatus);

ipcMain.handle('minemarker:choose-minecraft-directory', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Choose your Minecraft folder',
    defaultPath: await getMinecraftDirectory(),
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true, status: await getModStatus() };
  await writeSettings({ ...(await readSettings()), minecraftDirectory: result.filePaths[0] });
  return { canceled: false, status: await getModStatus() };
});

ipcMain.handle('minemarker:reset-minecraft-directory', async () => {
  const settings = await readSettings();
  delete settings.minecraftDirectory;
  await writeSettings(settings);
  return getModStatus();
});

ipcMain.handle('minemarker:install-mod', async () => {
  const status = await getModStatus();
  if (!status.bundled) throw new Error(`Bundled mod jar was not found: ${status.bundledPath}`);
  await fs.mkdir(status.modsDirectory, { recursive: true });
  await fs.copyFile(status.bundledPath, status.installedPath);
  return { ...(await getModStatus()), message: `Installed ${MOD_FILE_NAME} to ${status.modsDirectory}` };
});

ipcMain.handle('minemarker:open-mods-folder', async () => {
  const { modsDirectory } = await getPaths();
  await openDirectory(modsDirectory);
  return { modsDirectory };
});

ipcMain.handle('minemarker:get-latest-session', async () => {
  const { sessionsDirectory } = await getPaths();
  let entries;
  try {
    entries = await fs.readdir(sessionsDirectory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') return { found: false, sessionsDirectory };
    throw error;
  }

  const candidates = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const sessionPath = path.join(sessionsDirectory, entry.name, 'session.json');
    try {
      const stats = await fs.stat(sessionPath);
      candidates.push({ sessionId: entry.name, sessionPath, modifiedAtMs: stats.mtimeMs, modifiedAt: stats.mtime.toISOString() });
    } catch {
      // Ignore incomplete export folders.
    }
  }

  candidates.sort((a, b) => b.modifiedAtMs - a.modifiedAtMs);
  const latest = candidates[0];
  if (!latest) return { found: false, sessionsDirectory };
  return {
    found: true,
    sessionsDirectory,
    sessionPath: latest.sessionPath,
    sessionId: latest.sessionId,
    modifiedAt: latest.modifiedAt,
    content: await fs.readFile(latest.sessionPath, 'utf8')
  };
});

ipcMain.handle('minemarker:open-sessions-folder', async () => {
  const { sessionsDirectory } = await getPaths();
  await openDirectory(sessionsDirectory);
  return { sessionsDirectory };
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.minemarker.app');
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
