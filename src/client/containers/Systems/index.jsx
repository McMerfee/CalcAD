import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { A, useTitle } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';
import clsx from 'clsx';

import SystemsActions from '../../redux/actions/systems';
import DoorsActions from '../../redux/actions/doorsAndSections';
import FillingActions from '../../redux/actions/fillingMaterials';
import OrderActions from '../../redux/actions/order';
import ProfileActions from '../../redux/actions/profile';

import Main from '../layout/Main';
import Label from '../../components/Label';

import { AuthService } from '../../services';

import { ADSSystemTypesList } from '../../helpers/constants';
import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';


const Systems = ({ toastManager }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { language } = useSelector(({ profile }) => profile);

  useTitle(t('routes.system-choice'));

  const { currentOrderId, errorMessage, successMessage } = useSelector(({ order }) => order);
  const [notificationId, setNotificationId] = useState('');

  useEffect(() => {
    if (AuthService.isLoggedIn()) dispatch(ProfileActions.getUserProfileRequest());
    dispatch(SystemsActions.resetCurrentSystem());
    dispatch(OrderActions.resetCurrentOrderData());
    dispatch(FillingActions.toggleFillingMaterialModal(false));
    dispatch(FillingActions.resetFillingMaterialModal());
    dispatch(OrderActions.resetSpecification());
    dispatch(DoorsActions.resetOrderDefaults());
  }, []);

  useEffect(() => {
    if (AuthService.isLoggedIn()) dispatch(ProfileActions.getUserProfileRequest());
    dispatch(SystemsActions.resetCurrentSystem());
    dispatch(OrderActions.resetCurrentOrderData());
    dispatch(FillingActions.toggleFillingMaterialModal(false));
    dispatch(FillingActions.resetFillingMaterialModal());
    dispatch(OrderActions.resetSpecification());
    dispatch(DoorsActions.resetOrderDefaults());
    dispatch(DoorsActions.setActiveDoor(0));
    dispatch(DoorsActions.setActiveSection(0));
  }, [currentOrderId]);

  useEffect(() => {
    if (!language) return;
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    if (errorMessage) showToast(errorMessage, 'error');
    if (successMessage) showToast(successMessage, 'success');
  }, [errorMessage, successMessage]);

  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };

  const systemLinks = ADSSystemTypesList.map((type) => {
    const isCommingSoon = _.some(['suspended', 'frame-facades'], (system) => system === type);
    const rootClassName = clsx('systems-choise--item-wrapper', type, isCommingSoon && 'coming-soon');

    return (
      <div
        key={type}
        className={rootClassName}
      >
        { isCommingSoon
          ? (
            <a
              href={`/${type}`}
              className="system-image"
              onClick={(e) => { e.preventDefault(); return false; }}
            >
              <span>
                COMMING
                <br />
                SOON
              </span>
            </a>
          )
          : (
            <A
              className="system-image"
              href={`/${type}`}
              onClick={(e) => {
                e.preventDefault();
                dispatch(SystemsActions.setCurrentSystem(type));
              }}
            />
          )}
        <Label value={t(`systemsChoise.${type}`)} />
      </div>
    );
  });

  return (
    <Main
      className="systems-choise"
      hasFooter={false}
      canGoBack={false}
    >
      <div className="title-wrapper">
        <div className="title">{t('routes.system-choice')}</div>
      </div>

      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <section className="systems-choise--text-info">
            <p>{t('systemsChoise.choose-one-of')}</p>
          </section>

          <section className="systems-choise--items">
            {systemLinks}
          </section>
        </div>
      </div>
    </Main>
  );
};

Systems.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(Systems);
