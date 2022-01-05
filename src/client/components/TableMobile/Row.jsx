import _ from 'lodash';
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';


const Row = ({
  onClick,
  entity,
  isEntityReadOnly,
  isRowExtended,
  className,
  onPDFClick,
  onViewClick,
  onDeleteClick,
  onEditClick,
  onPutIntoWorkClick,
  onCopyClick,
  onEditTitleClick,
}) => {
  const { t } = useTranslation();
  const rowClassName = clsx('table-mobile--row', className);
  const ref = useRef(null);

  if (_.isEmpty(entity)) return null;

  const {
    _id: entityId,
    retailTotalPrice,
    totalPrice,
    saving,
    createdOn,
    systemType,
    title,
    orderNumber,
  } = entity;

  useEffect(() => {}, [title, totalPrice, retailTotalPrice]);

  const secondaryPriceInfo = saving
    ? `${t('mySavedOrders.retail')}: ${retailTotalPrice} ${t('mySavedOrders.saving')}: ${saving}`
    : `${t('mySavedOrders.retail')}: ${retailTotalPrice}`;

  const actionButtons = () => {
    if (isEntityReadOnly) {
      return (
        <div className="table-mobile--action-buttons">
          <button
            type="button"
            className="circle"
            title={t('table.copy-project')}
            onClick={() => onCopyClick(entityId, orderNumber)}
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
      <div className="table-mobile--action-buttons">
        <button
          type="button"
          className="circle"
          title={t('table.copy-project')}
          onClick={() => onCopyClick(entityId, orderNumber)}
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
          onClick={() => onEditTitleClick(entityId, title)}
        >
          <ReactSVG
            wrapper="span"
            src="/src/client/assets/icons/font-solid.svg"
          />
        </button>
        <button
          type="button"
          className="circle"
          title={t('table.delete-project')}
          onClick={() => onDeleteClick(entityId, orderNumber)}
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
        <button
          type="button"
          className="rectangle"
          onClick={() => onPutIntoWorkClick(entityId, orderNumber)}
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
    <div className={rowClassName} ref={ref} key={entityId}>
      <div className="table-mobile--row-inner">
        <div
          className="table-mobile--row-content"
          onClick={() => onClick(entityId)}
          onKeyPress={null}
          role="button"
          tabIndex={0}
        >
          <div className="table-mobile--line">
            <div className="table-mobile--date">{createdOn}</div>
          </div>
          <div className="table-mobile--line">
            <div className="table-mobile--number">{orderNumber}</div>
            <div className="table-mobile--title">{title}</div>
          </div>
          <div className="table-mobile--line">
            <div className="table-mobile--system-type">{t(`systemsChoise.${systemType}`)}</div>
            <div className="table-mobile--price">{totalPrice}</div>
          </div>
          <div className="table-mobile--line">
            <div className="table-mobile--price-secondary">{secondaryPriceInfo}</div>
          </div>
        </div>
        { !isRowExtended
          || (
            <>
              <div className="table-mobile--row-hr" />
              <div className="table-mobile--action-buttons-wrapper">
                {actionButtons()}
              </div>
            </>
          )}
      </div>
    </div>
  );
};

Row.propTypes = {
  entity: PropTypes.shape({
    _id: PropTypes.string,
    retailTotalPrice: PropTypes.string,
    totalPrice: PropTypes.string,
    saving: PropTypes.string,
    createdOn: PropTypes.string,
    systemType: PropTypes.string,
    title: PropTypes.string,
    orderNumber: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
  }).isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  isEntityReadOnly: PropTypes.bool,
  isRowExtended: PropTypes.bool,
  onPDFClick: PropTypes.func,
  onViewClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onPutIntoWorkClick: PropTypes.func,
  onCopyClick: PropTypes.func,
  onEditTitleClick: PropTypes.func,
};

Row.defaultProps = {
  onClick: null,
  isEntityReadOnly: true,
  isRowExtended: false,
  className: '',
  onPDFClick: () => {},
  onViewClick: () => {},
  onDeleteClick: () => {},
  onEditClick: () => {},
  onPutIntoWorkClick: () => {},
  onCopyClick: () => {},
  onEditTitleClick: () => {},
};

export default Row;
