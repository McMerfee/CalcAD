import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import FillingActions from '../../redux/actions/fillingMaterials';

const StickyHeaderDesktop = ({ titleKey }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const renderBackButton = () => (
    <div className="">
      <div className="header--back-icon">
        <img
          src="src/client/assets/icons/arrow-back-white.svg"
          alt="Back"
          width="18"
          height="18"
          onClick={() => dispatch(FillingActions.toggleFillingMaterialModal(false))}
          onKeyPress={() => {}}
          role="button" // eslint-disable-line
          tabIndex="0"
        />
      </div>
    </div>
  );

  return (
    <div className="tab-content--title-wrapper filling-desktop">
      {renderBackButton()}
      <div className="tab-content--title">
        <span>{t(titleKey)}</span>
      </div>
    </div>
  );
};

StickyHeaderDesktop.propTypes = {
  titleKey: PropTypes.string.isRequired,
};

export default StickyHeaderDesktop;
