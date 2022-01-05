import { createReducer } from 'reduxsauce';

import { FooterTypes } from '../actions/footer';

const INITIAL_STATE = {
  isFooterShown: true,
};

const showFooter = () => ({ isFooterShown: true });
const hideFooter = () => ({ isFooterShown: false });

export default createReducer(INITIAL_STATE, {
  [FooterTypes.SHOW_FOOTER]: showFooter,
  [FooterTypes.HIDE_FOOTER]: hideFooter,
});
