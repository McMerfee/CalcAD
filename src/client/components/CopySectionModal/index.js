import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import Modal from '../Modal';
import Checkbox from '../Checkbox';

const CopySectionModal = ({
  isOpen,
  onCloseModal,
  onCopy,
  className,
  doorNumber,
  sectionNumber,
  sectionsAmount,
}) => {
  const { t } = useTranslation();
  const subHeader = t('copySectionModal.section-n', { doorNumber, sectionNumber });
  const [checkedItems, setCheckedItems] = useState({});

  clearAllBodyScrollLocks();

  // Reset selected option
  useEffect(() => setCheckedItems({}), [isOpen]);

  const checkboxes = Array
    .from(Array(sectionsAmount))
    .map((section, index) => ({
      index,
    }))
    .filter((item) => item.index !== sectionNumber - 1);

  const handleApply = () => {
    const selectedSections = _.keys(_.pickBy(checkedItems));
    onCopy(sectionNumber - 1, selectedSections);
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
          {t('copySectionModal.apply-to')}
          &nbsp;
          <b>
            {t('copySectionModal.section')}
            &nbsp;
            <span>{`${doorNumber}.${item.index + 1}`}</span>
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
      <h2 className="headings-h2">{t('copySectionModal.copy')}</h2>
      <div className="content-wrapper">
        <p>
          <span><b>{subHeader}</b></span>
          &nbsp;
          <span>{t('copySectionModal.copy-settings')}</span>
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
            <span>{t('copySectionModal.cancel')}</span>
          </button>
          <button
            type="button"
            className="blue-button"
            onClick={handleApply}
            disabled={!_.keys(_.pickBy(checkedItems)).length}
          >
            <span>{t('copySectionModal.apply')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

CopySectionModal.defaultProps = {
  isOpen: false,
  className: 'action-modal',
};

CopySectionModal.propTypes = {
  isOpen: PropTypes.bool,
  className: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  doorNumber: PropTypes.number.isRequired,
  sectionNumber: PropTypes.number.isRequired,
  sectionsAmount: PropTypes.number.isRequired,
};

export default CopySectionModal;
