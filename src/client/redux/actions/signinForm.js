import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  resetSigninForm: null,
  updateSigninField: ['field'],
});

export const SigninFormTypes = Types;
export default Creators;
