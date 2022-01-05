import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const RadioGroup = ({
  children,
  className,
}) => (
  <div className={clsx('radio-group', className)}>
    <div className="radio-group--inner">
      {children}
    </div>
  </div>
);

RadioGroup.defaultProps = {
  children: null,
  className: null,
};

RadioGroup.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default RadioGroup;
