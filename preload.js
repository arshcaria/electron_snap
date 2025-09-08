// Preload script - exposes secure APIs in the renderer process

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods on the window object
contextBridge.exposeInMainWorld('electronAPI', {
    // Method to get window status
    getWindowStatus: () => {
        console.log('preload.js: calling getWindowStatus');
        return ipcRenderer.invoke('get-window-status');
    }
});

console.log('preload.js loaded, electronAPI exposed to renderer process');