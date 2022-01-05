import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import DoorsActions from '../../redux/actions/doorsAndSections';

import Modal from '../Modal';
import Visualisation from '../Visualisation';

const ZoomVisualisationModal = () => {
  const dispatch = useDispatch();

  const { isOpenZoomModal } = useSelector(({ doorsAndSections }) => doorsAndSections);

  if (!isOpenZoomModal) return null;

  clearAllBodyScrollLocks();

  return (
    <Modal
      closeModal={() => dispatch(DoorsActions.toggleZoomModal(false))}
      opened={isOpenZoomModal}
      type="full-size"
      className="zoom-visualisation-modal"
      shouldDisableBodyScroll
    >
      <Visualisation isZoomedIn />
    </Modal>
  );
};

export default ZoomVisualisationModal;
