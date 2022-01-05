import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';

import { AuthService } from '../../services';

import { isValidMobilePhone } from '../../helpers/validation';
import { sanitizeValueToNumberStringLike } from '../../helpers/sanitizer';
import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';

import SignupFormActions from '../../redux/actions/signupForm';
import ProfileActions from '../../redux/actions/profile';

import Label from '../../components/Label';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Main from '../layout/Main';

import API from '../../api';


const SignupStart = ({ toastManager }) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();

  useTitle(t('routes.sign-up'));

  const { phone } = useSelector(({ signupForm }) => signupForm);

  const [hasErrors, setHasErrors] = useState(false);
  const [notificationId, setNotificationId] = useState('');

  useEffect(() => {
    dispatch(SignupFormActions.resetForm());
  }, []);

  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };

  const updatePhone = ({ target: { name, value } }) => {
    const sanitizedNumber = sanitizeValueToNumberStringLike(value);

    if (phone?.value === sanitizedNumber) return;

    dispatch(SignupFormActions.updateField({
      name,
      value: sanitizedNumber,
    }));
  };

  const validatePhone = ({ target: { name, value } }) => {
    const sanitizedNumber = sanitizeValueToNumberStringLike(value);
    const isInvalid = !isValidMobilePhone(sanitizedNumber);
    const error = isInvalid ? t('errorMessages.invalid-phone-number') : '';

    setHasErrors(!_.isEmpty(error));
    dispatch(SignupFormActions.updateField({
      name,
      value: sanitizedNumber,
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
              <Label value={t('signUp.phone')} />
              <Input
                  value={phone?.value ?? ''}
                  error={phone.error}
                  onChange={updatePhone}
                  onBlur={validatePhone}
                  placeholder={t('signUp.phone-number-format')}
                  name="phone"
              />
            </div>

            <div className="content-wrapper-bottom-section">
              <Button
                  value={t('signUp.proceed')}
                  type="rounded"
                  onClick={async (e) => {
                    e.preventDefault();

                    if (hasErrors || !phone?.value) return;

                    const res = await API.user.signUpBy(phone.value);
                    const { error, jwtToken, status } = res.data;

                    if (error?.message) {
                      const msg = res.data?.error?.message;
                      showToast(msg ? t(`errorMessagesHelper.${msg}`) : t('errorMessages.something-went-wrong'), 'error');
                      return;
                    }

                    if (status === 200) dispatch(ProfileActions.getUserProfileSuccess(res.data?.profile));

                    if (jwtToken) {
                      AuthService.setToken(res.data.jwtToken);
                      navigate('/tfa');
                    }
                  }}
                  isDisabled={hasErrors || !phone?.value}
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

SignupStart.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(SignupStart);
