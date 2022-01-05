import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';

import { AuthService } from '../../services';

import MySavedOrdersActions from '../../redux/actions/mySavedOrders';
import OrderActions from '../../redux/actions/order';
import DoorsActions from '../../redux/actions/doorsAndSections';
import SystemsActions from '../../redux/actions/systems';
import FillingActions from '../../redux/actions/fillingMaterials';
import ProfileActions from '../../redux/actions/profile';
import DeliveryActions from '../../redux/actions/delivery';
import PriceListActions from '../../redux/actions/priceList';

import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';

import Main from '../layout/Main';
import TableDesktop from '../../components/TableDesktop';
import TableMobile from '../../components/TableMobile';
import PutOrderIntoWorkModal from '../../components/PutOrderIntoWorkModal';
import DeleteOrderModal from '../../components/DeleteOrderModal';
import CopyOrderModal from '../../components/CopyOrderModal';
import OrderTitleModal from '../../components/OrderTitleModal';
import Loader from '../../components/Loader';


const WIDE_TABLE_MIN_WIDTH = 980;

const MySavedOrders = ({ toastManager }) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();

  useTitle(t('routes.saved-orders'));

  if (!(AuthService.isLoggedIn() && AuthService.isPhoneNumberVerified())) navigate('/sign-in');

  const {
    orders,
    isLoading,
    isComplete,
    errorMessage: errorMessageMySavedOrders,
    isPutOrderIntoWorkModalOpen,
    isDeleteOrderModalOpen,
    isCopyOrderModalOpen,
  } = useSelector(({ mySavedOrders }) => mySavedOrders);

  const {
    currentOrderId,
    errorMessage,
    successMessage,
    isOrderTitleModalOpen,
  } = useSelector(({ order }) => order);

  const heading = [{
    label: t('mySavedOrders.order'),
    value: 'order',
    width: 10,
  }, {
    label: t('myAcceptedOrders.client'),
    value: 'client',
    width: 15,
  }, {
    label: t('myAcceptedOrders.system-type'),
    value: 'system-type',
    width: 10,
  }, {
    label: t('mySavedOrders.date'),
    value: 'date',
    width: 7,
  }, {
    label: t('mySavedOrders.sum'),
    value: 'sum',
    width: 6,
  }, {
    label: t('mySavedOrders.retail'),
    value: 'retail',
    width: 6,
  }, {
    label: t('mySavedOrders.saving'),
    value: 'saving',
    width: 6,
  }, {
    label: t('myAcceptedOrders.actions'),
    value: 'actions',
    width: 25,
  }];

  const [rows, setRows] = useState([]);
  const [notificationId, setNotificationId] = useState('');
  const [isWideTable, setIsWideTable] = useState(false);
  const [orderIdToInteractWith, setOrderIdToInteractWith] = useState('');
  const [orderTitleToInteractWith, setOrderTitleToInteractWith] = useState('');
  const [orderNumberForModal, setOrderNumberForModal] = useState('');
  const [showLoader, setShowLoader] = useState('');

  useEffect(() => {
    dispatch(ProfileActions.getUserProfileRequest());
    dispatch(DeliveryActions.getDeliveryRequest());
    dispatch(MySavedOrdersActions.getMySavedOrdersRequest());
    dispatch(OrderActions.resetCurrentOrderData());
    dispatch(SystemsActions.resetCurrentSystem());
    dispatch(FillingActions.resetFillingMaterialModal());
    dispatch(OrderActions.resetSpecification());
    dispatch(DoorsActions.resetOrderDefaults());
    dispatch(PriceListActions.getPriceListRequest());
  }, []);

  const { delivery: userDelivery } = useSelector(({ profile }) => profile);
  const { deliveryOptions } = useSelector(({ delivery }) => delivery);

  useEffect(() => {
    dispatch(ProfileActions.getUserProfileRequest());
    dispatch(MySavedOrdersActions.getMySavedOrdersRequest());
    dispatch(SystemsActions.resetCurrentSystem());
    dispatch(OrderActions.resetCurrentOrderData());
    dispatch(FillingActions.toggleFillingMaterialModal(false));
    dispatch(FillingActions.resetFillingMaterialModal());
    dispatch(OrderActions.resetSpecification());
    dispatch(DoorsActions.resetOrderDefaults());
  }, [currentOrderId]);

  useEffect(() => { setShowLoader(!isComplete); }, [isComplete]);

  useEffect(() => {
    if (errorMessageMySavedOrders) showToast(errorMessageMySavedOrders, 'error');
    if (errorMessage) showToast(errorMessage, 'error');
    if (successMessage) showToast(successMessage, 'success');
  }, [
    errorMessageMySavedOrders,
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
          },
        }, ['orderNumber', 'title', 'systemType', 'createdOn', 'totalPrice', 'retailTotalPrice', 'saving', '_id']);
      });

    setRows(ordersToShow);
  }, [orders, currentOrderId, isComplete]);


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

  const onPutIntoWorkClick = (orderId, orderNumber) => {
    setOrderIdToInteractWith(orderId);
    setOrderNumberForModal(orderNumber);
    dispatch(MySavedOrdersActions.togglePutOrderIntoWorkModal(true));
  };

  const onDeleteClick = (orderId, orderNumber) => {
    setOrderIdToInteractWith(orderId);
    setOrderNumberForModal(orderNumber);
    dispatch(MySavedOrdersActions.toggleDeleteOrderModal(true));
  };

  const onCopyClick = (orderId, orderNumber) => {
    setOrderIdToInteractWith(orderId);
    setOrderNumberForModal(orderNumber);
    dispatch(MySavedOrdersActions.toggleCopyOrderModal(true));
  };

  const onEditClick = (orderId) => navigate(`/order/${orderId}/edit`);

  const onEditTitleClick = (orderId, title) => {
    setOrderIdToInteractWith(orderId);
    setOrderTitleToInteractWith(title);
    dispatch(OrderActions.toggleOrderTitleModal(true));
  };

  if (showLoader) {
    return (
      <Main
        className="saved-orders"
        hasFooter={false}
        canGoBack={false}
        showHeaderLogoMobile
      >
        <div className="content-wrapper">
          <div className="content-wrapper-inner">
            <div className="my-orders--title">
              {t('mySavedOrders.saved-orders')}
            </div>
            <Loader />
          </div>
        </div>
      </Main>
    );
  }

  return (
    <Main
      className="saved-orders"
      hasFooter={false}
      canGoBack={false}
      showHeaderLogoMobile
    >
      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <div className="my-orders--title">
            {t('mySavedOrders.saved-orders')}
          </div>
          <div className="my-orders--table-wrapper">
            { isWideTable
              ? (
                <TableDesktop
                  noDataTranslationKey={isLoading ? 'mySavedOrders.loading' : 'mySavedOrders.no-orders'}
                  cellsWidth={[10, 15, 10, 7, 6, 6, 6, 25]}
                  linkIndexInRow={0}
                  heading={heading}
                  rows={rows}
                  isEntityReadOnly={false}
                  onPDFClick={(orderId) => onPDFClick(orderId)}
                  onPutIntoWorkClick={(orderId, orderNumber) => onPutIntoWorkClick(orderId, orderNumber)}
                  onDeleteClick={(orderId, orderNumber) => onDeleteClick(orderId, orderNumber)}
                  onCopyClick={(orderId, orderNumber) => onCopyClick(orderId, orderNumber)}
                  onEditClick={(orderId) => onEditClick(orderId)}
                  onEditTitleClick={(orderId, title) => onEditTitleClick(orderId, title)}
                />
              ) : (
                <TableMobile
                  noDataTranslationKey={isLoading ? 'mySavedOrders.loading' : 'mySavedOrders.no-orders'}
                  rows={rows}
                  isEntityReadOnly={false}
                  onPDFClick={(orderId) => onPDFClick(orderId)}
                  onPutIntoWorkClick={(orderId, orderNumber) => onPutIntoWorkClick(orderId, orderNumber)}
                  onDeleteClick={(orderId, orderNumber) => onDeleteClick(orderId, orderNumber)}
                  onCopyClick={(orderId, orderNumber) => onCopyClick(orderId, orderNumber)}
                  onEditTitleClick={(orderId, title) => onEditTitleClick(orderId, title)}
                  onEditClick={(orderId) => onEditClick(orderId)}
                />
              )}
          </div>
        </div>
      </div>

      <PutOrderIntoWorkModal
        orderNumber={orderNumberForModal}
        orderID={orderIdToInteractWith}
        isOpen={isPutOrderIntoWorkModalOpen}
        onCloseModal={() => {
          setOrderIdToInteractWith('');
          setOrderNumberForModal('');
          dispatch(MySavedOrdersActions.togglePutOrderIntoWorkModal(false));
        }}
        onPutOrderIntoWork={(data, recalculatedOrder) => {
          dispatch(OrderActions.putOrderIntoWorkRequest(orderIdToInteractWith, data, recalculatedOrder));
          dispatch(MySavedOrdersActions.getMySavedOrdersRequest());
        }}
        deliveryOptions={deliveryOptions}
        deliveryType={userDelivery?.type || ''}
        city={userDelivery?.city || ''}
        addressLine={userDelivery?.addressLine || ''}
        office={userDelivery?.office || ''}
      />

      <DeleteOrderModal
        orderNumber={orderNumberForModal}
        isOpen={isDeleteOrderModalOpen}
        onCloseModal={() => {
          setOrderIdToInteractWith('');
          setOrderNumberForModal('');
          dispatch(MySavedOrdersActions.toggleDeleteOrderModal(false));
        }}
        onDeleteOrder={() => {
          dispatch(OrderActions.deleteOrderRequest(orderIdToInteractWith));
          dispatch(MySavedOrdersActions.getMySavedOrdersRequest());
        }}
      />

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
          dispatch(MySavedOrdersActions.getMySavedOrdersRequest());
        }}
      />

      <OrderTitleModal
        isOpen={isOrderTitleModalOpen}
        onCloseModal={() => dispatch(OrderActions.toggleOrderTitleModal(false))}
        onSubmit={(titleToUpdate) => {
          dispatch(OrderActions.updateOrderTitleRequest(orderIdToInteractWith, titleToUpdate));
          dispatch(MySavedOrdersActions.getMySavedOrdersRequest());
        }}
        className="action-modal order-title"
        title={orderTitleToInteractWith}
      />
    </Main>
  );
};

MySavedOrders.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(MySavedOrders);
