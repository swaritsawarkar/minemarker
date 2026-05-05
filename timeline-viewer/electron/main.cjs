const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const MOD_FILE_NAME = 'minemarker-2.0.0.jar';

function createWindow() {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1040,
    minHeight: 720,
    backgroundColor: '#070b0d',
    title: 'MineMarker Timeline Viewer',
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
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

function getMinecraftDirectory() {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, '.minecraft');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'minecraft');
  }
  return path.join(os.homedir(), '.minecraft');
}

function getModsDirectory() {
  return path.join(getMinecraftDirectory(), 'mods');
}

function getSessionsDirectory() {
  return path.join(getMinecraftDirectory(), 'minemarker', 'sessions');
}

function getBundledModPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bundled-mod', MOD_FILE_NAME);
  }
  return path.join(__dirname, '..', 'bundled-mod', MOD_FILE_NAME);
}

async function getModStatus() {
  const modsDirectory = getModsDirectory();
  const installedPath = path.join(modsDirectory, MOD_FILE_NAME);
  const bundledPath = getBundledModPath();
  const [installed, bundled] = await Promise.all([
    fs.access(installedPath).then(() => true).catch(() => false),
    fs.access(bundledPath).then(() => true).catch(() => false)
  ]);

  return {
    installed,
    bundled,
    modsDirectory,
    installedPath,
    bundledPath,
    minecraftDirectory: getMinecraftDirectory()
  };
}

ipcMain.handle('minemarker:get-mod-status', async () => {
  return getModStatus();
});

ipcMain.handle('minemarker:install-mod', async () => {
  const status = await getModStatus();
  if (!status.bundled) {
    throw new Error(`Bundled mod jar was not found: ${status.bundledPath}`);
  }

  await fs.mkdir(status.modsDirectory, { recursive: true });
  await fs.copyFile(status.bundledPath, status.installedPath);

  return {
    ...await getModStatus(),
    message: `Installed ${MOD_FILE_NAME} to ${status.modsDirectory}`
  };
});

ipcMain.handle('minemarker:open-mods-folder', async () => {
  const modsDirectory = getModsDirectory();
  await fs.mkdir(modsDirectory, { recursive: true });
  await shell.openPath(modsDirectory);
  return { modsDirectory };
});

ipcMain.handle('minemarker:get-latest-session', async () => {
  const sessionsDirectory = getSessionsDirectory();
  let entries;

  try {
    entries = await fs.readdir(sessionsDirectory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { found: false, sessionsDirectory };
    }
    throw error;
  }

  const candidates = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const sessionPath = path.join(sessionsDirectory, entry.name, 'session.json');
    try {
      const stats = await fs.stat(sessionPath);
      candidates.push({
        sessionId: entry.name,
        sessionPath,
        modifiedAtMs: stats.mtimeMs,
        modifiedAt: stats.mtime.toISOString()
      });
    } catch {
      // Ignore incomplete export folders.
    }
  }

  candidates.sort((a, b) => b.modifiedAtMs - a.modifiedAtMs);
  const latest = candidates[0];
  if (!latest) {
    return { found: false, sessionsDirectory };
  }

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
  const sessionsDirectory = getSessionsDirectory();
  await fs.mkdir(sessionsDirectory, { recursive: true });
  await shell.openPath(sessionsDirectory);
  return { sessionsDirectory };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
