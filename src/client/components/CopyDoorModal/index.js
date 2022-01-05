import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import Modal from '../Modal';
import Checkbox from '../Checkbox';

const CopyDoorModal = ({
  isOpen,
  onCloseModal,
  onCopy,
  className,
  doorNumber,
  doorsAmount,
}) => {
  const { t } = useTranslation();
  const subHeader = t('copyDoorModal.door-n', { number: doorNumber });
  const [checkedItems, setCheckedItems] = useState({});

  clearAllBodyScrollLocks();

  // Reset selected option
  useEffect(() => setCheckedItems({}), [isOpen]);

  const checkboxes = Array
    .from(Array(doorsAmount))
    .map((door, index) => ({
      index,
    }))
    .filter((item) => item.index !== doorNumber - 1);

  const handleApply = () => {
    const selectedDoors = _.keys(_.pickBy(checkedItems));
    onCopy(doorNumber - 1, selectedDoors);
    onCloseModal();
  };

  const handleChange = (index) => {
    const isChecked = !checkedItems[index];
    setCheckedItems({ ...checkedItems, [index]: isChecked });
  };

  const renderCheckboxes = () => checkboxes.map((item) => (
    <Checkbox
      key={item.index}
      onChange={() => handleChange(item.index)}
      label={(
        <span>
          {t('copyDoorModal.apply-to')}
          &nbsp;
          <b>
            {t('copyDoorModal.door')}
            &nbsp;
            <span>{item.index + 1}</span>
          </b>
        </span>
      )}
      isChecked={checkedItems[item.index]}
    />
  ));

  if (!isOpen) return null;

  return (
    <Modal
      opened={isOpen}
      closeModal={onCloseModal}
      className={className}
      shouldDisableBodyScroll
    >
      <h2 className="headings-h2">{t('copyDoorModal.copy')}</h2>
      <div className="content-wrapper">
        <p>
          <span><b>{subHeader}</b></span>
          &nbsp;
          <span>{t('copyDoorModal.copy-settings')}</span>
        </p>
        {renderCheckboxes()}
      </div>
      <div className="action-buttons">
        <div className="action-buttons-inner">
          <button
            type="button"
            className="link-button"
            onClick={onCloseModal}
          >
            <span>{t('copyDoorModal.cancel')}</span>
          </button>
          <button
            type="button"
            className="blue-button"
            onClick={handleApply}
            disabled={!_.keys(_.pickBy(checkedItems)).length}
          >
            <span>{t('copyDoorModal.apply')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

CopyDoorModal.defaultProps = {
  isOpen: false,
  className: 'action-modal',
};

CopyDoorModal.propTypes = {
  isOpen: PropTypes.bool,
  className: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  doorNumber: PropTypes.number.isRequired,
  doorsAmount: PropTypes.number.isRequired,
};

export default CopyDoorModal;
