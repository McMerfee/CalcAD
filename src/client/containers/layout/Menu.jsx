import React, { useEffect } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { A } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { Localization } from '../../components';
import { menuNavigation, menuNavigationAdmin } from '../../menuNavigation';

import NavigationActions from '../../redux/actions/navigation';
import DoorsActions from '../../redux/actions/doorsAndSections';
import FillingActions from '../../redux/actions/fillingMaterials';
import OrderActions from '../../redux/actions/order';

import { AuthService } from '../../services';


const Menu = () => {
  const dispatch = useDispatch();
  const state = useSelector(({ navigation }) => ({ navigation }));
  const { isMenuOpen } = state.navigation;
  const menuRef = React.createRef();
  const isLoggedIn = AuthService.isLoggedIn() && AuthService.isPhoneNumberVerified();

  const nav = (AuthService.getRole() === 'admin' ? menuNavigationAdmin : menuNavigation)
    .filter((item) => !isLoggedIn ? item.isPublic : item.isPublic || !item.isPublic); // eslint-disable-line

  useEffect(() => {
    if (isMenuOpen) disableBodyScroll(menuRef.current);
    else clearAllBodyScrollLocks();
  }, [isMenuOpen]);

  const currentPath = window.location.pathname;
  const { t } = useTranslation(['components']);

  if (!isMenuOpen) return null;

  const closeBurgerMenu = (e) => {
    e.preventDefault();

    dispatch(NavigationActions.closeNavigation());
  };

  const handleOutsideClick = (e) => {
    e.preventDefault();

    if (e.target.tagName === 'NAV') closeBurgerMenu(e);
  };

  return (
    <div
      onClick={handleOutsideClick}
      onKeyPress={null}
      role="button"
      tabIndex="0"
    >
      <nav ref={menuRef} role="navigation" className="menu">
        <div className="menu--inner">
          { isMenuOpen && (
            <div className="menu--close-icon">
              <a
                href={`/${currentPath}`}
                onClick={closeBurgerMenu}
              >
                <img
                  src="src/client/assets/icons/close-icon-white.svg"
                  alt="Close menu"
                />
              </a>
            </div>
          )}
          {nav.map(({ key, path, img }) => (
            <A
              href={path}
              className={clsx('menu--item', currentPath === path && 'selected')}
              onClick={() => {
                dispatch(NavigationActions.closeNavigation());
                dispatch(FillingActions.resetFillingMaterialModal());
                dispatch(OrderActions.resetSpecification());
                dispatch(DoorsActions.resetOrderDefaults());
              }}
              key={key}
            >
              <img
                className="menu--item-icon"
                src={`src/client/assets/icons/header/${img}.svg`}
                alt={img}
              />
              <span className="menu--item-text">{t(`header.${key}`)}</span>
            </A>
          ))}
          <Localization isMobile />
        </div>
      </nav>
    </div>
  );
};

export default Menu;
