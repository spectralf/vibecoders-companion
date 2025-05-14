import React, { useState, useEffect } from 'react';
import PromptList from './PromptList';
import PromptEditor from './PromptEditor';
import CreateSamplePrompts from './CreateSamplePrompts';
import './PromptManagerView.css';

const PromptManagerView = () => {
  // State for all prompts
  const [prompts, setPrompts] = useState([]);
  // State for selected prompt
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  // Error state
  const [error, setError] = useState(null);
  // Save status for feedback
  const [saveStatus, setSaveStatus] = useState(null);

  // Fetch all prompts on component mount
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Call the IPC API to get prompts from the main process
        const result = await window.electronAPI.getPrompts();

        if (result.success) {
          setPrompts(result.prompts);
        } else {
          setError(result.error?.message || 'Failed to load prompts');
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  // Handler for prompt selection
  const handleSelectPrompt = (promptId) => {
    setSelectedPromptId(promptId);
    // Clear any previous save status when selecting a different prompt
    setSaveStatus(null);
  };

  // Handler for creating a new prompt
  const handleCreateNewPrompt = async () => {
    try {
      // Call the IPC API to create a new prompt
      const result = await window.electronAPI.createNewPrompt({
        title: 'New Prompt'
      });

      if (result.success) {
        // Add the new prompt to the state
        setPrompts(prevPrompts => [...prevPrompts, result.prompt]);
        // Select the new prompt
        setSelectedPromptId(result.prompt.id);
        // Clear any previous save status
        setSaveStatus(null);
      } else {
        setError(result.error?.message || 'Failed to create new prompt');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  // Handler for saving a prompt
  const handleSavePrompt = async (updatedPrompt) => {
    try {
      // Find the index of the prompt to update
      const promptIndex = prompts.findIndex(p => p.id === updatedPrompt.id);

      if (promptIndex === -1) {
        throw new Error('Prompt not found');
      }

      // Create a new array with the updated prompt
      const updatedPrompts = [...prompts];
      updatedPrompts[promptIndex] = {
        ...updatedPrompt,
        updatedAt: new Date().toISOString()
      };

      // Call the IPC API to save all prompts
      const result = await window.electronAPI.savePrompts(updatedPrompts);

      if (result.success) {
        // Update the state with the saved prompts
        setPrompts(updatedPrompts);
        // Set save status for feedback
        setSaveStatus({ success: true, message: 'Prompt saved successfully!' });
        // Clear save status after 3 seconds
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus({
          success: false,
          message: result.error?.message || 'Failed to save prompt'
        });
      }
    } catch (err) {
      setSaveStatus({
        success: false,
        message: err.message || 'An unexpected error occurred'
      });
    }
  };

  // Handler for deleting a prompt
  const handleDeletePrompt = async (promptId) => {
    try {
      // Find the index of the prompt to delete
      const promptIndex = prompts.findIndex(p => p.id === promptId);

      if (promptIndex === -1) {
        throw new Error('Prompt not found');
      }

      // Create a new array without the deleted prompt
      const updatedPrompts = prompts.filter(p => p.id !== promptId);

      // Call the IPC API to save all prompts
      const result = await window.electronAPI.savePrompts(updatedPrompts);

      if (result.success) {
        // Update the state with the saved prompts
        setPrompts(updatedPrompts);
        // Clear the selected prompt ID
        setSelectedPromptId(null);
        // Set save status for feedback
        setSaveStatus({ success: true, message: 'Prompt deleted successfully!' });
        // Clear save status after 3 seconds
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus({
          success: false,
          message: result.error?.message || 'Failed to delete prompt'
        });
      }
    } catch (err) {
      setSaveStatus({
        success: false,
        message: err.message || 'An unexpected error occurred'
      });
    }
  };

  // Handler for duplicating a prompt
  const handleDuplicatePrompt = async (promptId) => {
    try {
      // Find the prompt to duplicate
      const promptToDuplicate = prompts.find(p => p.id === promptId);

      if (!promptToDuplicate) {
        throw new Error('Prompt not found');
      }

      // Call the IPC API to create a new prompt based on the existing one
      const result = await window.electronAPI.createNewPrompt({
        title: `Copy of ${promptToDuplicate.title}`,
        contentJSON: promptToDuplicate.contentJSON,
        contentHTML: promptToDuplicate.contentHTML,
        tags: promptToDuplicate.tags,
        colorCode: promptToDuplicate.colorCode,
        isFavorite: promptToDuplicate.isFavorite
      });

      if (result.success) {
        // Add the new prompt to the state
        setPrompts(prevPrompts => [...prevPrompts, result.prompt]);
        // Select the new prompt
        setSelectedPromptId(result.prompt.id);
        // Set save status for feedback
        setSaveStatus({ success: true, message: 'Prompt duplicated successfully!' });
        // Clear save status after 3 seconds
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus({
          success: false,
          message: result.error?.message || 'Failed to duplicate prompt'
        });
      }
    } catch (err) {
      setSaveStatus({
        success: false,
        message: err.message || 'An unexpected error occurred'
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Prompt List Component */}
      <PromptList
        prompts={prompts}
        isLoading={isLoading}
        error={error}
        onSelectPrompt={handleSelectPrompt}
        onCreateNewPrompt={handleCreateNewPrompt}
        selectedPromptId={selectedPromptId}
      />

      {/* Prompt Editor Component */}
      <PromptEditor
        selectedPromptId={selectedPromptId}
        prompts={prompts}
        onSavePrompt={handleSavePrompt}
        onDeletePrompt={handleDeletePrompt}
        onDuplicatePrompt={handleDuplicatePrompt}
        saveStatus={saveStatus}
      />

      {/* Utility component to create sample prompts (for development only) */}
      <CreateSamplePrompts />
    </div>
  );
};

export default PromptManagerView;
