import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const Footer = ({
  onSubmit,
  isDisabled,
}) => {
  const { t } = useTranslation(['components']);
  return (
    <div className="filling-modal-footer">
      <div className="filling-modal-footer--inner">
        <button
          type="button"
          className="full-width-button"
          disabled={isDisabled}
          onClick={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <span>{t('fillingMaterialsModal.choose')}</span>
        </button>
      </div>
    </div>
  );
};

Footer.defaultProps = {
  onSubmit: () => {},
  isDisabled: true,
};

Footer.propTypes = {
  onSubmit: PropTypes.func,
  isDisabled: PropTypes.bool,
};

export default Footer;
