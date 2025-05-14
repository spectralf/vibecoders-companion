# Prompt Data API Documentation

This document describes the Prompt Data structure and API for the Vibe Coder's Companion application.

## Prompt Object Structure

Each prompt is represented as a JavaScript object with the following properties:

```javascript
{
  "id": "550e8400-e29b-41d4-a716-446655440000", // Unique identifier (UUID)
  "title": "My Prompt Title",                    // Title of the prompt
  "contentJSON": {                               // TipTap JSON content
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "This is the prompt content."
          }
        ]
      }
    ]
  },
  "contentHTML": "<p>This is the prompt content.</p>", // HTML representation
  "tags": ["tag1", "tag2"],                            // Array of tags
  "colorCode": "#3498db",                              // Color code (hex)
  "isFavorite": false,                                 // Favorite status
  "createdAt": "2023-01-01T12:00:00.000Z",             // Creation timestamp
  "updatedAt": "2023-01-02T14:30:00.000Z"              // Last update timestamp
}
```

## Storage

Prompts are stored in a JSON file located in the application's user data directory:

- Windows: `%APPDATA%\vibe-coders-companion\prompts.json`
- macOS: `~/Library/Application Support/vibe-coders-companion/prompts.json`
- Linux: `~/.config/vibe-coders-companion/prompts.json`

The file contains an array of prompt objects.

## Main Process API

The main process provides the following functions for working with prompts:

### `loadPrompts()`

Loads all prompts from the local JSON file.

- **Returns**: `Promise<Prompt[]>` - Array of prompt objects
- **Error Handling**: Returns an empty array if the file doesn't exist or is invalid

### `savePrompts(prompts)`

Saves all prompts to the local JSON file.

- **Parameters**:
  - `prompts` (Prompt[]) - Array of prompt objects to save
- **Returns**: `Promise<boolean>` - True if successful, false otherwise
- **Error Handling**: Logs errors and returns false on failure

### `generateNewPrompt(promptData)`

Generates a new prompt object with a unique ID and timestamps.

- **Parameters**:
  - `promptData` (Object, optional) - Data to override default values
- **Returns**: `Prompt` - A new prompt object
- **Default Values**:
  - `id`: Generated UUID
  - `title`: "New Prompt"
  - `contentJSON`: Empty document
  - `contentHTML`: "<p></p>"
  - `tags`: []
  - `colorCode`: "#3498db"
  - `isFavorite`: false
  - `createdAt`: Current timestamp
  - `updatedAt`: Current timestamp

### `generateUniqueId()`

Generates a unique ID using UUID v4.

- **Returns**: `string` - A unique ID

### `createSamplePromptsFile()`

Creates a sample prompts file with example prompts.

- **Returns**: `Promise<boolean>` - True if successful, false otherwise

## IPC API (Renderer Process)

The renderer process can access the following functions via the `window.electronAPI` object:

### `getPrompts()`

Gets all prompts from the main process.

- **Returns**: `Promise<{ success: boolean, prompts: Prompt[] }>` - Object containing success status and prompts array

### `savePrompts(prompts)`

Saves prompts to the main process.

- **Parameters**:
  - `prompts` (Prompt[]) - Array of prompt objects to save
- **Returns**: `Promise<{ success: boolean, count: number }>` - Object containing success status and count of saved prompts

### `createNewPrompt(promptData)`

Creates a new prompt object with a unique ID and timestamps.

- **Parameters**:
  - `promptData` (Object, optional) - Data to override default values
- **Returns**: `Promise<{ success: boolean, prompt: Prompt }>` - Object containing success status and the new prompt

### `generateUniqueId()`

Generates a unique ID using UUID v4.

- **Returns**: `Promise<{ success: boolean, id: string }>` - Object containing success status and the generated ID

### `createSamplePrompts()`

Creates a sample prompts file with example prompts.

- **Returns**: `Promise<{ success: boolean }>` - Object containing success status

### `onPromptsSaved(callback)`

Listens for prompt saved events from the main process.

- **Parameters**:
  - `callback` (Function) - Function to call when prompts are saved
- **Returns**: `Function` - Function to remove the listener
- **Callback Parameters**:
  - `data` (Object) - Object containing information about the saved prompts
    - `count` (number) - Number of prompts saved

## Error Handling

All API functions return objects with a `success` property indicating whether the operation was successful. If `success` is `false`, the object will also contain an `error` property with details about the error:

```javascript
{
  success: false,
  error: {
    message: "Failed to load prompts",
    details: "ENOENT: no such file or directory, open '/path/to/prompts.json'"
  }
}
```

## Usage Examples

### Loading Prompts

```javascript
const loadPrompts = async () => {
  try {
    const result = await window.electronAPI.getPrompts();
    if (result.success) {
      setPrompts(result.prompts);
    } else {
      console.error('Error loading prompts:', result.error);
    }
  } catch (error) {
    console.error('Error loading prompts:', error);
  }
};
```

### Saving Prompts

```javascript
const savePrompts = async (prompts) => {
  try {
    const result = await window.electronAPI.savePrompts(prompts);
    if (result.success) {
      console.log(`Saved ${result.count} prompts`);
    } else {
      console.error('Error saving prompts:', result.error);
    }
  } catch (error) {
    console.error('Error saving prompts:', error);
  }
};
```

### Creating a New Prompt

```javascript
const createNewPrompt = async () => {
  try {
    const result = await window.electronAPI.createNewPrompt({
      title: 'My New Prompt'
    });
    if (result.success) {
      setPrompts([...prompts, result.prompt]);
    } else {
      console.error('Error creating new prompt:', result.error);
    }
  } catch (error) {
    console.error('Error creating new prompt:', error);
  }
};
```
