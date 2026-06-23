import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  saveProgress: (progress: any) => ipcRenderer.invoke('save-progress', progress),
  loadProgress: () => ipcRenderer.invoke('load-progress'),
});