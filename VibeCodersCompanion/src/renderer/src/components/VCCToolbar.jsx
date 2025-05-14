import React from 'react';
import PropTypes from 'prop-types';

/**
 * Visual Context Canvas Toolbar component
 * Provides buttons for selecting different drawing tools, colors, and stroke width
 */
const VCCToolbar = ({
  currentTool,
  onToolChange,
  selectedColor,
  onColorChange,
  selectedStrokeWidth,
  onStrokeWidthChange
}) => {
  // Array of available tools
  const tools = [
    {
      name: 'selection',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      label: 'Selection'
    },
    {
      name: 'rectangle',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
        </svg>
      ),
      label: 'Rectangle'
    },
    {
      name: 'ellipse',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
        </svg>
      ),
      label: 'Ellipse'
    },
    {
      name: 'line',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <line x1="5" y1="19" x2="19" y2="5" strokeWidth="2" />
        </svg>
      ),
      label: 'Line'
    },
    {
      name: 'pencil',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      label: 'Pencil'
    },
    {
      name: 'text',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18m-18 0v12m0-12h7m11 0v12m0-12h-7m-4 12h8" />
        </svg>
      ),
      label: 'Text'
    },
    {
      name: 'fill',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h10a2 2 0 012 2v12a4 4 0 01-4 4H7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21V5a2 2 0 012-2h10a2 2 0 012 2v12a4 4 0 01-4 4H7z" fill="currentColor" />
        </svg>
      ),
      label: 'Fill'
    },
    {
      name: 'eraser',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 13l4 4L20 3l-4-4L2 13z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 17l-4-4" />
        </svg>
      ),
      label: 'Eraser'
    }
  ];

  // Array of available colors
  const colors = [
    { value: '#000000', label: 'Black' },
    { value: '#FFFFFF', label: 'White' },
    { value: '#FF0000', label: 'Red' },
    { value: '#00FF00', label: 'Green' },
    { value: '#0000FF', label: 'Blue' },
    { value: '#FFFF00', label: 'Yellow' },
    { value: '#FF00FF', label: 'Magenta' },
    { value: '#00FFFF', label: 'Cyan' },
    { value: '#FFA500', label: 'Orange' },
    { value: '#800080', label: 'Purple' }
  ];

  return (
    <div className="vcc-toolbar bg-neutral-100 dark:bg-dark-bg-tertiary border-b border-neutral-300 dark:border-dark-border p-2">
      {/* Tools Section */}
      <div className="flex space-x-2 mb-2">
        {tools.map((tool) => (
          <button
            key={tool.name}
            className={`p-2 rounded-md flex items-center justify-center ${
              currentTool === tool.name
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-dark-bg-primary text-neutral-700 dark:text-dark-text-primary hover:bg-neutral-200 dark:hover:bg-dark-bg-secondary'
            }`}
            onClick={() => onToolChange(tool.name)}
            title={tool.label}
            aria-label={tool.label}
            aria-pressed={currentTool === tool.name}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Colors Section */}
      <div className="border-t border-neutral-300 dark:border-dark-border pt-2">
        <div className="text-xs text-neutral-500 dark:text-dark-text-secondary mb-1 pl-1">Colors</div>
        <div className="flex flex-wrap gap-1">
          {colors.map((color) => (
            <button
              key={color.value}
              className={`w-6 h-6 rounded-full border ${
                selectedColor === color.value
                  ? 'border-primary border-2 dark:border-primary-light'
                  : 'border-neutral-300 dark:border-dark-border'
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => onColorChange(color.value)}
              title={color.label}
              aria-label={`Select ${color.label} color`}
              aria-pressed={selectedColor === color.value}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width Section */}
      <div className="border-t border-neutral-300 dark:border-dark-border pt-2 mt-2">
        <div className="text-xs text-neutral-500 dark:text-dark-text-secondary mb-1 pl-1">Stroke Width</div>
        <div className="flex items-center px-1">
          <input
            type="range"
            min="1"
            max="20"
            value={selectedStrokeWidth}
            onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
            className="w-full dark:bg-dark-bg-primary"
            aria-label="Adjust stroke width"
          />
          <span className="ml-2 text-xs text-neutral-700 dark:text-dark-text-primary min-w-[24px] text-center">
            {selectedStrokeWidth}px
          </span>
        </div>
      </div>
    </div>
  );
};

VCCToolbar.propTypes = {
  currentTool: PropTypes.string.isRequired,
  onToolChange: PropTypes.func.isRequired,
  selectedColor: PropTypes.string.isRequired,
  onColorChange: PropTypes.func.isRequired,
  selectedStrokeWidth: PropTypes.number.isRequired,
  onStrokeWidthChange: PropTypes.func.isRequired
};

export default VCCToolbar;
