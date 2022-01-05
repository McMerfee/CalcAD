import _ from 'lodash';
import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import FooterActions from '../../redux/actions/footer';
import Label from '../Label';


const Input = ({
  label,
  type,
  value,
  placeholder,
  onChange,
  onBlur,
  error,
  className,
  direction,
  infoTagValue,
  withInfoTag,
  isDisabled,
  name,
  min,
  max,
  inputRef,
  shouldHideFooter,
  withIcon,
  iconClassName,
  onIconClick,
  onKeyDown,
}) => {
  const ref = inputRef || useRef(null);
  const inputClassName = clsx('input', type, className, !_.isEmpty(error) && 'invalid');
  const dispatch = useDispatch();

  const handleFocus = () => {
    if (shouldHideFooter) dispatch(FooterActions.hideFooter());
  };

  const handleBlur = (e) => {
    if (shouldHideFooter) dispatch(FooterActions.showFooter());
    if (!onBlur) return;
    onBlur(e);
  };

  return (
    <div className="input--wrapper">
      {label && (
        <Label
          htmlFor={inputClassName}
          value={label}
          infoTagValue={infoTagValue}
          withInfoTag={withInfoTag}
        />
      )}
      <span className="input--wrapper-inner">
        <input
          ref={ref}
          className={inputClassName}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          value={value}
          name={name}
          type={type}
          placeholder={placeholder}
          style={{ textAlign: direction === 'rtl' ? 'right' : 'initial' }}
          min={min}
          max={max}
          disabled={isDisabled}
        />
        {!withIcon || (
          <i
            className={iconClassName}
            aria-hidden="true"
            onClick={onIconClick}
          />
        )}
      </span>
      {error && error.length > 0 && (
        <span className="input--error">
          {error}
        </span>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf([
    'text',
    'password',
    'number',
  ]),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  error: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['rtl', 'ltr']),
  withInfoTag: PropTypes.bool,
  infoTagValue: PropTypes.string,
  name: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  inputRef: PropTypes.shape({}),
  isDisabled: PropTypes.bool,
  shouldHideFooter: PropTypes.bool,
  withIcon: PropTypes.bool,
  iconClassName: PropTypes.string,
  onIconClick: PropTypes.func,
  onKeyDown: PropTypes.func,
};

Input.defaultProps = {
  label: null,
  placeholder: null,
  className: 'default',
  direction: 'ltr',
  type: 'text',
  error: null,
  withInfoTag: false,
  infoTagValue: '',
  value: '',
  name: null,
  onBlur: null,
  min: null,
  max: null,
  inputRef: null,
  isDisabled: false,
  shouldHideFooter: true,
  withIcon: false,
  iconClassName: '',
  onIconClick: null,
  onKeyDown: null,
};

export default Input;
