# IPC Conventions for Vibe Coder's Companion

This document outlines the conventions and best practices for Inter-Process Communication (IPC) in the Vibe Coder's Companion application.

## Overview

The application uses Electron's IPC mechanism to communicate between the main process and renderer process. We follow a secure approach using `contextBridge` to expose only specific functionality to the renderer process.

## Security Principles

1. **Context Isolation**: Always use `contextIsolation: true` in the BrowserWindow webPreferences.
2. **No Node Integration**: Always use `nodeIntegration: false` in the BrowserWindow webPreferences.
3. **Preload Script**: Use a preload script to expose only specific functionality via `contextBridge`.
4. **Input Validation**: Always validate input data in both the main and renderer processes.
5. **Principle of Least Privilege**: Only expose the minimum functionality needed.

## API Structure

The preload script exposes an `electronAPI` object to the renderer process with specific functions:

```javascript
window.electronAPI = {
  // Functions exposed to the renderer
  functionName: (arg1, arg2) => ipcRenderer.invoke('channel-name', arg1, arg2)
}
```

## Channel Naming Conventions

IPC channels should follow a consistent naming pattern:

```
domain:action
```

Where:
- `domain` is the functional area (e.g., `prompt`, `canvas`, `app`)
- `action` is the specific operation (e.g., `save`, `load`, `delete`)

Examples:
- `prompt:save` - Save a prompt
- `prompt:load` - Load a prompt
- `canvas:export` - Export the canvas
- `app:settings` - Get/set application settings

For test or utility channels, use:
- `test:message` - Test message
- `util:clipboard` - Clipboard operations

## Communication Patterns

### 1. Request-Response Pattern (Recommended)

Use `ipcRenderer.invoke` and `ipcMain.handle` for promise-based request-response communication:

```javascript
// Preload script
window.electronAPI = {
  savePrompt: (promptData) => ipcRenderer.invoke('prompt:save', promptData)
}

// Main process
ipcMain.handle('prompt:save', async (event, promptData) => {
  // Process the data
  return { success: true, id: savedId };
})

// Renderer usage
const result = await window.electronAPI.savePrompt(promptData);
```

### 2. Event-based Pattern (For notifications)

Use `ipcRenderer.on` and `ipcMain.send` for event-based communication:

```javascript
// Preload script
window.electronAPI = {
  onPromptSaved: (callback) => {
    ipcRenderer.removeAllListeners('prompt:saved');
    ipcRenderer.on('prompt:saved', (event, ...args) => callback(...args));
    return () => ipcRenderer.removeAllListeners('prompt:saved');
  }
}

// Main process
mainWindow.webContents.send('prompt:saved', { id: savedId });

// Renderer usage
const cleanup = window.electronAPI.onPromptSaved((data) => {
  console.log('Prompt saved:', data);
});
// Later: cleanup();
```

## Data Structures

1. **Always use serializable data** (objects, arrays, primitives)
2. **Use consistent property naming** (camelCase)
3. **Include status information** in responses:
   ```javascript
   {
     success: true,  // or false
     data: { ... },  // the actual data (when success is true)
     error: { ... }  // error information (when success is false)
   }
   ```

## Error Handling

1. **Use try/catch blocks** in both main and renderer processes
2. **Return structured error objects**:
   ```javascript
   {
     success: false,
     error: {
       code: 'FILE_NOT_FOUND',
       message: 'The specified file could not be found',
       details: { path: '/path/to/file' }
     }
   }
   ```

## Planned IPC Channels

Based on the application requirements, we anticipate the following IPC channels:

### Prompt Manager
- `prompt:list` - Get all prompts
- `prompt:save` - Save a prompt
- `prompt:delete` - Delete a prompt
- `prompt:duplicate` - Duplicate a prompt

### Visual Context Canvas
- `canvas:save` - Save canvas to file
- `canvas:load` - Load canvas from file
- `canvas:clipboard` - Copy canvas to clipboard
- `canvas:paste` - Paste image from clipboard

### Application
- `app:settings` - Get/set application settings

## Example Implementation

See the current implementation in:
- `src/preload.js` - API exposure
- `src/main.js` - IPC handlers
- `src/renderer/src/components/PromptManagerView.jsx` - Usage example
