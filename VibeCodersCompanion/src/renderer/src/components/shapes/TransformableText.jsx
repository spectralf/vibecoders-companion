import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Text, Transformer } from 'react-konva';

/**
 * TransformableText component
 * A text shape that can be selected, moved, resized, and rotated
 */
const TransformableText = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  onDblClick
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
      <Text
        ref={shapeRef}
        {...shapeProps}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onDblClick}
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

          // Reset the scale to 1
          node.scaleX(1);
          node.scaleY(1);

          // Update the shape properties with the new dimensions and rotation
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            fontSize: Math.max(8, node.fontSize() * scaleX),
            rotation: node.rotation()
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 10) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          resizeEnabled={true}
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

TransformableText.propTypes = {
  shapeProps: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onDblClick: PropTypes.func
};

export default TransformableText;
