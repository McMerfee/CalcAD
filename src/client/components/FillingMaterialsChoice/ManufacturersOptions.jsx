import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import RadioOption from '../RadioOption';

const ManufacturersOptions = ({
  optionValue,
  optionLabel,
  optionIcon,
  chosenOption,
  onClick,
}) => (
  <RadioOption
    id={optionValue}
    key={optionValue}
    className={clsx('image-button', chosenOption === optionValue && 'checked')}
    iconPath={optionIcon}
    onChange={onClick}
    label={optionLabel}
  />
);

ManufacturersOptions.propTypes = {
  optionValue: PropTypes.string,
  optionLabel: PropTypes.string,
  optionIcon: PropTypes.string,
  chosenOption: PropTypes.string,
  onClick: PropTypes.func,
};

ManufacturersOptions.defaultProps = {
  optionValue: '',
  optionLabel: '',
  optionIcon: '',
  chosenOption: '',
  onClick: () => { },
};

export default ManufacturersOptions;
