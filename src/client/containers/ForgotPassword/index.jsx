import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';
import clsx from 'clsx';

import Label from '../../components/Label';
import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  isValidPassword,
  isValidMobilePhone,
} from '../../helpers/validation';
import { sanitizeValueToNumberStringLike } from '../../helpers/sanitizer';
import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';

import API from '../../api';

import ForgotPasswordActions from '../../redux/actions/forgotPasswordForm';

import Main from '../layout/Main';


const ForgotPassword = ({
  toastManager,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['components']);

  useTitle(t('routes.reset-password'));

  const {
    phone,
    confirmationCode,
    password,
    repeatedPassword,
  } = useSelector(({ forgotPasswordForm }) => forgotPasswordForm);

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatedPassword, setShowRepeatedPassword] = useState(false);
  const [isConfirmationCodeSent, setIsConfirmationCodeSent] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [notificationId, setNotificationId] = useState('');

  useEffect(() => {
    dispatch(ForgotPasswordActions.resetForgotPasswordForm());
  }, []);

  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };

  const updatePassword = ({ target: { name, value } }) => {
    dispatch(ForgotPasswordActions.updateForgotPasswordField({
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

    setHasErrors(!_.isEmpty(error));
    dispatch(ForgotPasswordActions.updateForgotPasswordField({
      name,
      value,
      error,
    }));
  };

  const updatePhone = ({ target: { name, value } }) => {
    const sanitizedNumber = sanitizeValueToNumberStringLike(value);

    if (phone?.value === sanitizedNumber) return;

    dispatch(ForgotPasswordActions.updateForgotPasswordField({
      name,
      value: sanitizedNumber,
    }));
  };

  const validatePhone = ({ target: { name, value } }) => {
    const sanitizedNumber = sanitizeValueToNumberStringLike(value);
    const isInvalid = !isValidMobilePhone(sanitizedNumber);
    const error = isInvalid ? t('errorMessages.invalid-phone-number') : '';

    setHasErrors(!_.isEmpty(error));
    dispatch(ForgotPasswordActions.updateForgotPasswordField({
      name,
      value: sanitizedNumber,
      error,
    }));
  };

  const renderPhoneInput = () => (
    <>
      <Label value={t('forgotPassword.phone')} />
      <Input
        value={phone?.value ?? ''}
        error={phone.error}
        onChange={updatePhone}
        onBlur={validatePhone}
        placeholder={t('signIn.phone-number-format')}
        name="phone"
      />

      <Button
        value={t('forgotPassword.send-code')}
        type="rounded"
        onClick={async (e) => {
          e.preventDefault();
          if (phone.error || !phone?.value) return;

          const res = await API.user.tfa.resetPasswordRequest(phone.value);
          const { error, isConfirmationCodeSent: isSent } = res.data;

          if (!res.ok || !isSent) {
            const msg = res.data?.error?.message;
            showToast(msg ? t(`errorMessagesHelper.${msg}`) : t('errorMessages.something-went-wrong'), 'error');
          }
          if (error?.message === 'USER_NOT_FOUND') {
            showToast(t('errorMessagesHelper.USER_NOT_FOUND'), 'error');
            navigate('/sign-up-start');
          }
          setIsConfirmationCodeSent(isSent);
        }}
        isDisabled={!!phone.error || !phone?.value}
      />
    </>
  );

  const renderPasswordInputs = () => (
    <>
      <Label value={t('tfa.code')} />
      <Input
        value={confirmationCode?.value ?? ''}
        error={confirmationCode?.error}
        onChange={({ target: { name, value } }) => {
          dispatch(ForgotPasswordActions.updateForgotPasswordField({ name, value }));
        }}
        placeholder={t('tfa.code')}
        name="confirmationCode"
      />

      <Label value={t('forgotPassword.password')} />
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

      <Label value={t('forgotPassword.repeat-password')} />
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

      <Button
        value={t('forgotPassword.submit')}
        type="rounded"
        onClick={async (e) => {
          e.preventDefault();
          if (hasErrors
            || !(phone?.value && confirmationCode?.value
              && password?.value && repeatedPassword?.value)) return;

          const res = await API.user.profile.resetPassword(phone.value, password.value, confirmationCode?.value);
          const {
            isConfirmationCodeValid,
            isPasswordUpdated,
          } = res.data;

          if (!res.ok || !isConfirmationCodeValid || !isPasswordUpdated) {
            const msg = res.data?.error?.message;
            showToast(msg ? t(`errorMessagesHelper.${msg}`) : t('errorMessages.something-went-wrong'), 'error');
            return;
          }

          showToast(t('forgotPassword.successfully-reset-password'), 'success');
          navigate('/sign-in');
        }}
        isDisabled={hasErrors
          || !(confirmationCode?.value && phone?.value && password?.value && repeatedPassword?.value)}
      />
    </>
  );

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
            className="forgot-password sign-up"
            hasFooter={false}
            classNameHeader="gray"
        >
            <div className="title-wrapper">
                <div className="title">{t('forgotPassword.setup-password')}</div>
            </div>

            <div className="content-wrapper">
                <div className="content-wrapper-inner">
                    {isConfirmationCodeSent ? renderPasswordInputs() : renderPhoneInput()}
                </div>
            </div>
        </Main>
      </div>
  );
};

ForgotPassword.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(ForgotPassword);
