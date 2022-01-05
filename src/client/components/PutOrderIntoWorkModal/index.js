import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { isValidTextField } from '../../helpers/validation';
import OrderActions from '../../redux/actions/order';

import Modal from '../Modal';
import Button from '../Button';
import Dropdown from '../Dropdown';
import Label from '../Label';
import Input from '../Input';
import TextArea from '../TextArea';

const MAX_ADDRESS_LENGTH = 40;

const PutOrderIntoWorkModal = ({
  isOpen,
  orderID,
  className,
  orderNumber,
  deliveryOptions,
  deliveryType,
  city,
  addressLine,
  office,
  onCloseModal,
  onPutOrderIntoWork,
}) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const languageKey = i18n.language;

  const [selectedDeliveryType, setSelectedDeliveryType] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [officesByCity, setOfficesByCity] = useState([]);
  const [comment, setComment] = useState(null);
  const [addressErrorMsg, setAddressErrorMsg] = useState(null);

  // Reset selected options
  useEffect(() => {
    if (isOpen) return;
    setComment(null);
  }, [isOpen]);

  // Set user's selected info from profile
  useEffect(() => setSelectedDeliveryType(deliveryType), [deliveryType]);
  useEffect(() => {
    setSelectedCity(city);
    setOfficesByCity(getOfficesByCity(city));
  }, [city, deliveryOptions?.length]);
  useEffect(() => setSelectedAddress(addressLine), [addressLine]);
  useEffect(() => setSelectedOffice(office), [office]);
  useEffect(() => {
    if (!orderID) return;
    dispatch(OrderActions.fetchOrderModalDataRequest(orderID));
  }, [orderID]);

  const {
    currentOrderModalData: {
      isPackageChanged,
      isTotalPriceChanged,
      orderOrigin,
      orderRecalculated,
    },
  } = useSelector(({ order }) => order);

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

    const ADSOffices = deliveryOptions;

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


  const handleSubmit = () => {
    if (!canSubmit()) return;

    const recalculatedOrder = isPackageChanged || isTotalPriceChanged ? orderRecalculated : null;
    const isTransportAgency = isSelectedTypeTransportAgency(selectedDeliveryType);
    let code1C = '';

    if (isTransportAgency) code1C = selectedDeliveryType;
    if (selectedDeliveryType === 'Самовивіз') code1C = selectedOffice;
    if (selectedDeliveryType === t('options:delivery-options.ads-transport')) {
      code1C = deliveryOptions
        .find((x) => x.type === t('options:delivery-options.ads-transport')
          && x.city1C[`${languageKey}`] === selectedCity)?.code1C || '';
    }

    const dataToSubmit = {
      deliveryType: isTransportAgency ? 'Перевізник' : selectedDeliveryType,
      city: selectedCity,
      addressLine: selectedAddress,
      office: selectedOffice,
      customerComment: comment,
      code1C,
    };

    onPutOrderIntoWork(dataToSubmit, recalculatedOrder);
    onCloseModal();
  };


  const canSubmit = () => {
    // TODO: change to t('options:delivery-options.self-pickup') depending on 1C lang values
    if (selectedDeliveryType !== 'Самовивіз') {
      return Boolean(!addressErrorMsg && selectedDeliveryType && selectedCity && selectedAddress);
    }
    return Boolean(!addressErrorMsg && selectedDeliveryType && selectedCity && selectedOffice);
  };


  const handleDeliveryTypeChange = (selectedOption) => {
    const { value } = selectedOption;
    if (!value) return;

    setSelectedDeliveryType(value);

    setAddressErrorMsg(null);
    if (value === 'Самовивіз') setSelectedAddress(null);
    if (value !== 'Самовивіз') setSelectedOffice(null);
    if (value !== 'Самовивіз' && value !== 'Транспорт ADS') setSelectedCity(null);
  };


  const handleCityChange = (selectedOption) => {
    if (_.isEmpty(selectedOption)) {
      setSelectedCity(null);
      setOfficesByCity([]);
      return;
    }

    const { value, label } = selectedOption;
    setSelectedCity(value);

    const offices = getOfficesByCity(label);
    setOfficesByCity(offices);
  };

  const handleOfficeChange = (selectedOption) => {
    setSelectedOffice(selectedOption?.value);
  };


  const handleAddressChange = (e) => {
    let value = e?.target?.value;

    if (value.length > MAX_ADDRESS_LENGTH) {
      value = value.substring(0, MAX_ADDRESS_LENGTH);
    }

    validateAddressChange(e);
    setSelectedAddress(value);
  };


  const validateAddressChange = (e) => {
    const { target: { value } } = e;
    const isInvalid = !isValidTextField(value, 6, MAX_ADDRESS_LENGTH);
    const message = isInvalid ? t('errorMessages.invalid-address') : '';

    setAddressErrorMsg(message);
  };


  const onCustomerCommentChange = (e) => {
    const { target: { value } } = e;
    setComment(value);
  };


  if (!isOpen) return null;


  const renderChangedPackageWarning = () => {
    if (!isTotalPriceChanged) return null;
    const prevPrice = orderOrigin?.totalPrice || '';
    const currentPrice = orderRecalculated?.totalPrice || '';

    return (
      <div className="warning-wrapper">
        <span>{t('warningMessages.price-has-changed', { prevPrice, currentPrice })}</span>
      </div>
    );
  };


  return (
    <Modal
      opened={isOpen}
      closeModal={onCloseModal}
      className={className}
      shouldDisableBodyScroll
    >
      <h2 className="headings-h2">{t('putOrderIntoWorkModal.title', { orderNumber })}</h2>

      <div className="content-subtitle">{t('putOrderIntoWorkModal.subtitle')}</div>

      <div className="content-wrapper">
        <div className="content-wrapper-inner">

          {renderChangedPackageWarning()}

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

          { selectedDeliveryType === 'Самовивіз' || selectedDeliveryType === 'Транспорт ADS'
            ? (
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
            ) : null }

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

          <TextArea
            name="customer-comment"
            placeholder={t('putOrderIntoWorkModal.comment-placeholder')}
            label={t('putOrderIntoWorkModal.comment-label')}
            infoTagValue={t('putOrderIntoWorkModal.comment-label')}
            onChange={onCustomerCommentChange}
            value={comment}
            minrows={3}
            maxrows={4}
            shouldHideFooter
            withInfoTag
          />

          <div className="paddings-10" />
        </div>
      </div>

      <div className="action-buttons">
        <div className="action-buttons-inner">
          <Button
            className="link-button"
            type="link-button"
            value={t('putOrderIntoWorkModal.cancel')}
            onClick={onCloseModal}
          />
          <Button
            value={t('putOrderIntoWorkModal.submit')}
            type="rounded"
            onClick={handleSubmit}
            isDisabled={!canSubmit()}
          />
        </div>
      </div>
    </Modal>
  );
};

PutOrderIntoWorkModal.defaultProps = {
  className: 'action-modal put-into-work',
  isOpen: false,
  deliveryOptions: [],
  deliveryType: '',
  city: '',
  office: '',
  addressLine: '',
};

PutOrderIntoWorkModal.propTypes = {
  isOpen: PropTypes.bool,
  orderID: PropTypes.string.isRequired,
  className: PropTypes.string,
  deliveryType: PropTypes.string,
  city: PropTypes.string,
  office: PropTypes.string,
  addressLine: PropTypes.string,
  deliveryOptions: PropTypes.arrayOf(PropTypes.shape({})),
  onCloseModal: PropTypes.func.isRequired,
  onPutOrderIntoWork: PropTypes.func.isRequired,
  orderNumber: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
};

export default PutOrderIntoWorkModal;
