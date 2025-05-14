// Preload script
// This file exposes specific Electron functionality to the renderer process
// using contextBridge for security

const { contextBridge, ipcRenderer } = require('electron');

// Define the API exposed to the renderer process
// This follows the principle of least privilege - only expose what's needed
contextBridge.exposeInMainWorld('electronAPI', {
  // Test message function - sends a ping and receives a pong
  sendTestMessage: (message) => ipcRenderer.invoke('test:message', message),

  // Example of an event listener pattern
  onTestResponse: (callback) => {
    // Remove existing listeners to avoid memory leaks
    ipcRenderer.removeAllListeners('test:response');
    // Add the new listener
    ipcRenderer.on('test:response', (event, ...args) => callback(...args));

    // Return a function to remove the listener (for cleanup)
    return () => {
      ipcRenderer.removeAllListeners('test:response');
    };
  },

  // Prompt Manager API

  // Get all prompts
  getPrompts: () => ipcRenderer.invoke('prompt:list'),

  // Save prompts
  savePrompts: (prompts) => ipcRenderer.invoke('prompt:save', prompts),

  // Generate a new prompt
  createNewPrompt: (promptData) => ipcRenderer.invoke('prompt:new', promptData),

  // Generate a unique ID
  generateUniqueId: () => ipcRenderer.invoke('prompt:generateId'),

  // Create sample prompts (for development/testing)
  createSamplePrompts: () => ipcRenderer.invoke('prompt:createSamples'),

  // Listen for prompt saved events
  onPromptsSaved: (callback) => {
    ipcRenderer.removeAllListeners('prompt:saved');
    ipcRenderer.on('prompt:saved', (event, ...args) => callback(...args));

    return () => {
      ipcRenderer.removeAllListeners('prompt:saved');
    };
  },

  // Clipboard operations
  writeTextToClipboard: (text) => ipcRenderer.invoke('util:clipboard-write-text', text),
  writeHTMLToClipboard: (html) => ipcRenderer.invoke('util:clipboard-write-html', html),
  writeImageToClipboard: (dataURL) => ipcRenderer.invoke('util:clipboard-write-image', dataURL),
  readImageFromClipboard: () => ipcRenderer.invoke('util:clipboard-read-image'),

  // Canvas operations
  saveCanvasToFile: (canvasData) => ipcRenderer.invoke('canvas:save', canvasData),
  loadCanvasFromFile: () => ipcRenderer.invoke('canvas:load')
});

// Log when the preload script has loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script loaded with IPC capabilities');
});
