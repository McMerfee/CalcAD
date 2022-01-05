import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import NoData from './NoData';
import Row from './Row';

const Body = ({
  className,
  items,
  noDataTranslationKey,
  linkIndexInRow,
  colAmount,
  cellsWidth,
  isEntityReadOnly,
  onPDFClick,
  onViewClick,
  onDeleteClick,
  onCopyClick,
  onEditClick,
  onEditTitleClick,
  onPutIntoWorkClick,
}) => {
  const headingClassName = clsx('table--body', className);

  const rows = items.length
    ? items.map((data, i) => {
      const itemsArray = Object.values(_.omit(data, ['_id']));

      return (
        <Row
          entityId={data?._id}
          entityNumber={data?.orderNumber}
          key={`row-${i + 1}`}
          items={itemsArray}
          cellsWidth={cellsWidth}
          linkIndex={linkIndexInRow}
          isEntityReadOnly={isEntityReadOnly}
          onPDFClick={onPDFClick}
          onViewClick={onViewClick}
          onDeleteClick={onDeleteClick}
          onCopyClick={onCopyClick}
          onEditClick={onEditClick}
          onEditTitleClick={onEditTitleClick}
          onPutIntoWorkClick={onPutIntoWorkClick}
        />
      );
    }) : (
      <NoData
        noDataTranslationKey={noDataTranslationKey}
        colSpan={colAmount}
      />
    );

  return (
    <tbody className={headingClassName}>
      {rows}
    </tbody>
  );
};

Body.propTypes = {
  noDataTranslationKey: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})),
  cellsWidth: PropTypes.arrayOf(PropTypes.number),
  className: PropTypes.string,
  colAmount: PropTypes.number,
  isEntityReadOnly: PropTypes.bool,
  onPDFClick: PropTypes.func,
  onViewClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onCopyClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onEditTitleClick: PropTypes.func,
  onPutIntoWorkClick: PropTypes.func,
  linkIndexInRow: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape(),
  ]),
};

Body.defaultProps = {
  className: '',
  items: [],
  cellsWidth: [],
  colAmount: 1,
  linkIndexInRow: null,
  isEntityReadOnly: true,
  onPDFClick: () => {},
  onViewClick: () => {},
  onDeleteClick: () => {},
  onCopyClick: () => {},
  onEditClick: () => {},
  onEditTitleClick: () => {},
  onPutIntoWorkClick: () => {},
};

export default Body;
