import _ from 'lodash';

import {
  ADSSystemTypes,
  regionsList,
  systemTypes,
} from './constants';
import { isItemDisbled } from './validation';
import { messagesTranslationFor1CExchange } from './jsonHelper';


export const sanitizeNonNumericToNumber = (value) => Number(value.replace(/[^0-9]+/g, ''));


export const sanitizePnoneNumberWithCode = (value) => {
  let phone = value.replace(/[^0-9]+/g, '');
  phone = phone.length === 10
    ? `38${phone}`
    : phone.length === 11
      ? `3${phone}`
      : phone.substring(0, 12);

  return Number(phone);
};


export const sanitizeRegionOrThrow = (region) => {
  const sanitizedRegion = region?.trim();
  const isRegionInvalid = regionsList.indexOf(sanitizedRegion) === -1;

  if (isRegionInvalid) throw new Error(`${region} is not a valid region`);

  return sanitizedRegion;
};


export const sanitizeSystemTypeOrThrow = (systemType) => {
  if (!systemType) throw new Error('systemType is empty');

  const sanitizedType = systemType?.trim()?.toLowerCase();
  const isSystemTypeIllegal = ADSSystemTypes.indexOf(sanitizedType) === -1;

  if (isSystemTypeIllegal) throw new Error(`${systemType} is not a legal system type`);

  return sanitizedType;
};


export const sanitizeItemsAndPricesJSON = (json, hasRoot) => {
  const listOfItems = hasRoot ? json && json['Номенклатура'] : json;
  if (!listOfItems) return [];

  const sanitizedData = listOfItems
    .filter((item) => !_.isEmpty(item['Код'])
      && !_.isEmpty(item['Артикул'])
      && !_.isEmpty(item['Наименование'])
      && !isItemDisbled(item['Наименование']))
    .map((item) => {
      item['Артикул'] = item['Артикул'].trim();
      return item;
    });

  return sanitizedData;
};


export const sanitizeJSONCustomer = (jsonCustomer) => {
  const primaryRegion = jsonCustomer['Регион']?.trim();
  const splitedName = jsonCustomer['Наименование'].split(' ');

  // Getting a first valid phone
  const firstValidPhone = jsonCustomer['Телефоны'].filter((p) => {
    const number = p.replace(/[^0-9]+/g, '');

    return number.length === 10
      || (number.length === 11 && number.startsWith('8'))
      || (number.length === 12 && number.startsWith('38'));
  })[0];

  const phoneWithCode = firstValidPhone && firstValidPhone?.length === 10
    ? Number(`38${firstValidPhone}`)
    : firstValidPhone && firstValidPhone?.length === 11
      ? Number(`3${firstValidPhone}`)
      : firstValidPhone
        ? Number(firstValidPhone)
        : firstValidPhone;

  return {
    id1C: jsonCustomer['Код'],
    lastName: splitedName[0] || '',
    firstName: splitedName[1] || '',
    packageName: jsonCustomer['ТипЦен'] || '',
    primaryRegion,
    regionsList: [primaryRegion],
    phone: phoneWithCode || '',
  };
};


export const sanitize1CConstantsOrThrow = (constants1C) => {
  const translate = messagesTranslationFor1CExchange.uk;
  if (_.isEmpty(constants1C)) throw new Error(`${translate.INVALID_DATA}`);

  const sideProfilesToStartWithZero = ['6', '7'];

  const sanitizedData = constants1C
    .map((obj1C) => ({
      ...obj1C,
      ...{
        'Тип БП': _.some(sideProfilesToStartWithZero, (sp) => sp === obj1C['Тип БП']?.toString())
          ? `0${obj1C['Тип БП']}`
          : obj1C['Тип БП']?.toString(),
        'Тип системы': systemTypes.find((i) => i.labelRu === obj1C['Тип системы'])?.value || obj1C['Тип системы'],
      },
    }))
    .filter((obj1C) => !_.isEmpty(obj1C['Тип системы']) && !_.isEmpty(obj1C['Тип БП']));
  return sanitizedData;
};
