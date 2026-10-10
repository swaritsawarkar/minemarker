const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mineMarkerDesktop', {
  getModStatus: () => ipcRenderer.invoke('minemarker:get-mod-status'),
  chooseMinecraftDirectory: () => ipcRenderer.invoke('minemarker:choose-minecraft-directory'),
  resetMinecraftDirectory: () => ipcRenderer.invoke('minemarker:reset-minecraft-directory'),
  installMod: () => ipcRenderer.invoke('minemarker:install-mod'),
  openModsFolder: () => ipcRenderer.invoke('minemarker:open-mods-folder'),
  getLatestSession: () => ipcRenderer.invoke('minemarker:get-latest-session'),
  openSessionsFolder: () => ipcRenderer.invoke('minemarker:open-sessions-folder')
});
