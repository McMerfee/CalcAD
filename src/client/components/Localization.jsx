import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import ProfileActions from '../redux/actions/profile';

// move to redux store if the server provides a list of available languages and selected one
// now all settings are in i18next config
const languages = [
  {
    id: 0,
    title: 'УКР',
    code: 'uk',
  }, {
    id: 1,
    title: 'РУС',
    code: 'ru',
  },
];

const Localization = ({ isMobile }) => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const changeLanguage = (lngCode) => i18n.changeLanguage(lngCode);
  const className = isMobile ? 'localization--mobile' : 'localization';
  const { language } = useSelector(({ profile }) => profile);

  useEffect(() => {
    if (!language) return;
    changeLanguage(language);
  }, [language]);

  const handleChangeLanguage = (lngCode) => {
    changeLanguage(lngCode);
    dispatch(ProfileActions.setProfileLanguageRequest(lngCode));
  };

  return (
    <div className={className}>
      <img
        className={`${className}--icon`}
        src={`src/client/assets/icons/${isMobile ? 'mobile-' : ''}planet.svg`}
        alt="Planet"
      />
      {languages.map((lng) => {
        const isSelected = i18n.language === lng.code;
        return (
          <button
            type="button"
            key={lng.id}
            className={`${className}--btn ${isSelected && 'selected'}`}
            onClick={() => handleChangeLanguage(lng.code)}
          >
            <span>{lng.title}</span>
          </button>
        );
      })}
    </div>
  );
};


Localization.propTypes = {
  isMobile: PropTypes.bool,
};

Localization.defaultProps = {
  isMobile: false,
};

export default Localization;
