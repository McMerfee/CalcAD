import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  resetSigninAdminForm: null,
  updateSigninAdminField: ['field'],
});

export const SigninAdminFormTypes = Types;
export default Creators;
