import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  setCurrentSystem: ['system'],
  resetCurrentSystem: null,
});

export const SystemsTypes = Types;
export default Creators;
