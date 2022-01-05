import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Body from './Body';
import Heading from './Heading';

const TableDesktop = ({
  noDataTranslationKey,
  className,
  cellsWidth,
  linkIndexInRow,
  heading,
  rows,
  isEntityReadOnly,
  onPDFClick,
  onViewClick,
  onDeleteClick,
  onCopyClick,
  onEditClick,
  onEditTitleClick,
  onPutIntoWorkClick,
}) => {
  const tableClassName = clsx('table-responsive-wrapper', className);
  const ref = useRef(null);

  return (
    <div className={tableClassName}>
      <table
        className="table"
        ref={ref}
      >
        <Heading items={heading} />
        <Body
          noDataTranslationKey={noDataTranslationKey}
          items={rows}
          colAmount={heading.length}
          cellsWidth={cellsWidth}
          linkIndexInRow={linkIndexInRow}
          isEntityReadOnly={isEntityReadOnly}
          onPDFClick={onPDFClick}
          onViewClick={onViewClick}
          onDeleteClick={onDeleteClick}
          onCopyClick={onCopyClick}
          onEditClick={onEditClick}
          onEditTitleClick={onEditTitleClick}
          onPutIntoWorkClick={onPutIntoWorkClick}
        />
      </table>
    </div>
  );
};

TableDesktop.propTypes = {
  className: PropTypes.string,
  isEntityReadOnly: PropTypes.bool,
  noDataTranslationKey: PropTypes.string,
  linkIndexInRow: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape(),
  ]),
  heading: PropTypes.arrayOf(PropTypes.shape({})),
  rows: PropTypes.arrayOf(PropTypes.shape({})),
  cellsWidth: PropTypes.arrayOf(PropTypes.number),
  onPDFClick: PropTypes.func,
  onViewClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onCopyClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onEditTitleClick: PropTypes.func,
  onPutIntoWorkClick: PropTypes.func,
};

TableDesktop.defaultProps = {
  noDataTranslationKey: 'table.no-data',
  linkIndexInRow: null,
  isEntityReadOnly: true,
  className: '',
  heading: [],
  rows: [],
  cellsWidth: [],
  onPDFClick: () => {},
  onViewClick: () => {},
  onDeleteClick: () => {},
  onCopyClick: () => {},
  onEditClick: () => {},
  onEditTitleClick: () => {},
  onPutIntoWorkClick: () => {},
};

export default TableDesktop;
