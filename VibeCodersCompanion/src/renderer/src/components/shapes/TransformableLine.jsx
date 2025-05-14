import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Line, Transformer } from 'react-konva';

/**
 * TransformableLine component
 * A line or pencil shape that can be selected, moved, resized, and rotated
 */
const TransformableLine = ({
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
      <Line
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

          // Reset the scale to 1
          node.scaleX(1);
          node.scaleY(1);

          // For lines, we need to scale the points
          const newPoints = [];
          const points = node.points();

          // Scale each point
          for (let i = 0; i < points.length; i += 2) {
            newPoints.push(points[i] * scaleX);
            newPoints.push(points[i + 1] * scaleY);
          }

          // Update the shape properties with the new dimensions and rotation
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            points: newPoints,
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

TransformableLine.propTypes = {
  shapeProps: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

export default TransformableLine;
