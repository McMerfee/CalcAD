import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';
import { ReactSVG } from 'react-svg';

import Button from '../../components/Button';

import DoorsActions from '../../redux/actions/doorsAndSections';
import FillingActions from '../../redux/actions/fillingMaterials';
import OrderActions from '../../redux/actions/order';

import Main from '../layout/Main';


const OrderAccepted = () => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();

  useTitle(t('routes.order-accepted'));

  const {
    currentOrderId,
    currentOrderNumber = '',
  } = useSelector(({ order }) => order);

  if (!currentOrderId) navigate('/');

  return (
    <Main
      className="order-accepted"
      hasFooter={false}
      classNameHeader="gray"
      canGoBack={false}
      showHeaderLogoMobile
    >

      <div className="content-wrapper">
        <div className="content-wrapper-inner">

          <div className="order-accepted--main-icon">
            <ReactSVG
              wrapper="span"
              className="order-accepted--main-icon-inner"
              src="/src/client/assets/icons/order-icon.svg"
            />
          </div>

          <div className="order-accepted--info-wrapper">
            <div className="title">{t('orderAccepted.your-order-number', { orderNumber: currentOrderNumber })}</div>
            <div className="title">{t('orderAccepted.accepted')}</div>
            <div className="label">{t('orderAccepted.manager-received-order')}</div>
          </div>

          <Button
            value={t('orderAccepted.new-order')}
            type="rounded"
            onClick={() => {
              navigate('/extendable');
              dispatch(FillingActions.resetFillingMaterialModal());
              dispatch(OrderActions.resetSpecification());
              dispatch(DoorsActions.resetOrderDefaults());
            }}
          />

          <div className="sm-bottom-text">
            <span>{t('orderAccepted.view')}</span>
            &nbsp;
            <span className="button text-blue">
              <Button
                value={t('orderAccepted.my-orders')}
                onClick={() => {
                  dispatch(FillingActions.resetFillingMaterialModal());
                  dispatch(OrderActions.resetSpecification());
                  dispatch(DoorsActions.resetOrderDefaults());
                  navigate('/my-orders');
                }}
              />
            </span>
          </div>
        </div>
      </div>
    </Main>
  );
};

OrderAccepted.propTypes = {};

export default withToastManager(OrderAccepted);
