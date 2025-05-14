import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Rect, Transformer } from 'react-konva';

/**
 * TransformableRect component
 * A rectangle shape that can be selected, moved, resized, and rotated
 */
const TransformableRect = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange
}) => {
  // Reference to the shape node
  const shapeRef = useRef();
  // Reference to the transformer node
  const trRef = useRef();

  // Attach or detach the transformer based on selection state
  useEffect(() => {
    if (isSelected && trRef.current) {
      // Attach the transformer to the shape
      trRef.current.nodes([shapeRef.current]);
      // Update the transformer
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        ref={shapeRef}
        {...shapeProps}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          // Update position when drag ends
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y()
          });
        }}
        onTransformEnd={() => {
          // Get the shape node
          const node = shapeRef.current;

          // Get the current scale
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset the scale to 1 (we'll apply it to width/height instead)
          node.scaleX(1);
          node.scaleY(1);

          // Update the shape properties with the new dimensions and rotation
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation()
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-right',
                          'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']}
          rotateEnabled={true}
          resizeEnabled={true}
          keepRatio={false}
          anchorSize={8}
          anchorCornerRadius={4}
          padding={5}
          onClick={(e) => {
            // Stop event propagation
            e.cancelBubble = true;  // For older browsers
            e.evt.cancelBubble = true;  // For Konva events
            if (e.evt.stopPropagation) e.evt.stopPropagation();  // Standard method
          }}
          onMouseDown={(e) => {
            // Stop event propagation
            e.cancelBubble = true;  // For older browsers
            e.evt.cancelBubble = true;  // For Konva events
            if (e.evt.stopPropagation) e.evt.stopPropagation();  // Standard method
          }}
        />
      )}
    </>
  );
};

TransformableRect.propTypes = {
  shapeProps: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

export default TransformableRect;
