import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Text, Image } from 'react-konva';
import VCCToolbar from './VCCToolbar';
import VCCPropertiesPanel from './VCCPropertiesPanel';
import TransformableRect from './shapes/TransformableRect';
import TransformableEllipse from './shapes/TransformableEllipse';
import TransformableLine from './shapes/TransformableLine';
import TransformableText from './shapes/TransformableText';
import TransformableImage from './shapes/TransformableImage';
import TransformableGroup from './shapes/TransformableGroup';
import useShapesHistory from '../hooks/useShapesHistory';
// We'll keep the CSS file for now, but we'll use Tailwind classes for new elements
import './VisualContextCanvasView.css';

const VisualContextCanvasView = () => {
  // State for stage dimensions
  const [stageSize, setStageSize] = useState({
    width: 800,
    height: 600
  });

  // State for canvas resize inputs
  const [canvasResizeInputs, setCanvasResizeInputs] = useState({
    width: 800,
    height: 600
  });



  // Common canvas size presets
  const canvasSizePresets = [
    { name: 'Custom', width: null, height: null },
    { name: '800 × 600', width: 800, height: 600 },
    { name: '1024 × 768', width: 1024, height: 768 },
    { name: '1280 × 720 (720p)', width: 1280, height: 720 },
    { name: '1920 × 1080 (1080p)', width: 1920, height: 1080 },
    { name: '400 × 300', width: 400, height: 300 },
    { name: '600 × 400', width: 600, height: 400 }
  ];

  // Selected preset
  const [selectedPreset, setSelectedPreset] = useState('800 × 600');

  // State for drawing tools
  const [currentTool, setCurrentTool] = useState('selection');
  const [selectedColor, setSelectedColor] = useState('#000000'); // Default to black
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(2); // Default stroke width
  const { shapes, updateShapes, undo, redo, canUndo, canRedo, clearHistory } = useShapesHistory([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShapeId, setCurrentShapeId] = useState(null);

  // State for selection
  const [selectedShapeIds, setSelectedShapeIds] = useState([]);

  // For backward compatibility and simplicity in some operations
  const selectedShapeId = selectedShapeIds.length === 1 ? selectedShapeIds[0] : null;

  // Temporary shape being drawn
  const [tempShapeProps, setTempShapeProps] = useState(null);

  // For pencil tool - track points
  const [points, setPoints] = useState([]);

  // For text tool - track text editing
  const [textToEdit, setTextToEdit] = useState(null);
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });
  const [textInputValue, setTextInputValue] = useState('');

  // State for copy feedback
  const [copyFeedback, setCopyFeedback] = useState(null);

  // State for paste feedback
  const [pasteFeedback, setPasteFeedback] = useState(null);

  // State for save/load feedback
  const [fileFeedback, setFileFeedback] = useState(null);

  // Reference to the container div
  const containerRef = useRef(null);
  // Reference to the stage
  const stageRef = useRef(null);

  // Generate a unique ID for shapes
  const getNextId = () => {
    return Date.now().toString();
  };

  // Handle shape deletion
  const handleShapeDelete = useCallback(() => {
    // Skip if no shapes are selected
    if (selectedShapeIds.length === 0) return;

    // Remove the selected shapes from the shapes array
    const updatedShapes = shapes.filter(shape => !selectedShapeIds.includes(shape.id));

    // Update the shapes array
    updateShapes(updatedShapes);

    // Clear the selection
    setSelectedShapeIds([]);
  }, [selectedShapeIds, shapes, updateShapes]);

  // Handle clear canvas
  const handleClearCanvas = useCallback(() => {
    // Show confirmation dialog
    const confirmClear = window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.');

    // If confirmed, clear the canvas
    if (confirmClear) {
      // Clear the shapes array and history
      clearHistory();

      // Clear selection
      setSelectedShapeId(null);
    }
  }, [clearHistory]);

  // Handle canvas resize input change
  const handleResizeInputChange = (e) => {
    const { name, value } = e.target;
    // Convert to number and ensure it's within reasonable limits
    const numValue = Math.max(50, Math.min(3000, parseInt(value) || 0));

    setCanvasResizeInputs(prev => ({
      ...prev,
      [name]: numValue
    }));

    // Set preset to "Custom" if the values don't match any preset
    const matchingPreset = canvasSizePresets.find(
      preset => preset.width === numValue && preset.height === canvasResizeInputs[name === 'width' ? 'height' : 'width']
    );

    if (!matchingPreset) {
      setSelectedPreset('Custom');
    }
  };

  // Handle preset selection
  const handlePresetChange = (e) => {
    const presetName = e.target.value;
    setSelectedPreset(presetName);

    // Find the selected preset
    const preset = canvasSizePresets.find(p => p.name === presetName);

    // If it's a real preset (not "Custom"), update the input values
    if (preset && preset.width && preset.height) {
      setCanvasResizeInputs({
        width: preset.width,
        height: preset.height
      });
    }
  };

  // Scale shapes based on new canvas dimensions
  const scaleShapes = (oldWidth, oldHeight, newWidth, newHeight) => {
    // Calculate scale factors
    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;

    // Scale each shape based on its type
    return shapes.map(shape => {
      const scaledShape = { ...shape };

      // Scale position for all shapes
      scaledShape.x = shape.x * scaleX;
      scaledShape.y = shape.y * scaleY;

      // Scale dimensions based on shape type
      switch (shape.tool) {
        case 'rectangle':
          scaledShape.width = shape.width * scaleX;
          scaledShape.height = shape.height * scaleY;
          break;

        case 'ellipse':
          scaledShape.radiusX = shape.radiusX * scaleX;
          scaledShape.radiusY = shape.radiusY * scaleY;
          break;

        case 'line':
        case 'pencil':
          // Scale each point in the line
          const newPoints = [];
          for (let i = 0; i < shape.points.length; i += 2) {
            newPoints.push(shape.points[i] * scaleX);
            newPoints.push(shape.points[i + 1] * scaleY);
          }
          scaledShape.points = newPoints;
          break;

        case 'text':
          // Scale font size proportionally (using average of X and Y scale)
          const fontScale = (scaleX + scaleY) / 2;
          scaledShape.fontSize = shape.fontSize * fontScale;
          break;

        case 'image':
          scaledShape.width = shape.width * scaleX;
          scaledShape.height = shape.height * scaleY;
          break;
      }

      return scaledShape;
    });
  };

  // Handle canvas resize
  const handleCanvasResize = (option) => {
    // Get the new dimensions from inputs
    const newWidth = canvasResizeInputs.width;
    const newHeight = canvasResizeInputs.height;

    // Validate dimensions
    if (newWidth < 50 || newHeight < 50 || newWidth > 3000 || newHeight > 3000) {
      alert('Canvas dimensions must be between 50 and 3000 pixels.');
      return;
    }



    // Handle based on selected option
    if (option === 'clear') {
      // Show confirmation dialog
      const confirmClear = window.confirm(
        'Resizing with the "Clear Canvas" option will remove all existing content. This action cannot be undone. Continue?'
      );

      if (confirmClear) {
        // Update stage size
        setStageSize({ width: newWidth, height: newHeight });

        // Clear the canvas
        clearHistory();

        // Clear selection
        setSelectedShapeId(null);
      }
    } else if (option === 'scale') {
      // Scale the shapes
      const scaledShapes = scaleShapes(stageSize.width, stageSize.height, newWidth, newHeight);

      // Update stage size
      setStageSize({ width: newWidth, height: newHeight });

      // Update shapes
      updateShapes(scaledShapes);
    }
  };

  // Handle save canvas to file
  const handleSaveCanvas = useCallback(async () => {
    try {
      // Check if stage reference exists
      if (!stageRef.current) {
        throw new Error('Canvas not available');
      }

      // Prepare canvas data for saving
      const canvasData = {
        version: '1.0',
        stageSize,
        shapes,
        timestamp: new Date().toISOString()
      };

      // Send the canvas data to the main process to be saved to a file
      const result = await window.electronAPI.saveCanvasToFile(canvasData);

      if (result.success) {
        // Show success feedback
        setFileFeedback({
          type: 'success',
          message: `Canvas saved to ${result.filePath}`
        });

        // Clear feedback after 5 seconds
        setTimeout(() => {
          setFileFeedback(null);
        }, 5000);
      } else if (result.canceled) {
        // User canceled the save dialog, no need for error feedback
        return;
      } else {
        throw new Error(result.error?.message || 'Failed to save canvas');
      }
    } catch (error) {
      console.error('Error saving canvas to file:', error);

      // Show error feedback
      setFileFeedback({
        type: 'error',
        message: error.message || 'Failed to save canvas'
      });

      // Clear feedback after 5 seconds
      setTimeout(() => {
        setFileFeedback(null);
      }, 5000);
    }
  }, [stageSize, shapes]);

  // Handle load canvas from file
  const handleLoadCanvas = useCallback(async () => {
    try {
      // Show confirmation dialog if there are shapes on the canvas
      if (shapes.length > 0) {
        const confirmLoad = window.confirm(
          'Loading a canvas will replace your current work. This action cannot be undone. Continue?'
        );

        if (!confirmLoad) {
          return;
        }
      }

      // Send request to the main process to open a file dialog and load a canvas file
      const result = await window.electronAPI.loadCanvasFromFile();

      if (result.success) {
        // Parse the loaded canvas data
        const canvasData = result.canvasData;

        // Validate the canvas data
        if (!canvasData || !canvasData.shapes || !Array.isArray(canvasData.shapes)) {
          throw new Error('Invalid canvas file format');
        }

        // Update the stage size
        if (canvasData.stageSize) {
          setStageSize(canvasData.stageSize);
          setCanvasResizeInputs(canvasData.stageSize);



          // Find matching preset or set to custom
          const matchingPreset = canvasSizePresets.find(
            preset => preset.width === canvasData.stageSize.width && preset.height === canvasData.stageSize.height
          );
          setSelectedPreset(matchingPreset ? matchingPreset.name : 'Custom');
        }

        // Load the shapes
        // For images, we need to create Image objects from the src
        const processedShapes = await Promise.all(canvasData.shapes.map(async (shape) => {
          if (shape.tool === 'image' && shape.src) {
            return new Promise((resolve) => {
              const img = new window.Image();
              img.src = shape.src;
              img.onload = () => {
                resolve({
                  ...shape,
                  image: img
                });
              };
              img.onerror = () => {
                // If image fails to load, still resolve but with a placeholder
                console.warn(`Failed to load image for shape ${shape.id}`);
                resolve(shape);
              };
            });
          }
          return shape;
        }));

        // Update the shapes array and clear history
        clearHistory();
        updateShapes(processedShapes);

        // Clear selection
        setSelectedShapeIds([]);

        // Show success feedback
        setFileFeedback({
          type: 'success',
          message: `Canvas loaded from ${result.filePath}`
        });

        // Clear feedback after 5 seconds
        setTimeout(() => {
          setFileFeedback(null);
        }, 5000);
      } else if (result.canceled) {
        // User canceled the load dialog, no need for error feedback
        return;
      } else {
        throw new Error(result.error?.message || 'Failed to load canvas');
      }
    } catch (error) {
      console.error('Error loading canvas from file:', error);

      // Show error feedback
      setFileFeedback({
        type: 'error',
        message: error.message || 'Failed to load canvas'
      });

      // Clear feedback after 5 seconds
      setTimeout(() => {
        setFileFeedback(null);
      }, 5000);
    }
  }, [shapes, clearHistory, updateShapes, canvasSizePresets]);

  // Handle copy canvas to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    try {
      // Check if stage reference exists
      if (!stageRef.current) {
        throw new Error('Canvas not available');
      }

      // Get a PNG data URL from the stage
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1, // Best quality
        pixelRatio: 2 // Higher resolution
      });

      // Send the data URL to the main process to be written to clipboard
      const result = await window.electronAPI.writeImageToClipboard(dataURL);

      if (result.success) {
        // Show success feedback
        setCopyFeedback({
          type: 'success',
          message: 'Canvas copied to clipboard as PNG!'
        });

        // Clear feedback after 3 seconds
        setTimeout(() => {
          setCopyFeedback(null);
        }, 3000);
      } else {
        throw new Error(result.error?.message || 'Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Error copying canvas to clipboard:', error);

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
  }, []);

  // Handle paste from clipboard
  const handlePaste = useCallback(async (e) => {
    try {
      // Prevent default paste behavior
      e.preventDefault();

      // Request image from clipboard via IPC
      const result = await window.electronAPI.readImageFromClipboard();

      if (result.success) {
        // Create a new image object
        const id = getNextId();

        // Create a new Image element to get the natural dimensions
        const img = new window.Image();
        img.src = result.dataURL;

        // Wait for the image to load
        img.onload = () => {
          // Calculate dimensions to fit within the canvas while maintaining aspect ratio
          const maxWidth = stageSize.width * 0.8;
          const maxHeight = stageSize.height * 0.8;

          let width = img.naturalWidth;
          let height = img.naturalHeight;

          // Scale down if image is too large
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          // Create the image shape
          const imageShape = {
            x: (stageSize.width - width) / 2, // Center horizontally
            y: (stageSize.height - height) / 2, // Center vertically
            width,
            height,
            image: img,
            rotation: 0,
            id,
            tool: 'image',
            src: result.dataURL // Store the source for serialization
          };

          // Add the image to the shapes array
          updateShapes([...shapes, imageShape]);

          // Show success feedback
          setPasteFeedback({
            type: 'success',
            message: 'Image pasted from clipboard!'
          });

          // Clear feedback after 3 seconds
          setTimeout(() => {
            setPasteFeedback(null);
          }, 3000);
        };

        // Handle image load error
        img.onerror = () => {
          throw new Error('Failed to load image');
        };
      } else {
        // If no image in clipboard, show error
        if (result.error?.message === 'No image found in clipboard') {
          setPasteFeedback({
            type: 'info',
            message: 'No image found in clipboard'
          });
        } else {
          throw new Error(result.error?.message || 'Failed to paste from clipboard');
        }

        // Clear feedback after 3 seconds
        setTimeout(() => {
          setPasteFeedback(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error pasting from clipboard:', error);

      // Show error feedback
      setPasteFeedback({
        type: 'error',
        message: error.message || 'Failed to paste from clipboard'
      });

      // Clear feedback after 3 seconds
      setTimeout(() => {
        setPasteFeedback(null);
      }, 3000);
    }
  }, [shapes, updateShapes, stageSize]);

  // Set initial stage size (no auto-resize)
  useEffect(() => {
    // Set initial canvas size to default values
    setStageSize({
      width: 800,
      height: 600
    });

    // Update the resize inputs to match
    setCanvasResizeInputs({
      width: 800,
      height: 600
    });
  }, []);



  // Add keyboard event listener for Delete/Backspace key presses
  useEffect(() => {
    // Handler function for keydown events
    const handleKeyDown = (e) => {
      // Only handle Delete/Backspace when a shape is selected and we're not editing text
      if ((e.key === 'Delete' || e.key === 'Backspace') &&
          selectedShapeId &&
          textToEdit === null &&
          !isDrawing) {
        // Prevent default behavior (e.g., browser back navigation on Backspace)
        e.preventDefault();

        // Delete the selected shape
        handleShapeDelete();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedShapeId, textToEdit, isDrawing, handleShapeDelete]);

  // Add keyboard event listener for Undo/Redo key presses
  useEffect(() => {
    // Handler function for keydown events
    const handleKeyDown = (e) => {
      // Check if we're editing text (don't handle shortcuts in that case)
      if (textToEdit !== null) return;

      // Check for Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Check for Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [textToEdit, undo, redo]);

  // Add paste event listener
  useEffect(() => {
    // Add event listener for paste events
    window.addEventListener('paste', handlePaste);

    // Cleanup
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // Handle tool change
  const handleToolChange = (tool) => {
    setCurrentTool(tool);
  };

  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  // Handle stroke width change
  const handleStrokeWidthChange = (width) => {
    setSelectedStrokeWidth(width);
  };

  // Handle shape selection
  const handleShapeSelect = (shapeId, isMultiSelect = false) => {
    // Only allow selection when the selection tool is active
    if (currentTool === 'selection') {
      if (isMultiSelect) {
        // If the shape is already selected, deselect it
        if (selectedShapeIds.includes(shapeId)) {
          setSelectedShapeIds(selectedShapeIds.filter(id => id !== shapeId));
        } else {
          // Otherwise, add it to the selection
          setSelectedShapeIds([...selectedShapeIds, shapeId]);
        }
      } else {
        // Single selection - replace the current selection
        setSelectedShapeIds([shapeId]);
      }
    }
  };



  // Handle shape deselection (when clicking on empty area)
  const checkDeselect = (e) => {
    // If we're drawing or editing text, don't handle deselection
    if (isDrawing || textToEdit !== null) return;

    // Only handle deselection when the selection tool is active
    // The fill tool and eraser tool should not deselect shapes
    if (currentTool !== 'selection' && currentTool !== 'fill' && currentTool !== 'eraser') return;

    // Check if the click is on a transformer handle or anchor
    // This prevents deselection when clicking on transformer handles
    const targetName = e.target.name ? e.target.name() : '';
    const isTransformerPart =
      targetName === 'transformer' ||
      targetName === 'anchor' ||
      targetName.includes('anchor') ||  // More general check for any anchor
      targetName.includes('rotater') ||
      targetName.includes('transformer') ||  // More general check for any transformer part
      (e.target.parent && (
        e.target.parent.name() === 'Transformer' ||
        (e.target.parent.className && e.target.parent.className === 'Transformer')
      )) ||
      (e.target.className && e.target.className === 'Transformer');

    // Deselect when clicked on empty area or on the stage background
    // but NOT when clicked on a transformer part
    const clickedOnEmpty = (e.target === e.target.getStage() ||
                          targetName === 'background-rect') &&
                          !isTransformerPart;

    if (clickedOnEmpty) {
      setSelectedShapeIds([]);
    }
  };

  // Handle mouse down event
  const handleMouseDown = (e) => {
    // If we're editing text, don't handle mouse down
    if (textToEdit !== null) return;

    // Get the native event
    const evt = e.evt;

    // Check if this is a multi-selection (Shift key pressed)
    const isMultiSelect = evt.shiftKey;

    // If this is a click on a shape with the selection tool, handle selection
    if (currentTool === 'selection' && e.target !== e.target.getStage() && e.target.name() !== 'background-rect') {
      const clickedShape = e.target;
      const clickedShapeId = clickedShape.attrs.id;

      // Handle shape selection with multi-select if shift is pressed
      handleShapeSelect(clickedShapeId, isMultiSelect);

      // Don't proceed with deselection or drawing
      return;
    }

    // Check for deselection (only if not multi-selecting)
    if (!isMultiSelect) {
      checkDeselect(e);
    }

    // Prevent default behavior
    evt.preventDefault();

    // Get pointer position relative to the stage
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Generate a unique ID for the new shape
    const id = getNextId();
    setCurrentShapeId(id);

    // Clear selection when starting to draw, but only if not using the selection tool, fill tool, or eraser tool
    if (currentTool !== 'selection' && currentTool !== 'fill' && currentTool !== 'eraser') {
      setSelectedShapeIds([]);
    }

    // Handle different tools
    switch (currentTool) {
      case 'selection':
        // For selection tool, we don't need to do anything here
        // Selection is handled by the shape's onClick event
        break;

      case 'fill':
        // For fill tool, we need to check if we clicked on a shape
        // If the target is a shape (not the stage or background), apply fill
        if (e.target !== e.target.getStage() && e.target.name() !== 'background-rect') {
          // Get the shape that was clicked
          const clickedShape = e.target;

          // Get the shape's ID from its attrs
          const clickedShapeId = clickedShape.attrs.id;

          // Find the shape in our shapes array
          const shapeIndex = shapes.findIndex(shape => shape.id === clickedShapeId);

          if (shapeIndex !== -1) {
            // Check if the shape supports fill (rectangle, ellipse, text)
            const shapeType = shapes[shapeIndex].tool;
            if (shapeType === 'rectangle' || shapeType === 'ellipse' || shapeType === 'text') {
              // Create a copy of the shapes array
              const updatedShapes = [...shapes];

              // Update the fill property of the clicked shape
              updatedShapes[shapeIndex] = {
                ...updatedShapes[shapeIndex],
                fill: selectedColor
              };

              // Update the shapes array
              updateShapes(updatedShapes);
            }
          }
        }
        break;

      case 'eraser':
        // For eraser tool, we need to check if we clicked on a shape
        // If the target is a shape (not the stage or background), remove it
        if (e.target !== e.target.getStage() && e.target.name() !== 'background-rect') {
          // Get the shape that was clicked
          const clickedShape = e.target;

          // Get the shape's ID from its attrs
          const clickedShapeId = clickedShape.attrs.id;

          // Remove the shape from the shapes array
          const updatedShapes = shapes.filter(shape => shape.id !== clickedShapeId);

          // Update the shapes array
          updateShapes(updatedShapes);

          // Clear selection if the erased shape was selected
          if (selectedShapeId === clickedShapeId) {
            setSelectedShapeId(null);
          }
        }
        break;

      case 'rectangle':
        // Start drawing
        setIsDrawing(true);
        // Create a new rectangle
        setTempShapeProps({
          x: pointerPos.x,
          y: pointerPos.y,
          width: 0,
          height: 0,
          stroke: selectedColor,
          strokeWidth: selectedStrokeWidth,
          rotation: 0,
          id
        });
        break;

      case 'ellipse':
        // Start drawing
        setIsDrawing(true);
        // Create a new ellipse
        setTempShapeProps({
          x: pointerPos.x,
          y: pointerPos.y,
          radiusX: 0,
          radiusY: 0,
          stroke: selectedColor,
          strokeWidth: selectedStrokeWidth,
          rotation: 0,
          id
        });
        break;

      case 'line':
        // Start drawing
        setIsDrawing(true);
        // Create a new line
        setTempShapeProps({
          points: [pointerPos.x, pointerPos.y, pointerPos.x, pointerPos.y],
          stroke: selectedColor,
          strokeWidth: selectedStrokeWidth,
          rotation: 0,
          id
        });
        break;

      case 'pencil':
        // Start drawing
        setIsDrawing(true);
        // Start a new pencil line
        setPoints([pointerPos.x, pointerPos.y]);
        setTempShapeProps({
          points: [pointerPos.x, pointerPos.y],
          stroke: selectedColor,
          strokeWidth: selectedStrokeWidth,
          tension: 0.5,
          lineCap: 'round',
          lineJoin: 'round',
          rotation: 0,
          id
        });
        break;

      case 'text':
        // For text tool, we don't need to set isDrawing
        // Just add a new text shape directly to the shapes array
        const newTextShape = {
          x: pointerPos.x,
          y: pointerPos.y,
          text: 'Double-click to edit',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: selectedColor,
          rotation: 0,
          id,
          tool: 'text'
        };
        updateShapes([...shapes, newTextShape]);
        break;

      default:
        break;
    }
  };

  // Handle mouse move event
  const handleMouseMove = (e) => {
    // Skip if not drawing
    if (!isDrawing) return;

    // Get pointer position relative to the stage
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Handle different tools
    switch (currentTool) {
      case 'rectangle':
        // Update rectangle dimensions
        setTempShapeProps({
          ...tempShapeProps,
          width: pointerPos.x - tempShapeProps.x,
          height: pointerPos.y - tempShapeProps.y
        });
        break;

      case 'ellipse':
        // Update ellipse dimensions
        setTempShapeProps({
          ...tempShapeProps,
          radiusX: Math.abs(pointerPos.x - tempShapeProps.x),
          radiusY: Math.abs(pointerPos.y - tempShapeProps.y)
        });
        break;

      case 'line':
        // Update line end point
        setTempShapeProps({
          ...tempShapeProps,
          points: [
            tempShapeProps.points[0],
            tempShapeProps.points[1],
            pointerPos.x,
            pointerPos.y
          ]
        });
        break;

      case 'pencil':
        // Add point to pencil line
        const newPoints = [...points, pointerPos.x, pointerPos.y];
        setPoints(newPoints);
        setTempShapeProps({
          ...tempShapeProps,
          points: newPoints
        });
        break;

      default:
        break;
    }
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    // Skip if not drawing
    if (!isDrawing) return;

    // Stop drawing
    setIsDrawing(false);

    // Add the shape to the shapes array
    if (tempShapeProps) {
      updateShapes([...shapes, { ...tempShapeProps, tool: currentTool }]);
    }

    // Reset temporary shape
    setTempShapeProps(null);
    setPoints([]);
    setCurrentShapeId(null);
  };

  // Handle text double click for editing
  const handleTextDblClick = (e, shape) => {
    // Prevent default behavior
    e.evt.preventDefault();

    // Get the stage
    const stage = e.target.getStage();

    // Calculate position for the text input
    // We need to account for the stage's position and any scaling
    const stageBox = stage.container().getBoundingClientRect();
    const textNode = e.target;

    // Set the text to edit
    setTextToEdit(shape.id);
    setTextInputValue(shape.text);

    // Position the text input over the text
    setTextInputPosition({
      x: stageBox.left + textNode.x() - stage.x(),
      y: stageBox.top + textNode.y() - stage.y()
    });
  };

  // Handle text input change
  const handleTextInputChange = (e) => {
    setTextInputValue(e.target.value);
  };

  // Handle text input blur (when user clicks outside)
  const handleTextInputBlur = () => {
    // Update the text in the shapes array
    if (textToEdit) {
      const updatedShapes = shapes.map(shape =>
        shape.id === textToEdit
          ? { ...shape, text: textInputValue || 'Double-click to edit' }
          : shape
      );
      updateShapes(updatedShapes);
    }

    // Reset text editing state
    setTextToEdit(null);
  };

  // Handle text input key down
  const handleTextInputKeyDown = (e) => {
    // If Enter key is pressed, save the text
    if (e.key === 'Enter') {
      handleTextInputBlur();
    }

    // If Escape key is pressed, cancel editing
    if (e.key === 'Escape') {
      setTextToEdit(null);
    }
  };

  // Handle shape change (position, size, rotation)
  const handleShapeChange = (newAttrs) => {
    // Update the shape in the shapes array
    const updatedShapes = shapes.map(shape =>
      shape.id === newAttrs.id ? { ...shape, ...newAttrs } : shape
    );

    updateShapes(updatedShapes);
  };

  // Group/Ungroup Functions

  // Group selected shapes
  const handleGroupShapes = useCallback(() => {
    // Skip if fewer than 2 shapes are selected
    if (selectedShapeIds.length < 2) return;

    // Find the selected shapes
    const selectedShapes = shapes.filter(shape => selectedShapeIds.includes(shape.id));

    // Calculate the bounding box of the selected shapes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedShapes.forEach(shape => {
      const x = shape.x || 0;
      const y = shape.y || 0;
      const width = shape.width || (shape.radiusX ? shape.radiusX * 2 : 0);
      const height = shape.height || (shape.radiusY ? shape.radiusY * 2 : 0);

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    // Create a new group shape
    const groupId = getNextId();
    const groupShape = {
      id: groupId,
      tool: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      children: selectedShapes.map(shape => ({
        ...shape,
        // Store relative positions within the group
        x: shape.x - minX,
        y: shape.y - minY
      }))
    };

    // Create a copy of the shapes array without the selected shapes
    const updatedShapes = shapes.filter(shape => !selectedShapeIds.includes(shape.id));

    // Add the group shape
    updatedShapes.push(groupShape);

    // Update the shapes array
    updateShapes(updatedShapes);

    // Select the new group
    setSelectedShapeIds([groupId]);
  }, [selectedShapeIds, shapes, updateShapes]);

  // Ungroup selected group
  const handleUngroupShapes = useCallback(() => {
    // Skip if not exactly one shape is selected
    if (selectedShapeIds.length !== 1) return;

    // Find the selected shape
    const selectedShape = shapes.find(shape => shape.id === selectedShapeIds[0]);

    // Skip if the selected shape is not a group
    if (!selectedShape || selectedShape.tool !== 'group' || !selectedShape.children) return;

    // Create a copy of the shapes array without the group
    const updatedShapes = shapes.filter(shape => shape.id !== selectedShape.id);

    // Add the children of the group with adjusted positions
    const childrenWithAbsolutePositions = selectedShape.children.map(child => ({
      ...child,
      // Restore absolute positions
      x: child.x + selectedShape.x,
      y: child.y + selectedShape.y,
      id: getNextId() // Assign new IDs to avoid conflicts
    }));

    updatedShapes.push(...childrenWithAbsolutePositions);

    // Update the shapes array
    updateShapes(updatedShapes);

    // Select the ungrouped shapes
    setSelectedShapeIds(childrenWithAbsolutePositions.map(child => child.id));
  }, [selectedShapeIds, shapes, updateShapes]);

  // Layer Management (Z-Order) Functions

  // Bring the selected shape to the front (top layer)
  const handleBringToFront = useCallback(() => {
    if (selectedShapeIds.length !== 1) return;
    const selectedShapeId = selectedShapeIds[0];

    // Find the selected shape
    const selectedShapeIndex = shapes.findIndex(shape => shape.id === selectedShapeId);
    if (selectedShapeIndex === -1) return;

    // If the shape is already at the front, do nothing
    if (selectedShapeIndex === shapes.length - 1) return;

    // Create a copy of the shapes array
    const updatedShapes = [...shapes];

    // Remove the selected shape from its current position
    const [selectedShape] = updatedShapes.splice(selectedShapeIndex, 1);

    // Add the selected shape to the end of the array (top layer)
    updatedShapes.push(selectedShape);

    // Update the shapes array
    updateShapes(updatedShapes);
  }, [selectedShapeIds, shapes, updateShapes]);

  // Bring the selected shape forward one layer
  const handleBringForward = useCallback(() => {
    if (selectedShapeIds.length !== 1) return;
    const selectedShapeId = selectedShapeIds[0];

    // Find the selected shape
    const selectedShapeIndex = shapes.findIndex(shape => shape.id === selectedShapeId);
    if (selectedShapeIndex === -1) return;

    // If the shape is already at the front, do nothing
    if (selectedShapeIndex === shapes.length - 1) return;

    // Create a copy of the shapes array
    const updatedShapes = [...shapes];

    // Swap the selected shape with the shape above it
    [updatedShapes[selectedShapeIndex], updatedShapes[selectedShapeIndex + 1]] =
    [updatedShapes[selectedShapeIndex + 1], updatedShapes[selectedShapeIndex]];

    // Update the shapes array
    updateShapes(updatedShapes);
  }, [selectedShapeIds, shapes, updateShapes]);

  // Send the selected shape backward one layer
  const handleSendBackward = useCallback(() => {
    if (selectedShapeIds.length !== 1) return;
    const selectedShapeId = selectedShapeIds[0];

    // Find the selected shape
    const selectedShapeIndex = shapes.findIndex(shape => shape.id === selectedShapeId);
    if (selectedShapeIndex === -1) return;

    // If the shape is already at the back, do nothing
    if (selectedShapeIndex === 0) return;

    // Create a copy of the shapes array
    const updatedShapes = [...shapes];

    // Swap the selected shape with the shape below it
    [updatedShapes[selectedShapeIndex], updatedShapes[selectedShapeIndex - 1]] =
    [updatedShapes[selectedShapeIndex - 1], updatedShapes[selectedShapeIndex]];

    // Update the shapes array
    updateShapes(updatedShapes);
  }, [selectedShapeIds, shapes, updateShapes]);

  // Send the selected shape to the back (bottom layer)
  const handleSendToBack = useCallback(() => {
    if (selectedShapeIds.length !== 1) return;
    const selectedShapeId = selectedShapeIds[0];

    // Find the selected shape
    const selectedShapeIndex = shapes.findIndex(shape => shape.id === selectedShapeId);
    if (selectedShapeIndex === -1) return;

    // If the shape is already at the back, do nothing
    if (selectedShapeIndex === 0) return;

    // Create a copy of the shapes array
    const updatedShapes = [...shapes];

    // Remove the selected shape from its current position
    const [selectedShape] = updatedShapes.splice(selectedShapeIndex, 1);

    // Add the selected shape to the beginning of the array (bottom layer)
    updatedShapes.unshift(selectedShape);

    // Update the shapes array
    updateShapes(updatedShapes);
  }, [selectedShapeIds, shapes, updateShapes]);

  // Get the selected shape object (for single selection)
  const selectedShape = selectedShapeId ? shapes.find(shape => shape.id === selectedShapeId) : null;

  // Get all selected shapes
  const selectedShapes = shapes.filter(shape => selectedShapeIds.includes(shape.id));

  // Determine if the selected shape is a group
  const isSelectedShapeGroup = selectedShape && selectedShape.tool === 'group';

  // Determine if the selected shape can be moved in each direction
  const canBringToFront = selectedShapeId && shapes.findIndex(shape => shape.id === selectedShapeId) < shapes.length - 1;
  const canBringForward = selectedShapeId && shapes.findIndex(shape => shape.id === selectedShapeId) < shapes.length - 1;
  const canSendBackward = selectedShapeId && shapes.findIndex(shape => shape.id === selectedShapeId) > 0;
  const canSendToBack = selectedShapeId && shapes.findIndex(shape => shape.id === selectedShapeId) > 0;

  // Determine if shapes can be grouped or ungrouped
  const canGroup = selectedShapeIds.length >= 2;
  const canUngroup = selectedShapeId && isSelectedShapeGroup;

  return (
    <div className="visual-context-canvas-view">
      {/* Using Tailwind classes for the heading */}
      <h2 className="text-2xl font-semibold text-secondary-dark dark:text-dark-text-primary mb-4">
        Visual Context Canvas
      </h2>

      {/* Drawing Tools Toolbar */}
      <VCCToolbar
        currentTool={currentTool}
        onToolChange={handleToolChange}
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
        selectedStrokeWidth={selectedStrokeWidth}
        onStrokeWidthChange={handleStrokeWidthChange}
      />

      {/* Main content area with canvas and properties panel - always row layout for stability */}
      <div className="flex flex-row flex-shrink-0">
        {/* Canvas container - with flexible layout */}
        <div
          ref={containerRef}
          className="canvas-container bg-neutral-100 dark:bg-dark-bg-tertiary border border-neutral-300 dark:border-dark-border rounded-lg"
          style={{
            flex: '1',
            transition: 'none', /* Disable any transitions that might cause animation */
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto' /* Ensure scrolling is enabled at this level */
          }}
        >
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background Layer */}
            <Layer>
              <Rect
                x={0}
                y={0}
                width={stageSize.width}
                height={stageSize.height}
                fill="white"
                name="background-rect"
                onClick={checkDeselect}
              />
            </Layer>

            {/* Content Layer - For drawing shapes */}
            <Layer>
              {/* Render all finalized shapes */}
              {shapes.map((shape) => {
                const isSelected = selectedShapeIds.includes(shape.id);

                switch (shape.tool) {
                  case 'rectangle':
                    return (
                      <TransformableRect
                        key={shape.id}
                        shapeProps={shape}
                        isSelected={isSelected}
                        onSelect={(e) => handleShapeSelect(shape.id, e.evt.shiftKey)}
                        onChange={handleShapeChange}
                      />
                    );

                  case 'ellipse':
                    return (
                      <TransformableEllipse
                        key={shape.id}
                        shapeProps={shape}
                        isSelected={isSelected}
                        onSelect={(e) => handleShapeSelect(shape.id, e.evt.shiftKey)}
                        onChange={handleShapeChange}
                      />
                    );

                  case 'line':
                  case 'pencil':
                    return (
                      <TransformableLine
                        key={shape.id}
                        shapeProps={shape}
                        isSelected={isSelected}
                        onSelect={(e) => handleShapeSelect(shape.id, e.evt.shiftKey)}
                        onChange={handleShapeChange}
                      />
                    );

                  case 'text':
                    return (
                      <TransformableText
                        key={shape.id}
                        shapeProps={shape}
                        isSelected={isSelected}
                        onSelect={(e) => handleShapeSelect(shape.id, e.evt.shiftKey)}
                        onChange={handleShapeChange}
                        onDblClick={(e) => handleTextDblClick(e, shape)}
                      />
                    );

                  case 'image':
                    return (
                      <TransformableImage
                        key={shape.id}
                        shapeProps={shape}
                        isSelected={isSelected}
                        onSelect={(e) => handleShapeSelect(shape.id, e.evt.shiftKey)}
                        onChange={handleShapeChange}
                      />
                    );

                  case 'group':
                    return (
                      <TransformableGroup
                        key={shape.id}
                        shapeProps={shape}
                        isSelected={isSelected}
                        onSelect={(e) => handleShapeSelect(shape.id, e.evt.shiftKey)}
                        onChange={handleShapeChange}
                      />
                    );

                  default:
                    return null;
                }
              })}

              {/* Render the shape being currently drawn */}
              {tempShapeProps && (
                <>
                  {currentTool === 'rectangle' && (
                    <Rect
                      x={tempShapeProps.x}
                      y={tempShapeProps.y}
                      width={tempShapeProps.width}
                      height={tempShapeProps.height}
                      stroke={tempShapeProps.stroke}
                      strokeWidth={tempShapeProps.strokeWidth}
                    />
                  )}

                  {currentTool === 'ellipse' && (
                    <Ellipse
                      x={tempShapeProps.x}
                      y={tempShapeProps.y}
                      radiusX={tempShapeProps.radiusX}
                      radiusY={tempShapeProps.radiusY}
                      stroke={tempShapeProps.stroke}
                      strokeWidth={tempShapeProps.strokeWidth}
                    />
                  )}

                  {(currentTool === 'line' || currentTool === 'pencil') && (
                    <Line
                      points={tempShapeProps.points}
                      stroke={tempShapeProps.stroke}
                      strokeWidth={tempShapeProps.strokeWidth}
                      tension={tempShapeProps.tension}
                      lineCap={tempShapeProps.lineCap}
                      lineJoin={tempShapeProps.lineJoin}
                    />
                  )}
                </>
              )}
            </Layer>
          </Stage>
        </div>

        {/* Properties Panel - Always visible with fixed width */}
        <div className="ml-4 w-64 lg:w-80 flex-shrink-0">
          <VCCPropertiesPanel
            selectedShape={selectedShape}
            selectedShapes={selectedShapes}
            onChange={handleShapeChange}
            onBringToFront={handleBringToFront}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onSendToBack={handleSendToBack}
            onGroup={handleGroupShapes}
            onUngroup={handleUngroupShapes}
            canBringToFront={canBringToFront}
            canBringForward={canBringForward}
            canSendBackward={canSendBackward}
            canSendToBack={canSendToBack}
            canGroup={canGroup}
            canUngroup={canUngroup}
            isGroup={isSelectedShapeGroup}
          />
        </div>
      </div>

      {/* Text Input Overlay for editing text */}
      {textToEdit !== null && (
        <div
          className="absolute"
          style={{
            position: 'absolute',
            top: `${textInputPosition.y}px`,
            left: `${textInputPosition.x}px`,
            zIndex: 1000
          }}
        >
          <input
            type="text"
            value={textInputValue}
            onChange={handleTextInputChange}
            onBlur={handleTextInputBlur}
            onKeyDown={handleTextInputKeyDown}
            className="border border-primary dark:border-primary-light rounded px-2 py-1 text-sm dark:bg-dark-bg-primary dark:text-dark-text-primary"
            autoFocus
            style={{
              background: document.documentElement.classList.contains('dark') ? '#1e1e1e' : 'white',
              minWidth: '150px'
            }}
          />
        </div>
      )}

      {/* Canvas Actions */}
      <div className="mt-4 p-4 bg-neutral-100 dark:bg-dark-bg-tertiary rounded-md border border-neutral-300 dark:border-dark-border">
        <h3 className="text-lg font-medium text-secondary-dark dark:text-dark-text-primary mb-2">
          Canvas Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-2 ${canUndo() ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-neutral-300 dark:bg-dark-bg-primary text-neutral-500 dark:text-dark-text-secondary cursor-not-allowed'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 flex items-center`}
            onClick={undo}
            disabled={!canUndo()}
            aria-label="Undo last action"
            title="Undo (Ctrl+Z)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a4 4 0 0 1 0 8H9m-6-8l-3 3m0 0l3 3m-3-3h3" />
            </svg>
            Undo
          </button>
          <button
            className={`px-3 py-2 ${canRedo() ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-neutral-300 dark:bg-dark-bg-primary text-neutral-500 dark:text-dark-text-secondary cursor-not-allowed'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 flex items-center`}
            onClick={redo}
            disabled={!canRedo()}
            aria-label="Redo last undone action"
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10H11a4 4 0 0 0 0 8h4m6-8l3 3m0 0l-3 3m3-3h-3" />
            </svg>
            Redo
          </button>
          <button
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
            onClick={handleCopyToClipboard}
            aria-label="Copy canvas to clipboard"
            title="Copy to Clipboard (PNG)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy to Clipboard
          </button>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
            onClick={handleSaveCanvas}
            aria-label="Save canvas to file"
            title="Save Canvas (JSON)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Canvas
          </button>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
            onClick={handleLoadCanvas}
            aria-label="Load canvas from file"
            title="Load Canvas (JSON)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Load Canvas
          </button>
          <button
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
            onClick={handleClearCanvas}
            aria-label="Clear canvas"
            title="Clear Canvas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Canvas
          </button>
        </div>

        {/* Feedback message for copy operation */}
        {copyFeedback && (
          <div className={`mt-2 p-2 rounded-md ${copyFeedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {copyFeedback.message}
          </div>
        )}

        {/* Feedback message for paste operation */}
        {pasteFeedback && (
          <div className={`mt-2 p-2 rounded-md ${
            pasteFeedback.type === 'success' ? 'bg-green-100 text-green-800' :
            pasteFeedback.type === 'info' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {pasteFeedback.message}
          </div>
        )}

        {/* Feedback message for file operations */}
        {fileFeedback && (
          <div className={`mt-2 p-2 rounded-md ${
            fileFeedback.type === 'success' ? 'bg-green-100 text-green-800' :
            fileFeedback.type === 'info' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {fileFeedback.message}
          </div>
        )}

        <p className="text-sm text-neutral-500 dark:text-dark-text-secondary mt-2">
          You can also use keyboard shortcuts: Ctrl+Z for Undo, Ctrl+Y or Ctrl+Shift+Z for Redo, Ctrl+V to paste images.
        </p>
      </div>

      {/* Shape Actions */}
      {selectedShapeId && (
        <div className="mt-4 p-4 bg-neutral-100 dark:bg-dark-bg-tertiary rounded-md border border-neutral-300 dark:border-dark-border">
          <h3 className="text-lg font-medium text-secondary-dark dark:text-dark-text-primary mb-2">
            Shape Actions
          </h3>
          <div className="flex space-x-2">
            <button
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
              onClick={handleShapeDelete}
              aria-label="Delete selected shape"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
          <p className="text-sm text-neutral-500 dark:text-dark-text-secondary mt-2">
            You can also press Delete or Backspace to remove the selected shape.
          </p>
        </div>
      )}

      {/* Canvas Information and Resize Controls */}
      <div className="mt-4 p-4 bg-neutral-100 dark:bg-dark-bg-tertiary rounded-md border border-neutral-300 dark:border-dark-border">
        <h3 className="text-lg font-medium text-secondary-dark dark:text-dark-text-primary mb-2">
          Canvas Information
        </h3>
        <p className="text-neutral-700 dark:text-dark-text-primary">
          Canvas dimensions: {stageSize.width} x {stageSize.height} px
        </p>
        <p className="text-neutral-700 dark:text-dark-text-primary mt-2">
          Current tool: <span className="font-medium capitalize">{currentTool}</span>
        </p>
        <p className="text-neutral-700 dark:text-dark-text-primary mt-2">
          Current stroke width: <span className="font-medium">{selectedStrokeWidth}px</span>
        </p>
        <p className="text-neutral-700 dark:text-dark-text-primary mt-2">
          Shapes on canvas: {shapes.length}
        </p>
        <p className="text-neutral-700 dark:text-dark-text-primary mt-2">
          Selected shape: {selectedShapeId ?
            <span className="font-medium">
              {shapes.find(s => s.id === selectedShapeId)?.tool || 'None'}
            </span> :
            <span className="text-neutral-500 dark:text-dark-text-secondary">None</span>}
        </p>

        {/* Canvas Resize Controls */}
        <div className="mt-4 pt-4 border-t border-neutral-300 dark:border-dark-border">
          <h4 className="text-md font-medium text-secondary-dark dark:text-dark-text-primary mb-2">
            Resize Canvas
          </h4>

          {/* Preset Dropdown */}
          <div className="mb-3">
            <label htmlFor="canvas-preset" className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">
              Preset Sizes:
            </label>
            <select
              id="canvas-preset"
              className="w-full p-2 border border-neutral-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg-primary dark:text-dark-text-primary"
              value={selectedPreset}
              onChange={handlePresetChange}
            >
              {canvasSizePresets.map(preset => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Width and Height Inputs */}
          <div className="flex space-x-2 mb-3">
            <div className="flex-1">
              <label htmlFor="canvas-width" className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">
                Width (px):
              </label>
              <input
                id="canvas-width"
                type="number"
                name="width"
                min="50"
                max="3000"
                className="w-full p-2 border border-neutral-300 dark:border-dark-border rounded-md dark:bg-dark-bg-primary dark:text-dark-text-primary"
                value={canvasResizeInputs.width}
                onChange={handleResizeInputChange}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="canvas-height" className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">
                Height (px):
              </label>
              <input
                id="canvas-height"
                type="number"
                name="height"
                min="50"
                max="3000"
                className="w-full p-2 border border-neutral-300 dark:border-dark-border rounded-md dark:bg-dark-bg-primary dark:text-dark-text-primary"
                value={canvasResizeInputs.height}
                onChange={handleResizeInputChange}
              />
            </div>
          </div>

          {/* Apply Buttons */}
          <div className="flex space-x-2">
            <button
              className="flex-1 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              onClick={() => handleCanvasResize('scale')}
              title="Resize and scale existing content"
            >
              Apply & Scale Content
            </button>
            <button
              className="flex-1 px-3 py-2 bg-danger text-white rounded-md hover:bg-danger-dark"
              onClick={() => handleCanvasResize('clear')}
              title="Resize and clear existing content"
            >
              Apply & Clear Canvas
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-neutral-500 dark:text-dark-text-secondary mt-2">
            "Scale Content" will resize all shapes proportionally. "Clear Canvas" will remove all content.
          </p>
        </div>




      </div>
    </div>
  );
};

export default VisualContextCanvasView;
