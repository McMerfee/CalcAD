import _ from 'lodash';
import moment from 'moment';

import { PDFService } from '../services';

import { GRAY_COLOR, systemTypes, squareMillimetersValue } from './constants';
import errorLogger from './errorLogger';

const ENV = process.env.NODE_ENV || 'development';

const specificationStyles = {
  header: {
    font: 'Roboto',
    fontSize: 19,
    bold: true,
    margin: [0, 5, 0, 15],
  },
  subheader: {
    font: 'Roboto',
    fontSize: 10,
    bold: true,
    margin: [0, 10, 0, 5],
  },
  subheaderThin: {
    font: 'Roboto',
    fontSize: 10,
    bold: false,
    margin: [0, 10, 0, 5],
    pageBreak: 'after',
  },
  tableStyle: {
    font: 'Roboto',
    margin: [0, 5, 0, 15],
    fontSize: 10,
  },
  schemaPictureStyle: {
    font: 'Roboto',
    margin: [0, 0, 0, 0],
  },
  tableHeader: {
    font: 'Roboto',
    bold: true,
    fontSize: 9,
    color: 'black',
    alignment: 'center',
    fillColor: GRAY_COLOR,
  },
  tableFooter: {
    font: 'Roboto',
    bold: true,
    fontSize: 10,
    color: 'black',
  },
  icon: {
    bold: true,
    fontSize: 14,
    color: 'black',
    font: 'Fontello',
  },
};


export const generateSpecification = (specification) => {
  try {
    const {
      description = {},
      items = [],
      totalPrice = 0,
      retailTotalPrice = 0,
      doorsSnippet = {},
      createdOn,
      systemType,
    } = specification;
    const systemName = systemTypes.find((i) => i.value === systemType)?.labelUk || '';

    const itemsList = items.filter((i) => i.item !== 'filling' && i.item !== 'fillingFeature');
    const filling = items.filter((i) => i.item === 'filling' || i.item === 'fillingFeature')
      .sort((a, b) => {
        if (a.item < b.item) return -1;
        if (a.item > b.item) return 1;
        return 0;
      });
    const orderDate = moment(createdOn).format('D.MM.YYYY');

    const groupedFilling = groupFillingByArticleCodeAndSize(filling);
    const groupedItems = groupItemsByArticleCodeAndSize(itemsList);

    const pdfHeader = PDFService.generatePDFHeaderTable();
    const footerText = PDFService.generateFooterText(totalPrice, retailTotalPrice);

    const itemsDescriptionTable = PDFService.generateDescriptionTable(description, orderDate, systemType);

    const itemsListTable = ENV !== 'production'
      ? PDFService.generateItemsListTableDev(groupedItems)
      : PDFService.generateItemsListTable(groupedItems);

    const fillingTable = ENV !== 'production'
      ? PDFService.generateFillingTableDev(groupedFilling)
      : PDFService.generateFillingTable(groupedFilling);

    const doorLatchMechanism = PDFService.generateDoorLatchMechanisms(description, doorsSnippet, systemType);
    const openingSides = PDFService.generateOpeningSides(description, doorsSnippet, systemType);
    const schemaPicture = PDFService.generateSchemaPicture(description, doorsSnippet, groupedFilling);
    const schemaPictureСaption = PDFService.generateSchemaPictureСaption(description);

    const docDefinition = {
      content: [
        pdfHeader,
        { text: `Тип системи: ${systemName}`, style: 'subheader' },
        { text: 'Опис замовлення:', style: 'subheader' },
        itemsDescriptionTable,
        itemsListTable,
        fillingTable,
        footerText,
        {
          stack: [
            { text: 'Схематичний малюнок:', style: 'subheaderThin' },
            doorLatchMechanism,
            schemaPicture,
            openingSides,
            schemaPictureСaption,
          ],
          unbreakable: true,
        },
      ],
      styles: specificationStyles,
      pageOrientation: 'portrait',
      pageSize: 'A4',
      pageMargins: [30, 50, 30, 50],
    };

    return docDefinition;
  } catch (err) {
    errorLogger(err, { method: 'generateSpecification', url: ENV });
    return null;
  }
};



export const groupItemsByArticleCodeAndSize = (items) => {
  const groupedItemsByArticleCode = _.groupBy(items, 'articleCode');
  const groupedItems = [];
  let itemNumber = 0;

  _.map(groupedItemsByArticleCode, (groupedItem) => {
    const groupedItemsBySizes = _.groupBy(groupedItem, 'size');

    return _.map(groupedItemsBySizes, (itemsBySizes) => {
      const groupedItemsByAmount = _.groupBy(itemsBySizes, 'amount');

      return _.map(groupedItemsByAmount, (itemsByAmount) => {
        const item = itemsByAmount[0];
        itemNumber += 1;

        const amount = itemsByAmount.length * item.amount;

        const sizeRaw = item.size ? item.size / 1000 : '';
        const sizeRounded = item.size
          // Round up for topProfile, bottomProfile, connectingProfile
          && _.some(['topProfile', 'bottomProfile', 'connectingProfile'], (el) => el === item.item)
          ? parseFloat(Math.ceil(item.size) / 1000).toFixed(3)
          : item.size ? parseFloat(Math.floor(item.size) / 1000).toFixed(3) : '';

        const groupedTotalPrice = sizeRaw && item.unitPrice && amount
          ? +(item.unitPrice * sizeRaw * amount).toFixed(2)
          : item.unitPrice && amount
            ? +(item.unitPrice * amount).toFixed(2)
            : '';

        groupedItems.push({
          itemNumber,
          label: item.labelUk || '',
          amount: amount || '',
          size: sizeRounded || '',
          unitPrice: item.unitPrice || '',
          totalPrice: groupedTotalPrice,
        });
      });
    });
  });

  return groupedItems;
};



export const groupFillingByArticleCodeAndSize = (filling) => {
  const groupedFillingByArticleCode = _.groupBy(filling, 'articleCode');
  const groupedFilling = [];

  _.map(groupedFillingByArticleCode, (aFilling, articleCode) => {
    const groupedFillingByTexture = _.groupBy(aFilling, 'texture');

    return _.map(groupedFillingByTexture, (fill, texture) => {
      const groupedFillingBySizes = _.groupBy(fill, 'size');

      return _.map(groupedFillingBySizes, (items) => {
        const sortedItems = items
          .sort((a, b) => {
            if (a.position.sectionIndex < b.position.sectionIndex) return -1;
            if (a.position.sectionIndex > b.position.sectionIndex) return 1;
            return 0;
          })
          .sort((a, b) => {
            if (a.position.doorIndex < b.position.doorIndex) return -1;
            if (a.position.doorIndex > b.position.doorIndex) return 1;
            return 0;
          });

        const item = sortedItems[0];

        const positions = sortedItems.map((i) => i.position);

        const area = item.size
          ? parseFloat(Math.floor(item.size) / squareMillimetersValue).toFixed(3)
          : '';

        const groupedTotalPrice = item.itemTotalPrice * items.length
          ? +(item.itemTotalPrice * items.length).toFixed(2)
          : '';

        const height = texture === 'horizontal' ? item.width : item.height; // swing for horizontal
        const width = texture === 'horizontal' ? item.height : item.width; // swing for horizontal

        groupedFilling.push({
          articleCode,
          label: item.labelUk || '',
          amount: items.length || '',
          height: height ? Math.floor(height) : '',
          width: width ? Math.floor(width) : '',
          area,
          unitPrice: item.unitPrice || '',
          totalPrice: groupedTotalPrice,
          positions,
          startDoorPosition: item.position?.doorIndex || 0,
          startSectionPosition: item.position?.sectionIndex || 0,
          item: item.item,
        });
      });
    });
  });

  const sortedFilling = groupedFilling
    .sort((a, b) => {
      if (a.startSectionPosition < b.startSectionPosition) return -1;
      if (a.startSectionPosition > b.startSectionPosition) return 1;
      return 0;
    })
    .sort((a, b) => {
      if (a.startDoorPosition < b.startDoorPosition) return -1;
      if (a.startDoorPosition > b.startDoorPosition) return 1;
      return 0;
    })
    .sort((a, b) => {
      if (a.item < b.item) return -1;
      if (a.item > b.item) return 1;
      return 0;
    })
    .map((item, index) => ({
      ...item,
      ...{ fillingNumber: index + 1 },
    }));

  return sortedFilling;
};
