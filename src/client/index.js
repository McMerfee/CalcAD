import './styles/index.scss';
import './utils/i18next';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ToastProvider } from 'react-toast-notifications';

import configureStore from './redux/store';
import App from './containers/App';
import Loader from './components/Loader';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <Suspense fallback={Loader}>
      <ToastProvider
        autoDismissTimeout={10000}
        transitionDuration={1000}
        placement="bottom-center"
      >
        <App />
      </ToastProvider>
    </Suspense>
  </Provider>,
  document.getElementById('root'),
);
