import _ from 'lodash';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { navigate, getWorkingPath } from 'hookrouter';
import clsx from 'clsx';

import DoorsActions from '../../redux/actions/doorsAndSections';
import PriceListActions from '../../redux/actions/priceList';
import OrderActions from '../../redux/actions/order';
import MySavedOrdersActions from '../../redux/actions/mySavedOrders';

import { AuthService } from '../../services';

import { ADSSystemTypesList } from '../../helpers/constants';

import Button from '../Button';
import OrderTitleModal from '../OrderTitleModal';

export const canSaveOrder = (doors, doorOpeningHeight, doorOpeningWidth) => {
  const doorsAmountWithoutSections = doors
    .filter((door) => !door.sections.length)?.length;

  const doorsFillingWithoutSections = doors
    .filter((door) => !door.sections.length && !_.isEmpty(door?.main?.filling?.material))
    .map((door) => door?.main?.filling);

  const sectionsFilling = _.flattenDeep(doors
    .filter((door) => !_.isEmpty(door?.sections))
    .map((door) => door.sections
      .filter((section) => !_.isEmpty(section.filling?.material))
      .map((s) => s?.filling)));

  let sectionsAmount = 0;
  doors
    .filter((door) => door?.main?.sectionsAmount?.value)
    .map((door) => {
      sectionsAmount += door?.main?.sectionsAmount?.value;
      return door;
    });

  return Boolean(doorsFillingWithoutSections.length === doorsAmountWithoutSections
    && sectionsFilling.length === sectionsAmount
    && doorOpeningHeight?.value && doorOpeningWidth?.value);
};


const Footer = ({
  className,
  onSubmitFilling,
}) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const labelKey = i18n.language === 'ru' ? 'labelRu' : 'labelUk';
  const state = useSelector(({ footer }) => ({ footer }));
  const { isFooterShown } = state.footer;
  const isOrderPage = getWorkingPath().includes('/order');
  const pathArray = getWorkingPath().split('/');
  const isSystemPage = _.some(ADSSystemTypesList, (route) => route === pathArray[1]);
  const footerClassName = clsx('configurator-footer', className);

  const {
    isLoading,
    isOrderAccepted,
    currentOrderId,
    shouldShowOrderPage,
    isOrderTitleModalOpen,
    specification: { totalPrice },
    title,
  } = useSelector(({ order }) => order);

  const {
    doors,
    main: {
      doorOpeningHeight,
      doorOpeningWidth,
      sideProfile: { value: sideProfile },
    },
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const {
    isOpenFillingModal,
    activeTrigger,
    customers: {
      customersOption,
    },
    dsp: {
      isDspUVPrinting,
      dspOption,
      dspUvPrintType,
    },
    mirror: {
      mirrorType,
      isMirrorRearMatted,
      mirrorColor,
    },
    lacobel: {
      lacobelType,
      isLacobelRearMatted,
      lacobelColor,
    },
    glass: {
      glassType,
      isGlassOneColorPainted,
      isGlassTwoColorsPainted,
      glassColors,
    },
  } = useSelector(({ fillingMaterials }) => fillingMaterials);

  useEffect(() => {
    dispatch(PriceListActions.getPriceListRequest());
  }, []);

  useEffect(() => {
    if (!(currentOrderId && shouldShowOrderPage)) return;
    dispatch(OrderActions.toggleShouldShowOrderPage(false));
    navigate(`/order/${currentOrderId}/edit`);
  }, [shouldShowOrderPage]);


  if (!isFooterShown) return null;


  const isSubmitFillingDisabled = () => {
    const isSlim = sideProfile === 'Slim';

    if (activeTrigger === null) return false;

    return (isSlim && activeTrigger === 'dsp')
      || (isSlim && activeTrigger === 'customers' && customersOption?.includes('dsp'))
      || !((activeTrigger === 'customers' && customersOption)
        || (activeTrigger === 'dsp' && dspOption && isDspUVPrinting && !_.isEmpty(dspUvPrintType))
        || (activeTrigger === 'dsp' && dspOption)
        || (activeTrigger === 'mirror' && !_.isEmpty(mirrorType))
        || (activeTrigger === 'lacobel' && !_.isEmpty(lacobelType))
        || (activeTrigger === 'glass' && !_.isEmpty(glassType))
      )
      || (activeTrigger === 'mirror' && isMirrorRearMatted && !mirrorColor)
      || (activeTrigger === 'lacobel' && isLacobelRearMatted && !lacobelColor)
      || (activeTrigger === 'glass' && isGlassOneColorPainted && !glassColors.length)
      || (activeTrigger === 'glass' && isGlassTwoColorsPainted && glassColors.length < 2);
  };

  const handleProceed = () => {
    if (!AuthService.isLoggedIn() || !AuthService.isPhoneNumberVerified()) {
      navigate('/sign-in');
      return;
    }

    if (!(doorOpeningHeight?.value && doorOpeningWidth?.value)) {
      dispatch(DoorsActions.hightlightDoorOpeningInputs(labelKey));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (!canSaveOrder(doors, doorOpeningHeight, doorOpeningWidth) && isSystemPage) {
      if (doorOpeningHeight?.value && doorOpeningWidth?.value) {
        dispatch(OrderActions.showErrorMessage(t('errorMessages.filling-is-missing')));
      }
      return;
    }

    navigate(currentOrderId ? `/order/${currentOrderId}/edit` : '/order');
  };


  const onSaveOrder = () => {
    dispatch(OrderActions.saveOrderRequest());
    dispatch(MySavedOrdersActions.getMySavedOrdersRequest());
    setTimeout(() => {
      navigate('/saved-orders');
      window.location.reload();
    }, 4000);
  };


  const handleSaveButtonClick = () => {
    if (currentOrderId) {
      onSaveOrder();
      return;
    }
    dispatch(OrderActions.toggleOrderTitleModal(true));
  };


  return (
    <div className={footerClassName}>
      <div className="configurator-footer--inner">
        <div className="configurator-footer--price">
          {!(doorOpeningHeight?.value && doorOpeningWidth?.value
            && canSaveOrder(doors, doorOpeningHeight, doorOpeningWidth) && !isOpenFillingModal)
          || (
            <span className="configurator-footer--cost-value">
              {totalPrice || 0}
              &nbsp;
              грн.
            </span>
          )}
        </div>
        { isOpenFillingModal
          ? (
            <Button
              value={t('fillingMaterialsModal.choose')}
              type={isSubmitFillingDisabled() ? 'button-light-blue' : 'button-blue'}
              onClick={onSubmitFilling}
              isDisabled={isSubmitFillingDisabled()}
              isProcessing={isLoading}
            />
          ) : isOrderPage
            ? (
              <Button
                value={t('stickyMenu.footer.save')}
                onClick={handleSaveButtonClick}
                isDisabled={window.location.href.endsWith('/view') || isOrderAccepted}
                isProcessing={isLoading}
                type="button-blue"
              />
            ) : (
              <Button
                value={t('stickyMenu.footer.process')}
                type={canSaveOrder(doors, doorOpeningHeight, doorOpeningWidth) ? 'button-blue' : 'button-light-blue'}
                onClick={handleProceed}
                className={canSaveOrder(doors, doorOpeningHeight, doorOpeningWidth) ? '' : 'disabled'}
                isProcessing={isLoading}
              />
            )}
      </div>

      <OrderTitleModal
        isOpen={isOrderTitleModalOpen}
        onCloseModal={() => dispatch(OrderActions.toggleOrderTitleModal(false))}
        onSubmit={onSaveOrder}
        title={title}
        className="action-modal order-title"
      />
    </div>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
  onSubmitFilling: PropTypes.func,
};

Footer.defaultProps = {
  className: null,
  onSubmitFilling: () => {},
};

export default Footer;
