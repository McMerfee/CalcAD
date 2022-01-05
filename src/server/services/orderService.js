import _ from 'lodash';
import dotenv from 'dotenv-safe';

import {
  regionsValuesList,
  orderTypes,
  defaultRegion,
  jwtExpiresLong,
  ordersStatuses,
} from '../helpers/constants';

import { generateToken } from '../helpers/jwt';
import errorLogger from '../helpers/errorLogger';
import logger from '../helpers/logger';

import {
  ExchangeStore,
  Orders,
} from '../db';

dotenv.config({ path: '.env' });

const {
  MANAGER_ACCESS_KEY,
  NODE_ENV,
  SITE_URL,
} = process.env;
const ENV = NODE_ENV || 'development';

const seperatorCyrillic = 'х';
const seperatorLatin = 'x';


const makeOrdersArrayFor1CExchange = (orders, dbItems, regionValue) => {
  logger.info(`[OrderService.makeOrdersArrayFor1CExchange] Called. Orders: ${orders.length}`);

  const region = regionsValuesList.find((item) => item.value === regionValue);
  const ordersArray = {
    Тест: 'Масив заказов',
    Заказы: [],
  };

  const accessToken = generateToken({
    manager: true,
    accessToken: MANAGER_ACCESS_KEY,
  }, { expiresIn: jwtExpiresLong });

  ordersArray['Заказы'] = orders
    .map((order) => {
      const pdfUrl = `${SITE_URL}/api/orders/${order._id}/pdf/${accessToken}`;
      const sideProfile = order.doorsSnippet?.main?.sideProfile?.value;
      const color = order.doorsSnippet?.main?.aluminiumColor?.value;
      const doorWidth = order.doorsSnippet?.doors[0]?.main?.doorWidth;
      const doorHeight = order.doorsSnippet?.doors[0]?.main?.doorHeight;
      const assemblingAmount = order.doorsSnippet?.doors
        .filter((door) => door.main?.isDoorAssemblingOn?.value === true)?.length;
      const itemWork = order.items?.find((el) => el.item === 'work') || {};
      const inProcessStatus = ordersStatuses.find((x) => x.value === 'in-processing')?.value;

      const articleCodesNotIn = ['pak_n', 'pak_d', 'pak_sl', 'pak_dl'];

      const theItems = order.items
        .filter((item) => !_.isEmpty(item.articleCode) && !_.some(articleCodesNotIn, (x) => x === item.articleCode))
        .map((item) => {
          const itemRegion = dbItems.find((x) => x.articleCode === item.articleCode && x.region === region?.label);
          const itemDefault = dbItems.find((x) => x.articleCode === item.articleCode && x.region === defaultRegion);
          // ! Note: 'х' is written in Cyrillic in 1C
          const height = item.texture === 'horizontal' ? item.width : item.height; // swing for horizontal
          const width = item.texture === 'horizontal' ? item.height : item.width; // swing for horizontal
          const sizes = height && width
            ? `${height}${seperatorCyrillic}${width}${seperatorCyrillic}${item.amount}`
            : item.size ? `${item.size}${seperatorCyrillic}${item.amount}` : '';
          const divider = height && width ? 1000000 : 1000;
          const amount = item.size ? +((item.size * item.amount) / divider).toFixed(3) : item.amount;

          const itemToReturn = {
            Код: itemRegion?.id1C || itemDefault?.id1C,
            допКодЛьвов: itemDefault?.id1C,
            Наименование: itemDefault?.labelUk,
            Артикул: item.articleCode,
            Размеры: sizes,
            Количество: amount,
            ИД: item?.exchange1C?.ID || '',
            ФИД: item?.exchange1C?.FID || '',
            Цена: item.unitPrice,
            Сумма: item.itemTotalPrice,
            doorPosition: item.position?.doorIndex || 0,
            sectionPosition: item.position?.sectionIndex || 0,
            itemType: item.item,
          };

          return itemToReturn;
        });

      const services = [
        {
          Код: '000000716',
          допКодЛьвов: '000000716',
          Наименование: 'Робота',
          Артикул: '',
          Размеры: '',
          Количество: 1,
          ИД: itemWork?.exchange1C?.ID || '',
          ФИД: itemWork?.exchange1C?.FID || '',
          Цена: itemWork?.itemTotalPrice || 0,
          Сумма: itemWork?.itemTotalPrice || 0,
        },
      ];

      const item = {
        СсылкаЗаказа: order._id,
        Ссылка: pdfUrl,
        Статус: order.status || inProcessStatus,
        Источник: region?.label?.charAt(0),
        ТипЗаказа: assemblingAmount ? orderTypes['doors-with-assembling'] : orderTypes['doors-without-assembling'],
        Направление: region?.label,
        Номер: order.orderNumber,
        Сумма: order.totalPrice,
        Контрагент: order.user.phoneNumber,
        КонтрагентИмя: order.user.fullName.split(' ')[0],
        КонтрагентФамилия: order.user.fullName.split(' ')[1],
        Комментарий: order.comments?.customer || '',
        КомментарийМенеджера: order.comments?.manager || '',
        допПроемВысота: order.description?.doorOpeningHeight,
        допПроемШирина: order.description?.doorOpeningWidth,
        допДлинаНапр: order.description?.doorOpeningWidth,
        допБП: sideProfile,
        допЦвет: color,
        допДверьВысота: doorHeight,
        допДверьШирина: doorWidth,
        допКолДверей: order.description?.doorsAmount,
        допКолСборка: assemblingAmount,
        адсКонструктор: false,
        допНеБронировать: false,
        допСтруктураДСП: false,
        допОстаткиКлиента: false,
        допСуммаСборки: 0, // requirement: don't calculate
        допНаправлениеВнешний: '',
        допПунктВнешний: '',
        Товары: theItems,
        Услуги: assemblingAmount ? services : [],
        КодДоставки: order.delivery?.code1C || '',
      };

      return item;
    });

  return ordersArray;
};


const parseAndUpdateOrdersFrom1C = async (orders1C, exchangeDataID) => {
  logger.info(`[OrderService.parseAndUpdateOrdersFrom1C] Called. 1C Orders: ${orders1C.length}`);

  const ordersIDs = orders1C.map((order) => order['СсылкаЗаказа']);
  const rejectedRecordsIDs = [];
  const successfulRecordsIDs = [];

  const bdOrders = await Orders.find({ _id: { $in: ordersIDs } }).lean();

  const outcome = await Promise.allSettled(
    bdOrders.map((orderDB) => {
      const order1C = orders1C.find((el) => el['СсылкаЗаказа'] === orderDB._id.toString());
      const isChangedIn1C = order1C['Сумма'] !== orderDB.totalPrice;
      const items1C = order1C['Товары'] || [];
      const itemsToUpdate = items1C.map((item1C) => {
        const defaultID = '00000000-0000-0000-0000-000000000000';
        const sizes1C = item1C['Размеры'];
        let size = 0;
        let height = 0;
        let width = 0;

        // ! Note: 'х' is written in Cyrillic in 1C
        const seperatorCount = (sizes1C.match(/х/g) || sizes1C.match(/x/g) || []).length;

        // height && width
        if (seperatorCount === 2) {
          const sizesArray = sizes1C.indexOf(seperatorCyrillic) !== -1
            ? sizes1C.split(seperatorCyrillic)
            : sizes1C.split(seperatorLatin);
          height = sizesArray && sizesArray[0] ? sizesArray[0] : 0;
          width = sizesArray && sizesArray[1] ? sizesArray[1] : 0;
          size = +((height * width) / 1000).toFixed(3);
        }

        // one size
        if (seperatorCount === 1) {
          const sizesArray = sizes1C.indexOf(seperatorCyrillic) !== -1
            ? sizes1C.split(seperatorCyrillic)
            : sizes1C.split(seperatorLatin);
          size = sizesArray && sizesArray[0] ? sizesArray[0] : 0;
        }

        let itemDB = orderDB?.items?.find((el) => el.exchange1C?.ID === item1C['ИД']) || {};
        if (itemDB?.exchange1C?.ID === defaultID) {
          itemDB = orderDB?.items?.find((el) => el.exchange1C?.FID === item1C['ФИД']) || {};
        }

        const itemToSet = {
          ...itemDB,
          ...{
            articleCode: item1C['Артикул'] || itemDB.articleCode,
            unitPrice: item1C['Цена'] || itemDB.unitPrice,
            itemTotalPrice: item1C['Сумма'] || itemDB.unitPrice,
            labelUk: item1C['Наименование'] || itemDB.labelUk,
            labelRu: item1C['Наименование'] || itemDB.labelRu,
            amount: item1C['Количество'] || itemDB.amount,
            size,
            height,
            width,
            exchange1C: {
              ID: item1C['ИД'],
              FID: item1C['ФИД'],
            },
          },
        };
        return itemToSet;
      });

      const orderToUpdate = {
        updatedOn: new Date().toISOString(),
        ...(order1C['Статус'] ? { status: order1C['Статус'] } : {}),
        isChangedIn1C,
        items: itemsToUpdate,
        totalPrice: order1C['Сумма'],
        ...(order1C['Номер1С'] ? { number1C: order1C['Номер1С'] } : {}),
      };

      return Orders.findOneAndUpdate(
        { _id: orderDB._id },
        { $set: orderToUpdate },
        { new: true },
        (error, result) => {
          if (error) {
            logger.error(error);
            rejectedRecordsIDs.push(orderDB._id);
          } else if (result) { successfulRecordsIDs.push(orderDB._id); }
        },
      );
    }),
  );

  outcome.filter(({ status }) => status === 'rejected').forEach((result) => {
    errorLogger(result.reason, { method: 'OrderService.parseAndUpdateOrdersFrom1C', url: ENV });
  });

  const exchangeOutcome = {
    rejectedRecords: {
      IDs: rejectedRecordsIDs,
      count: outcome.filter(({ status }) => status === 'rejected').length,
    },
    successfulRecords: {
      IDs: successfulRecordsIDs,
      count: outcome.filter(({ status }) => status === 'fulfilled').length,
    },
  };

  if (exchangeDataID) {
    const query = { _id: exchangeDataID };
    const updateDoc = { $set: exchangeOutcome };
    const options = { new: true };
    const callback = (error) => { if (error) logger.error(error); };

    const updatedExchangeStore = await ExchangeStore.findOneAndUpdate(query, updateDoc, options, callback);
    logger.info('updatedExchangeStore ID:', updatedExchangeStore?._id);
  }

  return { exchangeOutcome };
};

export default {
  makeOrdersArrayFor1CExchange,
  parseAndUpdateOrdersFrom1C,
};
