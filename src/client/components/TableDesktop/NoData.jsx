import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';


const NoData = ({
  noDataTranslationKey,
  className,
  colSpan,
}) => {
  const rowClassName = clsx('table--row-empty', className);
  const { t } = useTranslation(['components']);

  return (
    <tr className={rowClassName}>
      <td
        key="single-cell"
        className="table--cell"
        colSpan={colSpan}
      >
        <div className="table--cell-inner">
          {t(noDataTranslationKey)}
        </div>
      </td>
    </tr>
  );
};

NoData.propTypes = {
  noDataTranslationKey: PropTypes.string.isRequired,
  className: PropTypes.string,
  colSpan: PropTypes.number,
};

NoData.defaultProps = {
  className: '',
  colSpan: 1,
};

export default NoData;
