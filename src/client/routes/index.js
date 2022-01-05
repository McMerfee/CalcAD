/* eslint-disable react/prop-types */
import React from 'react';

import FileUploadForm from '../containers/FileUploadForm';
import SigninAdmin from '../containers/SigninAdmin';
import Signin from '../containers/Signin';
import SignupStart from '../containers/SignupStart';
import Signup from '../containers/Signup';
import ForgotPassword from '../containers/ForgotPassword';
import Landing from '../containers/Landing';
import TFA from '../containers/TFA';
import OrderAccepted from '../containers/OrderAccepted';
import ExtendableSystem from '../containers/ExtendableSystem';
import MonorailSystem from '../containers/MonorailSystem';
import OpeningSystem from '../containers/OpeningSystem';
import AssemblingSystem from '../containers/AssemblingSystem';
import HingedSystem from '../containers/HingedSystem';
import Order from '../containers/Order';

const ProfilePage = React.lazy(() => import('../containers/Profile'));
const SystemsPage = React.lazy(() => import('../containers/Systems'));
const ExtendableSystemPage = React.lazy(() => import('../containers/ExtendableSystem'));
const MonorailSystemPage = React.lazy(() => import('../containers/MonorailSystem'));
const OpeningSystemPage = React.lazy(() => import('../containers/OpeningSystem'));
const AssemblingSystemPage = React.lazy(() => import('../containers/AssemblingSystem'));
const HingedSystemPage = React.lazy(() => import('../containers/HingedSystem'));
const MySavedOrdersPage = React.lazy(() => import('../containers/MySavedOrders'));
const MyAcceptedOrdersPage = React.lazy(() => import('../containers/MyAcceptedOrders'));

const routes = {
  '/': () => <Landing />,
  '/sign-in': () => <Signin />,
  '/sign-up-start': () => <SignupStart />,
  '/sign-up': () => <Signup />,
  '/reset-password': () => <ForgotPassword />,
  '/sign-in/admin': () => <SigninAdmin />,
  '/json-form': () => <FileUploadForm />,
  '/tfa': () => <TFA />,
  '/order-accepted': () => <OrderAccepted />,
  '/profile': () => <ProfilePage />,
  '/systems': () => <SystemsPage />,

  '/extendable': () => <ExtendableSystemPage />,
  '/extendable/edit': () => <ExtendableSystemPage />,
  '/extendable/:orderID': ({ orderID }) => <ExtendableSystem orderID={orderID} />,
  '/extendable/:orderID/edit': ({ orderID }) => <ExtendableSystem orderID={orderID} />,

  '/monorail': () => <MonorailSystemPage />,
  '/monorail/edit': () => <MonorailSystemPage />,
  '/monorail/:orderID': ({ orderID }) => <MonorailSystem orderID={orderID} />,
  '/monorail/:orderID/edit': ({ orderID }) => <MonorailSystem orderID={orderID} />,

  '/opening': () => <OpeningSystemPage />,
  '/opening/edit': () => <OpeningSystemPage />,
  '/opening/:orderID': ({ orderID }) => <OpeningSystem orderID={orderID} />,
  '/opening/:orderID/edit': ({ orderID }) => <OpeningSystem orderID={orderID} />,

  '/assembling': () => <AssemblingSystemPage />,
  '/assembling/edit': () => <AssemblingSystemPage />,
  '/assembling/:orderID': ({ orderID }) => <AssemblingSystem orderID={orderID} />,
  '/assembling/:orderID/edit': ({ orderID }) => <AssemblingSystem orderID={orderID} />,

  '/hinged': () => <HingedSystemPage />,
  '/hinged/edit': () => <HingedSystemPage />,
  '/hinged/:orderID': ({ orderID }) => <HingedSystem orderID={orderID} />,
  '/hinged/:orderID/edit': ({ orderID }) => <HingedSystem orderID={orderID} />,

  '/order': () => <Order />,
  // '/order/:orderID': ({ orderID }) => <Order orderID={orderID} />,
  '/order/:orderID/view': ({ orderID }) => <Order orderID={orderID} />,
  '/order/:orderID/edit': ({ orderID }) => <Order orderID={orderID} />,
  '/my-orders': () => <MyAcceptedOrdersPage />,
  '/saved-orders': () => <MySavedOrdersPage />,
};

export default routes;
