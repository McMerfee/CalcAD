import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { SimpleSelect } from 'react-selectize';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import Label from '../Label';

const Dropdown = ({
  id,
  className,
  label,
  infoTagValue,
  withInfoTag,
  options,
  onChange,
  placeholder,
  value,
  isDisabled,
  isClearable,
  isSearchable,
  translationNs,
  hasInternalTranslation,
  hideResetButton,
}) => {
  const { t, i18n } = useTranslation(['options']);
  const labelKey = i18n.language === 'ru' ? 'labelRu' : 'labelUk';
  const simpleSelectRef = useRef(null);

  let valueToDisplay = value;
  let formattedOptions = [];

  if (translationNs) {
    formattedOptions = options.map((opt) => ({
      ...opt,
      label: t(`${translationNs}.${opt.value}`),
    }));

    const selectedOpt = value && options.find((op) => op.value === value.value || op.value === value.articleCode);

    valueToDisplay = value
      ? {
        image: value.image,
        value: value.value || value.articleCode,
        label: (selectedOpt && t(`${translationNs}.${selectedOpt.value}`)) || value.label,
      } : null;
  } else if (hasInternalTranslation) {
    formattedOptions = options.map((opt) => ({
      ...opt,
      label: opt[labelKey],
    }));

    const selectedOpt = value && options.find((op) => op.value === value.value || op.value === value.articleCode);

    valueToDisplay = value
      ? {
        image: value.image,
        value: value.value || value.articleCode,
        label: selectedOpt && selectedOpt[labelKey] ? selectedOpt[labelKey] : value.label,
      } : null;
  } else {
    formattedOptions = options;
  }

  const handleValueChange = (selectedOption) => {
    onChange(selectedOption);
    simpleSelectRef.current.blur();
  };

  return (
    <>
      {label && (
        <Label
          htmlFor="react-selectize"
          value={label}
          infoTagValue={infoTagValue}
          withInfoTag={withInfoTag}
        />
      )}
      <SimpleSelect
        id={id}
        className={className}
        ref={simpleSelectRef}
        value={valueToDisplay}
        theme="bootstrap3"
        placeholder={placeholder}
        onValueChange={handleValueChange}
        options={formattedOptions}
        isDisabled={isDisabled}
        isClearable={isClearable}
        hideResetButton={hideResetButton}
        onFocus={({ originalEvent }) => {
          const { target } = originalEvent;
          if (target && !isSearchable) {
            target.readOnly = true;
          }
        }}
        renderValue={(item) => (
          <div className="dropdown-value">
            {!item.image || <img alt="" src={item.image} className="dropdown-value-image" />}
            <span className="dropdown-value-label">
              {item.label || item[labelKey]}
            </span>
          </div>
        )}
        renderOption={(item) => {
          const selectedValue = simpleSelectRef?.current?.value()?.value
            || simpleSelectRef?.current?.value()?.articleCode;
          const isSelected = !!selectedValue && selectedValue === item.value;

          return (
            <div className={clsx('dropdown-option', isSelected && 'selected')}>
              {!item.image || <img alt="" src={item.image} className="dropdown-option-image" />}
              <span className="dropdown-option-label">{item.label}</span>
            </div>
          );
        }}
        renderNoResultsFound={() => (
          <div className="no-results-found">
            {t('options:no-data')}
          </div>
        )}
        menuPlacement="auto"
        backspaceRemovesValue={false}
        captureMenuScroll
        blurInputOnSelect
        transitionEnter
        transitionLeave
      />
    </>
  );
};


Dropdown.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    image: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    disabled: PropTypes.bool,
  })).isRequired,
  value: PropTypes.shape({
    image: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    articleCode: PropTypes.string,
    disabled: PropTypes.bool,
  }),
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  withInfoTag: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isClearable: PropTypes.bool,
  isSearchable: PropTypes.bool,
  infoTagValue: PropTypes.string,
  translationNs: PropTypes.string,
  hasInternalTranslation: PropTypes.bool,
  hideResetButton: PropTypes.bool,
};

Dropdown.defaultProps = {
  id: '',
  className: '',
  label: null,
  value: null,
  placeholder: null,
  withInfoTag: false,
  isDisabled: false,
  isClearable: true,
  isSearchable: false,
  infoTagValue: '',
  translationNs: null,
  hasInternalTranslation: false,
  hideResetButton: true,
};

export default Dropdown;
