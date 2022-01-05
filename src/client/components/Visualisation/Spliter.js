import React from 'react';
import PropTypes from 'prop-types';
import { Rect } from 'react-konva';

import { DEFAULT_FRAME_COLOR } from '../../helpers/visualisationHelper';

const Spliter = ({
  y,
  x,
  width,
  height,
  fill,
}) => {
  const colorToFill = fill
    ? fill.substr(fill.indexOf('#'), 7)
    : DEFAULT_FRAME_COLOR;

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={colorToFill}
      stroke="black"
      strokeWidth={1}
    />
  );
};


Spliter.defaultProps = {
  fill: '',
};

Spliter.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  fill: PropTypes.string,
};

export default Spliter;
