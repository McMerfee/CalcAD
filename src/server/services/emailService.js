import _ from 'lodash';
import moment from 'moment';
import dotenv from 'dotenv-safe';

import { getEmailTemplatePath, sendHtmlEmail } from '../helpers/emailsHelper';
import { generateToken } from '../helpers/jwt';

import {
  groupItemsByArticleCodeAndSize,
  groupFillingByArticleCodeAndSize,
} from '../helpers/pdf';

import {
  emailLogoBase64,
  jwtExpiresLong,
} from '../helpers/constants';

dotenv.config({ path: '.env' });
const ENV = process.env.NODE_ENV || 'development';
const {
  NODE_ENV = 'development',
  ADS_FROM_EMAIL,
  ADS_TO_EMAIL,
  SITE_URL,
  TO_EMAIL_KYIV,
  TO_EMAIL_ODESSA,
  TO_EMAIL_LVIV,
  TO_EMAIL_KHARKIV,
} = process.env;

const getEmailToByRegion = (region) => {
  if (region === 'Харьков') return TO_EMAIL_KHARKIV;
  if (region === 'Львов') return TO_EMAIL_LVIV;
  if (region === 'Одеса') return TO_EMAIL_ODESSA;
  if (region === 'Киев') return TO_EMAIL_KYIV;
  return ADS_TO_EMAIL;
};

const sendNewOrderEmail = async (order, user) => {
  const { primaryRegion } = user;
  const {
    description = {},
    doorsSnippet,
    items = [],
    totalPrice,
    createdOn,
    comments = {},
  } = order;

  const fillingList = groupFillingByArticleCodeAndSize(items
    .filter((i) => i.item === 'filling' || i.item === 'fillingFeature'));
  const itemsList = groupItemsByArticleCodeAndSize(items
    .filter((i) => i.item !== 'filling' && i.item !== 'fillingFeature'));

  const schemaDoors = doorsSnippet.doors
    .map((door, doorIndex) => {
      const { sections, main } = door;
      const doorSections = [];

      if (!sections.length) {
        const doorFillingText = fillingList
          .filter((item) => _.some(item.positions, (x) => x.doorIndex === doorIndex))
          .map((item) => item.fillingNumber)
          .join('.');

        const fillingD = main?.filling;
        const texture = main?.texture?.value;
        const isChipboardD = fillingD?.customersOption?.includes('dsp') || fillingD?.material === 'dsp';
        const textureTextD = !isChipboardD
          ? ''
          : texture?.value === 'horizontal'
            ? '='
            : '||';

        doorSections.push({
          doorNumber: doorIndex + 1,
          text: `${doorFillingText} ${textureTextD}`,
        });
      } else {
        _.map(sections, (s, sectionIndex) => {
          const {
            texture: textureS,
            filling: fillingS,
          } = s;

          const sectionFillingText = fillingList
            .filter((item) => _.some(item.positions, (i) => i.doorIndex === doorIndex
              && i.sectionIndex === sectionIndex))
            .map((item) => item.fillingNumber)
            .join('.');

          const isChipboardS = fillingS?.customersOption?.includes('dsp') || fillingS?.material === 'dsp';
          const textureTextS = !isChipboardS
            ? ''
            : textureS?.value === 'horizontal'
              ? '='
              : '||';

          doorSections.push({ text: `${sectionFillingText} ${textureTextS}` });
        });
      }

      return {
        sections: doorSections,
      };
    });

  const accessToken = generateToken({
    manager: true,
    accessToken: process.env.MANAGER_ACCESS_KEY,
  }, { expiresIn: jwtExpiresLong });

  const pdfUrl = `${SITE_URL}/api/orders/${order._id}/pdf/${accessToken}`;
  const templatePath = getEmailTemplatePath('newOrderCreated.html');
  const replacements = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    userFullName: `${user.firstName} ${user.lastName}`,
    userPhoneNumber: user.phone,
    orderDate: moment(createdOn).format('D.MM.YYYY'),
    comment: comments?.customer || '-',
    logoBase64: emailLogoBase64,
    description,
    totalPrice,
    itemsList,
    fillingList,
    schemaDoors,
    SITE_URL,
    pdfUrl,
  };

  const mailOptions = {
    to: getEmailToByRegion(primaryRegion),
    from: ADS_FROM_EMAIL,
    subject: NODE_ENV === 'production'
      ? `Нове замовлення №${order._id}`
      : `Тестове замовлення №${order._id}`,
  };

  await sendHtmlEmail(templatePath, replacements, mailOptions);
};



const sendNewUserCreatedEmail = async (userFullName, userPhoneNumber, region) => {
  const templatePath = getEmailTemplatePath('newUserCreated.html');
  const replacements = {
    userFullName,
    userPhoneNumber,
    SITE_URL,
  };

  const mailOptions = {
    to: getEmailToByRegion(region),
    from: ADS_FROM_EMAIL,
    subject: NODE_ENV === 'production'
      ? 'Реєстрація нового користувача'
      : 'Тестова реєстрація нового користувача',
  };

  await sendHtmlEmail(templatePath, replacements, mailOptions);
};



const sendEmailAboutMissingPrices = async (replacements, templatePath) => {
  const dateTimeFormated = moment().locale('uk').format('LLL');

  const mailOptions = {
    to: getEmailToByRegion(replacements.region),
    from: ADS_FROM_EMAIL,
    subject: ENV === 'production'
      ? `Відсутні ціни для Роздрібного пакету цін, ${replacements.region}, ${dateTimeFormated}`
      : `Тест - Відсутні ціни для Роздрібного пакету цін, ${replacements.region}, ${dateTimeFormated}`,
  };

  await sendHtmlEmail(templatePath, replacements, mailOptions);
};


const sendCustomerUploadingResults = async (replacements, templatePath) => {
  const dateTimeFormated = moment().locale('uk').format('LLL');

  const mailOptions = {
    to: getEmailToByRegion(replacements.region),
    from: ADS_FROM_EMAIL,
    subject: ENV === 'production'
      ? `Загрузка контрагентів, ${replacements.region}, ${dateTimeFormated}`
      : `Тест - Загрузка контрагентів, ${replacements.region}, ${dateTimeFormated}`,
  };

  await sendHtmlEmail(templatePath, replacements, mailOptions);
};


export default {
  sendNewOrderEmail,
  sendNewUserCreatedEmail,
  sendEmailAboutMissingPrices,
  sendCustomerUploadingResults,
};
