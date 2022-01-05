import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import Modal from '../Modal';


const DeleteDoorModal = ({
  isOpen,
  onCloseModal,
  onDeleteDoor,
  className,
  doorNumber,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  clearAllBodyScrollLocks();

  const handleDeleteDoor = () => {
    onDeleteDoor(doorNumber - 1);
    onCloseModal();
  };

  return (
    <Modal
      opened={isOpen}
      closeModal={onCloseModal}
      className={className}
      shouldDisableBodyScroll
    >
      <h2 className="headings-h2">{t('deleteDoorModal.title', { doorNumber })}</h2>
      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <span>{t('deleteDoorModal.subtitle')}</span>
        </div>
      </div>
      <div className="action-buttons">
        <div className="action-buttons-inner">
          <button
            type="button"
            className="link-button"
            onClick={onCloseModal}
          >
            <span>{t('deleteDoorModal.cancel')}</span>
          </button>
          <button
            type="button"
            className="blue-button"
            onClick={handleDeleteDoor}
          >
            <span>{t('deleteDoorModal.submit')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

DeleteDoorModal.defaultProps = {
  isOpen: false,
  className: 'action-modal delete-door',
};

DeleteDoorModal.propTypes = {
  isOpen: PropTypes.bool,
  className: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onDeleteDoor: PropTypes.func.isRequired,
  doorNumber: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
};

export default DeleteDoorModal;
