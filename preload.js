const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  showNotification: (options) => {
    return ipcRenderer.invoke('show-notification', options);
  },
  playSound: () => {
    return ipcRenderer.invoke('play-sound');
  },
  // Add any other IPC methods you need here
});