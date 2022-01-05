import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ReactSVG } from 'react-svg';

import DoorsActions from '../../../redux/actions/doorsAndSections';


const TabHeader = ({ doorNumber }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    main: {
      doorsAmount,
      minDoorsAmount,
    },
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const deleteDoor = (e) => {
    e.preventDefault();

    const doorsAmountToChange = doorsAmount.value - 1;
    if (doorsAmountToChange < minDoorsAmount) return;

    dispatch(DoorsActions.toggleDeleteDoorModal(true));
  };

  const copyDoor = (e) => {
    e.preventDefault();

    dispatch(DoorsActions.toggleCopyDoorModal(true));
  };

  const renderActionButtons = () => {
    if (!doorNumber) return null;

    return (
      <div className="tab-content--action-buttons">
        <button
          type="button"
          className="rectangle"
          onClick={copyDoor}
          disabled={doorsAmount.value < 2}
        >
          <ReactSVG
            wrapper="span"
            src="/src/client/assets/icons/copy.svg"
          />
          <span className="button-label">
            &nbsp;
            {t('stickyMenu.door.copy')}
          </span>
        </button>
        <button
          type="button"
          className="circle"
          onClick={deleteDoor}
          disabled={doorsAmount.value <= minDoorsAmount}
        >
          <ReactSVG
            wrapper="span"
            src="/src/client/assets/icons/trash.svg"
          />
        </button>
      </div>
    );
  };

  return (
    <div className="tab-content--title-wrapper">
      <div className="tab-content--title">
        { doorNumber > 0
          ? (<span>{t('stickyMenu.bottomNavPanel.door-n', { number: doorNumber })}</span>)
          : (<span>{t('stickyMenu.desktop.main-params')}</span>)}
      </div>
      {renderActionButtons()}
    </div>
  );
};

TabHeader.propTypes = {
  doorNumber: PropTypes.number.isRequired,
};

export default TabHeader;
