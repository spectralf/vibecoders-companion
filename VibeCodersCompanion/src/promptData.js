/**
 * Prompt Data Module
 * 
 * This module handles the storage and retrieval of prompt data.
 * It provides functions for loading and saving prompts to a local JSON file,
 * as well as generating unique IDs for new prompts.
 */

const { app } = require('electron');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Define the path to the prompts file
const getPromptsFilePath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'prompts.json');
};

/**
 * Prompt object structure
 * @typedef {Object} Prompt
 * @property {string} id - Unique identifier for the prompt
 * @property {string} title - Title of the prompt
 * @property {Object} contentJSON - JSON content for TipTap editor
 * @property {string} contentHTML - HTML representation of the content
 * @property {string[]} tags - Array of tags associated with the prompt
 * @property {string} colorCode - Color code for the prompt (hex format)
 * @property {boolean} isFavorite - Whether the prompt is marked as favorite
 * @property {string} createdAt - ISO timestamp of when the prompt was created
 * @property {string} updatedAt - ISO timestamp of when the prompt was last updated
 */

/**
 * Default prompt object
 * @type {Prompt}
 */
const defaultPrompt = {
  id: '',
  title: 'New Prompt',
  contentJSON: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
  contentHTML: '<p></p>',
  tags: [],
  colorCode: '#3498db',
  isFavorite: false,
  createdAt: '',
  updatedAt: ''
};

/**
 * Generate a new prompt object with a unique ID and timestamps
 * @param {Object} promptData - Optional data to override default values
 * @returns {Prompt} A new prompt object
 */
const generateNewPrompt = (promptData = {}) => {
  const now = new Date().toISOString();
  return {
    ...defaultPrompt,
    ...promptData,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  };
};

/**
 * Load all prompts from the local JSON file
 * @returns {Promise<Prompt[]>} Array of prompt objects
 */
const loadPrompts = async () => {
  try {
    const promptsFilePath = getPromptsFilePath();
    
    // Check if the file exists
    const exists = await fs.pathExists(promptsFilePath);
    if (!exists) {
      // If the file doesn't exist, create it with an empty array
      await fs.writeJson(promptsFilePath, [], { spaces: 2 });
      return [];
    }
    
    // Read the file and parse the JSON
    const prompts = await fs.readJson(promptsFilePath);
    
    // Validate that it's an array
    if (!Array.isArray(prompts)) {
      console.error('Prompts file does not contain a valid array');
      return [];
    }
    
    return prompts;
  } catch (error) {
    console.error('Error loading prompts:', error);
    return [];
  }
};

/**
 * Save all prompts to the local JSON file
 * @param {Prompt[]} prompts - Array of prompt objects to save
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
const savePrompts = async (prompts) => {
  try {
    // Validate input
    if (!Array.isArray(prompts)) {
      throw new Error('Prompts must be an array');
    }
    
    const promptsFilePath = getPromptsFilePath();
    
    // Ensure the directory exists
    await fs.ensureDir(path.dirname(promptsFilePath));
    
    // Write the prompts to the file
    await fs.writeJson(promptsFilePath, prompts, { spaces: 2 });
    
    return true;
  } catch (error) {
    console.error('Error saving prompts:', error);
    return false;
  }
};

/**
 * Generate a unique ID using UUID v4
 * @returns {string} A unique ID
 */
const generateUniqueId = () => {
  return uuidv4();
};

/**
 * Create a sample prompts file with example prompts
 * This is useful for testing and development
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
const createSamplePromptsFile = async () => {
  try {
    const samplePrompts = [
      generateNewPrompt({
        title: 'Welcome to Vibe Coder\'s Companion',
        contentJSON: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'This is a sample prompt to help you get started. You can edit or delete it.' }
              ]
            }
          ]
        },
        contentHTML: '<p>This is a sample prompt to help you get started. You can edit or delete it.</p>',
        tags: ['welcome', 'sample'],
        colorCode: '#3498db',
        isFavorite: true
      }),
      generateNewPrompt({
        title: 'React Component Template',
        contentJSON: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Create a React functional component with TypeScript and props interface.' }
              ]
            }
          ]
        },
        contentHTML: '<p>Create a React functional component with TypeScript and props interface.</p>',
        tags: ['react', 'template', 'typescript'],
        colorCode: '#2ecc71',
        isFavorite: false
      })
    ];
    
    return await savePrompts(samplePrompts);
  } catch (error) {
    console.error('Error creating sample prompts file:', error);
    return false;
  }
};

module.exports = {
  loadPrompts,
  savePrompts,
  generateNewPrompt,
  generateUniqueId,
  createSamplePromptsFile
};
