const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mineMarkerDesktop', {
  getModStatus: () => ipcRenderer.invoke('minemarker:get-mod-status'),
  installMod: () => ipcRenderer.invoke('minemarker:install-mod'),
  openModsFolder: () => ipcRenderer.invoke('minemarker:open-mods-folder')
});
