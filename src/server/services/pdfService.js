import _ from 'lodash';

import {
  GRAY_COLOR,
  LOGO_PATH,
  PDF_ICONS,
  PDF_SCALE_SM,
  PDF_SCALE_LG,
} from '../helpers/constants';

import { hasOpeningSide } from '../helpers/validation';



const generateDoorLatchMechanisms = (description, doorsSnippet, systemType) => {
  if (_.isEmpty(description) || !_.some(['extendable', 'monorail'], (item) => item === systemType)) return null;

  const {
    doorsAmount,
    doorsHeight,
    doorsWidth,
  } = description;

  const scale = doorsHeight <= 3000 ? PDF_SCALE_SM : PDF_SCALE_LG;
  const widthsD = Array.from(Array(doorsAmount > 1 ? doorsAmount : 2)).map(() => doorsWidth / scale);

  const table = doorsSnippet.doors
    .map((door) => {
      const isDoorLatchMechanismOn = door?.main?.isDoorLatchMechanismOn?.value;
      const position = door?.main?.doorLatchMechanismPosition?.value;
      const widths = widthsD.map((w) => w / 2.5);

      const body = [[
        {
          text: {
            text: isDoorLatchMechanismOn && (position === 'at-left' || position === 'both-sides')
              ? PDF_ICONS.find((ico) => ico.name === 'doorLatchMechanism').icon
              : '',
            style: 'icon',
            alignment: 'left',
          },
        }, {
          text: {
            text: isDoorLatchMechanismOn && (position === 'at-right' || position === 'both-sides')
              ? PDF_ICONS.find((ico) => ico.name === 'doorLatchMechanism').icon
              : '',
            style: 'icon',
            alignment: 'right',
          },
        },
      ]];

      return (
        [{
          table: { body, widths },
          layout: {
            hLineColor: () => 'white',
            vLineColor: () => 'white',
          },
        }]);
    });

  return {
    table: {
      headerRows: 0,
      margin: [0, 0, 0, 0],
      widths: widthsD,
      body: [table],
    },
    layout: {
      hLineColor: () => 'white',
      vLineColor: () => 'white',
    },
  };
};



const generateOpeningSides = (description, doorsSnippet, systemType) => {
  if (_.isEmpty(description) || !hasOpeningSide(systemType)) return null;

  const {
    doorsAmount,
    doorsHeight,
    doorsWidth,
  } = description;

  const scale = doorsHeight <= 3000 ? PDF_SCALE_SM : PDF_SCALE_LG;
  const widthsD = Array.from(Array(doorsAmount)).map(() => doorsWidth / scale);

  const table = doorsSnippet.doors
    .map((door) => {
      const side = door?.main?.openingSide?.value;
      const widths = Array.from(Array(doorsAmount * 2)).map(() => doorsWidth / 2 / (scale * 1.45));

      const body = [[
        {
          text: {
            text: side === 'left' ? PDF_ICONS.find((ico) => ico.name === 'leftArrow').icon : '',
            style: 'icon',
            alignment: 'left',
          },
        }, {
          text: {
            text: side === 'right' ? PDF_ICONS.find((ico) => ico.name === 'rightArrow').icon : '',
            style: 'icon',
            alignment: 'right',
          },
        },
      ]];

      return (
        [{
          table: { body, widths },
          layout: {
            hLineColor: () => 'white',
            vLineColor: () => 'white',
          },
        }]);
    });

  return {
    table: {
      headerRows: 0,
      margin: [0, 0, 0, 0],
      widths: widthsD,
      body: [table],
    },
    layout: {
      hLineColor: () => 'white',
      vLineColor: () => 'white',
    },
  };
};



const generateSchemaPicture = (description, doorsSnippet, groupedFilling) => {
  if (_.isEmpty(description)) return null;

  const {
    doorsAmount,
    doorsHeight,
    doorsWidth,
  } = description;

  const scale = doorsHeight <= 3000 ? PDF_SCALE_SM : PDF_SCALE_LG;

  const doorsTable = doorsSnippet.doors
    .map((door, doorIndex) => {
      const sectionsTable = [];
      const { sections, main } = door;
      const directionOfSections = main?.directionOfSections?.value;

      // Door without sections
      if (!sections.length) {
        const doorFillingText = groupedFilling
          .filter((item) => _.some(item.positions, (i) => i.doorIndex === doorIndex))
          .map((item) => item.fillingNumber)
          .join('.');

        const fillingD = main?.filling;
        const texture = main?.texture?.value;
        const isChipboardD = fillingD?.customersOption?.includes('dsp') || fillingD?.material === 'dsp';
        const textureTextD = !isChipboardD
          ? ''
          : texture === 'horizontal'
            ? '='
            : '||';

        return ([
          {
            text: `${doorFillingText} ${textureTextD}`,
            alignment: 'center',
            headerRows: 0,
            fontSize: 9,
          },
        ]);
      }

      let columnsAmount = 1;
      let rowsAmount = 1;

      if (directionOfSections === 'vertical') {
        columnsAmount = sections.length;
      }

      if (directionOfSections === 'horizontal') {
        rowsAmount = sections.length;
      }

      sections.forEach((section, sectionIndex) => {
        const sectionBorders = sectionIndex === sections.length - 1
          ? [false, false, false, false]
          : directionOfSections === 'horizontal'
            ? [false, false, false, true]
            : [false, false, false, false];

        const {
          texture: textureS,
          filling: fillingS,
        } = section;

        const sectionFillingText = groupedFilling
          .filter((item) => _.some(item.positions, (i) => i.doorIndex === doorIndex && i.sectionIndex === sectionIndex))
          .map((item) => item.fillingNumber)
          .join('.');

        const isChipboardS = fillingS?.customersOption?.includes('dsp') || fillingS?.material === 'dsp';
        const textureTextS = !isChipboardS
          ? ''
          : textureS?.value === 'horizontal'
            ? '='
            : '||';

        sectionsTable.push([{
          text: `${sectionFillingText} ${textureTextS}`,
          fontSize: 9,
          alignment: 'center',
          bold: false,
          border: sectionBorders,
        }]);
      });

      const widthsS = Array.from(Array(columnsAmount)).map((r, i) => sections[i].fillingWidth?.value / scale);
      const heightsS = Array.from(Array(rowsAmount)).map((r, i) => sections[i].fillingHeight?.value / scale);

      return ([
        [{
          table: {
            headerRows: 0,
            margin: [0, 0, 0, 0],
            widths: widthsS,
            heights: heightsS,
            body: directionOfSections === 'vertical' ? [sectionsTable] : sectionsTable,
          },
          layout: {
            hLineColor: directionOfSections === 'vertical' ? () => 'white' : 'gray',
            vLineColor: (i, node) => { // eslint-disable-line
              return directionOfSections === 'vertical' && (i === 0 || i === node.table.widths.length)
                ? 'white' : 'gray';
            },
          },
        }],
      ]);
    });

  const widthsD = Array
    .from(Array(doorsAmount))
    .map(() => doorsWidth / scale);

  const table = {
    style: 'schemaPictureStyle',
    table: {
      headerRows: 0,
      margin: [0, 0, 0, 0],
      widths: widthsD,
      heights: [doorsHeight / scale],
      body: [doorsTable],
    },
  };

  return table;
};



const generateSchemaPictureСaption = (description) => {
  if (_.isEmpty(description)) return null;

  const { doorsAmount, doorsWidth, doorsHeight } = description;
  const scale = doorsHeight <= 3000 ? PDF_SCALE_SM : PDF_SCALE_LG;
  const widths = Array.from(Array(doorsAmount)).map(() => doorsWidth / scale);

  const doorsNumbers = Array
    .from(Array(doorsAmount))
    .map((door, index) => ({
      text: `${index + 1}`,
      alignment: 'center',
      pageBreak: 'after',
      bold: true,
    }));

  const table = {
    table: {
      widths,
      body: [doorsNumbers],
    },
    layout: {
      hLineColor: () => 'white',
      vLineColor: () => 'white',
    },
  };

  return table;
};



const generatePDFHeaderTable = () => ({
  style: 'header',
  table: {
    widths: ['*', '*'],
    body: [
      [
        {
          image: LOGO_PATH,
          width: 250,
          border: [false, false, false, false],
        },
        {
          text: 'Заявка-специфікація',
          border: [false, false, false, false],
          alignment: 'right',
        },
      ],
    ],
  },
});



const generateDescriptionTable = (description, orderDate, systemType) => {
  if (_.isEmpty(description)) return null;

  const {
    doorOpeningHeight,
    doorOpeningWidth,
    doorsAmount,
    doorsHeight,
    doorsWidth,
    aluminiumColor,
  } = description;
  let { doorPositioning } = description;
  if (_.some(['monorail', 'assembling'], (item) => item === systemType)) doorPositioning = '';

  const lastColumnWidth = aluminiumColor.length > 11 ? 100 : 70;

  const table = {
    style: 'tableStyle',
    table: {
      widths: [120, 60, '*', 120, lastColumnWidth],
      body: [
        [
          {
            border: [false, false, false, false],
            text: 'Висота проєму, мм',
          },
          {
            border: [true, true, true, false],
            fillColor: GRAY_COLOR,
            text: doorOpeningHeight,
            alignment: 'right',
            bold: true,
          },
          {
            border: [false, false, false, false],
            text: '',
          },
          {
            border: [false, false, false, false],
            text: 'Колір системи',
          },
          {
            border: [true, true, true, false],
            fillColor: GRAY_COLOR,
            text: aluminiumColor,
            alignment: 'right',
            bold: true,
          },
        ],
        [
          {
            border: [false, false, false, false],
            text: 'Ширина проєму, мм',
          },
          {
            border: [true, false, true, false],
            fillColor: GRAY_COLOR,
            text: doorOpeningWidth,
            alignment: 'right',
            bold: true,
          },
          {
            border: [false, false, false, false],
            text: '',
          },
          {
            border: [false, false, false, false],
            text: 'К-сть дверей, шт',
          },
          {
            border: [true, false, true, false],
            fillColor: GRAY_COLOR,
            text: doorsAmount,
            alignment: 'right',
            bold: true,
          },
        ],
        [
          {
            border: [false, false, false, false],
            text: 'Висота дверей, мм',
          },
          {
            border: [true, false, true, false],
            fillColor: GRAY_COLOR,
            text: doorsHeight.toFixed(1),
            alignment: 'right',
          },
          {
            border: [false, false, false, false],
            text: '',
          },
          {
            border: [false, false, false, false],
            text: doorPositioning ? 'Схема розташування' : '',
          },
          {
            border: [true, false, true, false],
            fillColor: GRAY_COLOR,
            text: doorPositioning,
            alignment: 'right',
            bold: true,
          },
        ],
        [
          {
            border: [false, false, false, false],
            text: 'Ширина дверей, мм',
          },
          {
            border: [true, false, true, true],
            fillColor: GRAY_COLOR,
            text: doorsWidth.toFixed(1),
            alignment: 'right',
          },
          {
            border: [false, false, false, false],
            text: '',
          },
          {
            border: [false, false, false, false],
            text: 'Дата замовлення',
          },
          {
            border: [true, false, true, true],
            fillColor: GRAY_COLOR,
            text: orderDate,
            alignment: 'right',
          },
        ],
      ],
    },
  };

  return table;
};



const generateFooterText = (price, retail) => {
  if (!price) return null;

  const text = {
    text: retail ? `Загальна вартість ${price} грн. Роздріб (${retail} грн)` : `Загальна вартість ${price} грн.`,
    alignment: 'right',
    style: 'tableFooter',
  };

  return text;
};



const generateItemsListTable = (groupedItems) => {
  if (_.isEmpty(groupedItems)) return null;

  const body = [
    [
      { text: '№', style: 'tableHeader' },
      { text: 'Номенклатура', style: 'tableHeader' },
      { text: 'К-сть', style: 'tableHeader' },
      { text: 'Довжина, пог.м.', style: 'tableHeader' },
    ],
  ];

  _.map(groupedItems, (item) => {
    body.push([
      { text: item.itemNumber, alignment: 'center', lineHeight: 0.9 },
      { text: item.label, alignment: 'left', lineHeight: 0.9 },
      { text: item.amount, alignment: 'right', lineHeight: 0.9 },
      { text: item.size, alignment: 'right', lineHeight: 0.9 },
    ]);
  });

  const table = {
    style: 'tableStyle',
    table: {
      widths: [40, '*', 'auto', 50],
      body,
    },
  };

  return table;
};



const generateItemsListTableDev = (groupedItems) => {
  if (_.isEmpty(groupedItems)) return null;

  const body = [
    [
      { text: '№', style: 'tableHeader' },
      { text: 'Номенклатура', style: 'tableHeader' },
      { text: 'К-сть', style: 'tableHeader' },
      { text: 'Довжина, пог.м.', style: 'tableHeader' },
      { text: 'Ціна', style: 'tableHeader' },
      { text: 'Вартість', style: 'tableHeader' },
    ],
  ];

  _.map(groupedItems, (item) => {
    body.push([
      { text: item.itemNumber, alignment: 'center', lineHeight: 0.9 },
      { text: item.label, alignment: 'left', lineHeight: 0.9 },
      { text: item.amount, alignment: 'right', lineHeight: 0.9 },
      { text: item.size, alignment: 'right', lineHeight: 0.9 },
      { text: item.unitPrice, alignment: 'right', lineHeight: 0.9 },
      { text: item.totalPrice, alignment: 'right', lineHeight: 0.9 },
    ]);
  });

  const table = {
    style: 'tableStyle',
    table: {
      widths: ['auto', '*', 'auto', 50, 'auto', 'auto'],
      body,
    },
  };

  return table;
};



const generateFillingTable = (groupedFilling) => {
  if (_.isEmpty(groupedFilling)) return null;

  const body = [
    [
      { text: '№', style: 'tableHeader' },
      { text: 'Наповнення', style: 'tableHeader' },
      { text: 'К-сть', style: 'tableHeader' },
      { text: 'Висота', style: 'tableHeader' },
      { text: 'Ширина', style: 'tableHeader' },
      { text: 'Площа', style: 'tableHeader' },
    ],
  ];

  _.map(groupedFilling, (item) => {
    body.push([
      { text: item.fillingNumber, alignment: 'center', lineHeight: 0.9 },
      {
        text: item.label,
        alignment: 'left',
        fontSize: item.label?.length > 40 ? 9 : 10,
        lineHeight: 0.9,
      },
      { text: item.amount, alignment: 'right', lineHeight: 0.9 },
      { text: item.height, alignment: 'right', lineHeight: 0.9 },
      { text: item.width, alignment: 'right', lineHeight: 0.9 },
      { text: item.area, alignment: 'right', lineHeight: 0.9 },
    ]);
  });

  const table = {
    style: 'tableStyle',
    table: {
      widths: ['auto', '*', 30, 'auto', 'auto', 'auto'],
      body,
    },
  };

  return table;
};



const generateFillingTableDev = (groupedFilling) => {
  if (_.isEmpty(groupedFilling)) return null;

  const body = [
    [
      { text: '№', style: 'tableHeader' },
      { text: 'Наповнення', style: 'tableHeader' },
      { text: 'К-сть', style: 'tableHeader' },
      { text: 'Висота', style: 'tableHeader' },
      { text: 'Ширина', style: 'tableHeader' },
      { text: 'Площа', style: 'tableHeader' },
      { text: 'Ціна', style: 'tableHeader' },
      { text: 'Вартість', style: 'tableHeader' },
    ],
  ];

  _.map(groupedFilling, (item) => {
    body.push([
      { text: item.fillingNumber, alignment: 'center', lineHeight: 0.9 },
      {
        text: item.label,
        alignment: 'left',
        fontSize: item.label?.length > 40 ? 9 : 10,
        lineHeight: 0.9,
      },
      { text: item.amount, alignment: 'right', lineHeight: 0.9 },
      { text: item.height, alignment: 'right', lineHeight: 0.9 },
      { text: item.width, alignment: 'right', lineHeight: 0.9 },
      { text: item.area, alignment: 'right', lineHeight: 0.9 },
      { text: item.unitPrice, alignment: 'right', lineHeight: 0.9 },
      { text: item.totalPrice, alignment: 'right', lineHeight: 0.9 },
    ]);
  });

  const table = {
    style: 'tableStyle',
    table: {
      widths: ['auto', '*', 30, 'auto', 'auto', 'auto', 'auto', 'auto'],
      body,
    },
  };

  return table;
};

export default {
  generateDoorLatchMechanisms,
  generateOpeningSides,
  generateSchemaPicture,
  generateSchemaPictureСaption,
  generatePDFHeaderTable,
  generateDescriptionTable,
  generateFooterText,
  generateItemsListTable,
  generateItemsListTableDev,
  generateFillingTable,
  generateFillingTableDev,
};
