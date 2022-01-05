import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { SystemsTypes } from '../actions/systems';

const INITIAL_STATE = {
  currentSystem: '',
};

const setCurrentSystem = (state = INITIAL_STATE, { system }) => update(state, {
  currentSystem: { $set: system },
});

const resetCurrentSystem = (state = INITIAL_STATE) => update(state, {
  currentSystem: { $set: INITIAL_STATE.currentSystem },
});

export default createReducer(INITIAL_STATE, {
  [SystemsTypes.SET_CURRENT_SYSTEM]: setCurrentSystem,
  [SystemsTypes.RESET_CURRENT_SYSTEM]: resetCurrentSystem,
});
