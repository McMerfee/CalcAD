import React from 'react';
import { useRoutes, useRedirect } from 'hookrouter';

import { AuthService } from '../services';

import routes from '../routes';
import NotFoundPage from './NotFoundPage';

const App = () => {
  const match = useRoutes(routes);

  if (AuthService.getRole() !== 'admin') {
    useRedirect('/json-form', '/sign-in/admin');

    return match;
  }

  // The application will be redirected to home route for logged in users
  // when they try to visit the registration or login routes
  if (AuthService.isLoggedIn() && AuthService.isPhoneNumberVerified()) {
    useRedirect('/sign-in', '/');
    useRedirect('/sign-in/admin', '/');
    useRedirect('/sign-up-start', '/');
    useRedirect('/sign-up', '/');
    useRedirect('/reset-password', '/');

    return match;
  }

  return match || <NotFoundPage />;
};

export default App;
