import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { ReactSVG } from 'react-svg';

const RadioOption = ({
  id,
  name,
  label,
  iconPath,
  backgroundColor,
  checked,
  isDisabled,
  className,
  onChange,
  onKeyPress,
}) => {
  const rootClassName = clsx('radio-option', className, isDisabled && 'disabled');

  const handleClick = (e) => {
    e.preventDefault();

    if (isDisabled) return;
    onChange();
  };

  return (
    <div
      id={id}
      className={rootClassName}
      onClick={handleClick}
      onKeyPress={onKeyPress}
      role="button"
      tabIndex={0}
      disabled={isDisabled}
    >
      <div className="radio-option--inner">
        <input
          type="radio"
          checked={checked}
          id={name}
          name={name}
          onChange={() => {}}
        />
        <label htmlFor={name}>
          { className.includes('icon')
            && (
              <ReactSVG src={iconPath} />
            )}
          { className.includes('color')
            && (
              <div className="radio-option--background-wrapper">
                <div
                  className="radio-option--background"
                  style={{
                    background: checked
                      ? `url('/src/client/assets/icons/check-mark-blue.svg') no-repeat center, ${backgroundColor}`
                      : backgroundColor.startsWith('http') ? `center / cover no-repeat url(${backgroundColor})` : backgroundColor,
                  }}
                />
                <div
                  className="radio-option--hidden-background"
                  style={{ background: backgroundColor }}
                />
              </div>
            )}
          { className.includes('image-button')
            && (
              <>
                <img alt={name} src={iconPath} height="70" width="70" />
                <div
                  className="radio-option--background"
                  style={{
                    background: checked
                      || "url('/src/client/assets/icons/check-mark-blue.svg') no-repeat center, transparent",
                  }}
                />
              </>
            )}
          { className.includes('icon-button')
            && (
              <span className="radio-option--icon-button-title">{label}</span>
            )}
          { className.includes('text-button')
            && (
              <span className="radio-option--button-title">{label}</span>
            )}
        </label>
      </div>
      { !className.includes('text-button') && !className.includes('icon-button') && label
        && (
          <div className="radio-option--label">
            <span>{label}</span>
          </div>
        )}
    </div>
  );
};

RadioOption.defaultProps = {
  id: '',
  name: 'radio-option',
  label: null,
  iconPath: null,
  backgroundColor: null,
  checked: false,
  isDisabled: false,
  onKeyPress: () => {},
};

RadioOption.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func,
  name: PropTypes.string,
  iconPath: PropTypes.string,
  backgroundColor: PropTypes.string,
  label: PropTypes.string,
  checked: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

export default RadioOption;
