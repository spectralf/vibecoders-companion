import React, { useState } from 'react';

/**
 * A utility component to create sample prompts for testing
 * This is a temporary component that will be removed in the final version
 */
const CreateSamplePrompts = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreateSamples = async () => {
    try {
      setIsCreating(true);
      setResult(null);
      
      // Call the IPC API to create sample prompts
      const response = await window.electronAPI.createSamplePrompts();
      
      setResult({
        success: response.success,
        message: response.success 
          ? 'Sample prompts created successfully!' 
          : `Failed to create sample prompts: ${response.error?.message || 'Unknown error'}`
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message || 'An unexpected error occurred'}`
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleCreateSamples}
        disabled={isCreating}
        className="bg-warning hover:bg-warning-dark text-white px-3 py-2 rounded text-sm shadow-md"
      >
        {isCreating ? 'Creating...' : 'Create Sample Prompts'}
      </button>
      
      {result && (
        <div className={`mt-2 p-2 rounded text-sm ${result.success ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default CreateSamplePrompts;
