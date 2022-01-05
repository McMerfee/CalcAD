/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

const Modal = ({
  children,
  opened,
  closeModal,
  type,
  className,
  shouldDisableBodyScroll,
}) => {
  const modalClassName = clsx('modal', type, className, opened && 'open');
  const modalRef = React.createRef();

  useEffect(() => {
    if (opened && shouldDisableBodyScroll) disableBodyScroll(modalRef.current);
    else clearAllBodyScrollLocks();
  }, [opened]);

  return (!opened || (
    <div ref={modalRef} className={modalClassName}>
      <div className="modal-wrapper">
        <div className="modal-inner">
          <div className="modal-close">
            <button className="modal-close-button" type="button" onClick={closeModal}>
              <div className="modal-close-button-cross" />
            </button>
          </div>
          <div className="modal-inner-children">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
  );
};

Modal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.node,
    PropTypes.object,
  ]).isRequired,
  type: PropTypes.oneOf(['bottom', 'full-size', '']),
  opened: PropTypes.bool,
  closeModal: PropTypes.func,
  className: PropTypes.string,
  shouldDisableBodyScroll: PropTypes.bool,
};

Modal.defaultProps = {
  type: '',
  opened: false,
  closeModal: () => {},
  className: null,
  shouldDisableBodyScroll: false,
};

export default Modal;
