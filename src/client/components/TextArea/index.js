import _ from 'lodash';
import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Textarea from 'rc-textarea';
import clsx from 'clsx';

import FooterActions from '../../redux/actions/footer';
import Label from '../Label';

const TextArea = ({
  label,
  value,
  placeholder,
  onChange,
  onBlur,
  error,
  className,
  infoTagValue,
  withInfoTag,
  isDisabled,
  name,
  minrows,
  maxrows,
  textareaRef,
  shouldHideFooter,
  onKeyDown,
}) => {
  const ref = textareaRef || useRef(null);
  const textareaClassName = clsx('ads-textarea', className, !_.isEmpty(error) && 'invalid');
  const dispatch = useDispatch();

  const handleFocus = () => {
    if (shouldHideFooter) dispatch(FooterActions.hideFooter());
  };

  const handleBlur = (e) => {
    if (shouldHideFooter) dispatch(FooterActions.showFooter());
    if (!onBlur) return;
    onBlur(e);
  };

  // Avoid warning
  const textareaProps = { minRows: minrows, maxRows: maxrows };

  return (
    <div className="text-area--wrapper">
      {label && (
        <Label
          htmlFor={textareaClassName}
          value={label}
          infoTagValue={infoTagValue}
          withInfoTag={withInfoTag}
        />
      )}
      <span className="text-area--wrapper-inner">
        <Textarea
          ref={ref}
          name={name}
          autoSize={{ minRows: minrows, maxRows: maxrows }}
          defaultValue={value}
          onChange={onChange}
          onPressEnter={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          className={textareaClassName}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textareaProps}
        />
      </span>
      {error && error.length > 0 && (
        <span className="text-area--error">
          {error}
        </span>
      )}
    </div>
  );
};

TextArea.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  error: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  withInfoTag: PropTypes.bool,
  infoTagValue: PropTypes.string,
  name: PropTypes.string,
  minrows: PropTypes.number,
  maxrows: PropTypes.number,
  textareaRef: PropTypes.shape({}),
  isDisabled: PropTypes.bool,
  shouldHideFooter: PropTypes.bool,
  onKeyDown: PropTypes.func,
};

TextArea.defaultProps = {
  label: null,
  placeholder: null,
  className: 'default',
  error: null,
  withInfoTag: false,
  infoTagValue: '',
  value: '',
  name: null,
  onBlur: null,
  minrows: 3,
  maxrows: 4,
  textareaRef: null,
  isDisabled: false,
  shouldHideFooter: true,
  onKeyDown: null,
};

export default TextArea;
