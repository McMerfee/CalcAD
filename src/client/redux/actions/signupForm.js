import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  resetForm: null,
  resetPassword: null,
  updateField: ['field'],
  updateRegion: ['region'],
});

export const SignupFormTypes = Types;
export default Creators;
