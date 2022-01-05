import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactSVG } from 'react-svg';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import Modal from '../Modal';


const DeleteOrderModal = ({
  isOpen,
  onCloseModal,
  onDeleteOrder,
  className,
  orderNumber,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  clearAllBodyScrollLocks();

  const handleDeleteOrder = () => {
    onDeleteOrder();
    onCloseModal();
  };

  return (
    <Modal
      opened={isOpen}
      closeModal={onCloseModal}
      className={className}
      shouldDisableBodyScroll
    >
      <div className="modal-order-icon-wrapper">
        <ReactSVG
          wrapper="div"
          className="modal-order-icon"
          src="/src/client/assets/icons/order-icon.svg"
        />
      </div>
      <h2 className="headings-h2">{t('deleteOrderModal.title', { orderNumber })}</h2>
      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <span>{t('deleteOrderModal.subtitle')}</span>
        </div>
      </div>
      <div className="action-buttons">
        <div className="action-buttons-inner">
          <button
            type="button"
            className="link-button"
            onClick={onCloseModal}
          >
            <span>{t('deleteOrderModal.cancel')}</span>
          </button>
          <button
            type="button"
            className="blue-button"
            onClick={handleDeleteOrder}
          >
            <span>{t('deleteOrderModal.submit')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

DeleteOrderModal.defaultProps = {
  isOpen: false,
  className: 'action-modal',
};

DeleteOrderModal.propTypes = {
  isOpen: PropTypes.bool,
  className: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onDeleteOrder: PropTypes.func.isRequired,
  orderNumber: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
};

export default DeleteOrderModal;
