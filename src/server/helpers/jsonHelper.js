import _ from 'lodash';

import { defaultRegion, defaultPackageName } from './constants';


export const filterPriceListData = (data) => data.filter((item) => !_.isEmpty(item['Регион'])
  && !_.isEmpty(item['Код']) && !_.isEmpty(item['Артикул'])
  && !_.isEmpty(item['Наименование']));


export const filterProfiles = (data) => data.filter((item) => item && item['ТипНоменклатуры'] === 'Профиль'
  && !_.isEmpty(item['Артикул']) && !_.isEmpty(item['Наименование']));


export const filterFurnishing = (data) => data.filter((item) => item && item['ТипНоменклатуры'] === 'Фурнитура'
  && !_.isEmpty(item['Артикул']) && !_.isEmpty(item['Наименование']));


export const filterFilling = (data) => data.filter((item) => item && item['ТипНоменклатуры'] === 'Наполнение'
  && !_.isEmpty(item['Артикул']) && !_.isEmpty(item['Наименование']));


export const filterFillingFeatures = (data) => data.filter((item) => item
  && (item['ТипНоменклатуры'] === 'Услуга к наполнению' || item['Наименование'] === 'Фрезерування')
  && !_.isEmpty(item['Артикул']) && !_.isEmpty(item['Наименование']));


export const hasItemDefaultPackage = (prices) => prices
  .filter((price) => price['Наименование'] === defaultPackageName)?.length;


export const hasItemEmptyDefaultPackagePrice = (prices) => prices
  .filter((price) => price['Наименование'] === defaultPackageName && !Number(price['Цена'].replace(',', '.')))?.length;


export const isDefaultPackagePriceEmpty = (item1C) => {
  const isMainRegion = item1C?.['Регион'] === defaultRegion;

  return isMainRegion
    ? _.isEmpty(item1C['Цены']) || !hasItemDefaultPackage(item1C['Цены'])
    || !!hasItemEmptyDefaultPackagePrice(item1C['Цены'])
    : false;
};


export const hasAllExchangingConstantsSystemType = (exchange) => !_.some(
  exchange,
  (obj1C) => _.isUndefined(obj1C['Тип системы']),
);


export const checkForSystemTypeField = (exchange) => ({
  missingSystemType: exchange.filter((obj1C) => _.isUndefined(obj1C['Тип системы']))?.length,
  emptySystemType: exchange.filter((obj1C) => _.isEmpty(obj1C['Тип системы']))?.length,
});


export const messagesTranslationFor1CExchange = {
  uk: {
    MISSING_SYSTEM_TYPE_FIELDS: 'Кількість констант без поля "Тип системи"',
    EMPTY_SYSTEM_TYPE_FIELDS: 'Кількість констант з пустим полем "Тип системи"',
    PERMISSION_DENIED: 'Дозвіл відмовлено',
    INVALID_DATA: 'Некоректні дані або відсутні',
    INVALID_TOKEN: 'Некоректний токен',
    BAD_REQUEST: 'Неправильний запит',
  },
};
