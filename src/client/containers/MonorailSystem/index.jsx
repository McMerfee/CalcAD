import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { navigate, useTitle } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';

import ConfigActions from '../../redux/actions/config';
import OrderActions from '../../redux/actions/order';
import SystemsActions from '../../redux/actions/systems';
import ProfileActions from '../../redux/actions/profile';
import FillingActions from '../../redux/actions/fillingMaterials';
import DoorsActions from '../../redux/actions/doorsAndSections';
import NavigationActions from '../../redux/actions/navigation';
import PriceListActions from '../../redux/actions/priceList';
import MySavedOrdersActions from '../../redux/actions/mySavedOrders';

import DoorsNavigation from '../../components/DoorsNavigation';
import StickyMenu from '../../components/StickyMenu';
import { canSaveOrder } from '../../components/StickyMenu/Footer';
import Visualisation from '../../components/Visualisation';
import ZoomVisualisationModal from '../../components/ZoomVisualisationModal';
import LeavePageModal from '../../components/LeavePageModal';
import Loader from '../../components/Loader';

import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';

import { AuthService } from '../../services';

import Main from '../layout/Main';


const MonorailSystem = ({
  toastManager,
  orderID,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useTitle(t('routes.monorail-system'));

  const [notificationId, setNotificationId] = useState('');
  const [isDesktopView, setIsDesktopView] = useState(false);

  const { isLoading, isConfigFetched } = useSelector(({ config }) => config);
  const { isLeavePageModalOpen, nextPath } = useSelector(({ navigation }) => navigation);
  const { isOrderAccepted, title, isFetched, errorMessage } = useSelector(({ order }) => order);
  const {
    activeDoor, activeSection, successMessage, doors, hasChanges,
    main: { doorOpeningHeight, doorOpeningWidth },
  } = useSelector(({ doorsAndSections }) => doorsAndSections);
  const fillingMaterialsState = useSelector(({ fillingMaterials }) => fillingMaterials);
  const { activeTrigger, isOpenFillingModal } = fillingMaterialsState;

  const pathname = window?.location?.pathname;
  const pathArray = pathname.split('/');
  const isEditPage = pathArray[2] === 'edit' || pathArray[3] === 'edit';

  useEffect(() => {
    if (!AuthService.isLoggedIn()) return;
    dispatch(ProfileActions.getUserProfileRequest());
    dispatch(PriceListActions.getPriceListRequest());
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth } = window || {};
      setIsDesktopView(innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    if (_.isEmpty(orderID)) {
      dispatch(ConfigActions.getConfigRequest('monorail'));
      dispatch(SystemsActions.setCurrentSystem('monorail'));
    }
    if (_.isEmpty(orderID) && !isEditPage) {
      dispatch(DoorsActions.setDefaultsBySystemType('monorail'));
    }
  }, []);


  useEffect(() => {
    if (_.isEmpty(orderID)) return;
    dispatch(OrderActions.fetchOrderDataRequest(orderID));
  }, [orderID]);



  useEffect(() => {
    if (isOrderAccepted) navigate(`/order/${orderID}/edit`);
  }, [isOrderAccepted, orderID]);


  useEffect(() => {
    if (!errorMessage) return;
    showToast(errorMessage, 'error');
  }, [errorMessage]);


  useEffect(() => {
    if (!successMessage) return;
    showToast(t(successMessage), 'success');
  }, [successMessage]);


  useEffect(() => {
    const handleLeavePage = (e) => {
      e.preventDefault();
      const hasMinimalRequiredInfo = Boolean(doorOpeningHeight?.value && doorOpeningWidth?.value);
      if (!AuthService.isLoggedIn() || !hasChanges || !hasMinimalRequiredInfo) return;
      dispatch(NavigationActions.toggleLeavePageModal(true));
      e.returnValue = t('leavePageModal.title');
    };
    window.addEventListener('beforeunload', handleLeavePage);
    return () => window.removeEventListener('beforeunload', handleLeavePage);
  });


  const tabsLabels = doors.map((door, i) => ({ title: t('monorailSystem.door-n', { number: i + 1 }) }));
  tabsLabels.unshift({ title: t('monorailSystem.basic') });

  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };

  const handleSubmitFilling = () => {
    const fillingMaterialToSet = {
      ...fillingMaterialsState[activeTrigger],
      ...{ material: activeTrigger },
    };

    if (activeDoor === 0) {
      dispatch(DoorsActions.updateMainDoorFilling(fillingMaterialToSet));
      closeFillingChoise();
      return;
    }
    if (activeSection === 0 && activeDoor > 0) {
      dispatch(DoorsActions.updateMainSectionFilling(activeDoor - 1, fillingMaterialToSet));
      closeFillingChoise();
      return;
    }
    if (activeDoor > 0 && activeSection > 0) {
      dispatch(DoorsActions.updateSectionFilling(
        activeDoor - 1,
        activeSection - 1,
        fillingMaterialToSet,
      ));
    }
    closeFillingChoise();
  };

  const closeFillingChoise = () => {
    dispatch(OrderActions.calculateOrderRequest());
    dispatch(FillingActions.resetFillingMaterialModal());
    dispatch(FillingActions.toggleFillingMaterialModal(false));
  };

  if ((isLoading || !isConfigFetched) || (orderID && !isFetched)) {
    return (
      <div className="extendable-system-page">
        <div className="sticky-container">
          <div className="main-wrapper--page-content">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="monorail-system-page">
      <div className="sticky-container">
        <Main
          footerClassName={isOpenFillingModal && !isDesktopView ? 'back' : null}
          onSubmitFilling={handleSubmitFilling}
          showBreadcrumbsDesktop
        >
          <div className="main-wrapper--page-content">
            <DoorsNavigation tabs={tabsLabels} />
            <Visualisation />
          </div>
        </Main>
        <StickyMenu tabs={tabsLabels} />
      </div>
      <ZoomVisualisationModal />

      <LeavePageModal
        isOpen={isLeavePageModalOpen}
        title={title}
        canSaveOrder={canSaveOrder(doors, doorOpeningHeight, doorOpeningWidth)}
        onCloseModal={() => dispatch(NavigationActions.toggleLeavePageModal(false))}
        onLeavePage={() => {
          dispatch(NavigationActions.toggleLeavePageModal(false));
          if (nextPath) {
            dispatch(OrderActions.resetCurrentOrderData());
            dispatch(SystemsActions.resetCurrentSystem());
            dispatch(FillingActions.resetFillingMaterialModal());
            dispatch(OrderActions.resetSpecification());
            dispatch(DoorsActions.resetOrderDefaults());
            navigate(nextPath);
          }
          dispatch(NavigationActions.resetLeavePageNextPath());
          dispatch(MySavedOrdersActions.getMySavedOrdersRequest());
        }}
        onSaveOrder={() => {
          dispatch(OrderActions.saveOrderRequest());
          if (nextPath) {
            dispatch(OrderActions.resetCurrentOrderData());
            dispatch(SystemsActions.resetCurrentSystem());
            dispatch(FillingActions.resetFillingMaterialModal());
            dispatch(OrderActions.resetSpecification());
            dispatch(DoorsActions.resetOrderDefaults());
            navigate(nextPath);
          }
          dispatch(NavigationActions.resetLeavePageNextPath());
        }}
      />
    </div>
  );
};

MonorailSystem.defaultProps = {
  orderID: null,
};

MonorailSystem.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
  orderID: PropTypes.string,
};

export default withToastManager(MonorailSystem);
