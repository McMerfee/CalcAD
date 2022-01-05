import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import DoorsActions from '../../../redux/actions/doorsAndSections';
import OrderActions from '../../../redux/actions/order';

import SectionSwitcher from '../sections/SectionSwitcher';
import CopyDoorModal from '../../CopyDoorModal';
import DeleteDoorModal from '../../DeleteDoorModal';
import TabHeader from './TabHeader';

const Door = ({
  doorNumber,
}) => {
  const dispatch = useDispatch();

  const { systemConctants } = useSelector(({ config }) => config);
  const { currentSystem } = useSelector(({ systems }) => systems);

  const {
    main: { doorsAmount },
    doors,
    isOpenCopyDoorModal,
    isOpenDeleteDoorModal,
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const door = doors[doorNumber - 1];

  if (!door) return null;

  return (
    <div className={clsx('tab-content', 'door-tab')}>
      <div className="tab-content--inner">
        <TabHeader doorNumber={doorNumber} />
        <SectionSwitcher doorNumber={doorNumber} />
      </div>

      <CopyDoorModal
        isOpen={isOpenCopyDoorModal}
        onCloseModal={() => dispatch(DoorsActions.toggleCopyDoorModal(false))}
        onCopy={(doorIndex, selectedDoors) => {
          dispatch(DoorsActions.copyDoorRequest(doorIndex, selectedDoors));
          dispatch(OrderActions.calculateOrderRequest());
        }}
        doorNumber={doorNumber}
        doorsAmount={doorsAmount.value}
      />

      <DeleteDoorModal
        isOpen={isOpenDeleteDoorModal}
        onCloseModal={() => dispatch(DoorsActions.toggleDeleteDoorModal(false))}
        onDeleteDoor={(doorIndex) => {
          dispatch(DoorsActions.removeDoorRequest(doorIndex, systemConctants, currentSystem));
          dispatch(OrderActions.calculateOrderRequest());
        }}
        doorNumber={doorNumber}
      />
    </div>
  );
};

Door.propTypes = {
  doorNumber: PropTypes.number.isRequired,
};

export default Door;
