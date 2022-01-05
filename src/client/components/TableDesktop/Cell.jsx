import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { A } from 'hookrouter';
import clsx from 'clsx';

const Cell = ({
  item,
  width,
  isLink,
  path,
  className,
}) => {
  const ref = useRef(null);

  return (
    <td
      className={clsx('table--cell', className)}
      width={width}
      ref={ref}
    >
      <div className="table--cell-inner">
        { isLink
          ? (<A href={path}>{item}</A>)
          : <span>{item}</span>}
      </div>
    </td>
  );
};

Cell.propTypes = {
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  className: PropTypes.string,
  path: PropTypes.string,
  isLink: PropTypes.bool,
  item: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node,
    PropTypes.object,
  ]),
};

Cell.defaultProps = {
  isLink: false,
  className: '',
  item: '',
  path: '#',
};

export default Cell;
