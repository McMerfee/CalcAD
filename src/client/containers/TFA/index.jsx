import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';

import Input from '../../components/Input';
import Button from '../../components/Button';

import tfaFormActions from '../../redux/actions/tfaForm';
import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';

import { AuthService } from '../../services';

import API from '../../api';

import Main from '../layout/Main';


const TFA = ({
  toastManager,
}) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();
  const userId = AuthService.getUserId();

  useTitle(t('routes.tfa'));

  const {
    confirmationCode,
    isLoading,
  } = useSelector(({ tfaForm }) => tfaForm);

  const { phone } = useSelector(({ signupForm }) => signupForm);

  const [notificationId, setNotificationId] = useState('');

  useEffect(() => {
    dispatch(tfaFormActions.resetTFAForm());
  }, []);

  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };

  const updateConfirmationCode = ({ target: { value } }) => {
    dispatch(tfaFormActions.updateConfirmationCode({ value }));
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
          className="tfa"
          hasFooter={false}
      >
        <div className="title-wrapper">
          <div className="title">{t('tfa.auth')}</div>
          <div className="link">
            <span className="label">{t('tfa.hint-section')}</span>
          </div>
        </div>

        <div className="content-wrapper">
          <div className="content-wrapper-inner">
            <Input
                value={confirmationCode?.value ?? ''}
                error={confirmationCode?.error}
                onChange={updateConfirmationCode}
                placeholder={t('tfa.code')}
                name="confirmationCode"
            />

            <Button
                value={t('tfa.confirm')}
                type="rounded"
                onClick={async (e) => {
                  e.preventDefault();

                  if (!confirmationCode?.value) return;

                  const res = await API.user.tfa.verifyConfirmationCode(userId, confirmationCode.value);

                  if (!res.ok || !res.data?.isConfirmationCodeValid) {
                    const msg = res.data?.error?.message;
                    showToast(msg ? t(`errorMessagesHelper.${msg}`) : t('errorMessages.something-went-wrong'), 'error');
                    return;
                  }

                  navigate('/sign-up');
                }}
                isDisabled={!confirmationCode?.value}
                isProcessing={isLoading}
            />

            <div className="sm-bottom-text">
              <Button
                  value={t('tfa.send-confirmation-again')}
                  isDisabled={_.isEmpty(phone?.value)}
                  isProcessing={isLoading}
                  onClick={async (e) => {
                    e.preventDefault();

                    const res = await API.user.tfa.sendConfirmationCode(userId, phone.value);
                    dispatch(tfaFormActions.updateConfirmationCode({ value: '' }));

                    if (!res.ok) {
                      const msg = res.data?.error?.message;
                      showToast(msg ? t(`errorMessagesHelper.${msg}`) : t('errorMessages.something-went-wrong'), 'error');
                    }
                  }}
              />
            </div>

            <div className="sm-bottom-link">
              <Button
                  value={t('tfa.go-to-registration')}
                  onClick={() => navigate('/sign-up-start')}
              />
            </div>
          </div>
        </div>
      </Main>
  </div>
  );
};

TFA.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(TFA);
