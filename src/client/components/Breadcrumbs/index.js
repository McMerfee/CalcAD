import _ from 'lodash';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import NavigationActions from '../../redux/actions/navigation';
import { ADSSystemTypesList } from '../../helpers/constants';

const Breadcrumbs = ({ className }) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();

  const {
    hasChanges,
    main: { doorOpeningHeight, doorOpeningWidth },
  } = useSelector(({ doorsAndSections }) => doorsAndSections);
  const { currentSystem } = useSelector(({ systems }) => systems);
  const { isOrderAccepted, currentOrderId } = useSelector(({ order }) => order);

  const pathArray = window.location.pathname.split('/');
  const currentBreadcrumb = pathArray[1];
  const isSystemPage = _.some(ADSSystemTypesList, (route) => route === currentBreadcrumb);
  const isOrderPage = currentBreadcrumb === 'order';

  const handleGoBack = () => {
    const navigationPath = isOrderPage && currentOrderId && isOrderAccepted
      ? '/my-orders'
      : isOrderPage && !isOrderAccepted
        ? `/${currentSystem}/edit`
        : isSystemPage ? '/systems' : '/';
    const hasMinimalRequiredInfo = Boolean(doorOpeningHeight?.value && doorOpeningWidth?.value);

    if (isSystemPage && hasChanges && hasMinimalRequiredInfo) {
      dispatch(NavigationActions.toggleLeavePageModal(true, navigationPath));
      return;
    }

    navigate(navigationPath);
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = isOrderPage && currentSystem
      ? (
        <>
          <li className="breadcrumbs--item">{t(`breadcrumbs.${currentSystem}`)}</li>
          <li className="breadcrumbs--item blue">&nbsp;/&nbsp;</li>
          <li className="breadcrumbs--item bold">{t('breadcrumbs.order-process')}</li>
        </>
      ) : isSystemPage
        ? (
          <li className="breadcrumbs--item bold">{t(`breadcrumbs.${currentBreadcrumb}`)}</li>
        ) : null;

    return breadcrumbs;
  };

  return (
    <div className={clsx('breadcrumbs--wrapper', className)}>
      <div className="breadcrumbs--inner">
        <div className="breadcrumbs--back-button">
          <button
            type="button"
            onClick={handleGoBack}
            className="header--back-icon"
          >
            <img
              src="src/client/assets/icons/arrow-back-blue.svg"
              alt="Back"
              width="17.95"
              height="18"
            />
          </button>
        </div>
        <ul className="breadcrumbs--list">{renderBreadcrumbs()}</ul>
      </div>
    </div>
  );
};

Breadcrumbs.propTypes = {
  className: PropTypes.string,
};

Breadcrumbs.defaultProps = {
  className: '',
};

export default Breadcrumbs;
