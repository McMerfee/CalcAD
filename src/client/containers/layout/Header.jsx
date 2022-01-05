import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { getPath, getWorkingPath, navigate } from 'hookrouter';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { AuthService } from '../../services';

import { menuNavigation, menuNavigationAdmin } from '../../menuNavigation';

import NavigationActions from '../../redux/actions/navigation';
import { ADSSystemTypesList } from '../../helpers/constants';

import { Localization } from '../../components';
import Breadcrumbs from '../../components/Breadcrumbs';


const Header = ({
  canGoBack,
  className,
  burgerMenuColor,
  showBreadcrumbsDesktop,
}) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();

  const {
    hasChanges,
    main: { doorOpeningHeight, doorOpeningWidth },
  } = useSelector(({ doorsAndSections }) => doorsAndSections);
  const { currentSystem } = useSelector(({ systems }) => systems);
  const { isOrderAccepted, currentOrderId } = useSelector(({ order }) => order);

  const [desktopView, setDesktopView] = useState(false);
  const [desktopMiddleView, setDesktopMiddleView] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  const pathname = window?.location?.pathname;
  const pathArray = pathname.split('/');
  const isSystemPage = _.some(ADSSystemTypesList, (route) => route === pathArray[1]);
  const isOrderPage = pathArray[1] === 'order';
  const isLoggedIn = AuthService.isLoggedIn() && AuthService.isPhoneNumberVerified();

  const nav = (AuthService.getRole() === 'admin'
    ? menuNavigationAdmin
    : menuNavigation)
    .filter((item) => !isLoggedIn ? item.isPublic : item.isPublic || !item.isPublic); // eslint-disable-line

  const openBurgerMenu = (e) => {
    e.preventDefault();

    dispatch(NavigationActions.openNavigation());
  };

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth } = window || {};

      setDesktopView(innerWidth >= 768);
      setDesktopMiddleView(innerWidth >= 768 && innerWidth < 950);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    setHasHistory(getPath() !== getWorkingPath());

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavigation = (path) => {
    const navigationPath = isOrderPage && currentOrderId && isOrderAccepted
      ? '/my-orders'
      : isOrderPage && !isOrderAccepted
        ? `/${currentSystem}/edit`
        : isSystemPage ? '/systems' : '/';
    const hasMinimalRequiredInfo = Boolean(doorOpeningHeight?.value && doorOpeningWidth?.value);

    if (isSystemPage && hasChanges && hasMinimalRequiredInfo) {
      dispatch(NavigationActions.toggleLeavePageModal(true, path || navigationPath));
      return;
    }
    navigate(path || navigationPath);
  };

  return (
    <header
      role="banner"
      className={clsx('header', className)}
    >
      <div className="header--inner">
        { !showBreadcrumbsDesktop ?
            <button
                type="button"
                onClick={() => handleNavigation('/')}
                className="header--logo-button"
            >
              <img
                  src="src/client/assets/images/logo.svg"
                  alt="ADS"
                  width="76"
                  height="27"
              />
            </button> : null }
        { desktopView && showBreadcrumbsDesktop ? <Breadcrumbs /> : null }
        { !desktopView && (
          <div className={hasHistory && canGoBack
            ? 'header--mobile'
            : 'header--mobile single-button'}
          >
            <div className="header--mobile-button">
              <a
                href="/"
                onClick={openBurgerMenu}
              >
                <img
                  src={burgerMenuColor === 'white'
                    ? '/src/client/assets/icons/header/burger-menu-white.svg'
                    : '/src/client/assets/icons/header/burger-menu.svg'}
                  alt="Open menu"
                />
              </a>
            </div>
          </div>
        )}
        { desktopView && (
          <div className="header--desktop">
            {nav.map(({ key, path, img }) => {
              if (desktopMiddleView) {
                return (
                  <div
                    className={clsx('header--desktop-nav-item', pathname === path && 'selected')}
                    key={key}
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigation(path)}
                    >
                      <img
                        className="header--desktop-nav-icon"
                        src={`src/client/assets/icons/header/${img}-blue.svg`}
                        title={t(`header.${key}`)}
                        alt={t(`header.${key}`)}
                      />
                    </button>
                  </div>
                );
              }
              return (
                <div
                  className={clsx('header--desktop-nav-item', pathname === path && 'selected')}
                  key={key}
                >
                  <button
                    type="button"
                    onClick={() => handleNavigation(path)}
                  >
                    <span>{t(`header.${key}`)}</span>
                  </button>
                </div>
              );
            })}
            <Localization />
          </div>
        )}
        { hasHistory && canGoBack && (
            <button
                type="button"
                onClick={() => handleNavigation()}
                className="header--back-icon-gray header--back-icon"
            >
              <img
                  src="src/client/assets/icons/header/arrow-back.svg"
                  alt="Back"
                  width="17.95"
                  height="18"
              />
            </button>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  canGoBack: PropTypes.bool,
  showHeaderLogoMobile: PropTypes.bool,
  showBreadcrumbsDesktop: PropTypes.bool,
  burgerMenuColor: PropTypes.string,
  className: PropTypes.string,
};

Header.defaultProps = {
  canGoBack: true,
  showHeaderLogoMobile: false,
  showBreadcrumbsDesktop: false,
  burgerMenuColor: 'gray',
  className: '',
};

export default Header;
