import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Button = ({
  value,
  type,
  onClick,
  className,
  isProcessing,
  isDisabled,
}) => {
  const buttonClassName = clsx('button', type, isProcessing && 'loading', className);

  return (
    <button
      className={buttonClassName}
      onClick={onClick}
      disabled={isDisabled}
      type="button"
    >
      <span>{value}</span>
    </button>
  );
};

Button.propTypes = {
  value: PropTypes.string.isRequired,
  type: PropTypes.oneOf([
    'text-blue',
    'button-light-blue',
    'button-blue',
    'rounded',
    'outlined-white',
    'link-button',
  ]),
  onClick: PropTypes.func,
  className: PropTypes.string,
  isProcessing: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

Button.defaultProps = {
  onClick: () => {},
  type: 'text-blue',
  className: '',
  isProcessing: false,
  isDisabled: false,
};

export default Button;
