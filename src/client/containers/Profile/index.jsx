import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle, navigate } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';

import {
  sanitizeValueToNumberStringLike,
  capitalizeFirstLetter,
} from '../../helpers/sanitizer';

import {
  isValidFirstOrLastName,
  isValidMobilePhone,
  isValidTextField,
} from '../../helpers/validation';

import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';

import Input from '../../components/Input';
import Label from '../../components/Label';
import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';

import { AuthService } from '../../services';

import DeliveryActions from '../../redux/actions/delivery';
import ProfileActions from '../../redux/actions/profile';

import Main from '../layout/Main';

const MAX_ADDRESS_LENGTH = 40;


const Profile = ({ toastManager }) => {
  const { t, i18n } = useTranslation(['components']);
  const languageKey = i18n.language;

  const dispatch = useDispatch();

  useTitle(t('routes.profile'));

  if (!(AuthService.isLoggedIn() && AuthService.isPhoneNumberVerified())) navigate('/sign-in');

  useEffect(() => {
    dispatch(ProfileActions.getUserProfileRequest());
    dispatch(DeliveryActions.getDeliveryRequest());
  }, []);

  const {
    firstName,
    currentFirstName,
    currentLastName,
    currentPhone,
    isUpdating,
    errorMessage,
    delivery: {
      type: deliveryType,
      office,
      addressLine,
      city,
    },
  } = useSelector(({ profile }) => profile);

  const { deliveryOptions } = useSelector(({ delivery }) => delivery);

  const {
    errorMessage: orderErrorMsg,
    successMessage,
  } = useSelector(({ order }) => order);

  const [hasChanges, setHasChanges] = useState(false);
  const [notificationId, setNotificationId] = useState('');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [officesByCity, setOfficesByCity] = useState([]);
  const [addressErrorMsg, setAddressErrorMsg] = useState(null);


  useEffect(() => {
    if (errorMessage) showToast(errorMessage, 'error');
    if (orderErrorMsg) showToast(orderErrorMsg, 'error');
    if (successMessage) showToast(successMessage, 'success');
  }, [errorMessage, orderErrorMsg, successMessage]);

  const updateName = ({ target: { name, value } }) => {
    const isInvalid = !isValidFirstOrLastName(value, 1, 30);
    const error = isInvalid ? t('errorMessages.invalid-name') : '';

    dispatch(ProfileActions.updateProfileField({
      name,
      value: capitalizeFirstLetter(value).trim(),
      error,
    }));
    setHasChanges(true);
  };

  const updatePhone = ({ target: { name, value } }) => {
    const sanitizedNumber = sanitizeValueToNumberStringLike(value);
    const isInvalid = !isValidMobilePhone(sanitizedNumber);
    const error = isInvalid ? t('errorMessages.invalid-phone-number') : '';

    dispatch(ProfileActions.updateProfileField({
      name,
      value: sanitizedNumber,
      error,
    }));
    setHasChanges(true);
  };

  const submitProfileFormRequest = () => {
    if (isSubmitDisabled()) return;

    const isTransportAgency = isSelectedTypeTransportAgency(selectedDeliveryType);
    let code1C = '';

    if (isTransportAgency) code1C = selectedDeliveryType;
    if (selectedDeliveryType === 'Самовивіз') code1C = selectedOffice;
    if (selectedDeliveryType === t('options:delivery-options.ads-transport')) {
      code1C = deliveryOptions
        .find((x) => x.type === t('options:delivery-options.ads-transport')
          && x.city1C[`${languageKey}`] === selectedCity)?.code1C || '';
    }

    const deliveryData = {
      type: isTransportAgency ? 'Перевізник' : selectedDeliveryType,
      city: selectedCity,
      addressLine: selectedAddress,
      office: selectedOffice,
      code1C,
    };

    dispatch(ProfileActions.submitProfileFormRequest(deliveryData));
  };

  const cancelChanges = () => {
    dispatch(ProfileActions.getUserProfileRequest());
    setHasChanges(false);
  };

  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };

  const isSubmitDisabled = () => Boolean(!hasChanges
    || !currentFirstName.value || !currentLastName.value || !currentPhone.value
    || currentFirstName.error || currentLastName.error || currentPhone.error);

  // Set user's selected info from profile
  useEffect(() => setSelectedDeliveryType(deliveryType), [deliveryType]);
  useEffect(() => {
    setSelectedCity(city);
    setOfficesByCity(getOfficesByCity(city));
  }, [city, deliveryOptions?.length]);
  useEffect(() => setSelectedAddress(addressLine), [addressLine]);
  useEffect(() => setSelectedOffice(office), [office]);


  const getDeliveryTypeList = () => {
    if (!deliveryOptions?.length) return [];

    // TODO: change to t('options:delivery-options.transport-agency') depending on 1C lang values
    const transportAgencies = _.groupBy(deliveryOptions, 'type')?.['Перевізник']
      .map(({ code1C, addressLine1C }) => ({ value: code1C, label: addressLine1C[languageKey] }))
      .filter(({ value, label }) => value && label);

    const keysOfGroups = _.keys(_.groupBy(deliveryOptions, 'type'))
      .map((type) => ({ value: type, label: type }))
      .filter(({ value }) => value && value !== 'Перевізник');

    return _.union(keysOfGroups, transportAgencies);
  };


  const citiesList = _.keys(_.groupBy(deliveryOptions, `city1C[${languageKey}]`))
    .map((city1C) => ({ value: city1C, label: city1C }))
    .filter(({ value }) => value);


  const getOfficesByCity = (cityName) => {
    if (!cityName) return [];

    const ADSOffices = deliveryOptions.filter(({ isOffice }) => isOffice);

    const ADSOfficesByCity = ADSOffices
      .filter(({ city1C }) => city1C[languageKey] === cityName)
      .map(({ code1C, addressLine1C }) => ({ value: code1C, label: addressLine1C[languageKey] }))
      .filter(({ value, label }) => value && label);

    return ADSOfficesByCity?.length
      ? ADSOfficesByCity
      : ADSOffices?.length ? ADSOffices : [];
  };


  const isSelectedTypeTransportAgency = (value) => deliveryOptions
    .find(({ code1C, type }) => code1C === value && type === 'Перевізник')?._id;


  const handleDeliveryTypeChange = (selectedOption) => {
    const { value } = selectedOption;
    if (!value) return;

    setSelectedDeliveryType(value);
    setHasChanges(true);
    setAddressErrorMsg(null);
    if (value === 'Самовивіз') setSelectedAddress(null);
    if (value !== 'Самовивіз') setSelectedOffice(null);
  };


  const handleCityChange = (selectedOption) => {
    if (_.isEmpty(selectedOption)) {
      setSelectedCity(null);
      setOfficesByCity([]);
      setHasChanges(true);
      return;
    }
    setHasChanges(true);

    const { value, label } = selectedOption;
    setSelectedCity(value);

    const offices = getOfficesByCity(label);
    setOfficesByCity(offices);
  };


  const handleOfficeChange = (selectedOption) => {
    setSelectedOffice(selectedOption?.value);
    setHasChanges(true);
  };


  const handleAddressChange = (e) => {
    let value = e?.target?.value;

    if (value.length > MAX_ADDRESS_LENGTH) {
      value = value.substring(0, MAX_ADDRESS_LENGTH);
    }

    validateAddressChange(e);
    setSelectedAddress(value);
    setHasChanges(true);
  };


  const validateAddressChange = (e) => {
    const { target: { value } } = e;
    const isInvalid = !isValidTextField(value, 6, MAX_ADDRESS_LENGTH);
    const message = isInvalid ? t('errorMessages.invalid-address') : '';

    setAddressErrorMsg(message);
  };


  return (
    <Main
      className="profile"
      hasFooter={false}
      canGoBack={false}
    >

      <div className="title-wrapper">
        <div className="title">
          <span>{t('profile.greeting')}</span>
          <span>{firstName?.value ? `, ${firstName.value}` : ''}</span>
        </div>
        <div className="link">
          <span className="label">{t('profile.contact-info')}</span>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="content-wrapper-inner">
          <div className="content-wrapper-top-section">
            <Label value={t('profile.first-name')} />
            <Input
              onChange={updateName}
              name="currentFirstName"
              value={currentFirstName?.value ?? ''}
              error={currentFirstName.error}
            />

            <Label value={t('profile.last-name')} />
            <Input
              value={currentLastName?.value ?? ''}
              error={currentLastName.error}
              onChange={updateName}
              name="currentLastName"
            />

            <Label value={t('profile.phone')} />
            <Input
              value={currentPhone?.value ?? ''}
              error={currentPhone.error}
              onChange={updatePhone}
              placeholder={t('profile.phone-number-format')}
              name="currentPhone"
            />
          </div>

          <div className="content-wrapper-delivery-section">
            <div className="delivery-section-title">{t('profile.delivery-by-default')}</div>

            <div className="delivery-type-wrapper">
              <Label
                value={t('putOrderIntoWorkModal.delivery-type')}
                infoTagValue={t('putOrderIntoWorkModal.delivery-type')}
                withInfoTag
              />
              <Dropdown
                placeholder={t('putOrderIntoWorkModal.delivery-type')}
                isClearable={false}
                options={getDeliveryTypeList()}
                onChange={(selectedOption) => handleDeliveryTypeChange(selectedOption)}
                value={getDeliveryTypeList().find(({ value }) => value === selectedDeliveryType)}
              />
            </div>

            <div className="city-wrapper">
              <Label
                value={t('putOrderIntoWorkModal.city-label')}
                infoTagValue={t('putOrderIntoWorkModal.city-label')}
                withInfoTag
              />
              <Dropdown
                className="search-glass"
                placeholder={t('putOrderIntoWorkModal.city-search')}
                options={citiesList || []}
                onChange={(selectedOption) => handleCityChange(selectedOption)}
                value={citiesList.find(({ value }) => value === selectedCity)}
                hideResetButton={false}
                isClearable
                isSearchable
              />
            </div>

            { selectedDeliveryType !== 'Самовивіз' // TODO: change to t('options:delivery-options.self-pickup') depending on 1C lang values
              ? (
                <div className="address-wrapper">
                  <Label
                    value={t('putOrderIntoWorkModal.address-label')}
                    infoTagValue={t('putOrderIntoWorkModal.address-label')}
                    withInfoTag
                  />
                  <Input
                    placeholder={t('putOrderIntoWorkModal.address-placeholder')}
                    onChange={handleAddressChange}
                    onBlur={validateAddressChange}
                    value={selectedAddress ?? ''}
                    error={addressErrorMsg}
                  />
                </div>
              ) : null }

            { selectedDeliveryType === 'Самовивіз' // TODO: change to t('options:delivery-options.self-pickup') depending on 1C lang values
              ? (
                <div className="office-wrapper">
                  <Label
                    value={t('putOrderIntoWorkModal.office-label')}
                    infoTagValue={t('putOrderIntoWorkModal.office-label')}
                    withInfoTag
                  />
                  <Dropdown
                    className="search-glass"
                    placeholder={t('putOrderIntoWorkModal.office-search')}
                    options={officesByCity || []}
                    onChange={(selectedOption) => handleOfficeChange(selectedOption)}
                    value={officesByCity?.find(({ value }) => value === selectedOffice)}
                    hideResetButton={false}
                    isClearable
                    isSearchable
                  />
                </div>
              ) : null }
          </div>

          { hasChanges
            ? (
              <div className="content-wrapper-bottom-section">
                <Button
                  value={t('profile.cancel')}
                  onClick={cancelChanges}
                />
                <Button
                  value={t('profile.submit')}
                  type="rounded"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (isSubmitDisabled()) return;
                    submitProfileFormRequest();
                    setHasChanges(false);
                    if (!errorMessage) {
                      showToast(t('successMessages.data-updated-successfully'), 'success');
                    }
                    navigate('/systems');
                  }}
                  isDisabled={isSubmitDisabled()}
                  isProcessing={isUpdating}
                />
              </div>
            ) : null }
        </div>
      </div>
    </Main>
  );
};

Profile.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(Profile);
