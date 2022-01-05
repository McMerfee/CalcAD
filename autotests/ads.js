import { Selector } from 'testcafe';

const url = 'http://ads-calc.herokuapp.com';
const input = Selector('.main-tab--inner .main-tab--item-group:nth-child(1) .input');
const input1 = Selector('.main-tab--inner .main-tab--item-group:nth-child(2) .input');
const addDoor = Selector('.main-tab--inner .main-tab--item-group:nth-child(3) .plus-control');
const shema = Selector('.radio-option.icon.symmetrically');
const prof = Selector('.main-tab--inner .simple-select:nth-child(7)');
const color = Selector('#aluminium-color-WG+ label .radio-option--background');
const mexanizm = Selector('.main-tab--inner .simple-select:nth-child(11)');
const button = Selector('.radio-option--inner').withText('Верхний');
const button1 = Selector('.filling-materails-control .button.text-blue');
const napoln = Selector('.trigger-wrapper').withText('ДСП');

fixture `userView` // eslint-disable-line
  .page `${url}`; // eslint-disable-line

test('userView', async (t) => {
  await t
    .selectText(input)
    .pressKey('delete')
    .typeText('.main-tab--inner .main-tab--item-group:nth-child(1) .input', '2500')
    .selectText(input1)
    .pressKey('delete')
    .typeText('.main-tab--inner .main-tab--item-group:nth-child(2) .input', '2500')
    .click(addDoor)
    .click(addDoor)
    .click(shema)
    .click(prof)
    .typeText('.main-tab--inner .simple-select:nth-child(7) [type="input"]', '119')
    .pressKey('enter')
    .click(color)
    .click(mexanizm)
    .typeText('.main-tab--inner .simple-select:nth-child(11) [type="input"]',
      'Набір для кріплення №1 для А119/А07 (на силікон)')
    .pressKey('enter')
    .click(button)
    .click(button1)
    .click(napoln)
    .click('.modal-inner-children .Collapsible:nth-child(3) [type="input"]')
    .typeText('.modal-inner-children .Collapsible:nth-child(3) [type="input"]', 'Егер')
    .pressKey('enter')
    .click('.uv-print-section .toggle-control')
    .click('.dsp-section-inner .react-selectize-control .react-selectize-placeholder')
    .typeText('.dsp-section-inner .react-selectize-control .react-selectize-placeholder', 'В 2 слоя')
    .pressKey('enter')
    .click('.dsp-options-wrapper div:nth-child(1) .radio-group--inner .image-button:nth-child(3) img')
    .click('.filling-modal-footer--inner .full-width-button[type="button"]')
    .click('.configurator-bottom-nav--inner .configurator-bottom-nav--next-icon')
    .click('.toggle-control.door-latch-mechanism')
    .click('.react-selectize-search-field-and-selected-values [type="input"]')
    .typeText('.react-selectize-search-field-and-selected-values [type="input"]', 'Дотяг верхній OPK (Новинка)')
    .pressKey('enter')
    .click('.right label')
    .click('.main-section--column .button.text-blue')
    .click('.modal-inner-children .Collapsible:nth-child(2)')
    .click('.radio-group--inner .icon.icon-button-large:nth-child(1)')
    .click('.filling-modal-footer .full-width-button')
    .click('.plus-minus-control .plus-control')
    .click('.plus-minus-control .plus-control')
    .click('.plus-minus-control .plus-control')
    .click('.plus-minus-control .plus-control')
    .click('.plus-minus-control .plus-control')
    .click('.main-section--inner :nth-child(9)')
    .typeText('.main-section--inner :nth-child(9) .react-selectize-search-field-and-selected-values [type="input"]',
      '32')
    .pressKey('enter')
    .click('.main-section--row-space-between .toggle-control.door-assembling')
    .click('.tab-content--action-buttons .rectangle')
    .click('.content-wrapper .container:nth-child(2) .checkmark')
    .click('.content-wrapper .container:nth-child(3) .checkmark')
    .click('.content-wrapper .container:nth-child(4) .checkmark')
    .click('.action-buttons .blue-button')
    .click('.tab-sections--head :nth-child(2)')
    .click('.filling-materails-control .button.text-blue')
    .click('.filling-modal-footer .full-width-button')
    .click('.sticky-menu--head .sticky-menu-tabs :nth-child(5)')
    .click('.tab-content--action-buttons .circle');
});
