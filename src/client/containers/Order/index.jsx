import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { navigate, useTitle, getWorkingPath } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';
import { ReactSVG } from 'react-svg';
import Sticky from 'react-sticky-el';
import clsx from 'clsx';

import { AuthService } from '../../services';

import OrderActions from '../../redux/actions/order';
import ProfileActions from '../../redux/actions/profile';

import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';
import postPDF from '../../helpers/pdf';

import EditOrder from '../../components/EditOrder';
import ZoomVisualisationModal from '../../components/ZoomVisualisationModal';
import ZoomVizualizationButton from '../../components/ZoomVizualizationButton';
import ScrollingContainer from '../../components/StickyMenu/ScrollingContainer';
import Visualisation from '../../components/Visualisation';
import Loader from '../../components/Loader';

import Main from '../layout/Main';

const Order = ({
  orderID,
  toastManager,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [notificationId, setNotificationId] = useState('');

  const {
    currentOrderNumber,
    specification,
    errorMessage,
    successMessage,
  } = useSelector(({ order }) => order);

  const {
    minDoorsAmount,
    maxDoorsAmount,
    minSectionsAmount,
    maxSectionsAmount,
    main,
    doors,
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const { currentSystem } = useSelector(({ systems }) => systems);

  useTitle(t('routes.order'));

  if (!(AuthService.isLoggedIn() && AuthService.isPhoneNumberVerified())) navigate('/sign-in');

  useEffect(() => {
    dispatch(ProfileActions.getUserProfileRequest());
  }, []);

  useEffect(() => {
    dispatch(ProfileActions.getUserProfileRequest());
    dispatch(OrderActions.fetchOrderDataRequest(orderID));
    dispatch(OrderActions.calculateOrderRequest());
  }, [orderID]);

  useEffect(() => {
    if (errorMessage) showToast(errorMessage, 'error');
    if (successMessage) showToast(successMessage, 'success');
  }, [
    errorMessage,
    successMessage,
  ]);

  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };

  const showSpecification = async (e) => {
    e.preventDefault();

    const userId = AuthService.getUserId();
    if (!userId) return;

    const pathArray = getWorkingPath().split('/');
    const isEditPage = pathArray[3] === 'edit';
    let orderDraftId = '';

    if (!orderID || isEditPage) {
      const doorsSnippet = {
        minDoorsAmount,
        maxDoorsAmount,
        minSectionsAmount,
        maxSectionsAmount,
        main,
        doors,
      };

      await postPDF({
        userId,
        data: specification,
        doorsSnippet,
        systemType: currentSystem,
      })
        .then((res) => {
          orderDraftId = res?.orderId;
        });
    }

    const pathname = orderID && !isEditPage
      ? `/api/orders/${userId}/${orderID}/pdf`
      : orderDraftId
        ? `/api/orders-draft/${userId}/${orderDraftId}/pdf`
        : '';

    if (!pathname) {
      showToast(t('errorMessages.something-went-wrong'), 'error');
      return;
    }

    const pdfTab = window.open(pathname, '_blank');

    if (_.isEmpty(pdfTab)) {
      showToast(t('warningMessages.please-disable-popup-blocker'), 'warning');
      window.location.pathname = pathname;
      return;
    }

    pdfTab.focus();
  };

  const titleText = currentOrderNumber
    ? `${t('editOrder.project')} №${currentOrderNumber}`
    : t('editOrder.new-order');

  if (!main?.sideProfile?.value) {
    return (
      <div className="order-page">
        <div className="sticky-container">
          <div className="main-wrapper--page-content">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="sticky-container">
        <Main
          className="order-container"
          showBreadcrumbsDesktop
          canGoBack={false}
        >
          <div className="main-wrapper--page-content">
            <Visualisation />
          </div>
        </Main>

        <div className="sticky-menu-wrapper">
          <Sticky className="sticky-menu">
            <div className="sticky-menu--offset">
              <ZoomVizualizationButton className="mobile" />
            </div>
            <div className="sticky-menu--inner">
              <div className="sticky-menu--head-mobile">
                <div className="sticky-menu--snap"><span /></div>
              </div>
              <div className="sticky-menu--head-desktop">
                <div className="tab-content--title-wrapper">
                  <div className="tab-content--title">
                    {titleText}
                  </div>
                  <button
                    type="button"
                    className="rectangle"
                    onClick={showSpecification}
                  >
                    <ReactSVG
                      wrapper="span"
                      src="/src/client/assets/icons/pdf-icon.svg"
                    />
                    <span className="button-label">
                      &nbsp;
                      {t('editOrder.specification')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </Sticky>
          <ScrollingContainer className="scroll-area">
            <div className={clsx('tab-content', 'main-tab')} key="door-main-tab">
              <div className="main-tab--inner">
                <EditOrder />
              </div>
            </div>
          </ScrollingContainer>
        </div>
      </div>

      <ZoomVisualisationModal />
    </div>
  );
};

Order.defaultProps = {
  orderID: null,
};

Order.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
  orderID: PropTypes.string,
};

export default withToastManager(Order);
