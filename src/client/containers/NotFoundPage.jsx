import React from 'react';
import { useTitle } from 'hookrouter';
import { useTranslation } from 'react-i18next';

import Main from './layout/Main';

const PageNotFound = () => {
  useTitle('404');

  const { t } = useTranslation();

  return (
    <Main
      className="empty-page"
      hasFooter={false}
    >
      <h1>{t('routes.page-not-found')}</h1>
    </Main>
  );
};

export default PageNotFound;
