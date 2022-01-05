import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  openNavigation: null,
  closeNavigation: null,
  resetLeavePageNextPath: null,
  toggleLeavePageModal: ['isOpen', 'nextPath'],
});

export const NavigationTypes = Types;
export default Creators;
