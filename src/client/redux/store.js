import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import reducers from './reducers';

const enableMiddleware = (...middlewares) => {
  if (process.env.NODE_ENV !== 'production' || process.env.NODE_ENV !== 'staging') {
    return composeWithDevTools(applyMiddleware(...middlewares));
  }

  return compose(applyMiddleware(...middlewares));
};

let store;

const configureStore = (initialState) => {
  store = createStore(
    reducers,
    initialState,
    enableMiddleware(thunkMiddleware),
  );

  return store;
};

export const getStore = () => store;

export default configureStore;
