import React from 'react';
import PropTypes from 'prop-types';
import {
  Label,
  Tag,
  Text,
  Line,
  Group,
} from 'react-konva';

const LINE_SHIFT = 0.5; // This need to draw 1px line in canvas
const VERTICAL_ROTATE = -90;
const TEXT_SHIFT = 15; // dimension text has some length, TODO - better calculate real length of it
const TEXT_PADDING = 3; // padding for make text background and imitate line break


const Dimensions = ({
  y,
  x,
  width,
  height,
  label,
  scale,
  isLastSection,
  direction,
  sizeBackground,
  fontSize,
  sideArrowSise,
  sideArrowStartCord,
  isInner,
  textOffset,
}) => {
  const verticalDimension = () => {
    const upperLine = (
      <Line
        points={[
          sideArrowStartCord,
          y + LINE_SHIFT / scale,
          (sideArrowStartCord + sideArrowSise),
          y + LINE_SHIFT / scale,
        ]}
        stroke="black"
        strokeWidth={Math.floor(1 / scale)}
      />
    );

    const bottomLine = (
      <Line
        points={[
          sideArrowStartCord,
          y + height - LINE_SHIFT / scale,
          (sideArrowStartCord + sideArrowSise),
          y + height - LINE_SHIFT / scale,
        ]}
        stroke="black"
        strokeWidth={Math.floor(1 / scale)}
      />
    );

    const sizeLine = (
      <Line
        points={[
          (sideArrowStartCord + sideArrowSise / 2),
          y,
          (sideArrowStartCord + sideArrowSise / 2),
          y + height,
        ]}
        stroke="black"
        strokeWidth={Math.floor(1 / scale)}
      />
    );

    const size = (
      <Label
        x={Math.floor(-textOffset / scale + (isInner && sideArrowStartCord)) - LINE_SHIFT}
        y={Math.floor(y + height / 2 + TEXT_SHIFT / scale) - LINE_SHIFT}
      >
        <Tag fill={sizeBackground} rotation={VERTICAL_ROTATE} />
        <Text
          text={label || Math.floor(height)}
          fontSize={fontSize / scale}
          rotation={VERTICAL_ROTATE}
          padding={TEXT_PADDING / scale}
        />
      </Label>
    );

    return (
      <Group>
        {upperLine}
        {isLastSection && bottomLine}
        {sizeLine}
        {size}
      </Group>
    );
  };

  const horizontalDimension = () => {
    const leftLine = (
      <Line
        points={[
          x + LINE_SHIFT,
          sideArrowStartCord,
          x + LINE_SHIFT,
          (sideArrowStartCord + sideArrowSise),
        ]}
        stroke="black"
        strokeWidth={Math.floor(1 / scale)}
      />
    );

    const rightLine = (
      <Line
        points={[
          x + width + LINE_SHIFT,
          sideArrowStartCord,
          x + width + LINE_SHIFT,
          (sideArrowStartCord + sideArrowSise),
        ]}
        stroke="black"
        strokeWidth={Math.floor(1 / scale)}
      />
    );

    const sizeLine = (
      <Line
        points={[
          x,
          Math.floor(sideArrowStartCord + sideArrowSise / 2) + LINE_SHIFT,
          x + width,
          Math.floor(sideArrowStartCord + sideArrowSise / 2) + LINE_SHIFT,
        ]}
        stroke="black"
        strokeWidth={Math.floor(1 / scale)}
      />
    );

    const size = (
      <Label
        y={Math.floor(-textOffset / scale + (isInner && sideArrowStartCord)) + LINE_SHIFT}
        x={Math.floor(x + width / 2 - TEXT_SHIFT / scale) - LINE_SHIFT}
      >
        <Tag fill={sizeBackground} rotation={0} />
        <Text
          text={label || Math.floor(width)}
          fontSize={fontSize / scale}
          rotation={0}
          padding={TEXT_PADDING / scale}
        />
      </Label>
    );

    return (
      <Group>
        {leftLine}
        {isLastSection && rightLine}
        {sizeLine}
        {size}
      </Group>
    );
  };

  const dimentions = {
    vertical: verticalDimension,
    horizontal: horizontalDimension,
  };

  return dimentions[direction]();
};


Dimensions.defaultProps = {
  scale: 1,
  isLastSection: true,
  sizeBackground: '',
  label: '',
  fontSize: 14,
  sideArrowSise: 0,
  sideArrowStartCord: 0,
  textOffset: 0,
  isInner: false,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

Dimensions.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  direction: PropTypes.string.isRequired,
  sizeBackground: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  scale: PropTypes.number,
  textOffset: PropTypes.number,
  isLastSection: PropTypes.bool,
  isInner: PropTypes.bool,
  fontSize: PropTypes.number,
  sideArrowSise: PropTypes.number,
  sideArrowStartCord: PropTypes.number,
};

export default Dimensions;
