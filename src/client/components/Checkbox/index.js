/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Checkbox = ({
  name,
  isChecked,
  onChange,
  label,
  isDisabled,
  checkboxRef,
  className,
}) => {
  const checkboxClassName = clsx('checkmark', className, isDisabled && 'disabled');
  const ref = checkboxRef || useRef(null);

  return (
    <label
      htmlFor="checkbox"
      className="container"
      onClick={isDisabled ? () => {} : () => onChange()}
    >
      {label}
      <input
        className="checkbox"
        type="checkbox"
        checked={isChecked}
        disabled={isDisabled}
        onChange={() => {}}
        ref={ref}
        name={name}
      />
      <span className={checkboxClassName} />
    </label>
  );
};

Checkbox.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  isChecked: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onChange: PropTypes.func,
  checkboxRef: PropTypes.shape({}),
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.object,
  ]),
};

Checkbox.defaultProps = {
  name: '',
  className: '',
  isChecked: false,
  isDisabled: false,
  onChange: () => {},
  label: null,
  checkboxRef: null,
};

export default Checkbox;
