import React, { useEffect } from 'react';
import { useTitle, navigate } from 'hookrouter';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { AuthService } from '../services';

import Button from '../components/Button';

import Main from './layout/Main';
import Menu from './layout/Menu';
import Header from './layout/Header';

import DoorsActions from '../redux/actions/doorsAndSections';
import FillingActions from '../redux/actions/fillingMaterials';
import OrderActions from '../redux/actions/order';

const Landing = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { language } = useSelector(({ profile }) => profile);

  useTitle('ADS');

  useEffect(() => {
    if (!language) return;
    i18n.changeLanguage(language);
  }, [language]);

  const onLogoutClick = () => {
    AuthService.logout();
    dispatch(FillingActions.resetFillingMaterialModal());
    dispatch(OrderActions.resetSpecification());
    dispatch(DoorsActions.resetOrderDefaults());
    navigate('/sign-in');
  };

  return (
    <Main
      className="landing"
      hasHeader={false}
      hasFooter={false}
    >
      <Header
        canGoBack={false}
        burgerMenuColor="white"
      />
      <Menu />

      <section className="landing--title">
        <p>{t('landing.title')}</p>
      </section>

      <section className="landing--text-info">
        <p>{`${t('landing.advantages')}:`}</p>
        <ul>
          <li>{`${t('landing.advantage-1')};`}</li>
          <li>{`${t('landing.advantage-2')};`}</li>
          <li>{`${t('landing.advantage-3')};`}</li>
          <li>{`${t('landing.advantage-4')};`}</li>
          <li>{`${t('landing.advantage-5')}.`}</li>
        </ul>
      </section>

      <section className="landing--action-buttons">
        <div className="landing--action-buttons-inner">
          <div className="start-button-wrapper">
            <Button
              type="rounded"
              value={t('landing.start')}
              onClick={() => {
                navigate('/systems');
                dispatch(OrderActions.resetSpecification());
                dispatch(DoorsActions.resetOrderDefaults());
              }}
            />
          </div>
          { (AuthService.isLoggedIn() && AuthService.isPhoneNumberVerified())
            || (
              <div className="sign-up-sign-in-wrapper">
                <Button
                  value={t('landing.sign-up')}
                  onClick={() => navigate('/sign-up-start')}
                />
                <Button
                  value={t('landing.sign-in')}
                  onClick={() => navigate('/sign-in')}
                />
              </div>
            )}
          { (AuthService.isLoggedIn() && AuthService.isPhoneNumberVerified())
            && (
              <div className="logout-wrapper">
                <Button
                  value={t('landing.logout')}
                  onClick={onLogoutClick}
                />
              </div>
            )}
        </div>
      </section>
    </Main>
  );
};

export default Landing;
