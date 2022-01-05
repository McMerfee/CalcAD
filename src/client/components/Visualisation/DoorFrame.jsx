import _ from 'lodash';
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Rect, Group, Image, Arrow } from 'react-konva';

import {
  FRAME_PROFILES_SIZE,
  DEFAULT_FRAME_COLOR,
  FILLING_COLORS,
  IMAGES_PATH,
  MIRROR_GRADIENT,
  GLASS_GRADIENT,
  dspListWithWhiteMargins,
} from '../../helpers/visualisationHelper';

const DoorFrame = ({
  sideProfileOffset,
  y,
  x,
  doorWidth,
  fullWidth,
  sideProfileWidth,
  height,
  frameColor,
  isRightBorderVisible,
  isLeftBorderVisible,
  isFrontDoor, // eslint-disable-line
  isActive,
  onClick,
  texture,
  filling: fillingFromProps = {},
  fillingMaterials, // eslint-disable-line
  hasSections,
  scale,
  isLeft,
  isRight,
}) => {
  const doorRef = useRef(null);
  const [filling, setFilling] = useState(fillingFromProps);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (doorRef?.current) doorRef.current.draw();
      setFilling(fillingFromProps);
    }, 100);

    return () => clearTimeout(timeout);
  }, [fillingFromProps]);

  const frameColorToFill = frameColor
    ? frameColor.substr(frameColor.indexOf('#'), 7)
    : DEFAULT_FRAME_COLOR;

  const fillingColor = '';
  const fillingImage = document.createElement('img');
  const isCustomChipboard = filling?.material === 'customers' && filling?.customersOption?.includes('dsp');
  const isADSChipboard = filling?.material === 'dsp' && filling?.dspOption;
  const isMirror = filling?.material === 'mirror' || filling?.material === 'lacobel';
  const isGlass = (filling?.material === 'customers' && filling?.customersOption === 'glass')
    || filling?.material === 'glass';
  const hasHorizontalRotation = filling?.material !== 'customers' && texture === 'horizontal';

  if (isCustomChipboard) { fillingImage.src = IMAGES_PATH.chipboardPath; }

  if (isADSChipboard) {
    const { dspOption } = filling;
    const chipboardPath = dspOption && _.some(dspListWithWhiteMargins, (item) => item === dspOption)
      ? IMAGES_PATH.chipboardPath
      : dspOption
        ? fillingMaterials?.find((f) => f.articleCode === dspOption)?.image
        : '';
    fillingImage.src = chipboardPath || IMAGES_PATH.chipboardPath;
  }

  const rightBorder = sideProfileOffset + doorWidth - (sideProfileWidth / 2) - 1;
  const bottomArrowPoint = y + height - FRAME_PROFILES_SIZE.bottom * 2;

  const leftOpeningPoints = [
    sideProfileOffset + doorWidth - sideProfileWidth * 3,
    bottomArrowPoint,
    sideProfileOffset + doorWidth / 2 - sideProfileWidth * 3,
    bottomArrowPoint,
  ];

  const rightOpeningPoints = [
    sideProfileOffset + doorWidth / 2 - sideProfileWidth * 3,
    bottomArrowPoint,
    sideProfileOffset + doorWidth - sideProfileWidth * 3,
    bottomArrowPoint,
  ];

  return (
    <Group
      onClick={() => onClick()}
      onTap={() => onClick()}
      brightness={1}
      scale={scale}
      ref={doorRef}
    >
      {/* Highlight */}
      <Rect
        x={sideProfileOffset}
        y={y}
        width={doorWidth}
        height={height}
        fill={isActive ? FILLING_COLORS.highlight.background : ''}
        visible={!hasSections}
        opacity={fillingColor ? 0.7 : 0.5}
        zIndex={0}
      />

      {/* Filling Color */}
      <Image
        x={sideProfileOffset}
        y={y}
        width={doorWidth}
        height={height}
        opacity={0.7}
        fill={fillingColor}
        visible={Boolean(!hasSections && fillingColor)}
      />

      {/* Filling Material */}
      <Image
        x={sideProfileOffset}
        y={y}
        width={doorWidth}
        height={height}
        opacity={fillingImage.src || isMirror || isGlass ? 0.6 : 0}
        visible={!hasSections}
        fillPatternImage={isMirror || isGlass ? null : fillingImage}
        fillPatternOffsetX={x}
        fillPatternRepeat="repeat"
        fillPatternRotation={hasHorizontalRotation ? 90 : 0}
        fillLinearGradientStartPoint={isMirror || isGlass ? { x: 0, y: 0 } : null}
        fillLinearGradientEndPoint={isMirror || isGlass ? { x: doorWidth, y: height } : null}
        fillLinearGradientColorStops={isMirror ? MIRROR_GRADIENT : isGlass ? GLASS_GRADIENT : []}
      />

      {/* Left border */}
      <Rect
        x={sideProfileOffset}
        y={y}
        width={sideProfileWidth / 2}
        height={height}
        fill={frameColorToFill}
        stroke="black"
        strokeWidth={3}
        visible={isLeftBorderVisible}
      />

      {/* Right border */}
      <Rect
        x={rightBorder}
        y={y}
        width={sideProfileWidth / 2}
        height={height}
        fill={frameColorToFill}
        stroke="black"
        strokeWidth={3}
        visible={isRightBorderVisible}
      />

      {/* UP border */}
      <Rect
        x={x + 1}
        y={y}
        width={fullWidth}
        height={FRAME_PROFILES_SIZE.up}
        fill={frameColorToFill}
        stroke="black"
        strokeWidth={3}
      />

      {/* Bottom border */}
      <Rect
        x={x + 1}
        y={y + height - FRAME_PROFILES_SIZE.bottom}
        width={fullWidth}
        height={FRAME_PROFILES_SIZE.bottom}
        fill={frameColorToFill}
        stroke="black"
        strokeWidth={3}
      />

      {/* Opening sides */}
      { isLeft && doorWidth >= 450
        ? (
          <Arrow
            points={leftOpeningPoints}
            pointerLength={50}
            pointerWidth={50}
            fill="white"
            stroke="black"
            strokeWidth={4}
          />
        ) : null}
      { isRight && doorWidth >= 450
        ? (
          <Arrow
            points={rightOpeningPoints}
            pointerLength={50}
            pointerWidth={50}
            fill="white"
            stroke="black"
            strokeWidth={4}
          />
        ) : null}
    </Group>
  );
};

DoorFrame.defaultProps = {
  doorWidth: 0,
  fullWidth: 0,
  sideProfileWidth: FRAME_PROFILES_SIZE.side,
  height: 0,
  frameColor: '',
  isRightBorderVisible: true,
  isLeftBorderVisible: true,
  isFrontDoor: true,
  isActive: false,
  onClick: () => {},
  texture: '',
  filling: null,
  fillingMaterials: [],
  hasSections: false,
  scale: 1,
  isLeft: false,
  isRight: false,
};

DoorFrame.propTypes = {
  sideProfileOffset: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  doorWidth: PropTypes.number,
  fullWidth: PropTypes.number,
  sideProfileWidth: PropTypes.number,
  height: PropTypes.number,
  isRightBorderVisible: PropTypes.bool,
  isLeftBorderVisible: PropTypes.bool,
  isFrontDoor: PropTypes.bool,
  frameColor: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  texture: PropTypes.string,
  filling: PropTypes.shape({
    dspOption: PropTypes.string,
  }),
  fillingMaterials: PropTypes.arrayOf(PropTypes.shape({})),
  hasSections: PropTypes.bool,
  scale: PropTypes.number,
  isLeft: PropTypes.bool,
  isRight: PropTypes.bool,
};

export default DoorFrame;
