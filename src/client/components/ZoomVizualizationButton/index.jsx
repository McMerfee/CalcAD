import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import clsx from 'clsx';

import DoorsActions from '../../redux/actions/doorsAndSections';

const ZoomVizualizationButton = ({
  className,
  isDisabled,
}) => {
  const dispatch = useDispatch();
  const rootClassName = clsx('zoom-visualisation-wrapper', className, isDisabled && 'disabled');

  const {
    main: {
      doorOpeningHeight,
      doorOpeningWidth,
    },
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  if (!(doorOpeningHeight?.value && doorOpeningWidth?.value)) return null;

  return (
    <div className={rootClassName}>
      <ReactSVG
        wrapper="span"
        src="/src/client/assets/icons/zoom-icon.svg"
        className="zoom-visualisation-button"
        beforeInjection={(svg) => { svg.classList.add('zoom-visualisation'); }}
        onClick={() => {
          dispatch(DoorsActions.setActiveDoor(0));
          dispatch(DoorsActions.setActiveSection(0));
          dispatch(DoorsActions.toggleZoomModal(true));
        }}
      />
    </div>
  );
};


ZoomVizualizationButton.propTypes = {
  className: PropTypes.string,
  isDisabled: PropTypes.bool,
};

ZoomVizualizationButton.defaultProps = {
  className: '',
  isDisabled: false,
};

export default ZoomVizualizationButton;
