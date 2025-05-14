import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Strike from '@tiptap/extension-strike';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TurndownService from 'turndown';
import TipTapToolbar from './TipTapToolbar';

/**
 * PromptEditor component for displaying and editing a selected prompt
 *
 * @param {Object} props - Component props
 * @param {string|null} props.selectedPromptId - ID of the selected prompt
 * @param {Array} props.prompts - Array of all prompts
 * @param {Function} props.onSavePrompt - Function to call when saving a prompt
 * @param {Function} props.onDeletePrompt - Function to call when deleting a prompt
 * @param {Function} props.onDuplicatePrompt - Function to call when duplicating a prompt
 * @param {Object|null} props.saveStatus - Status of the save operation
 */
const PromptEditor = ({
  selectedPromptId,
  prompts,
  onSavePrompt,
  onDeletePrompt,
  onDuplicatePrompt,
  saveStatus
}) => {
  // State for the selected prompt data
  const [promptData, setPromptData] = useState(null);
  // State for the prompt title (separate from promptData to handle input changes)
  const [title, setTitle] = useState('');
  // State for tags (separate from promptData to handle input changes)
  const [tags, setTags] = useState([]);
  // State for the tag input field
  const [tagInput, setTagInput] = useState('');
  // State for the selected color
  const [colorCode, setColorCode] = useState('#3498db');
  // State for the favorite status
  const [isFavorite, setIsFavorite] = useState(false);
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Error state
  const [error, setError] = useState(null);
  // State to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // State for copy feedback
  const [copyFeedback, setCopyFeedback] = useState(null);
  // State for TTS (Text-to-Speech)
  const [ttsState, setTTSState] = useState('stopped'); // 'playing', 'paused', or 'stopped'
  const [ttsSupported, setTTSSupported] = useState(true); // Assume supported until checked
  const [voices, setVoices] = useState([]); // Available voices for TTS
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0); // Index of the selected voice
  const utteranceRef = useRef(null); // Reference to store the SpeechSynthesisUtterance object

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({ levels: [1, 2, 3, 4] }),
      Strike,
      Subscript,
      Superscript,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      HorizontalRule,
    ],
    content: promptData?.contentJSON || {
      type: 'doc',
      content: [{ type: 'paragraph' }]
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none h-full',
      },
    },
    onUpdate: ({ editor }) => {
      // Mark that there are unsaved changes when the editor content changes
      setHasUnsavedChanges(true);
    }
  });

  // Update prompt data when selectedPromptId or prompts change
  useEffect(() => {
    // If no prompt is selected, reset the state
    if (!selectedPromptId) {
      setPromptData(null);
      setTitle('');
      setTags([]);
      setTagInput('');
      setColorCode('#3498db'); // Reset to default color
      setIsFavorite(false); // Reset to default favorite status
      setHasUnsavedChanges(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Find the selected prompt in the array
      const selectedPrompt = prompts.find(prompt => prompt.id === selectedPromptId);

      if (selectedPrompt) {
        setPromptData(selectedPrompt);
        setTitle(selectedPrompt.title);
        // Initialize tags from the prompt data (or empty array if none)
        setTags(selectedPrompt.tags || []);
        // Initialize color from the prompt data (or default color if none)
        setColorCode(selectedPrompt.colorCode || '#3498db');
        // Initialize favorite status from the prompt data (or default to false if none)
        setIsFavorite(selectedPrompt.isFavorite || false);
        setTagInput('');
        setHasUnsavedChanges(false);
      } else {
        setError('Selected prompt not found');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPromptId, prompts]);

  // Handle title input changes
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  // Handle tag input changes
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Handle tag input keydown (Enter or comma to add tag)
  const handleTagInputKeyDown = (e) => {
    // If Enter key is pressed or comma is typed
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  // Add a new tag
  const addTag = () => {
    // Split by comma to handle multiple tags at once
    const tagValues = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (tagValues.length === 0) {
      setTagInput('');
      return;
    }

    // Filter out duplicates and add new tags
    const newTags = [...tags];
    let tagsAdded = false;

    tagValues.forEach(newTag => {
      // Skip if empty or already exists (case insensitive)
      if (!newTag || newTags.some(tag => tag.toLowerCase() === newTag.toLowerCase())) {
        return;
      }

      // Add the new tag
      newTags.push(newTag);
      tagsAdded = true;
    });

    if (tagsAdded) {
      setTags(newTags);
      setHasUnsavedChanges(true);
    }

    setTagInput('');
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setHasUnsavedChanges(true);
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setColorCode(color);
    setHasUnsavedChanges(true);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    setHasUnsavedChanges(true);
  };

  // Handle saving the prompt
  const handleSavePrompt = () => {
    if (!editor || !promptData) return;

    // Get the current content from the editor
    const contentJSON = editor.getJSON();
    const contentHTML = editor.getHTML();

    // Create the updated prompt object
    const updatedPrompt = {
      ...promptData,
      title,
      contentJSON,
      contentHTML,
      tags,
      colorCode,
      isFavorite
    };

    // Call the save function passed from the parent
    if (onSavePrompt) {
      onSavePrompt(updatedPrompt);
    }
  };

  // Handle deleting the prompt
  const handleDeletePrompt = () => {
    if (!promptData) return;

    // Show confirmation dialog
    const confirmDelete = window.confirm(`Are you sure you want to delete "${promptData.title}"?`);

    // If confirmed, call the delete function passed from the parent
    if (confirmDelete && onDeletePrompt) {
      onDeletePrompt(promptData.id);
    }
  };

  // Handle duplicating the prompt
  const handleDuplicatePrompt = () => {
    if (!promptData) return;

    // Call the duplicate function passed from the parent
    if (onDuplicatePrompt) {
      onDuplicatePrompt(promptData.id);
    }
  };

  // Handle copying prompt content as Markdown
  const handleCopyAsMarkdown = async () => {
    if (!editor) return;

    try {
      // Get HTML content from the editor
      const html = editor.getHTML();

      // Create a new instance of TurndownService
      const turndownService = new TurndownService({
        headingStyle: 'atx', // Use # style headings
        codeBlockStyle: 'fenced', // Use ``` style code blocks
        emDelimiter: '*', // Use * for emphasis
        strongDelimiter: '**' // Use ** for strong
      });

      // Convert HTML to Markdown
      const markdown = turndownService.turndown(html);

      // Copy to clipboard using Electron's clipboard API
      const result = await window.electronAPI.writeTextToClipboard(markdown);

      if (result.success) {
        // Show success feedback
        setCopyFeedback({
          type: 'success',
          message: 'Copied to clipboard as Markdown!'
        });

        // Clear feedback after 3 seconds
        setTimeout(() => {
          setCopyFeedback(null);
        }, 3000);
      } else {
        throw new Error(result.error?.message || 'Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Error copying as Markdown:', error);

      // Show error feedback
      setCopyFeedback({
        type: 'error',
        message: error.message || 'Failed to copy to clipboard'
      });

      // Clear feedback after 3 seconds
      setTimeout(() => {
        setCopyFeedback(null);
      }, 3000);
    }
  };

  // Handle copying prompt content as Rich Text (HTML)
  const handleCopyAsRichText = async () => {
    if (!editor) return;

    try {
      // Get HTML content from the editor
      const html = editor.getHTML();

      // Copy HTML to clipboard using Electron's clipboard API
      const result = await window.electronAPI.writeHTMLToClipboard(html);

      if (result.success) {
        // Show success feedback
        setCopyFeedback({
          type: 'success',
          message: 'Copied to clipboard as Rich Text!'
        });

        // Clear feedback after 3 seconds
        setTimeout(() => {
          setCopyFeedback(null);
        }, 3000);
      } else {
        throw new Error(result.error?.message || 'Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Error copying as Rich Text:', error);

      // Show error feedback
      setCopyFeedback({
        type: 'error',
        message: error.message || 'Failed to copy to clipboard'
      });

      // Clear feedback after 3 seconds
      setTimeout(() => {
        setCopyFeedback(null);
      }, 3000);
    }
  };

  // Handle TTS Play
  const handleTTSPlay = () => {
    if (!editor || !ttsSupported || ttsState === 'playing') return;

    try {
      // If paused, resume playback
      if (ttsState === 'paused') {
        window.speechSynthesis.resume();
        setTTSState('playing');
        return;
      }

      // Get plain text from the editor
      const text = editor.getText();

      if (!text.trim()) {
        setCopyFeedback({
          type: 'error',
          message: 'No text to speak!'
        });

        setTimeout(() => {
          setCopyFeedback(null);
        }, 3000);

        return;
      }

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Set the selected voice if available
      if (voices.length > 0 && selectedVoiceIndex >= 0 && selectedVoiceIndex < voices.length) {
        utterance.voice = voices[selectedVoiceIndex];
      }

      // Set up event handlers
      utterance.onstart = () => setTTSState('playing');
      utterance.onpause = () => setTTSState('paused');
      utterance.onresume = () => setTTSState('playing');
      utterance.onend = () => setTTSState('stopped');
      utterance.onerror = (event) => {
        console.error('TTS Error:', event);
        setTTSState('stopped');
        setCopyFeedback({
          type: 'error',
          message: 'Text-to-speech error: ' + (event.error || 'Unknown error')
        });

        setTimeout(() => {
          setCopyFeedback(null);
        }, 3000);
      };

      // Store the utterance in the ref
      utteranceRef.current = utterance;

      // Start speaking
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('TTS Error:', error);
      setTTSState('stopped');
      setCopyFeedback({
        type: 'error',
        message: 'Text-to-speech error: ' + (error.message || 'Unknown error')
      });

      setTimeout(() => {
        setCopyFeedback(null);
      }, 3000);
    }
  };

  // Handle TTS Pause
  const handleTTSPause = () => {
    if (!ttsSupported || ttsState !== 'playing') return;

    try {
      window.speechSynthesis.pause();
      setTTSState('paused');
    } catch (error) {
      console.error('TTS Pause Error:', error);
      setCopyFeedback({
        type: 'error',
        message: 'Failed to pause speech: ' + (error.message || 'Unknown error')
      });

      setTimeout(() => {
        setCopyFeedback(null);
      }, 3000);
    }
  };

  // Handle TTS Stop
  const handleTTSStop = () => {
    if (!ttsSupported || (ttsState !== 'playing' && ttsState !== 'paused')) return;

    try {
      window.speechSynthesis.cancel();
      setTTSState('stopped');
      utteranceRef.current = null;
    } catch (error) {
      console.error('TTS Stop Error:', error);
      setCopyFeedback({
        type: 'error',
        message: 'Failed to stop speech: ' + (error.message || 'Unknown error')
      });

      setTimeout(() => {
        setCopyFeedback(null);
      }, 3000);
    }
  };

  // Handle voice selection change
  const handleVoiceChange = (e) => {
    const index = parseInt(e.target.value, 10);
    setSelectedVoiceIndex(index);
  };

  // Update editor content when promptData changes
  useEffect(() => {
    if (editor && promptData?.contentJSON) {
      // Only update if the content is different to avoid cursor position reset
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(promptData.contentJSON);

      if (currentContent !== newContent) {
        editor.commands.setContent(promptData.contentJSON);
      }
    }
  }, [editor, promptData]);

  // Check if Web Speech API is supported, load available voices, and handle cleanup
  useEffect(() => {
    // Check if speechSynthesis is available in the window object
    if (!('speechSynthesis' in window)) {
      setTTSSupported(false);
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    setTTSSupported(true);

    // Function to load and set available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);

        // Try to find and set the default voice
        const defaultVoiceIndex = availableVoices.findIndex(voice => voice.default);
        if (defaultVoiceIndex !== -1) {
          setSelectedVoiceIndex(defaultVoiceIndex);
        }
      }
    };

    // Load voices initially (might be available immediately in some browsers)
    loadVoices();

    // Set up event listener for when voices are loaded asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup function to cancel any ongoing speech when component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Remove the event listener if it was set
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      }
    };
  }, []);

  // Render a message when no prompt is selected
  if (!selectedPromptId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Prompt Editor</h2>
          <p className="text-gray-600">
            Select a prompt from the list or create a new one.
          </p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading prompt...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Editor Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Prompt Title"
            className="flex-1 px-3 py-2 text-xl font-semibold border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-label="Prompt Title"
          />

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={handleFavoriteToggle}
            className="ml-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        </div>
      </div>

      {/* TipTap Toolbar */}
      <TipTapToolbar editor={editor} />

      {/* Editor Content Area */}
      <div className="flex-1 p-4">
        <div className="border border-gray-300 rounded-md p-4 h-[320px] bg-white overflow-y-auto">
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Tag Management and Color Selection Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-start mb-4">
          {/* Tag Management */}
          <div className="flex-1 mr-4">
            <label htmlFor="tag-input" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>

          {/* Tags Display */}
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">No tags added yet</span>
            )}
          </div>

          {/* Tag Input */}
          <div className="flex">
            <input
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              onBlur={() => tagInput.trim() && addTag()}
              placeholder="Add tags (press Enter or comma to add)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              aria-label="Add tags"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim()}
              className={`ml-2 px-3 py-2 rounded text-sm ${
                tagInput.trim()
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Press Enter or comma to add a tag. Tags help organize and find your prompts.
          </p>
          </div>

          {/* Color Selection */}
          <div className="w-48">
            <div className="flex items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 mr-2">
                Color
              </label>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colorCode }}
                title="Current color"
              ></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Primary color */}
              <button
                type="button"
                onClick={() => handleColorSelect('#3498db')}
                className="w-8 h-8 rounded-full hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                style={{
                  backgroundColor: '#3498db',
                  border: colorCode === '#3498db' ? '2px solid #3498db' : '2px solid transparent'
                }}
                aria-label="Select primary color"
                title="Primary Blue"
              ></button>

              {/* Success color */}
              <button
                type="button"
                onClick={() => handleColorSelect('#2ecc71')}
                className="w-8 h-8 rounded-full hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success"
                style={{
                  backgroundColor: '#2ecc71',
                  border: colorCode === '#2ecc71' ? '2px solid #2ecc71' : '2px solid transparent'
                }}
                aria-label="Select success color"
                title="Success Green"
              ></button>

              {/* Warning color */}
              <button
                type="button"
                onClick={() => handleColorSelect('#f39c12')}
                className="w-8 h-8 rounded-full hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning"
                style={{
                  backgroundColor: '#f39c12',
                  border: colorCode === '#f39c12' ? '2px solid #f39c12' : '2px solid transparent'
                }}
                aria-label="Select warning color"
                title="Warning Orange"
              ></button>

              {/* Danger color */}
              <button
                type="button"
                onClick={() => handleColorSelect('#e74c3c')}
                className="w-8 h-8 rounded-full hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
                style={{
                  backgroundColor: '#e74c3c',
                  border: colorCode === '#e74c3c' ? '2px solid #e74c3c' : '2px solid transparent'
                }}
                aria-label="Select danger color"
                title="Danger Red"
              ></button>

              {/* Secondary color */}
              <button
                type="button"
                onClick={() => handleColorSelect('#2c3e50')}
                className="w-8 h-8 rounded-full hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                style={{
                  backgroundColor: '#2c3e50',
                  border: colorCode === '#2c3e50' ? '2px solid #2c3e50' : '2px solid transparent'
                }}
                aria-label="Select secondary color"
                title="Secondary Dark Blue"
              ></button>

              {/* Purple color */}
              <button
                type="button"
                onClick={() => handleColorSelect('#9b59b6')}
                className="w-8 h-8 rounded-full hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                style={{
                  backgroundColor: '#9b59b6',
                  border: colorCode === '#9b59b6' ? '2px solid #9b59b6' : '2px solid transparent'
                }}
                aria-label="Select purple color"
                title="Purple"
              ></button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Select a color to help identify this prompt in the list.
            </p>
          </div>
        </div>
      </div>

      {/* Editor Footer with Save Button */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          {/* Save Status Feedback */}
          <div className="flex-1">
            {saveStatus && (
              <div className={`text-sm ${saveStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {saveStatus.message}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 flex-wrap">
            <button
              onClick={handleSavePrompt}
              disabled={!hasUnsavedChanges || !editor}
              className={`px-4 py-2 rounded flex items-center ${
                hasUnsavedChanges && editor
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDeletePrompt}
              disabled={!promptData}
              className={`px-4 py-2 rounded flex items-center ${
                promptData
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Delete Prompt"
              aria-label="Delete Prompt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>

            {/* Duplicate Button */}
            <button
              onClick={handleDuplicatePrompt}
              disabled={!promptData}
              className={`px-4 py-2 rounded flex items-center ${
                promptData
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Duplicate Prompt"
              aria-label="Duplicate Prompt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplicate
            </button>

            {/* Copy for AI (Markdown) Button */}
            <button
              onClick={handleCopyAsMarkdown}
              disabled={!editor}
              className={`px-4 py-2 rounded flex items-center mt-2 sm:mt-0 ${
                editor
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Copy for AI (Markdown)"
              aria-label="Copy for AI (Markdown)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy for AI
            </button>

            {/* Copy as Rich Text Button */}
            <button
              onClick={handleCopyAsRichText}
              disabled={!editor}
              className={`px-4 py-2 rounded flex items-center mt-2 sm:mt-0 ${
                editor
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Copy as Rich Text"
              aria-label="Copy as Rich Text"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Copy as Rich Text
            </button>

            {/* Copy Feedback */}
            {copyFeedback && (
              <div className={`ml-2 flex items-center px-3 py-1 rounded text-sm ${
                copyFeedback.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {copyFeedback.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {copyFeedback.message}
              </div>
            )}

            {/* TTS Controls Section */}
            {ttsSupported && (
              <div className="mt-4 border-t pt-4 w-full">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Text-to-Speech</h3>

                {/* Voice Selection Dropdown */}
                <div className="mb-3">
                  <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Voice
                  </label>
                  <select
                    id="voice-select"
                    value={selectedVoiceIndex}
                    onChange={handleVoiceChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    aria-label="Select voice"
                    disabled={voices.length === 0}
                  >
                    {voices.length === 0 ? (
                      <option value="0">Loading voices...</option>
                    ) : (
                      voices.map((voice, index) => (
                        <option key={index} value={index}>
                          {voice.name} ({voice.lang}) {voice.default ? '(Default)' : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex space-x-2">
                  {/* Play/Resume Button */}
                  {ttsState !== 'playing' && (
                    <button
                      onClick={handleTTSPlay}
                      disabled={!editor}
                      className={`px-4 py-2 rounded flex items-center ${
                        editor
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={ttsState === 'paused' ? "Resume Speech" : "Play Speech"}
                      aria-label={ttsState === 'paused' ? "Resume Speech" : "Play Speech"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {ttsState === 'paused' ? "Resume" : "Play"}
                    </button>
                  )}

                  {/* Pause Button */}
                  {ttsState === 'playing' && (
                    <button
                      onClick={handleTTSPause}
                      className="px-4 py-2 rounded flex items-center bg-yellow-500 text-white hover:bg-yellow-600"
                      title="Pause Speech"
                      aria-label="Pause Speech"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pause
                    </button>
                  )}

                  {/* Stop Button */}
                  <button
                    onClick={handleTTSStop}
                    disabled={ttsState === 'stopped'}
                    className={`px-4 py-2 rounded flex items-center ${
                      ttsState !== 'stopped'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title="Stop Speech"
                    aria-label="Stop Speech"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop
                  </button>

                  {/* TTS Status Indicator */}
                  {ttsState !== 'stopped' && (
                    <div className={`ml-2 flex items-center px-3 py-1 rounded text-sm ${
                      ttsState === 'playing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ttsState === 'playing' ? (
                        <>
                          <span className="animate-pulse mr-1">●</span>
                          Speaking...
                        </>
                      ) : (
                        <>
                          <span className="mr-1">❚❚</span>
                          Paused
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

PromptEditor.propTypes = {
  selectedPromptId: PropTypes.string,
  prompts: PropTypes.array.isRequired,
  onSavePrompt: PropTypes.func.isRequired,
  onDeletePrompt: PropTypes.func.isRequired,
  onDuplicatePrompt: PropTypes.func.isRequired,
  saveStatus: PropTypes.shape({
    success: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired
  })
};

export default PromptEditor;
