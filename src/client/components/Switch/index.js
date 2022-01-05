import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Switch = ({
  isToggled,
  isDisabled,
  setToggleValue,
  className,
}) => {
  const toggleClassName = clsx('toggle-control', className);
  const ref = useRef(null);

  return (
    <label htmlFor="control" className={toggleClassName}>
      <input
        type="checkbox"
        checked={isToggled}
        disabled={isDisabled}
        onChange={() => {}}
        ref={ref}
      />
      <span
        className={clsx('control', isDisabled && 'disabled')}
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          if (isDisabled) return;
          setToggleValue(!isToggled);
        }}
      />
    </label>
  );
};

Switch.propTypes = {
  isToggled: PropTypes.bool,
  isDisabled: PropTypes.bool,
  setToggleValue: PropTypes.func,
  className: PropTypes.string,
};

Switch.defaultProps = {
  isToggled: false,
  isDisabled: false,
  setToggleValue: () => {},
  className: '',
};

export default Switch;
