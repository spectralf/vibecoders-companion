import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Group, Rect, Transformer } from 'react-konva';

/**
 * TransformableGroup component
 * A group of shapes that can be selected, moved, resized, and rotated as a single unit
 */
const TransformableGroup = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange
}) => {
  // Reference to the group node
  const groupRef = useRef();
  // Reference to the transformer node
  const trRef = useRef();

  // Attach or detach the transformer based on selection state
  useEffect(() => {
    if (isSelected && trRef.current) {
      // Attach the transformer to the group
      trRef.current.nodes([groupRef.current]);
      // Update the transformer
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Render the children of the group
  const renderChildren = () => {
    if (!shapeProps.children || !Array.isArray(shapeProps.children)) {
      return null;
    }

    return shapeProps.children.map(child => {
      // Render each child based on its tool type
      switch (child.tool) {
        case 'rectangle':
          return (
            <Rect
              key={child.id}
              {...child}
              // Don't make children draggable individually
              draggable={false}
            />
          );
        // Add cases for other shape types as needed
        default:
          return null;
      }
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={shapeProps.x}
        y={shapeProps.y}
        width={shapeProps.width}
        height={shapeProps.height}
        rotation={shapeProps.rotation || 0}
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
          // Get the group node
          const node = groupRef.current;

          // Get the current scale
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset the scale to 1 (we'll apply it to width/height instead)
          node.scaleX(1);
          node.scaleY(1);

          // Update the group properties with the new dimensions and rotation
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation()
          });
        }}
      >
        {/* Render a background rect for the group */}
        <Rect
          width={shapeProps.width}
          height={shapeProps.height}
          fill="transparent"
          stroke={isSelected ? "#00A0FF" : "transparent"}
          strokeWidth={1}
          dash={[5, 5]}
        />

        {/* Render the children of the group */}
        {renderChildren()}
      </Group>

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

TransformableGroup.propTypes = {
  shapeProps: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

export default TransformableGroup;
