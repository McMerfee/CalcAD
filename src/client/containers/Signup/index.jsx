import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';
import clsx from 'clsx';

import { regionsList } from '../../../server/helpers/constants';

import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';
import { capitalizeFirstLetter } from '../../helpers/sanitizer';

import Label from '../../components/Label';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';

import {
  isValidFirstOrLastName,
  isValidPassword,
} from '../../helpers/validation';

import { AuthService } from '../../services';

import API from '../../api';

import SignupFormActions from '../../redux/actions/signupForm';
import ProfileActions from '../../redux/actions/profile';

import Main from '../layout/Main';


const Signup = ({
  toastManager,
}) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();
  const userId = AuthService.getUserId();

  useTitle(t('routes.sign-up'));

  const {
    firstName,
    lastName,
    primaryRegion,
    password,
    repeatedPassword,
    errorMessage,
    successMessage,
  } = useSelector(({ signupForm }) => signupForm);

  const {
    isConfirmationCodeSent,
    isConfirmationCodeValid,
    isPhoneNumberVerified,
  } = useSelector(({ tfaForm }) => tfaForm);

  const {
    primaryRegion: userPrimaryRegion,
    regionsList: userRegionsList,
  } = useSelector(({ profile }) => profile);

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatedPassword, setShowRepeatedPassword] = useState(false);
  const [notificationId, setNotificationId] = useState('');

  const regions = userRegionsList?.length
    ? userRegionsList.map((region) => ({
      value: region,
      labelRu: region,
      labelUk: region,
    }))
    : regionsList.map((region) => ({
      value: region,
      labelRu: region,
      labelUk: region,
    }));

  useEffect(() => {
    dispatch(SignupFormActions.resetPassword());
    dispatch(ProfileActions.getUserProfileRequest());
  }, []);

  useEffect(() => {
    if (primaryRegion) return;

    updateRegion(userPrimaryRegion);
  }, [userPrimaryRegion]);

  useEffect(() => {
    if (!userId) navigate('/sign-up-start');
    if (userId && isConfirmationCodeSent && !(isConfirmationCodeValid && isPhoneNumberVerified)) {
      navigate('/sign-up-start');
    }
  }, [isConfirmationCodeSent, isConfirmationCodeValid, isPhoneNumberVerified]);

  useEffect(() => {
    if (errorMessage) showToast(errorMessage, 'error');
    if (successMessage) showToast(successMessage, 'success');
  }, [
    errorMessage,
    successMessage,
  ]);

  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };

  const updateName = ({ target: { name, value } }) => {
    dispatch(SignupFormActions.updateField({
      name,
      value,
    }));
  };

  const updateRegion = (selectedOption) => {
    dispatch(SignupFormActions.updateRegion(selectedOption));
  };

  const validateName = ({ target: { name, value } }) => {
    const isInvalid = !isValidFirstOrLastName(value, 2, 30);
    const error = isInvalid ? t('errorMessages.invalid-name') : '';

    dispatch(SignupFormActions.updateField({
      name,
      value: capitalizeFirstLetter(value),
      error,
    }));
  };

  const updatePassword = ({ target: { name, value } }) => {
    dispatch(SignupFormActions.updateField({
      name,
      value,
    }));
  };

  const validatePassword = ({ target: { name, value } }) => {
    const isInvalid = !isValidPassword(value);
    const isPasswordsMatch = password?.value?.toString() === repeatedPassword?.value?.toString();
    let error = '';

    if (isInvalid) error = t('errorMessages.invalid-password');
    if (_.isEmpty(value)) error = t('errorMessages.empty-value');
    if (name === 'repeatedPassword' && !isPasswordsMatch) error = t('errorMessages.password-doesnt-match');

    dispatch(SignupFormActions.updateField({
      name,
      value,
      error,
    }));
  };

  const isSignUpDisabled = () => {
    const isPasswordsMatch = password?.value?.toString() === repeatedPassword?.value?.toString();

    return Boolean(!primaryRegion || !isPasswordsMatch
    || !firstName.value || !lastName.value || !password.value || !repeatedPassword.value
    || firstName.error || lastName.error || password.error || repeatedPassword.error);
  };

  return (
    <div className="sign-up-wrap">
      <div className="landing-text">
        <section className="landing--title">
          <p>{t('landing.title')}</p>
        </section>

        <section className="landing--text-info">
          <p>{`${t('landing.advantages')}:`}</p>
          <ul>
            <li>{`${t('landing.advantage-1')};`}</li>
            <li>{`${t('landing.advantage-2')};`}</li>
            <li>{`${t('landing.advantage-3')};`}</li>
            <li>{`${t('landing.advantage-4')};`}</li>
            <li>{`${t('landing.advantage-5')}.`}</li>
          </ul>
        </section>
      </div>
      <Main
        className="sign-up"
        hasFooter={false}
        classNameHeader="gray"
      >
        <div className="title-wrapper">
          <div className="title">{t('signUp.title')}</div>
          <div className="link">
            <span className="label">{t('signUp.already-have-account')}</span>
            &nbsp; &nbsp;
            <Button
              value={t('signUp.to-sign-in')}
              onClick={() => navigate('/sign-in')}
            />
          </div>
        </div>

        <div className="content-wrapper">
          <div className="content-wrapper-inner">
            <div className="content-wrapper-top-section">
              <Label value={t('signUp.first-name')} />
              <Input
                onChange={updateName}
                onBlur={validateName}
                placeholder={t('signUp.first-name')}
                name="firstName"
                value={firstName?.value ?? ''}
                error={firstName.error}
              />

              <Label value={t('signUp.last-name')} />
              <Input
                value={lastName?.value ?? ''}
                error={lastName.error}
                onChange={updateName}
                onBlur={validateName}
                placeholder={t('signUp.last-name')}
                name="lastName"
              />

              <Label value={t('signUp.region')} />
              <Dropdown
                hasInternalTranslation
                isDisabled={!_.isEmpty(primaryRegion)}
                options={regions?.length ? regions : []}
                onChange={(selectedOption) => {
                  if (!selectedOption?.value) return;
                  updateRegion(selectedOption.value);
                }}
                value={primaryRegion
                  ? regions.find((item) => item.value === primaryRegion)
                  : null}
              />

              <Label value={t('signUp.password')} />
              <Input
                value={password?.value ?? ''}
                error={password.error}
                onChange={updatePassword}
                onBlur={validatePassword}
                name="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                type={showPassword ? 'text' : 'password'}
                withIcon
                iconClassName={clsx('icon-at-right', 'password', showPassword && 'active')}
                onIconClick={() => setShowPassword(!showPassword)}
              />

              <Label value={t('signUp.repeat-password')} />
              <Input
                value={repeatedPassword?.value ?? ''}
                error={repeatedPassword.error}
                onChange={updatePassword}
                onBlur={validatePassword}
                name="repeatedPassword"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                type={showRepeatedPassword ? 'text' : 'password'}
                withIcon
                iconClassName={clsx('icon-at-right', 'password', showRepeatedPassword && 'active')}
                onIconClick={() => setShowRepeatedPassword(!showRepeatedPassword)}
              />
            </div>

            <div className="content-wrapper-bottom-section">
              <Button
                value={t('signUp.sign-up')}
                type="rounded"
                onClick={async (e) => {
                  e.preventDefault();

                  if (isSignUpDisabled()) return;

                  const res = await API.user
                    .setPassword(userId, firstName.value, lastName.value, password.value, primaryRegion);

                  if (res?.data?.jwtToken) {
                    AuthService.setToken(res.data.jwtToken);
                    showToast(res.data?.message || t('successMessages.data-updated-successfully'), 'success');
                    navigate('/profile');
                    return;
                  }

                  const msg = res.data?.error?.message;
                  showToast(msg ? t(`errorMessagesHelper.${msg}`) : t('errorMessages.something-went-wrong'), 'error');
                }}
                isDisabled={isSignUpDisabled()}
              />

              <div className="sm-bottom-text">
                <span>{t('signUp.by-clicking-you-accept-the-terms')}</span>
                <span className="button text-blue">{t('signUp.of-user-agreement')}</span>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </div>
  );
};

Signup.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(Signup);
