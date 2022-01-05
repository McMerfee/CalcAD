import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import Modal from '../Modal';


const DeleteSectionModal = ({
  isOpen,
  onCloseModal,
  onDeleteSection,
  className,
  sectionNumber,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  clearAllBodyScrollLocks();

  const handleDeleteSection = () => {
    onDeleteSection();
    onCloseModal();
  };

  return (
    <Modal
      opened={isOpen}
      closeModal={onCloseModal}
      className={className}
      shouldDisableBodyScroll
    >
      <h2 className="headings-h2">{t('deleteSectionModal.title', { sectionNumber })}</h2>
      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <span>{t('deleteSectionModal.subtitle')}</span>
        </div>
      </div>
      <div className="action-buttons">
        <div className="action-buttons-inner">
          <button
            type="button"
            className="link-button"
            onClick={onCloseModal}
          >
            <span>{t('deleteSectionModal.cancel')}</span>
          </button>
          <button
            type="button"
            className="blue-button"
            onClick={handleDeleteSection}
          >
            <span>{t('deleteSectionModal.submit')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

DeleteSectionModal.defaultProps = {
  isOpen: false,
  className: 'action-modal',
};

DeleteSectionModal.propTypes = {
  isOpen: PropTypes.bool,
  className: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onDeleteSection: PropTypes.func.isRequired,
  sectionNumber: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
};

export default DeleteSectionModal;
