import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';
import clsx from 'clsx';

import {
  isValidEmail,
  isValidPassword,
} from '../../helpers/validation';
import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';

import SigninAdminFormActions from '../../redux/actions/signinAdminForm';

import { AuthService } from '../../services';

import API from '../../api';

import Button from '../../components/Button';
import Label from '../../components/Label';
import Input from '../../components/Input';

import Main from '../layout/Main';


const SigninAdmin = ({
  toastManager,
}) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();

  useTitle(t('routes.sign-in-admin'));

  const {
    email,
    password,
  } = useSelector(({ signinAdminForm }) => signinAdminForm);

  const [hasErrors, setHasErrors] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notificationId, setNotificationId] = useState('');

  useEffect(() => {
    dispatch(SigninAdminFormActions.resetSigninAdminForm());
  }, []);

  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };

  const updateField = ({ target: { name, value } }) => {
    dispatch(SigninAdminFormActions.updateSigninAdminField({
      name,
      value,
    }));
  };

  const validateEmail = ({ target: { name, value } }) => {
    const isInvalid = !isValidEmail(value);
    const error = isInvalid ? t('errorMessages.invalid-email') : '';

    setHasErrors(!_.isEmpty(error));
    dispatch(SigninAdminFormActions.updateSigninAdminField({
      name,
      value,
      error,
    }));
  };

  const validatePassword = ({ target: { name, value } }) => {
    const isInvalid = !isValidPassword(value);
    let error = '';

    if (_.isEmpty(value)) error = t('errorMessages.empty-value');
    if (isInvalid) error = t('errorMessages.invalid-password');

    setHasErrors(!_.isEmpty(error));
    dispatch(SigninAdminFormActions.updateSigninAdminField({
      name,
      value,
      error,
    }));
  };

  return (
    <Main
      className="sign-in"
      hasFooter={false}
      canGoBack={false}
      classNameHeader="gray"
    >
      <div className="title-wrapper">
        <div className="title">{t('signIn.sign-in-admin')}</div>
      </div>

      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <Label value={t('signIn.email')} />
          <Input
            value={email?.value ?? ''}
            error={email.error}
            onChange={updateField}
            onBlur={validateEmail}
            placeholder={t('signIn.email')}
            name="email"
          />

          <Label value={t('signIn.password')} />
          <Input
            value={password?.value ?? ''}
            error={password.error}
            onChange={updateField}
            onBlur={validatePassword}
            name="password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
            type={showPassword ? 'text' : 'password'}
            withIcon
            iconClassName={clsx('icon-at-right', 'password', showPassword && 'active')}
            onIconClick={() => setShowPassword(!showPassword)}
          />

          <Button
            value={t('signIn.sign-in')}
            type="rounded"
            onClick={async (e) => {
              e.preventDefault();

              if (hasErrors || !(password?.value && email?.value)) return;

              const res = await API.user.signInAsAdmin(password.value, email.value);
              if (res?.data?.jwtToken) {
                AuthService.setToken(res.data.jwtToken);
                navigate('/json-form');
                return;
              }
              if (!res.ok) {
                const msg = res.data?.error?.message;
                showToast(msg ? t(`errorMessagesHelper.${msg}`) : t('errorMessages.something-went-wrong'), 'error');
              }
            }}
            isDisabled={hasErrors || !(password?.value && email?.value)}
          />
        </div>
      </div>
    </Main>
  );
};

SigninAdmin.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(SigninAdmin);
