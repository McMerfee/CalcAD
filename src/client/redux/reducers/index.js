import { combineReducers } from 'redux';

import adminPageInfo from './admin';
import doorsAndSections from './doorsAndSections';
import navigation from './navigation';
import footer from './footer';
import fillingMaterials from './fillingMaterials';
import config from './config';
import order from './order';
import priceList from './priceList';
import signupForm from './signupForm';
import signinForm from './signinForm';
import signinAdminForm from './signinAdminForm';
import profile from './profile';
import tfaForm from './tfaForm';
import forgotPasswordForm from './forgotPasswordForm';
import myAcceptedOrders from './myAcceptedOrders';
import mySavedOrders from './mySavedOrders';
import systems from './systems';
import delivery from './delivery';

const reducers = combineReducers({
  adminPageInfo,
  doorsAndSections,
  navigation,
  footer,
  fillingMaterials,
  config,
  priceList,
  order,
  signupForm,
  signinForm,
  signinAdminForm,
  profile,
  tfaForm,
  forgotPasswordForm,
  myAcceptedOrders,
  mySavedOrders,
  systems,
  delivery,
});

export default reducers;
