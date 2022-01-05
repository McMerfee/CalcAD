import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactSVG } from 'react-svg';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import OrderActions from '../../redux/actions/order';

import Modal from '../Modal';
import Input from '../Input';


const OrderTitleModal = ({
  isOpen,
  className,
  onCloseModal,
  onSubmit,
  title,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [titleToUpdate, setTitleToUpdate] = useState(null);

  clearAllBodyScrollLocks();

  // Reset title
  useEffect(() => setTitleToUpdate(title || ''), [isOpen]);

  const handleInput = (value) => {
    setTitleToUpdate(value);
  };

  const handleSubmit = () => {
    dispatch(OrderActions.updateOrderTitle(titleToUpdate));
    onSubmit(titleToUpdate);
    onCloseModal();
  };

  if (!isOpen) return null;

  return (
    <Modal
      opened={isOpen}
      closeModal={onCloseModal}
      className={className}
      key="order-title-modal"
      shouldDisableBodyScroll
    >
      <div className="modal-order-icon-wrapper">
        <ReactSVG
          wrapper="div"
          className="modal-order-icon"
          src="/src/client/assets/icons/order-icon.svg"
        />
      </div>
      <h2 className="headings-h2">{t('saveOrderModal.desktop.title')}</h2>
      <div className="content-wrapper">
        <Input
          type="text"
          placeholder={t('saveOrderModal.general.placeholder')}
          value={titleToUpdate}
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
            <span>{t('saveOrderModal.general.cancel')}</span>
          </button>
          <button
            type="button"
            className="blue-button"
            onClick={handleSubmit}
          >
            <span>{t('saveOrderModal.mobile.submit')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

OrderTitleModal.defaultProps = {
  isOpen: false,
  className: 'action-modal',
  title: '',
};

OrderTitleModal.propTypes = {
  isOpen: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default OrderTitleModal;
