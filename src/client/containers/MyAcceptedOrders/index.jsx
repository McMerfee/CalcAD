import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';

import { AuthService } from '../../services';

import MyAcceptedOrdersActions from '../../redux/actions/myAcceptedOrders';
import MySavedOrdersActions from '../../redux/actions/mySavedOrders';
import OrderActions from '../../redux/actions/order';
import DoorsActions from '../../redux/actions/doorsAndSections';
import SystemsActions from '../../redux/actions/systems';
import FillingActions from '../../redux/actions/fillingMaterials';

import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';

import Main from '../layout/Main';
import TableDesktop from '../../components/TableDesktop';
import TableMobile from '../../components/TableMobile';
import CopyOrderModal from '../../components/CopyOrderModal';

const WIDE_TABLE_MIN_WIDTH = 1022;

const MyAcceptedOrders = ({ toastManager }) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();

  useTitle(t('routes.my-orders'));

  if (!(AuthService.isLoggedIn() && AuthService.isPhoneNumberVerified())) navigate('/sign-in');

  const {
    orders,
    isLoading,
    errorMessage: errorMessageMyAcceptedOrders,
  } = useSelector(({ myAcceptedOrders }) => myAcceptedOrders);
  const { isCopyOrderModalOpen } = useSelector(({ mySavedOrders }) => mySavedOrders);

  const {
    errorMessage,
    successMessage,
  } = useSelector(({ order }) => order);

  const heading = [{
    label: t('myAcceptedOrders.order'),
    value: 'order',
    width: 6,
  }, {
    label: t('myAcceptedOrders.client'),
    value: 'client',
    width: 10,
  }, {
    label: t('myAcceptedOrders.system-type'),
    value: 'system-type',
    width: 10,
  }, {
    label: t('myAcceptedOrders.date'),
    value: 'date',
    width: 7,
  }, {
    label: t('mySavedOrders.sum'),
    value: 'sum',
    width: 8,
  }, {
    label: t('mySavedOrders.retail'),
    value: 'retail',
    width: 8,
  }, {
    label: t('mySavedOrders.saving'),
    value: 'saving',
    width: 8,
  }, {
    label: t('myAcceptedOrders.status'),
    value: 'status',
    width: 10,
  }, {
    label: t('myAcceptedOrders.actions'),
    value: 'actions',
    width: 20,
  }];

  const [rows, setRows] = useState([]);
  const [notificationId, setNotificationId] = useState('');
  const [isWideTable, setIsWideTable] = useState(false);
  const [orderNumberForModal, setOrderNumberForModal] = useState('');
  const [orderIdToInteractWith, setOrderIdToInteractWith] = useState('');

  useEffect(() => {
    dispatch(MyAcceptedOrdersActions.getMyAcceptedOrdersRequest());
    dispatch(OrderActions.resetCurrentOrderData());
    dispatch(SystemsActions.resetCurrentSystem());
    dispatch(FillingActions.resetFillingMaterialModal());
    dispatch(OrderActions.resetSpecification());
    dispatch(DoorsActions.resetOrderDefaults());
  }, []);


  useEffect(() => {
    if (errorMessageMyAcceptedOrders) showToast(errorMessageMyAcceptedOrders, 'error');
    if (errorMessage) showToast(errorMessage, 'error');
    if (successMessage) showToast(successMessage, 'success');
  }, [
    errorMessageMyAcceptedOrders,
    errorMessage,
    successMessage,
  ]);


  useEffect(() => {
    const ordersToShow = orders
      .map((o) => {
        const retail = o.retailTotalPrice || o.totalPrice;
        const saving = +retail - +o.totalPrice;
        return _.pick({
          ...o,
          ...{
            createdOn: moment(o.createdOn).format('D.MM.YYYY'),
            totalPrice: `${o.totalPrice} грн.`,
            retailTotalPrice: `${retail} грн.`,
            saving: saving ? `${saving.toFixed(2)} грн.` : '',
            status: t(`ordersStatuses.${o.status}`),
          },
        }, ['orderNumber', 'title', 'systemType', 'createdOn', 'totalPrice',
          'retailTotalPrice', 'saving', 'status', '_id']);
      });

    setRows(ordersToShow);
  }, [orders]);


  useEffect(() => {
    const handleResizeWindow = () => {
      const { innerWidth } = window || {};
      setIsWideTable(innerWidth >= WIDE_TABLE_MIN_WIDTH);
    };

    handleResizeWindow();
    window.addEventListener('resize', handleResizeWindow);

    return () => window.removeEventListener('resize', handleResizeWindow);
  }, []);


  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };


  const onPDFClick = (orderId) => {
    const userId = AuthService.getUserId();

    if (!(orderId && userId)) return;

    const pathname = `/api/orders/${userId}/${orderId}/pdf`;
    const pdfTab = window.open(pathname, '_blank');

    if (_.isEmpty(pdfTab)) {
      showToast(t('warningMessages.please-disable-popup-blocker'), 'warning');
      window.location.pathname = pathname;
      return;
    }

    pdfTab.focus();
  };

  const onViewClick = (orderId) => navigate(`/order/${orderId}/view`);

  const onCopyClick = (orderId, orderNumber) => {
    setOrderIdToInteractWith(orderId);
    setOrderNumberForModal(orderNumber);
    dispatch(MySavedOrdersActions.toggleCopyOrderModal(true));
  };

  return (
    <Main
      className="my-orders"
      hasFooter={false}
      canGoBack={false}
      showHeaderLogoMobile
    >
      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <div className="my-orders--title">
            {t('myAcceptedOrders.my-orders')}
          </div>
          <div className="my-orders--table-wrapper">
            { isWideTable
              ? (
                <TableDesktop
                  noDataTranslationKey={isLoading ? 'myAcceptedOrders.loading' : 'myAcceptedOrders.no-orders'}
                  cellsWidth={[6, 10, 10, 7, 8, 8, 8, 10, 20]}
                  linkIndexInRow={0}
                  heading={heading}
                  rows={rows}
                  isEntityReadOnly
                  onPDFClick={(orderId) => onPDFClick(orderId)}
                  onViewClick={(orderId) => onViewClick(orderId)}
                  onCopyClick={(orderId, orderNumber) => onCopyClick(orderId, orderNumber)}
                />
              ) : (
                <TableMobile
                  noDataTranslationKey={isLoading ? 'myAcceptedOrders.loading' : 'myAcceptedOrders.no-orders'}
                  rows={rows}
                  isEntityReadOnly
                  onPDFClick={(orderId) => onPDFClick(orderId)}
                  onCopyClick={(orderId, orderNumber) => onCopyClick(orderId, orderNumber)}
                />
              )}
          </div>
        </div>
      </div>

      <CopyOrderModal
        orderNumber={orderNumberForModal}
        isOpen={isCopyOrderModalOpen}
        onCloseModal={() => {
          setOrderIdToInteractWith('');
          setOrderNumberForModal('');
          dispatch(MySavedOrdersActions.toggleCopyOrderModal(false));
        }}
        onCopyOrder={(title) => {
          dispatch(OrderActions.copyOrderRequest(orderIdToInteractWith, title));
          dispatch(MyAcceptedOrdersActions.getMyAcceptedOrdersRequest());
        }}
      />
    </Main>
  );
};

MyAcceptedOrders.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(MyAcceptedOrders);
