import _ from 'lodash';

import {
  doorLatchMechanismsArticles,
  listOfItemsTypes,
  mechanismArticlesCodes,
  ADSSideProfilesList,
  openingSidesSystems,
} from './constants';


export const isItemDisbled = (item) => item.startsWith('. ');


export const isValidPhoneNumber = (phone) => /^0(\d{9})$/.test(phone);


export const articleCodeVariant1 = RegExp('^[A-Z]{1,2}(-[0-9]{2,3})+$');
export const articleCodeVariant2 = RegExp('^[A-Z]{1,2}(-[0-9]{3})( v.p.)+$');
export const articleCodeVariant3 = RegExp('^[A-Z]{1,2}(-[0-9]{3})(-L)+$');
export const articleCodeVariant4 = RegExp('^[A-Z]{1,2}(-[0-9]{2})(-L)+$');
export const articleCodeVariant5 = RegExp('^[A-Z]{1,2}(-[0-9]{3})(-v.p.)+$');


export const isSideProfileValid = (profileWithoutColor) => ADSSideProfilesList.indexOf(profileWithoutColor) !== -1;


export const isItemTypeValid = (itemType) => listOfItemsTypes.indexOf(itemType) !== -1;


export const is1CItemOfMainRegionValid = (item) => !_.isEmpty(item)
  && !_.isEmpty(item?.['Регион']) && !_.isEmpty(item['ТипНоменклатуры']) && !_.isEmpty(item['Наименование'])
  && !_.isEmpty(item['Артикул']) && !_.isEmpty(item['Код']) && !isItemDisbled(item['Наименование']);


export const is1CItemValid = (item) => !_.isEmpty(item) && !_.isEmpty(item?.['Регион'])
  && !_.isEmpty(item['Артикул']) && !_.isEmpty(item['Код']);


export const isSideProfile = (item) => item['ТипНоменклатуры'] === 'Профиль'
  && (articleCodeVariant1.test(item['Артикул'])
    || articleCodeVariant2.test(item['Артикул'])
    || articleCodeVariant3.test(item['Артикул'])
    || articleCodeVariant5.test(item['Артикул'])
    || item['Артикул'].includes('Slim'))
  && (item['Наименование'].includes('боков') || item['Наименование'].includes('вертикальний'))
  && !item['Артикул'].includes('900');


export const isConnectingProfile = (item) => item['ТипНоменклатуры'] === 'Профиль'
  && (articleCodeVariant1.test(item['Артикул'])
    || articleCodeVariant2.test(item['Артикул'])
    || articleCodeVariant3.test(item['Артикул'])
    || articleCodeVariant4.test(item['Артикул'])
    || item['Артикул'].includes('-Slim'))
  && (item['Наименование'].includes("З'єднувальн")
  || item['Наименование'].includes("з'єднувальн")
  || item['Наименование'].includes('Профіль підсилюючий'));


export const isFilling = (item) => item['ТипНоменклатуры'] === 'Наполнение';


export const isFillingFeature = (item) => item['ТипНоменклатуры'] === 'Услуга к наполнению'
  || item['Наименование'] === 'Фрезерування';


export const isMechanism = (item) => item['ТипНоменклатуры'] === 'Фурнитура'
  && mechanismArticlesCodes.indexOf(item['Артикул']) !== -1;


export const isDoorLatchMechanisms = (item) => item['ТипНоменклатуры'] === 'Фурнитура'
  && doorLatchMechanismsArticles.indexOf(item['Артикул']) !== -1;


export const isOldLogoPath = (url) => url === 'https://ads-decor.ua/cache/800x800/theme/ee_catalog_467/ads.jpg'
    || url === 'https://ads-decor.ua/cache/800x800/theme/ee_catalogprops_406/ads.jpg';


export const hasOpeningSide = (systemType) => _.some(openingSidesSystems, (item) => item === systemType);
