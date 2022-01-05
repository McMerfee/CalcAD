import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Row from './Row';
import NoData from './NoData';

const TableMobile = ({
  noDataTranslationKey,
  className,
  rows,
  isEntityReadOnly,
  onPDFClick,
  onViewClick,
  onDeleteClick,
  onEditClick,
  onPutIntoWorkClick,
  onCopyClick,
  onEditTitleClick,
}) => {
  const ref = useRef(null);

  const [extentedRowId, setExtentedRowId] = useState('');

  const handleOnRowClick = (entityId) => {
    if (entityId === extentedRowId) {
      setExtentedRowId('');
      return;
    }
    setExtentedRowId(entityId);
  };

  const blocks = rows.length
    ? rows.map((row) => {
      const rowClassName = clsx(extentedRowId === row._id && 'extended');

      return (
        <Row
          onClick={handleOnRowClick}
          key={row._id}
          entity={row}
          isEntityReadOnly={isEntityReadOnly}
          onPDFClick={onPDFClick}
          onViewClick={onViewClick}
          onDeleteClick={onDeleteClick}
          onEditClick={onEditClick}
          onPutIntoWorkClick={onPutIntoWorkClick}
          className={rowClassName}
          isRowExtended={row._id === extentedRowId}
          onCopyClick={onCopyClick}
          onEditTitleClick={onEditTitleClick}
        />
      );
    }) : (
      <NoData noDataTranslationKey={noDataTranslationKey} />
    );


  return (
    <div className={className}>
      <div
        className="table-mobile"
        ref={ref}
      >
        {blocks}
      </div>
    </div>
  );
};

TableMobile.propTypes = {
  className: PropTypes.string,
  isEntityReadOnly: PropTypes.bool,
  noDataTranslationKey: PropTypes.string,
  rows: PropTypes.arrayOf(PropTypes.shape({})),
  onPDFClick: PropTypes.func,
  onViewClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onPutIntoWorkClick: PropTypes.func,
  onCopyClick: PropTypes.func,
  onEditTitleClick: PropTypes.func,
};

TableMobile.defaultProps = {
  noDataTranslationKey: 'table.no-data',
  isEntityReadOnly: true,
  className: '',
  rows: [],
  onPDFClick: () => {},
  onViewClick: () => {},
  onDeleteClick: () => {},
  onEditClick: () => {},
  onPutIntoWorkClick: () => {},
  onCopyClick: () => {},
  onEditTitleClick: () => {},
};

export default TableMobile;
