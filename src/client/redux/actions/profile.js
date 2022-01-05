import { createActions } from 'reduxsauce';
import { navigate } from 'hookrouter';

import API from '../../api';
import { AuthService } from '../../services';


const { Types, Creators } = createActions({
  updateProfileField: ['field'],

  setProfileLanguageRequest: (lngCode) => async () => {
    try {
      const userId = AuthService.getUserId();
      if (!userId) return;
      await API.user.profile.changeLanguage(userId, lngCode);
    } catch (error) {
      console.error(error);
    }
  },

  getUserProfileSuccess: ['profile'],
  getUserProfileFailure: ['errorMessage'],
  getUserProfileRequest: () => async (dispatch) => {
    try {
      const userId = AuthService.getUserId();

      if (!userId) {
        dispatch(Creators.getUserProfileFailure('Failed to get userId!'));
        return;
      }

      const response = await API.user.profile.get(userId);
      const { ok, problem, data } = response || {};
      const error = data?.error || {};
      const profile = data?.profile || {};
      const errorMessage = !ok
        ? (error?.message || data?.message || problem)
        : '';

      if (errorMessage === 'USER_NOT_FOUND') {
        AuthService.logout();
        return;
      }

      if (errorMessage) {
        dispatch(Creators.getUserProfileFailure(errorMessage));
        return;
      }

      dispatch(Creators.getUserProfileSuccess(profile));
    } catch (error) {
      dispatch(Creators.getUserProfileFailure(error.message || error.reason));
    }
  },

  submitProfileFormSuccess: null,
  submitProfileFormFailure: ['errorMessage'],
  submitProfileFormRequest: (delivery) => async (dispatch, state) => {
    try {
      const currentState = state();
      const {
        currentFirstName: { value: firstName },
        currentLastName: { value: lastName },
        currentPhone: { value: phone },
      } = currentState.profile;

      const userId = AuthService.getUserId();

      if (!userId) {
        dispatch(Creators.getUserProfileFailure('Failed to get userId!'));
        return;
      }

      const response = await API.user.profile.update(userId, { firstName, lastName, phone, delivery });
      const errorMsg = !response.ok
        ? (response.data?.message || response.problem)
        : '';

      if (errorMsg) {
        dispatch(Creators.submitProfileFormFailure(errorMsg));
        return;
      }

      const shouldRedirectToConfirmPhone = response?.data?.shouldRedirectToConfirmPhone || false;

      // Redirect to 2FA route
      if (shouldRedirectToConfirmPhone) {
        navigate('/tfa');
      }

      dispatch(Creators.submitProfileFormSuccess());
    } catch (error) {
      dispatch(Creators.submitProfileFormFailure(error.message || error.reason));
    }
  },
});

export const ProfileTypes = Types;
export default Creators;
