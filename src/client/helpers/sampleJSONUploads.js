import React from 'react';


const sampleCustomers = () => (
  <>
    <code>
      {String('{ "Контрагенты": [ {')}

      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Регион": "Львов",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Код": "000000000",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Наименование": "Прізвище  Ім\'я",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ТипЦен": "Розничная",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Телефоны": [ ')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"380680000000"')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String(' ]')}

      <br />
      {String('} ] }')}
    </code>
  </>
);


const sampleItemsJson = () => (
  <>
    <code>
      {String('{ "Номенклатура": [ {')}

      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Регион": "Львов",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Код": "000000000",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Наименование": "AS-119-L Ручка бокова лайт",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"НаименованиеНаСайтУкр": "AS-119-L Ручка бокова лайт",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"НаименованиеНаСайтРос": "AS-119-L Ручка боковая лайт",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Артикул": "AS-119-L",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ЕдиницаХранения": "пог. м",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ТипНоменклатуры": "Профиль",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допТипНаполнения": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"СсылкаНаКартинку": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"КатегорияНаполнения": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ТолщинаДСП": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Недоступен": false,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Цены": [ {')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Код": "000000000",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Наименование": "Розничная",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Цена": "36,45"')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('} ]')}
      <br />

      {String('} ] }')}
    </code>
  </>
);


const sampleDeliveryJson = () => (
  <>
    <code>
      {String('{ "Доставки": [ {')}

      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Регион": "Львов",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Код": "000000000",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"МістоДляСайтаУкр": "Львів",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"МістоДляСайтаРус": "Львов",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"МістоДляСайтаУкр": "вул. Луганська 6, ТЦ \'Гора\', офіс ADS",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"АдресаДляСайтаРус": "ул. Луганская 6, ТЦ \'Гора\', офис ADS",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Офис": false,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ТипДоставки": "Самовивіз"')}

      <br />
      {String('} ] }')}
    </code>
  </>
);


const sampleStatuses = () => (
  <>
    <code>
      {String('{ "Заказы": [ {')}

      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"СсылкаЗаказа": "60abac0c4fb54c36b58e0970",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Статус": "На опрацюванні",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Номер1С": "123123ab",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Ссылка": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Источник": "Л",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ТипЗаказа": "D - Двери",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Направление": "Львов",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Номер": 111,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Сумма": 4289.55,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Контрагент": "380680000000",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Комментарий": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"КомментарийМенеджера": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допПроемВысота": 3200,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допПроемШирина": 3222,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допДлинаНапр": 3222,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допБП": "119",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допЦвет": "AB",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допДверьВысота": 3157,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допДверьШирина": 1091.333,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допКолДверей": 3,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допКолСборка": 3,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"адсКонструктор": false,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допНеБронировать": false,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допСтруктураДСП": false,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допОстаткиКлиента": false,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допСуммаСборки": 0,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допНаправлениеВнешний": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допПунктВнешний": "",')}

      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Товары": [ {')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Код": "000000148",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допКодЛьвов": "000000148",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Наименование": "AB-119 Ручка бокова широкий паз",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Артикул": "AB-119",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Размеры": "3157x6",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Количество": 18.942,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ИД": "nbac01w6-bp74-hd09-b854-xz96o6s5w3uw",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ФИД": ""00000000-0000-0000-0000-000000000000,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Цена": 88.87,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Сумма": 1683.38')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('} ],')}

      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Услуги": [ {')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Код": "000000716",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"допКодЛьвов": "000000716",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Наименование": "Робота",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Артикул": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Размеры": "",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Количество": 1,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ИД": "mcd6ypa7-zp7d-69i8-pobb-362aak1n35ts",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"ФИД": "00000000-0000-0000-0000-000000000000",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Цена": 60,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Сумма": 60')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('} ]')}

      <br />
      {String('} ] }')}
    </code>
  </>
);


const sampleSystemConstants = () => (
  <>
    <code>
      {String('[ {')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Тип системы": "Раздвижная",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Код": 1,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Наименование": "A06",')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Парам для расчета высоты двери": 38,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Парам для расчета ширины двери": 32,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Парам для расчета нижнего профиля": 64,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Парам для расчета верхнего профиля": 64,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Высота наполнения (стекло)": 60,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Высота наполнения": 60,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Ширина наполнения (стекло)": 49,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Ширина наполнения": 49,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Числовой код": 6,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Высота верхнего профиля": 13,')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"Тип БП": 6')}

      <br />
      {String('} ]')}
    </code>
  </>
);

const sampleSetOrdersEschanged = () => (
  <>
    <code>
      {String('{ "Заказы": [ {')}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;
      {String('"СсылкаЗаказа": "61bb6bd7bb6bd9004b7833b4",')}
      <br />
      {String('} ] }')}
    </code>
  </>
);

export {
  sampleCustomers,
  sampleItemsJson,
  sampleDeliveryJson,
  sampleStatuses,
  sampleSystemConstants,
  sampleSetOrdersEschanged,
};
