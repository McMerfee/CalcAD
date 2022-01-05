import _ from 'lodash';
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Group, Rect, Image } from 'react-konva';

import {
  FILLING_COLORS,
  IMAGES_PATH,
  MIRROR_GRADIENT,
  GLASS_GRADIENT,
  dspListWithWhiteMargins,
} from '../../helpers/visualisationHelper';


const Section = ({
  y,
  x,
  width,
  height,
  isActive,
  onClick,
  texture,
  filling: fillingFromProps = {},
  fillingMaterials, // eslint-disable-line
}) => {
  const sectionRef = useRef(null);
  const [filling, setFilling] = useState(fillingFromProps);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (sectionRef?.current) sectionRef.current.draw();
      setFilling(fillingFromProps);
    }, 100);

    return () => clearTimeout(timeout);
  }, [fillingFromProps]);

  const { highlight } = FILLING_COLORS;

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

  return (
    <Group
      onClick={() => onClick()}
      onTap={() => onClick()}
      ref={sectionRef}
    >
      {/* Highlight */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isActive ? highlight.background : ''}
        opacity={fillingColor ? 0.7 : 0.5}
        zIndex={0}
      />

      {/* Filling Color */}
      <Image
        x={x}
        y={y}
        width={width}
        height={height}
        opacity={0.7}
        fill={fillingColor}
        visible={!!fillingColor}
      />

      {/* Filling Material */}
      <Image
        x={x}
        y={y}
        width={width}
        height={height}
        opacity={0.6}
        visible={fillingImage.src || isMirror || isGlass}
        fillPatternImage={isMirror || isGlass ? null : fillingImage}
        fillPatternOffsetX={x}
        fillPatternRepeat="repeat"
        fillPatternRotation={hasHorizontalRotation ? 90 : 0}
        fillLinearGradientStartPoint={isMirror || isGlass ? { x: 0, y: 0 } : null}
        fillLinearGradientEndPoint={isMirror || isGlass ? { x: width, y: height } : null}
        fillLinearGradientColorStops={isMirror ? MIRROR_GRADIENT : isGlass ? GLASS_GRADIENT : []}
      />

      {/* Section */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
      />
    </Group>
  );
};

Section.defaultProps = {
  isActive: false,
  onClick: () => {},
  texture: '',
  filling: null,
  fillingMaterials: [],
};

Section.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  texture: PropTypes.string,
  fillingMaterials: PropTypes.arrayOf(PropTypes.shape({})),
  filling: PropTypes.shape({
    dspOption: PropTypes.string,
  }),
};

export default Section;
