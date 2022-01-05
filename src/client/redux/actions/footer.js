import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  showFooter: null,
  hideFooter: null,
});

export const FooterTypes = Types;
export default Creators;
