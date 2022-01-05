import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactSVG } from 'react-svg';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import Modal from '../Modal';
import Input from '../Input';


const CopyOrderModal = ({
  isOpen,
  onCloseModal,
  onCopyOrder,
  className,
  orderNumber,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(null);

  // Reset title
  useEffect(() => setTitle(''), [isOpen]);

  const handleInput = (value) => { setTitle(value); };

  if (!isOpen) return null;

  clearAllBodyScrollLocks();

  const handleCopyOrder = () => {
    onCopyOrder(title);
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
      <h2 className="headings-h2">{t('copyOrderModal.title', { orderNumber })}</h2>
      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <span>{t('copyOrderModal.subtitle')}</span>
        </div>
        <div className="content-wrapper-inner">
          <span>{t('copyOrderModal.order-title')}</span>
        </div>
        <Input
          type="text"
          placeholder={t('copyOrderModal.order-title-placeholder')}
          value={title}
          onChange={(e) => handleInput(e.target.value)}
          name="title"
          shouldHideFooter={false}
        />
      </div>
      <div className="action-buttons">
        <div className="action-buttons-inner">
          <button
            type="button"
            className="link-button"
            onClick={onCloseModal}
          >
            <span>{t('copyOrderModal.cancel')}</span>
          </button>
          <button
            type="button"
            className="blue-button"
            onClick={handleCopyOrder}
          >
            <span>{t('copyOrderModal.submit')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

CopyOrderModal.defaultProps = {
  isOpen: false,
  className: 'action-modal copy-order',
};

CopyOrderModal.propTypes = {
  isOpen: PropTypes.bool,
  className: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onCopyOrder: PropTypes.func.isRequired,
  orderNumber: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
};

export default CopyOrderModal;
