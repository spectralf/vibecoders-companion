import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import FilterControls from './FilterControls';

// Utility function to extract text from TipTap JSON content
const extractTextFromTipTapJSON = (json) => {
  if (!json || !json.content) return '';

  let text = '';

  // Recursively extract text from content
  const extractFromNode = (node) => {
    if (node.text) {
      text += node.text + ' ';
    }

    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(extractFromNode);
    }
  };

  json.content.forEach(extractFromNode);

  return text.trim();
};

/**
 * PromptList component for displaying a list of prompts
 *
 * @param {Object} props - Component props
 * @param {Array} props.prompts - Array of prompt objects
 * @param {boolean} props.isLoading - Whether prompts are currently loading
 * @param {string|null} props.error - Error message, if any
 * @param {Function} props.onSelectPrompt - Function to call when a prompt is selected
 * @param {Function} props.onCreateNewPrompt - Function to call when the "New Prompt" button is clicked
 * @param {string|null} props.selectedPromptId - ID of the currently selected prompt
 */
const PromptList = ({
  prompts,
  isLoading,
  error,
  onSelectPrompt,
  onCreateNewPrompt,
  selectedPromptId
}) => {
  // State for filters
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  // State for search
  const [searchQuery, setSearchQuery] = useState('');

  // Handle prompt selection
  const handleSelectPrompt = (promptId) => {
    if (onSelectPrompt) {
      onSelectPrompt(promptId);
    }
  };

  // Handle creating a new prompt
  const handleCreateNewPrompt = () => {
    if (onCreateNewPrompt) {
      onCreateNewPrompt();
    }
  };

  // Handle tag filter change
  const handleTagFilterChange = (tags) => {
    setSelectedTags(tags);
  };

  // Handle favorite filter change
  const handleFavoriteFilterChange = (showFavorites) => {
    setShowFavoritesOnly(showFavorites);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter prompts based on selected filters and search query
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      // Filter by favorites if the favorites filter is active
      if (showFavoritesOnly && !prompt.isFavorite) {
        return false;
      }

      // Filter by tags if any tags are selected
      if (selectedTags.length > 0) {
        // Check if the prompt has all the selected tags
        const promptTags = prompt.tags || [];
        if (!selectedTags.every(tag => promptTags.includes(tag))) {
          return false;
        }
      }

      // Filter by search query if there is one
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = prompt.title.toLowerCase().includes(query);

        // Extract text from content JSON for content search
        let contentMatch = false;
        if (prompt.contentJSON) {
          const contentText = extractTextFromTipTapJSON(prompt.contentJSON).toLowerCase();
          contentMatch = contentText.includes(query);
        }

        // Return true if either title or content matches
        return titleMatch || contentMatch;
      }

      // If no search query, show the prompt
      return true;
    });
  }, [prompts, selectedTags, showFavoritesOnly, searchQuery]);

  // Format date for display (e.g., "2 days ago")
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 30) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (err) {
      return 'Unknown date';
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white w-80">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">My Prompts</h2>
        <button
          onClick={handleCreateNewPrompt}
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Prompt
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <FilterControls
        prompts={prompts}
        selectedTags={selectedTags}
        showFavoritesOnly={showFavoritesOnly}
        onTagFilterChange={handleTagFilterChange}
        onFavoriteFilterChange={handleFavoriteFilterChange}
      />

      {/* Prompt List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>Error loading prompts:</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-primary hover:text-primary-dark underline"
            >
              Retry
            </button>
          </div>
        ) : prompts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No prompts found.</p>
            <p className="text-sm">Click "New Prompt" to create one.</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No prompts match the selected criteria.</p>
            <p className="text-sm">
              {searchQuery ? 'Try a different search term or ' : ''}
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredPrompts.map((prompt) => (
              <li
                key={prompt.id}
                onClick={() => handleSelectPrompt(prompt.id)}
                className={`flex p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedPromptId === prompt.id ? 'bg-gray-100' : ''}`}
              >
                {/* Color indicator */}
                <div
                  className="w-1 self-stretch rounded-full mr-3"
                  style={{ backgroundColor: prompt.colorCode || '#3498db' }}
                ></div>

                {/* Prompt info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{prompt.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    {/* Tags (placeholder) */}
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags && prompt.tags.length > 0 ? (
                        prompt.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No tags</span>
                      )}
                      {prompt.tags && prompt.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{prompt.tags.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <span className="text-xs text-gray-500">
                      {formatDate(prompt.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Favorite indicator (placeholder) */}
                <div className="ml-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${prompt.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

PromptList.propTypes = {
  prompts: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onSelectPrompt: PropTypes.func.isRequired,
  onCreateNewPrompt: PropTypes.func.isRequired,
  selectedPromptId: PropTypes.string
};

export default PromptList;
