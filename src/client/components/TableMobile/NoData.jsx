import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';


const NoData = ({
  noDataTranslationKey,
  className,
}) => {
  const rowClassName = clsx('table-mobile--row-empty', className);
  const { t } = useTranslation(['components']);

  return (
    <div className={rowClassName}>
      <div className="table-mobile--row-inner">
        <div className="table-mobile--row-content">
          <div className="table-mobile--empty-row-line">
            {t(noDataTranslationKey)}
          </div>
        </div>
      </div>
    </div>
  );
};

NoData.propTypes = {
  noDataTranslationKey: PropTypes.string.isRequired,
  className: PropTypes.string,
};

NoData.defaultProps = {
  className: '',
};

export default NoData;
