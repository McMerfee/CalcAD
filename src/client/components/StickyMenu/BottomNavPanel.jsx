import React from 'react';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import DoorsActions from '../../redux/actions/doorsAndSections';

const BottomNavPanel = ({
  nextDoorNumber,
  showNext,
  onNavigate,
}) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const labelKey = i18n.language === 'ru' ? 'labelRu' : 'labelUk';
  const nextButtonText = t('stickyMenu.bottomNavPanel.door-n', { number: nextDoorNumber });

  const {
    main: {
      doorOpeningHeight,
      doorOpeningWidth,
    },
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const handleNavigate = (e) => {
    e.preventDefault();

    if (!(doorOpeningHeight?.value && doorOpeningWidth?.value)) {
      dispatch(DoorsActions.hightlightDoorOpeningInputs(labelKey));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onNavigate(nextDoorNumber);
  };

  return (
    <div className="configurator-bottom-nav">
      <div className="configurator-bottom-nav--inner">
        <div
          className={clsx(
            'configurator-bottom-nav--next-button',
            !(doorOpeningHeight?.value && doorOpeningWidth?.value) && 'disabled',
          )}
          onClick={handleNavigate}
          onKeyPress={() => {}}
          role="button"
          tabIndex={0}
        >
          { showNext
            && (
              <>
                <span>{nextButtonText}</span>
                <ReactSVG
                  src="/src/client/assets/icons/rounded-arrow-next.svg"
                  wrapper="span"
                  className={clsx(
                    'configurator-bottom-nav--next-icon',
                    !(doorOpeningHeight?.value && doorOpeningWidth?.value) && 'disabled',
                  )}
                />
              </>
            )}
        </div>
      </div>
    </div>
  );
};

BottomNavPanel.defaultProps = {
  nextDoorNumber: 1,
  showNext: true,
  onNavigate: () => {},
};

BottomNavPanel.propTypes = {
  nextDoorNumber: PropTypes.number,
  showNext: PropTypes.bool,
  onNavigate: PropTypes.func,
};

export default BottomNavPanel;
