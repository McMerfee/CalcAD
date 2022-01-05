import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactSVG } from 'react-svg';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import OrderActions from '../../redux/actions/order';

import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';

const LeavePageModal = ({
  isOpen,
  onCloseModal,
  onSaveOrder,
  onLeavePage,
  className,
  title,
  canSaveOrder,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [titleToUpdate, setTitleToUpdate] = useState(null);

  clearAllBodyScrollLocks();

  // Reset title
  useEffect(() => setTitleToUpdate(title || ''), [isOpen]);

  const handleInput = (value) => {
    setTitleToUpdate(value);
  };

  const handleSaveOrder = () => {
    if (!canSaveOrder) return;
    dispatch(OrderActions.updateOrderTitle(titleToUpdate));
    onSaveOrder();
    onCloseModal();
  };

  const handleLeavePage = () => {
    onLeavePage();
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
      <div className="modal-order-icon-wrapper">
        <ReactSVG
          wrapper="div"
          className="modal-order-icon"
          src="/src/client/assets/icons/order-icon.svg"
        />
      </div>
      <h2 className="headings-h2">{t('leavePageModal.title')}</h2>
      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <div className="content">{t('leavePageModal.subtitle')}</div>
          <div className="title-wrapper">
            <Input
              type="text"
              value={titleToUpdate}
              placeholder={t('leavePageModal.order-title')}
              onChange={(e) => handleInput(e.target.value)}
              name="title"
              shouldHideFooter={false}
              isDisabled={!canSaveOrder}
            />
          </div>

          { !canSaveOrder
            ? (
              <div className="modal-warning">
                <ReactSVG
                  wrapper="div"
                  className="modal-warning-icon"
                  src="/src/client/assets/icons/warning.svg"
                />
                <span>{t('warningMessages.please-add-filling-materials')}</span>
              </div>
            ) : null }
        </div>
      </div>

      <div className="action-buttons">
        <div className="action-buttons-inner">
          <Button
            className="link-button"
            type="link-button"
            value={t('leavePageModal.do-not-save')}
            onClick={handleLeavePage}
          />
          <Button
            value={t('leavePageModal.submit')}
            type="rounded"
            onClick={handleSaveOrder}
            isDisabled={!canSaveOrder}
          />
        </div>
      </div>
    </Modal>
  );
};

LeavePageModal.defaultProps = {
  isOpen: false,
  canSaveOrder: false,
  title: '',
  className: 'action-modal leave-page',
};

LeavePageModal.propTypes = {
  isOpen: PropTypes.bool,
  canSaveOrder: PropTypes.bool,
  className: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onSaveOrder: PropTypes.func.isRequired,
  onLeavePage: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default LeavePageModal;
