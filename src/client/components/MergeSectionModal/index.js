import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import { mergeSectionOptions } from '../../helpers/options';

import Modal from '../Modal';
import Dropdown from '../Dropdown';


const MergeSectionModal = ({
  isOpen,
  onCloseModal,
  onMerge,
  className,
  doorNumber,
  sectionNumber,
}) => {
  const { t } = useTranslation();
  const [mergeOption, setMergeOption] = useState(null);

  clearAllBodyScrollLocks();

  // Reset selected option
  useEffect(() => setMergeOption(null), [isOpen]);

  const { doors } = useSelector(({ doorsAndSections }) => doorsAndSections);
  const door = doors[doorNumber - 1];
  const sectionsAmount = door?.main?.sectionsAmount?.value;
  let availableOptions = mergeSectionOptions;

  if (sectionNumber - 1 === 0) {
    availableOptions = mergeSectionOptions.filter((item) => item.value !== 'first');
  }
  if (sectionNumber === sectionsAmount) {
    availableOptions = mergeSectionOptions.filter((item) => item.value !== 'last');
  }

  const handleDropdown = (selectedOption) => {
    setMergeOption(selectedOption?.value);
  };

  const handleMerge = () => {
    onMerge(doorNumber - 1, sectionNumber - 1, mergeOption);
    onCloseModal();
  };

  if (!isOpen) return null;

  return (
    <Modal
      opened={isOpen}
      closeModal={onCloseModal}
      className={className}
      shouldDisableBodyScroll
    >
      <h2 className="headings-h2">{t('mergeSectionModal.copy')}</h2>
      <div className="content-wrapper">
        <p>
          <span>{t('mergeSectionModal.merge-section')}</span>
        </p>
        <Dropdown
          options={availableOptions}
          translationNs="options:mergeSectionOptions"
          onChange={handleDropdown}
          value={
            mergeOption
              ? availableOptions.find((item) => item.value === mergeOption)
              : null
          }
        />
      </div>
      <div className="action-buttons">
        <div className="action-buttons-inner">
          <button
            type="button"
            className="link-button"
            onClick={onCloseModal}
          >
            <span>{t('mergeSectionModal.cancel')}</span>
          </button>
          <button
            type="button"
            className="blue-button"
            onClick={handleMerge}
            disabled={_.isEmpty(mergeOption)}
          >
            <span>{t('mergeSectionModal.delete')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

MergeSectionModal.defaultProps = {
  isOpen: false,
  className: 'action-modal',
};

MergeSectionModal.propTypes = {
  isOpen: PropTypes.bool,
  className: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onMerge: PropTypes.func.isRequired,
  doorNumber: PropTypes.number.isRequired,
  sectionNumber: PropTypes.number.isRequired,
};

export default MergeSectionModal;
