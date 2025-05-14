// Import required Electron components
const { app, BrowserWindow, ipcMain, clipboard, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');

// Import prompt data module
const promptData = require('./promptData');

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Vibe Coder's Companion",
    icon: path.join(__dirname, '../assets/icons/icon.ico'), // Custom application icon
    webPreferences: {
      nodeIntegration: false, // Security: Don't enable Node.js integration in the renderer
      contextIsolation: true, // Security: Enable context isolation
      preload: path.join(__dirname, 'preload.js'), // Will be used in future tasks
    },
  });

  // Load content based on environment
  if (isDev) {
    // In development, load from Vite's development server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development mode
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built assets
    mainWindow.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  }

  // Handle window being closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Set up IPC handlers
const setupIPC = () => {
  // Handle test messages from the renderer process
  ipcMain.handle('test:message', async (event, message) => {
    console.log('Received test message from renderer:', message);

    // Send a response back to the renderer (using the event sender)
    // This demonstrates the event-based pattern
    event.sender.send('test:response', `Main process received: "${message}" and sends back a response!`);

    // Return a value (this demonstrates the invoke/handle pattern)
    return {
      success: true,
      originalMessage: message,
      responseMessage: `Pong! Main process received your message: "${message}"`,
      timestamp: new Date().toISOString()
    };
  });

  // Prompt Manager IPC Handlers

  // Load all prompts
  ipcMain.handle('prompt:list', async () => {
    try {
      const prompts = await promptData.loadPrompts();
      return {
        success: true,
        prompts
      };
    } catch (error) {
      console.error('Error in prompt:list handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to load prompts',
          details: error.message
        }
      };
    }
  });

  // Save prompts
  ipcMain.handle('prompt:save', async (event, prompts) => {
    try {
      // Validate input
      if (!Array.isArray(prompts)) {
        throw new Error('Prompts must be an array');
      }

      const success = await promptData.savePrompts(prompts);

      if (success) {
        // Notify all renderer processes that prompts have been updated
        // This is useful for keeping multiple windows in sync
        event.sender.send('prompt:saved', { count: prompts.length });

        return {
          success: true,
          count: prompts.length
        };
      } else {
        throw new Error('Failed to save prompts');
      }
    } catch (error) {
      console.error('Error in prompt:save handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to save prompts',
          details: error.message
        }
      };
    }
  });

  // Generate a new prompt
  ipcMain.handle('prompt:new', async (event, newPromptData) => {
    try {
      const newPrompt = promptData.generateNewPrompt(newPromptData || {});
      return {
        success: true,
        prompt: newPrompt
      };
    } catch (error) {
      console.error('Error in prompt:new handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to generate new prompt',
          details: error.message
        }
      };
    }
  });

  // Generate a unique ID
  ipcMain.handle('prompt:generateId', async () => {
    try {
      const id = promptData.generateUniqueId();
      return {
        success: true,
        id
      };
    } catch (error) {
      console.error('Error in prompt:generateId handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to generate unique ID',
          details: error.message
        }
      };
    }
  });

  // Create sample prompts file (for development/testing)
  ipcMain.handle('prompt:createSamples', async () => {
    try {
      const success = await promptData.createSamplePromptsFile();
      return {
        success
      };
    } catch (error) {
      console.error('Error in prompt:createSamples handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to create sample prompts',
          details: error.message
        }
      };
    }
  });

  // Clipboard operations
  ipcMain.handle('util:clipboard-write-text', async (event, text) => {
    try {
      // Validate input
      if (typeof text !== 'string') {
        throw new Error('Text must be a string');
      }

      // Write text to clipboard
      clipboard.writeText(text);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in util:clipboard-write-text handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to write to clipboard',
          details: error.message
        }
      };
    }
  });

  // Clipboard HTML operations
  ipcMain.handle('util:clipboard-write-html', async (event, html) => {
    try {
      // Validate input
      if (typeof html !== 'string') {
        throw new Error('HTML must be a string');
      }

      // Write HTML to clipboard
      clipboard.writeHTML(html);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in util:clipboard-write-html handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to write HTML to clipboard',
          details: error.message
        }
      };
    }
  });

  // Clipboard Image operations
  ipcMain.handle('util:clipboard-write-image', async (event, dataURL) => {
    try {
      // Validate input
      if (typeof dataURL !== 'string' || !dataURL.startsWith('data:image/')) {
        throw new Error('Invalid image data URL');
      }

      // Extract the base64 data from the dataURL
      const base64Data = dataURL.split(',')[1];

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Create a NativeImage from the buffer
      const nativeImage = require('electron').nativeImage.createFromBuffer(buffer);

      // Write the image to clipboard
      clipboard.writeImage(nativeImage);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in util:clipboard-write-image handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to write image to clipboard',
          details: error.message
        }
      };
    }
  });

  // Read image from clipboard
  ipcMain.handle('util:clipboard-read-image', async () => {
    try {
      // Read image from clipboard
      const image = clipboard.readImage();

      // Check if the image is empty
      if (image.isEmpty()) {
        return {
          success: false,
          error: {
            message: 'No image found in clipboard'
          }
        };
      }

      // Convert the image to a PNG buffer
      const pngBuffer = image.toPNG();

      // Convert the buffer to a base64 string
      const base64String = pngBuffer.toString('base64');

      // Create a data URL
      const dataURL = `data:image/png;base64,${base64String}`;

      return {
        success: true,
        dataURL
      };
    } catch (error) {
      console.error('Error in util:clipboard-read-image handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to read image from clipboard',
          details: error.message
        }
      };
    }
  });

  // Canvas Save operation
  ipcMain.handle('canvas:save', async (event, canvasData) => {
    try {
      // Validate input
      if (typeof canvasData !== 'object' || !canvasData) {
        throw new Error('Canvas data must be a valid object');
      }

      // Convert canvas data to JSON string
      const jsonString = JSON.stringify(canvasData, null, 2);

      // Show save dialog
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Canvas',
        defaultPath: 'canvas.json',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['createDirectory']
      });

      // If user canceled the dialog, return success: false
      if (canceled || !filePath) {
        return {
          success: false,
          canceled: true
        };
      }

      // Write the file
      await fs.writeFile(filePath, jsonString, 'utf-8');

      return {
        success: true,
        filePath
      };
    } catch (error) {
      console.error('Error in canvas:save handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to save canvas',
          details: error.message
        }
      };
    }
  });

  // Canvas Load operation
  ipcMain.handle('canvas:load', async () => {
    try {
      // Show open dialog
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Load Canvas',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      // If user canceled the dialog, return success: false
      if (canceled || filePaths.length === 0) {
        return {
          success: false,
          canceled: true
        };
      }

      // Read the file
      const filePath = filePaths[0];
      const fileContent = await fs.readFile(filePath, 'utf-8');

      // Parse the JSON
      const canvasData = JSON.parse(fileContent);

      return {
        success: true,
        canvasData,
        filePath
      };
    } catch (error) {
      console.error('Error in canvas:load handler:', error);
      return {
        success: false,
        error: {
          message: 'Failed to load canvas',
          details: error.message
        }
      };
    }
  });

  console.log('IPC handlers set up successfully');
};

// Create window when Electron has finished initialization
app.on('ready', () => {
  createWindow();
  setupIPC();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, recreate the window when the dock icon is clicked and no other windows are open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
