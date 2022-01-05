import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { NavigationTypes } from '../actions/navigation';

const INITIAL_STATE = {
  isMenuOpen: false,
  isLeavePageModalOpen: false,
  nextPath: '',
};

const openNavigation = (state = INITIAL_STATE) => update(state, {
  isMenuOpen: { $set: true },
});

const closeNavigation = (state = INITIAL_STATE) => update(state, {
  isMenuOpen: { $set: false },
});

const toggleLeavePageModal = (state = INITIAL_STATE, { isOpen, nextPath }) => update(state, {
  isLeavePageModalOpen: { $set: isOpen },
  nextPath: { $set: nextPath || '' },
});

const resetLeavePageNextPath = (state = INITIAL_STATE) => update(state, {
  nextPath: { $set: '' },
});

export default createReducer(INITIAL_STATE, {
  [NavigationTypes.OPEN_NAVIGATION]: openNavigation,
  [NavigationTypes.CLOSE_NAVIGATION]: closeNavigation,
  [NavigationTypes.TOGGLE_LEAVE_PAGE_MODAL]: toggleLeavePageModal,
  [NavigationTypes.RESET_LEAVE_PAGE_NEXT_PATH]: resetLeavePageNextPath,
});
