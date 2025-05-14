import React from 'react';
import PropTypes from 'prop-types';

/**
 * Visual Context Canvas Properties Panel component
 * Displays and allows editing of properties for selected Konva shapes
 */
const VCCPropertiesPanel = ({
  selectedShape,
  selectedShapes,
  onChange,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onGroup,
  onUngroup,
  canBringToFront,
  canBringForward,
  canSendBackward,
  canSendToBack,
  canGroup,
  canUngroup,
  isGroup
}) => {
  // Always render the panel, even when no shape is selected
  if (!selectedShape) {
    return (
      <div className="vcc-properties-panel bg-neutral-100 dark:bg-dark-bg-tertiary border-l border-neutral-300 dark:border-dark-border p-4 w-64">
        <h3 className="text-lg font-medium text-secondary-dark dark:text-dark-text-primary mb-4">Properties</h3>
        <p className="text-sm text-neutral-500 dark:text-dark-text-secondary">No shape selected. Click on a shape to edit its properties.</p>

        {/* Empty property groups to maintain consistent height */}
        <div className="property-group">
          <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Type</label>
          <div className="text-sm text-neutral-500 dark:text-dark-text-secondary">None</div>
        </div>

        <div className="property-group">
          <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">X:</span>
              <input
                type="number"
                disabled
                className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded bg-neutral-200 dark:bg-dark-bg-primary"
              />
            </div>
            <div>
              <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Y:</span>
              <input
                type="number"
                disabled
                className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded bg-neutral-200 dark:bg-dark-bg-primary"
              />
            </div>
          </div>
        </div>

        <div className="property-group">
          <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Width:</span>
              <input
                type="number"
                disabled
                className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded bg-neutral-200 dark:bg-dark-bg-primary"
              />
            </div>
            <div>
              <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Height:</span>
              <input
                type="number"
                disabled
                className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded bg-neutral-200 dark:bg-dark-bg-primary"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle input change
  const handleChange = (property, value) => {
    // Convert numeric values
    if (['x', 'y', 'width', 'height', 'radiusX', 'radiusY', 'strokeWidth', 'fontSize', 'rotation'].includes(property)) {
      value = parseFloat(value);
      // Ensure the value is a valid number
      if (isNaN(value)) return;
    }

    // Call the onChange callback with the updated property
    onChange({
      ...selectedShape,
      [property]: value
    });
  };

  // Render different properties based on shape type
  const renderShapeProperties = () => {
    switch (selectedShape.tool) {
      case 'rectangle':
        return (
          <>
            {/* Position */}
            <div className="property-group">
              <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">X:</span>
                  <input
                    type="number"
                    value={selectedShape.x}
                    onChange={(e) => handleChange('x', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Y:</span>
                  <input
                    type="number"
                    value={selectedShape.y}
                    onChange={(e) => handleChange('y', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div className="property-group">
              <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Size</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Width:</span>
                  <input
                    type="number"
                    value={selectedShape.width}
                    onChange={(e) => handleChange('width', e.target.value)}
                    min="1"
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Height:</span>
                  <input
                    type="number"
                    value={selectedShape.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    min="1"
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 'ellipse':
        return (
          <>
            {/* Position */}
            <div className="property-group">
              <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">X:</span>
                  <input
                    type="number"
                    value={selectedShape.x}
                    onChange={(e) => handleChange('x', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Y:</span>
                  <input
                    type="number"
                    value={selectedShape.y}
                    onChange={(e) => handleChange('y', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div className="property-group">
              <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Radius</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">X Radius:</span>
                  <input
                    type="number"
                    value={selectedShape.radiusX}
                    onChange={(e) => handleChange('radiusX', e.target.value)}
                    min="1"
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Y Radius:</span>
                  <input
                    type="number"
                    value={selectedShape.radiusY}
                    onChange={(e) => handleChange('radiusY', e.target.value)}
                    min="1"
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 'line':
      case 'pencil':
        return (
          <>
            {/* Position */}
            <div className="property-group">
              <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">X:</span>
                  <input
                    type="number"
                    value={selectedShape.x || 0}
                    onChange={(e) => handleChange('x', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Y:</span>
                  <input
                    type="number"
                    value={selectedShape.y || 0}
                    onChange={(e) => handleChange('y', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 'text':
        return (
          <>
            {/* Position */}
            <div className="property-group">
              <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">X:</span>
                  <input
                    type="number"
                    value={selectedShape.x}
                    onChange={(e) => handleChange('x', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Y:</span>
                  <input
                    type="number"
                    value={selectedShape.y}
                    onChange={(e) => handleChange('y', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="property-group">
              <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Text</label>
              <textarea
                value={selectedShape.text}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded min-h-[60px] dark:bg-dark-bg-primary dark:text-dark-text-primary"
              />
            </div>

            {/* Font Properties */}
            <div className="property-group">
              <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Font</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Size:</span>
                  <input
                    type="number"
                    value={selectedShape.fontSize}
                    onChange={(e) => handleChange('fontSize', e.target.value)}
                    min="8"
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  />
                </div>
                <div>
                  <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Family:</span>
                  <select
                    value={selectedShape.fontFamily}
                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="vcc-properties-panel bg-neutral-100 dark:bg-dark-bg-tertiary border-l border-neutral-300 dark:border-dark-border p-4 w-64">
      <h3 className="text-lg font-medium text-secondary-dark dark:text-dark-text-primary mb-4">Properties</h3>

      {/* Shape Type */}
      <div className="property-group">
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Type</label>
        <div className="text-sm text-neutral-800 dark:text-dark-text-primary capitalize">{selectedShape.tool}</div>
      </div>

      {/* Shape-specific properties */}
      {renderShapeProperties()}

      {/* Layer Management (Z-Order) */}
      <div className="property-group">
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Layer Management</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
              canBringToFront
                ? 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary'
                : 'bg-neutral-200 dark:bg-dark-bg-primary text-neutral-400 dark:text-dark-text-secondary cursor-not-allowed'
            }`}
            onClick={onBringToFront}
            disabled={!canBringToFront}
            title="Bring to Front"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
            Bring to Front
          </button>
          <button
            className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
              canBringForward
                ? 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary'
                : 'bg-neutral-200 dark:bg-dark-bg-primary text-neutral-400 dark:text-dark-text-secondary cursor-not-allowed'
            }`}
            onClick={onBringForward}
            disabled={!canBringForward}
            title="Bring Forward"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7 7 7" />
            </svg>
            Bring Forward
          </button>
          <button
            className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
              canSendBackward
                ? 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary'
                : 'bg-neutral-200 dark:bg-dark-bg-primary text-neutral-400 dark:text-dark-text-secondary cursor-not-allowed'
            }`}
            onClick={onSendBackward}
            disabled={!canSendBackward}
            title="Send Backward"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7" />
            </svg>
            Send Backward
          </button>
          <button
            className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
              canSendToBack
                ? 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary'
                : 'bg-neutral-200 dark:bg-dark-bg-primary text-neutral-400 dark:text-dark-text-secondary cursor-not-allowed'
            }`}
            onClick={onSendToBack}
            disabled={!canSendToBack}
            title="Send to Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            Send to Back
          </button>
        </div>
      </div>

      {/* Group Management */}
      <div className="property-group mt-4">
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Group Management</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
              canGroup
                ? 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary'
                : 'bg-neutral-200 dark:bg-dark-bg-primary text-neutral-400 dark:text-dark-text-secondary cursor-not-allowed'
            }`}
            onClick={onGroup}
            disabled={!canGroup}
            title="Group Selected Shapes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Group
          </button>
          <button
            className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
              canUngroup
                ? 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary'
                : 'bg-neutral-200 dark:bg-dark-bg-primary text-neutral-400 dark:text-dark-text-secondary cursor-not-allowed'
            }`}
            onClick={onUngroup}
            disabled={!canUngroup}
            title="Ungroup Selected Group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Ungroup
          </button>
        </div>

        {/* Group Info */}
        {isGroup && (
          <div className="text-xs text-neutral-500 dark:text-dark-text-secondary mt-1 mb-2">
            <p>This is a group containing {selectedShape.children?.length || 0} shapes.</p>
            <p>Use the Ungroup button to separate the shapes.</p>
          </div>
        )}

        {/* Multi-selection Info */}
        {!isGroup && selectedShapes && selectedShapes.length > 1 && (
          <div className="text-xs text-neutral-500 dark:text-dark-text-secondary mt-1 mb-2">
            <p>{selectedShapes.length} shapes selected.</p>
            <p>Use the Group button to combine them.</p>
          </div>
        )}
      </div>

      {/* Common properties for all shapes */}
      <div className="property-group">
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">Appearance</label>

        {/* Stroke Color */}
        <div className="mb-2">
          <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Stroke Color:</span>
          <div className="flex items-center">
            <input
              type="color"
              value={selectedShape.stroke || '#000000'}
              onChange={(e) => handleChange('stroke', e.target.value)}
              className="w-8 h-8 border border-neutral-300 dark:border-dark-border rounded mr-2 dark:bg-dark-bg-primary"
            />
            <input
              type="text"
              value={selectedShape.stroke || '#000000'}
              onChange={(e) => handleChange('stroke', e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
            />
          </div>
        </div>

        {/* Fill Color (for shapes that support it) */}
        {(selectedShape.tool === 'rectangle' || selectedShape.tool === 'ellipse' || selectedShape.tool === 'text') && (
          <div className="mb-2">
            <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Fill Color:</span>
            <div className="flex items-center">
              <input
                type="color"
                value={selectedShape.fill || '#ffffff'}
                onChange={(e) => handleChange('fill', e.target.value)}
                className="w-8 h-8 border border-neutral-300 dark:border-dark-border rounded mr-2 dark:bg-dark-bg-primary"
              />
              <input
                type="text"
                value={selectedShape.fill || '#ffffff'}
                onChange={(e) => handleChange('fill', e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
              />
            </div>
          </div>
        )}

        {/* Stroke Width */}
        <div className="mb-2">
          <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Stroke Width:</span>
          <input
            type="number"
            value={selectedShape.strokeWidth || 1}
            onChange={(e) => handleChange('strokeWidth', e.target.value)}
            min="1"
            max="20"
            className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
          />
        </div>

        {/* Rotation */}
        <div>
          <span className="block text-xs text-neutral-500 dark:text-dark-text-secondary mb-1">Rotation:</span>
          <input
            type="number"
            value={selectedShape.rotation || 0}
            onChange={(e) => handleChange('rotation', e.target.value)}
            min="0"
            max="360"
            className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-dark-border rounded dark:bg-dark-bg-primary dark:text-dark-text-primary"
          />
        </div>
      </div>
    </div>
  );
};

VCCPropertiesPanel.propTypes = {
  selectedShape: PropTypes.object,
  selectedShapes: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onBringToFront: PropTypes.func.isRequired,
  onBringForward: PropTypes.func.isRequired,
  onSendBackward: PropTypes.func.isRequired,
  onSendToBack: PropTypes.func.isRequired,
  onGroup: PropTypes.func.isRequired,
  onUngroup: PropTypes.func.isRequired,
  canBringToFront: PropTypes.bool,
  canBringForward: PropTypes.bool,
  canSendBackward: PropTypes.bool,
  canSendToBack: PropTypes.bool,
  canGroup: PropTypes.bool,
  canUngroup: PropTypes.bool,
  isGroup: PropTypes.bool
};

export default VCCPropertiesPanel;
