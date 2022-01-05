import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import Cell from './Cell';

const Row = ({
  className,
  items,
  onClick,
  cellsWidth,
  entityId,
  entityNumber,
  linkIndex,
  isEntityReadOnly,
  onPDFClick,
  onViewClick,
  onDeleteClick,
  onCopyClick,
  onEditClick,
  onEditTitleClick,
  onPutIntoWorkClick,
}) => {
  const { t } = useTranslation();
  const rowClassName = clsx('table--row', className);

  if (_.isEmpty(items)) return null;

  const cells = _.map(items, (item, i) => (
    <Cell
      key={`cell-${i + 1}`}
      item={i === 2 ? t(`systemsChoise.${item}`)
        : (typeof item === 'string' && item.startsWith('ordersStatuses'))
          ? item.replace('ordersStatuses.', '') : item}
      path={`/order/${entityId}/edit`}
      width={`${cellsWidth.length ? cellsWidth[i] : 100 / items.length}%`}
      isLink={linkIndex === i}
      className={isEntityReadOnly && i === items.length - 1 ? 'status' : ''}
    />
  ));

  const actionButtons = () => {
    if (isEntityReadOnly) {
      return (
        <div className="table--action-buttons">
          <button
            type="button"
            className="circle"
            title={t('table.copy-project')}
            onClick={() => onCopyClick(entityId, entityNumber)}
          >
            <ReactSVG
              wrapper="span"
              src="/src/client/assets/icons/copy.svg"
            />
          </button>
          <button
            type="button"
            className="circle"
            title={t('table.open-specification')}
            onClick={() => onPDFClick(entityId)}
          >
            <ReactSVG
              wrapper="span"
              src="/src/client/assets/icons/pdf-icon.svg"
            />
          </button>
          <button
            type="button"
            className="rectangle"
            onClick={() => onViewClick(entityId)}
          >
            <ReactSVG
              wrapper="span"
              src="/src/client/assets/icons/eye-light-blue.svg"
            />
            <span className="button-label">
              &nbsp;
              {t('myAcceptedOrders.view')}
            </span>
          </button>
        </div>
      );
    }

    return (
      <div className="table--action-buttons">
        <div className="cirle-buttons-group">
          <button
            type="button"
            className="circle"
            title={t('table.copy-project')}
            onClick={() => onCopyClick(entityId, entityNumber)}
          >
            <ReactSVG
              wrapper="span"
              src="/src/client/assets/icons/copy.svg"
            />
          </button>
          <button
            type="button"
            className="circle"
            title={t('table.rename-project')}
            onClick={() => onEditTitleClick(entityId, items[1])}
          >
            <ReactSVG
              wrapper="span"
              src="/src/client/assets/icons/font-solid.svg"
            />
          </button>
          <button
            type="button"
            className="circle"
            id="delete-btn"
            title={t('table.delete-project')}
            onClick={() => onDeleteClick(entityId, entityNumber)}
          >
            <ReactSVG
              wrapper="span"
              src="/src/client/assets/icons/trash-blue.svg"
            />
          </button>
          <button
            type="button"
            className="circle"
            title={t('table.edit-project')}
            onClick={() => onEditClick(entityId)}
          >
            <ReactSVG
              wrapper="span"
              src="/src/client/assets/icons/edit-pencil.svg"
            />
          </button>
          <button
            type="button"
            className="circle"
            title={t('table.open-specification')}
            onClick={() => onPDFClick(entityId)}
          >
            <ReactSVG
              wrapper="span"
              src="/src/client/assets/icons/pdf-icon.svg"
            />
          </button>
        </div>
        <button
          type="button"
          className="rectangle"
          onClick={() => onPutIntoWorkClick(entityId, entityNumber)}
        >
          <ReactSVG
            wrapper="span"
            src="/src/client/assets/icons/cube-with-arrow.svg"
          />
          <span className="button-label">
            &nbsp;
            {t('mySavedOrders.put-into-work')}
          </span>
        </button>
      </div>
    );
  };

  return (
    <tr
      className={rowClassName}
      onClick={() => onClick(entityId)}
      id={entityId}
    >
      {cells}
      <Cell
        key={entityId}
        item={actionButtons()}
        path={`/order/${entityId}/edit`}
        width={100 / items.length}
        isLink={false}
        className="action-buttons-cell"
      />
    </tr>
  );
};

Row.propTypes = {
  entityId: PropTypes.string.isRequired,
  entityNumber: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  isEntityReadOnly: PropTypes.bool,
  onPDFClick: PropTypes.func,
  onViewClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onCopyClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onEditTitleClick: PropTypes.func,
  onPutIntoWorkClick: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ])),
  cellsWidth: PropTypes.arrayOf(PropTypes.number),
  linkIndex: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape(),
  ]),
};

Row.defaultProps = {
  linkIndex: null,
  isEntityReadOnly: true,
  className: '',
  items: [],
  cellsWidth: [],
  onClick: () => {},
  onPDFClick: () => {},
  onViewClick: () => {},
  onDeleteClick: () => {},
  onCopyClick: () => {},
  onEditClick: () => {},
  onEditTitleClick: () => {},
  onPutIntoWorkClick: () => {},
};

export default Row;
