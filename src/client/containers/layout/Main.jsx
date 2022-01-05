import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Header from './Header';
import Menu from './Menu';
import Footer from '../../components/StickyMenu/Footer';


const Main = ({
  children,
  className,
  footerClassName,
  hasHeader,
  hasFooter,
  classNameHeader,
  canGoBack,
  showHeaderLogoMobile,
  showBreadcrumbsDesktop,
  onSubmitFilling,
}) => {
  const { i18n } = useTranslation();
  const { language } = useSelector(({ profile }) => profile);

  useEffect(() => {
    if (!language) return;
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <div className="main-wrapper">
      {!hasHeader || (
        <>
          <Header
            canGoBack={canGoBack}
            className={classNameHeader}
            showHeaderLogoMobile={showHeaderLogoMobile}
            showBreadcrumbsDesktop={showBreadcrumbsDesktop}
          />
          <Menu />
        </>
      )}

      <div className={clsx('main-wrapper--inner', className)}>
        <main
          className="page--main"
          role="main"
        >
          <div className="page--main-inner">
            {children}
          </div>
        </main>
      </div>

      {!hasFooter || (<Footer className={footerClassName} onSubmitFilling={onSubmitFilling} />)}
    </div>
  );
};

Main.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.func,
    PropTypes.node,
    PropTypes.object,
  ]),
  className: PropTypes.string,
  footerClassName: PropTypes.string,
  hasHeader: PropTypes.bool,
  hasFooter: PropTypes.bool,
  canGoBack: PropTypes.bool,
  showHeaderLogoMobile: PropTypes.bool,
  showBreadcrumbsDesktop: PropTypes.bool,
  classNameHeader: PropTypes.string,
  onSubmitFilling: PropTypes.func,
};

Main.defaultProps = {
  children: null,
  className: null,
  footerClassName: null,
  hasHeader: true,
  hasFooter: true,
  canGoBack: true,
  showHeaderLogoMobile: false,
  showBreadcrumbsDesktop: false,
  classNameHeader: '',
  onSubmitFilling: () => {},
};

export default Main;
