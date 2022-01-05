import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';
import clsx from 'clsx';

import {
  isValidMobilePhone,
  isValidPassword,
} from '../../helpers/validation';
import { sanitizeValueToNumberStringLike } from '../../helpers/sanitizer';
import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';

import SigninFormActions from '../../redux/actions/signinForm';

import { AuthService } from '../../services';

import API from '../../api';

import Label from '../../components/Label';
import Input from '../../components/Input';
import Button from '../../components/Button';

import Main from '../layout/Main';


const Signin = ({
  toastManager,
}) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();

  useTitle(t('routes.sign-in'));

  const {
    phone,
    password,
  } = useSelector(({ signinForm }) => signinForm);
  const { currentSystem } = useSelector(({ systems }) => systems);

  const [hasErrors, setHasErrors] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notificationId, setNotificationId] = useState('');

  useEffect(() => {
    dispatch(SigninFormActions.resetSigninForm());
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
    dispatch(SigninFormActions.updateSigninField({
      name,
      value,
    }));
  };

  const updatePhone = ({ target: { name, value } }) => {
    const sanitizedNumber = sanitizeValueToNumberStringLike(value);

    if (phone?.value === sanitizedNumber) return;

    dispatch(SigninFormActions.updateSigninField({
      name,
      value: sanitizedNumber,
    }));
  };

  const validatePhone = ({ target: { name, value } }) => {
    const sanitizedNumber = sanitizeValueToNumberStringLike(value);
    const isInvalid = !isValidMobilePhone(sanitizedNumber);
    const error = isInvalid ? t('errorMessages.invalid-phone-number') : '';

    setHasErrors(!_.isEmpty(error));
    dispatch(SigninFormActions.updateSigninField({
      name,
      value: sanitizedNumber,
      error,
    }));
  };

  const validatePassword = ({ target: { name, value } }) => {
    const isInvalid = !isValidPassword(value);
    let error = '';

    if (_.isEmpty(value)) error = t('errorMessages.empty-value');
    if (isInvalid) error = t('errorMessages.invalid-password');

    setHasErrors(!_.isEmpty(error));
    dispatch(SigninFormActions.updateSigninField({
      name,
      value,
      error,
    }));
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
        className="sign-in"
        hasFooter={false}
        classNameHeader="gray"
      >
        <div className="title-wrapper">
          <div className="title">{t('signIn.sign-in')}</div>
          <div className="link">
            <span className="label">{t('signIn.no-account')}</span>
              &nbsp; &nbsp;
            <Button
              value={t('signIn.sign-up')}
              onClick={() => navigate('/sign-up-start')}
            />
          </div>
        </div>

        <div className="content-wrapper">
          <div className="content-wrapper-inner">
            <Label value={t('signIn.phone')} />
            <Input
              value={phone?.value ?? ''}
              error={phone.error}
              onChange={updatePhone}
              onBlur={validatePhone}
              placeholder={t('signIn.phone-number-format')}
              name="phone"
            />

            <Label value={t('signIn.password')} />
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

            <Button
              value={t('signIn.sign-in')}
              type="rounded"
              onClick={async (e) => {
                e.preventDefault();

                if (hasErrors || !(password?.value && phone?.value)) return;

                const res = await API.user.signIn(phone.value, password.value);
                if (res?.data?.jwtToken) {
                  AuthService.setToken(res.data.jwtToken);
                  navigate(currentSystem ? `/${currentSystem}/edit` : '/systems');
                  return;
                }
                if (!res.ok) {
                  const msg = res.data?.error?.message;
                  showToast(msg ? t(`errorMessagesHelper.${msg}`) : res.data?.message, 'error');
                }
              }}
              isDisabled={hasErrors || !(password?.value && phone?.value)}
            />

            <div className="sm-bottom-text">
              <Button
                value={t('signIn.reset-password')}
                onClick={() => navigate('/reset-password')}
              />
            </div>
          </div>
        </div>
      </Main>
    </div>
  );
};

Signin.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(Signin);
