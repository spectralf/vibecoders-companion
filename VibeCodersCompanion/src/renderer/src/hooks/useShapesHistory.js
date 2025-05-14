import { useState, useCallback } from 'react';

/**
 * Custom hook for managing shapes array with undo/redo functionality
 * @param {Array} initialShapes - Initial shapes array
 * @returns {Object} - Object containing shapes, functions for updating shapes, and undo/redo functions
 */
const useShapesHistory = (initialShapes = []) => {
  // State for the current shapes
  const [shapes, setShapes] = useState(initialShapes);
  
  // State for the history of shapes
  // Each item in the history is a complete shapes array
  const [history, setHistory] = useState([initialShapes]);
  
  // State for the current position in the history
  const [historyIndex, setHistoryIndex] = useState(0);

  /**
   * Update the shapes array and add the new state to the history
   * @param {Array} newShapes - New shapes array
   */
  const updateShapes = useCallback((newShapes) => {
    // Set the current shapes
    setShapes(newShapes);
    
    // Create a new history by removing any future history (if we've undone actions)
    // and adding the new shapes array
    const newHistory = history.slice(0, historyIndex + 1).concat([newShapes]);
    
    // Update the history and history index
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  /**
   * Undo the last action
   * @returns {boolean} - Whether the undo was successful
   */
  const undo = useCallback(() => {
    // Check if we can undo (if we're not at the beginning of the history)
    if (historyIndex > 0) {
      // Decrement the history index
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      // Set the shapes to the previous state in the history
      setShapes(history[newIndex]);
      
      return true;
    }
    
    return false;
  }, [history, historyIndex]);

  /**
   * Redo the last undone action
   * @returns {boolean} - Whether the redo was successful
   */
  const redo = useCallback(() => {
    // Check if we can redo (if we're not at the end of the history)
    if (historyIndex < history.length - 1) {
      // Increment the history index
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      // Set the shapes to the next state in the history
      setShapes(history[newIndex]);
      
      return true;
    }
    
    return false;
  }, [history, historyIndex]);

  /**
   * Check if undo is available
   * @returns {boolean} - Whether undo is available
   */
  const canUndo = useCallback(() => {
    return historyIndex > 0;
  }, [historyIndex]);

  /**
   * Check if redo is available
   * @returns {boolean} - Whether redo is available
   */
  const canRedo = useCallback(() => {
    return historyIndex < history.length - 1;
  }, [history, historyIndex]);

  /**
   * Clear the history and set the shapes to an empty array
   */
  const clearHistory = useCallback(() => {
    const emptyShapes = [];
    setShapes(emptyShapes);
    setHistory([emptyShapes]);
    setHistoryIndex(0);
  }, []);

  // Return the shapes and functions for updating shapes and managing history
  return {
    shapes,
    updateShapes,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  };
};

export default useShapesHistory;
