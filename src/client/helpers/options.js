export const doorPositioningOptions = [
  {
    value: 'chessboard',
    label: 'Шахматна',
    iconPath: '/src/client/assets/icons/chessboard-shaped.svg',
  }, {
    value: 'symmetrical',
    label: 'Симметрична',
    iconPath: '/src/client/assets/icons/symmetrically-shaped.svg',
  },
];

export const hingedDoorPositioningOptions = ['left-front', 'left-back'];

export const textures = [
  {
    value: 'vertical',
    label: 'Вертикальная',
    iconPath: '/src/client/assets/icons/vertical-texture.svg',
  }, {
    value: 'horizontal',
    label: 'Горизонтальная',
    iconPath: '/src/client/assets/icons/horizontal-texture.svg',
  },
];

export const stoppers = [
  {
    label: 'Верхний',
    value: 'stopor_new',
  }, {
    label: 'Нижний',
    value: 'stop_arc',
  },
];

export const openingSides = [
  {
    label: 'Левая',
    value: 'left',
  }, {
    label: 'Правая',
    value: 'right',
  },
];

export const doorLatchMechanismPositionOptions = [
  {
    label: 'Справа',
    value: 'at-right',
  }, {
    label: 'Зліва',
    value: 'at-left',
  }, {
    label: 'З двох сторін',
    value: 'both-sides',
  },
];

export const directionOfSectionsOptions = [
  {
    label: 'Горизонтальный',
    value: 'horizontal',
  }, {
    label: 'Вертикальный',
    value: 'vertical',
  },
];

export const mergeSectionOptions = [{
  label: 'С нижней секцией',
  value: 'last',
}, {
  label: 'С верхней секцией',
  value: 'first',
}, {
  label: 'Выровнять секции',
  value: 'align-all',
}];

export const chipboardUVPrintingTypes = [
  {
    label: 'Без белого цвета',
    value: 'print_uv_wcb',
  }, {
    label: 'С белым цветом',
    value: 'print_uvw_wcb',
  }, {
    label: 'В 2 слоя',
    value: 'print_uv_wcb2',
  }, {
    label: 'В 3 слоя',
    value: 'print_uv_wcb3',
  }, {
    label: 'В 4 слоя',
    value: 'print_uv_wcb4',
  }, {
    label: 'В 5 слоев',
    value: 'print_uv_wcb5',
  },
];

export const mirrorUVPrintingTypes = [
  {
    label: 'Друк кольором',
    value: 'print_uv_mir',
  }, {
    label: 'Друк білим кольором',
    value: 'print_uvw_mir',
  }, {
    label: 'Друк кольором з білим підкладом',
    value: 'print_uvws_mir',
  },
];

export const lacobelUVPrintingTypes = [
  {
    label: 'Друк кольором',
    value: 'print_uv_mir',
  }, {
    label: 'Друк білим кольором',
    value: 'print_uvw_mir',
  }, {
    label: 'Друк кольором з білим підкладом',
    value: 'print_uvws_mir',
  },
];

export const glassUVPrintingTypes = [
  {
    label: 'Друк кольором',
    value: 'print_uv_gl',
  }, {
    label: 'Друк білим кольором',
    value: 'print_uvw_gl',
  }, {
    label: 'Друк кольором з білим підкладом',
    value: 'print_uvws_gl',
  }, {
    label: 'Друк кольором з білим підкладом (двосторонній друк)',
    value: 'print_uv2sws_gl',
  }, {
    label: 'Друк кольором з білим підкладом з тильної сторони',
    value: 'print_uvbsws_gl',
  }, {
    label: 'Друк кольором з тильної сторони',
    value: 'print_uvbs_gl',
  },
];

export const glassPhotoPrintingTypes = [
  {
    label: 'Фотопечать ЛАТЕКС-HD',
    value: 'print_lathd',
  }, {
    label: 'Фотопечать ЛАТЕКС',
    value: 'print_lat',
  }, {
    label: 'Фотопечать ЛАТЕКС (ЕКО)',
    value: 'print_lateco',
  },
];

export const mirrorTypes = [
  {
    value: 'mirror_4',
    label: 'Серебряное',
  }, {
    value: 'mirror_br',
    label: 'Бронза',
  }, {
    value: 'mirror_grap',
    label: 'Графит',
  }, {
    value: 'mirror_sat',
    label: 'Сатин',
  }, {
    value: 'mirror_ult',
    label: 'Ультрапрозрачное',
  },
];

export const lacobelTypes = [
  {
    value: 'lakob_1013',
    label: 'Лакобель 1013',
  }, {
    value: 'lakob_1015',
    label: 'Лакобель 1015',
  }, {
    value: 'lakob_1236',
    label: 'Лакобель 1236',
  }, {
    value: 'lakob_9003',
    label: 'Лакобель 9003 (Білий на Ультрапрозорому склі)',
  }, {
    value: 'lakob_9005',
    label: 'Лакобель 9005',
  }, {
    value: 'lakob_9010',
    label: 'Лакобель 9010 (Білий на Зеленому склі)',
  },
];

export const glassTypes = [
  {
    value: 'glass_4',
    label: 'Прозрачное',
  }, {
    value: 'glass_br',
    label: 'Бронза',
  }, {
    value: 'glass_grap',
    label: 'Графит',
  }, {
    value: 'glass_sat',
    label: 'Сатин',
  }, {
    value: 'glass_ult',
    label: 'Ультрапрозрачное',
  },
];

export const deliveryTypes = [
  {
    value: 'ads-transport',
    labelUk: 'Транспорт ADS',
    labelRu: 'Транспорт ADS',
  },
  {
    value: 'self-pickup',
    labelUk: 'Самовивіз',
    labelRu: 'Самовывоз',
  },
  {
    value: 'nova-poshta',
    labelUk: 'Нова Пошта',
    labelRu: 'Новая Почта',
  },
  {
    value: 'cat',
    labelUk: 'CAT',
    labelRu: 'CAT',
  },
  {
    value: 'delivery',
    labelUk: 'Делівері',
    labelRu: 'Деливери',
  },
  {
    value: 'avtolyuks',
    labelUk: 'Автолюкс',
    labelRu: 'Автолюкс',
  },
];
