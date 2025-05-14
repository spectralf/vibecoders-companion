import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * FilterControls component for filtering prompts by tags and favorites
 *
 * @param {Object} props - Component props
 * @param {Array} props.prompts - Array of prompt objects
 * @param {Array} props.selectedTags - Array of currently selected tag filters
 * @param {boolean} props.showFavoritesOnly - Whether to show only favorite prompts
 * @param {Function} props.onTagFilterChange - Function to call when tag filters change
 * @param {Function} props.onFavoriteFilterChange - Function to call when favorite filter changes
 */
const FilterControls = ({
  prompts,
  selectedTags,
  showFavoritesOnly,
  onTagFilterChange,
  onFavoriteFilterChange
}) => {
  // State for dropdown open/closed
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  // Ref for the dropdown (for click outside detection)
  const tagDropdownRef = useRef(null);

  // Get all unique tags from prompts
  const allTags = [...new Set(prompts.flatMap(prompt => prompt.tags || []))].sort();

  // Toggle tag selection
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      // Remove tag if already selected
      onTagFilterChange(selectedTags.filter(t => t !== tag));
    } else {
      // Add tag if not selected
      onTagFilterChange([...selectedTags, tag]);
    }
  };

  // Toggle favorite filter
  const handleFavoriteToggle = () => {
    onFavoriteFilterChange(!showFavoritesOnly);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onTagFilterChange([]);
    onFavoriteFilterChange(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setIsTagDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate if any filters are active
  const hasActiveFilters = selectedTags.length > 0 || showFavoritesOnly;

  return (
    <div className="p-3 border-b border-gray-200 bg-gray-50">
      <div className="flex flex-wrap items-center gap-2">
        {/* All button */}
        <button
          onClick={handleClearFilters}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            !hasActiveFilters
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
        >
          All
        </button>

        {/* Favorites filter */}
        <button
          onClick={handleFavoriteToggle}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
            showFavoritesOnly
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${showFavoritesOnly ? 'text-white' : 'text-yellow-400'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Favorites
        </button>

        {/* Tags filter dropdown */}
        <div className="relative" ref={tagDropdownRef}>
          <button
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
              selectedTags.length > 0
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Tags
            {selectedTags.length > 0 && (
              <span className="ml-1 bg-white text-primary rounded-full px-1.5 text-xs font-medium">
                {selectedTags.length}
              </span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Tag dropdown menu */}
          {isTagDropdownOpen && (
            <div className="absolute z-10 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 max-h-60 overflow-y-auto">
              <div className="py-1">
                {allTags.length > 0 ? (
                  allTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={selectedTags.includes(tag)}
                        onChange={() => {}} // Handled by the onClick on the parent div
                        id={`tag-${tag}`}
                      />
                      <label
                        htmlFor={`tag-${tag}`}
                        className="ml-2 block text-sm text-gray-900 cursor-pointer"
                      >
                        {tag}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No tags available</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Display selected tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 ml-1">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-light text-primary-dark"
              >
                {tag}
                <button
                  type="button"
                  className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-primary-dark hover:bg-primary-dark hover:text-white focus:outline-none"
                  onClick={() => handleTagToggle(tag)}
                >
                  <span className="sr-only">Remove tag {tag}</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

FilterControls.propTypes = {
  prompts: PropTypes.array.isRequired,
  selectedTags: PropTypes.array.isRequired,
  showFavoritesOnly: PropTypes.bool.isRequired,
  onTagFilterChange: PropTypes.func.isRequired,
  onFavoriteFilterChange: PropTypes.func.isRequired
};

export default FilterControls;
