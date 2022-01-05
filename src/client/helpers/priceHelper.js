import _ from 'lodash';

import { squareMillimetersValue } from '../../server/helpers/constants';
import { hasOpeningSide } from '../../server/helpers/validation';

import {
  defaultAluminiumColor,
  defaultTopProfile,
  defaultBottomProfile,
  defaultSealing,
  defaultAssemblyScrew,
  topDoorLatchMechanism,
  bottomDoorLatchMechanism,
  defaultMilling,
  packagingOfGuidanceProfile,
  defaultPackageName,
  defaultStrainer,
  hingedMiddleDoorMechanism,
  assemblingAdditionalMechanism,
  defaultBung,
} from './constants';

import { doorPositioningOptions } from './options';
import { hasBottomLatchMechanism } from './sizesCalculation';
import constantsBySystemType from './constantsBySystemType';

export const isColorSideProfileAvailable = (color, sideProfile, prices) => {
  const spArticleCode = color ? `${color}-${sideProfile}` : sideProfile;
  const sideProfileDoc = prices?.find((s) => s.articleCode === spArticleCode && s.packageName === defaultPackageName);
  return !!sideProfileDoc?._id;
};

export const isMechanismAvailable = (mechanism, prices) => {
  const mechanismDoc = prices?.find((s) => s.articleCode === mechanism && s.packageName === defaultPackageName);
  return !!mechanismDoc?._id;
};

export function calculateOrder(state, packageName) {
  const {
    priceList: {
      priceList,
      specification: specificationObject,
    },
    config: {
      brushes,
      filling: fillingConfig,
      systemConctants,
      aluminiumColors,
    },
    systems: { currentSystem },
    doorsAndSections,
  } = state;

  const {
    main: {
      aluminiumColor,
      sideProfile,
      doorsAmount: { value: doorsAmount },
      doorOpeningHeight: { value: doorOpeningHeight },
      doorOpeningWidth: { value: doorOpeningWidth },
      stopper: { value: stopper },
      doorPositioning,
      mechanism,
      sidewallThickness,
      isX2ProfileOn,
      isMiddleDoorMechanismOn,
      isX4ProfileOn,
      isStopperOn,
    },
    doors,
  } = doorsAndSections;
  const X14 = sidewallThickness?.value || 0;

  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;
  const aluminiumColorValue = aluminiumColor?.value || defaultAluminiumColor;
  const sideProfileValue = sideProfile?.value || defaultSideProfile;
  const isSlim = sideProfileValue === 'Slim';
  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfileValue)[0] || {};
  const defaultGuidanceProfile = spConstants?.guidanceProfilesDependence
    ? spConstants.guidanceProfilesDependence[0]
    : '';

  const {
    topGap = 0,
    bottomGap = 0,
    topSealing = 0,
    bottomSealing = 0,
    sideSealing = 0,
    hiddingTopSize = 0,
    hiddingBottomSize = 0,
    X5 = 0,
    X12H = 0,
    X13W = 0,
    topProfilesDependence = [],
    bottomProfilesDependence = [],
    guidanceProfilesDependence = [],
    carriageProfilesDependence = [],
    standbyCarriagesProfilesDependence = [],
    defaultStopper = 'stopor_new',
  } = spConstants;

  const colorName = aluminiumColorValue && aluminiumColors
    ? aluminiumColors[aluminiumColors?.findIndex((c) => c.articleCode === aluminiumColor.value)]?.labelUk
    : '';

  const doorsHeight = doors[0]?.main?.doorHeight;
  const doorsWidth = doors[0]?.main?.doorWidth;
  const doorFillingHeight = isSlim
    ? doorsHeight + 2 - X12H - topSealing - bottomSealing - topGap - bottomGap
    : doorsHeight - X12H - topSealing - bottomSealing - topGap - bottomGap;
  const doorFillingHeightForChipboard = doorsHeight - X12H - topGap - bottomGap;
  const doorFillingWidth = isSlim
    ? doorsWidth + 2 - X13W - sideSealing * 2
    : doorsWidth - X13W - sideSealing * 2;
  const doorFillingWidthForChipboard = doorsWidth - X13W;

  // Top, bottom, horizontal profiles

  // * horizontalProfilesSize value. Changes due to ADS specifications
  const horizontalProfilesSizeDown = Math.floor(doorsWidth - X5);
  const horizontalProfilesSizeUp = Math.ceil(doorsWidth - X5);
  const horizontalProfilesSizeRaw = doorsWidth - X5; // * Added for price calculation due to ADS specifications

  const doorsHeightInMeters = doorsHeight / 1000;
  const doorOpeningWidthInMeters = doorOpeningWidth / 1000;

  let guidanceProfileSize = 0;
  let doorPositioningLabel = doorPositioningOptions.find((item) => item.value === doorPositioning.value)?.label;
  if (currentSystem === 'hinged') {
    doorPositioningLabel = doorPositioning.value === 'left-front' ? 'Ліва попереду' : 'Ліва позаду';
  }

  const specification = {
    user: {
      fullName: specificationObject?.user?.fullName || '',
      phoneNumber: specificationObject?.user?.phoneNumber || '',
    },
    description: {
      doorOpeningHeight,
      doorOpeningWidth,
      doorsAmount,
      doorsHeight,
      doorsWidth,
      doorPositioning: doorPositioningLabel,
      aluminiumColor: `${aluminiumColorValue} ${colorName.toLowerCase()}`,
    },
    items: [],
    totalPrice: 0,
    retailTotalPrice: 0,
  };

  try {
    /** Бокові або Вертикальні Профілі */

    const spArticleCode = aluminiumColorValue ? `${aluminiumColorValue}-${sideProfileValue}` : sideProfileValue;
    const selectedSideProfileRetail = priceList?.find((sp) => sp.articleCode === spArticleCode
      && sp.packageName === defaultPackageName) || {};
    const selectedSideProfile = priceList?.find((sp) => sp.articleCode === spArticleCode
        && sp.packageName === packageName) || selectedSideProfileRetail;
    const spCost = selectedSideProfile?.price || 0;
    const spCostRetail = selectedSideProfileRetail?.price || 0;

    let spAmount = doorsAmount * 2;

    if (currentSystem === 'hinged') {
      spAmount = doorsAmount === 2 || doorsAmount === 3
        ? doorsAmount + 1
        : doorsAmount === 4
          ? doorsAmount + 2
          : doorsAmount;

      const sp2Amount = doorsAmount === 3 || doorsAmount === 4 ? 2 : 1;

      // Note: 419с is written in Cyrillic
      const sp2ArticleCode = `${aluminiumColorValue}-419с`;
      const verticalProfileRetail = priceList?.find((sp) => sp.articleCode === sp2ArticleCode
        && sp.packageName === defaultPackageName) || {};
      const verticalProfile = priceList?.find((sp) => sp.articleCode === sp2ArticleCode
        && sp.packageName === packageName) || verticalProfileRetail;
      const sp2Cost = verticalProfile?.price || 0;
      const sp2CostRetail = verticalProfileRetail?.price || 0;
      const sp2TotalPrice = +(sp2Amount * doorsHeightInMeters * sp2Cost).toFixed(2);

      if (_.isEmpty(verticalProfile)) {
        console.log(`verticalProfile ${sp2ArticleCode} is not found`);
      } else {
        specification.items.push({
          item: 'verticalProfile',
          amount: sp2Amount,
          size: doorsHeight,
          unitPrice: sp2Cost,
          itemTotalPrice: sp2TotalPrice,
          labelRu: verticalProfile?.labelRu || '',
          labelUk: verticalProfile?.labelUk || '',
          articleCode: sp2ArticleCode,
        });
        specification.totalPrice += sp2TotalPrice;
        specification.retailTotalPrice += +(sp2Amount * doorsHeightInMeters * sp2CostRetail).toFixed(2);
      }
    }

    const spTotalPrice = +(spAmount * doorsHeightInMeters * spCost).toFixed(2);

    if (_.isEmpty(selectedSideProfile)) {
      console.log(`sideProfile ${spArticleCode} is not found`);
    } else {
      specification.items.push({
        item: 'sideProfile',
        amount: spAmount,
        size: doorsHeight,
        unitPrice: spCost,
        itemTotalPrice: spTotalPrice,
        labelRu: selectedSideProfile?.labelRu || '',
        labelUk: selectedSideProfile?.labelUk || '',
        articleCode: spArticleCode,
      });
      specification.totalPrice += spTotalPrice;
      specification.retailTotalPrice += +(spAmount * doorsHeightInMeters * spCostRetail).toFixed(2);
    }

    /** Верхні Профілі */

    const tpArticleCode = `${aluminiumColorValue}-${topProfilesDependence.length
      ? topProfilesDependence[0] : defaultTopProfile}`;
    const topProfileRetail = priceList?.find((tp) => tp.articleCode === tpArticleCode
      && tp.packageName === defaultPackageName) || {};
    const topProfile = priceList?.find((tp) => tp.articleCode === tpArticleCode && tp.packageName === packageName)
      || topProfileRetail;

    const tpCostRetail = topProfileRetail?.price || 0;
    const tpCost = topProfile?.price || 0;
    const tpAmount = doorsAmount;
    const tpSize = horizontalProfilesSizeRaw; // * Changed from horizontalProfilesSizeUp to horizontalProfilesSizeRaw
    const tpTotalPrice = +(tpAmount * (horizontalProfilesSizeRaw / 1000) * tpCost).toFixed(2);

    if (_.isEmpty(topProfile)) console.log(`topProfile ${tpArticleCode} is not found`);

    specification.items.push({
      item: currentSystem === 'assembling' ? 'bottomProfile' : 'topProfile',
      amount: tpAmount,
      size: tpSize,
      unitPrice: tpCost,
      itemTotalPrice: tpTotalPrice,
      labelRu: topProfile?.labelRu || '',
      labelUk: topProfile?.labelUk || '',
      articleCode: tpArticleCode,
    });
    specification.totalPrice += tpTotalPrice;
    specification.retailTotalPrice += +(tpAmount * (horizontalProfilesSizeRaw / 1000) * tpCostRetail).toFixed(2);

    /** Нижні Профілі */

    const bpArticleCode = `${aluminiumColorValue}-${bottomProfilesDependence.length
      ? bottomProfilesDependence[0] : defaultBottomProfile}`;
    const bottomProfileRetail = priceList?.find((bp) => bp.articleCode === bpArticleCode
      && bp.packageName === defaultPackageName) || {};
    const bottomProfile = priceList?.find((bp) => bp.articleCode === bpArticleCode && bp.packageName === packageName)
      || bottomProfileRetail;
    const bpCostRetail = bottomProfileRetail?.price || 0;
    const bpCost = bottomProfile?.price || 0;
    const bpAmount = doorsAmount;
    const bpSize = horizontalProfilesSizeRaw; // * Changed from horizontalProfilesSizeUp to horizontalProfilesSizeRaw
    const bpTotalPrice = +(bpAmount * (horizontalProfilesSizeRaw / 1000) * bpCost).toFixed(2);
    const bpTotalPriceRetail = +(bpAmount * (horizontalProfilesSizeRaw / 1000) * bpCostRetail).toFixed(2);

    if (_.isEmpty(bottomProfile)) {
      console.log(`bottomProfile ${bpArticleCode} is not found`);
    } else {
      specification.items.push({
        item: 'bottomProfile',
        amount: bpAmount,
        size: bpSize,
        unitPrice: bpCost,
        itemTotalPrice: bpTotalPrice,
        labelRu: bottomProfile?.labelRu || '',
        labelUk: bottomProfile?.labelUk || '',
        articleCode: bpArticleCode,
      });
      specification.totalPrice += bpTotalPrice;
      specification.retailTotalPrice += bpTotalPriceRetail;
    }

    /** Направляючі Профілі (X4) */

    if (isX4ProfileOn) {
      let gpArticleCode = `${aluminiumColorValue}-${guidanceProfilesDependence.length
        ? guidanceProfilesDependence[0] : defaultGuidanceProfile}`;
      if (currentSystem === 'hinged') {
        gpArticleCode = guidanceProfilesDependence ? guidanceProfilesDependence[0] : '';
      }
      const guidanceProfileRetail = priceList?.find((gp) => gp.articleCode === gpArticleCode
        && gp.packageName === defaultPackageName) || {};
      const guidanceProfile = priceList?.find((gp) => gp.articleCode === gpArticleCode
        && gp.packageName === packageName) || guidanceProfileRetail;
      const gpCostRetail = guidanceProfileRetail?.price || 0;
      const gpCost = guidanceProfile?.price || 0;
      const gpAmount = 1;
      const gpTotalPrice = +(gpAmount * doorOpeningWidthInMeters * gpCost).toFixed(2);
      guidanceProfileSize = currentSystem === 'hinged'
        ? doorOpeningWidth - X14 * 2
        : isSlim ? doorOpeningWidth - 1 : doorOpeningWidth;

      if (_.isEmpty(guidanceProfile)) {
        console.log(`guidanceProfile ${gpArticleCode} is not found`);
      }

      specification.items.push({
        item: 'guidanceProfile',
        amount: gpAmount,
        size: guidanceProfileSize,
        unitPrice: gpCost,
        itemTotalPrice: gpTotalPrice,
        labelRu: guidanceProfile?.labelRu || '',
        labelUk: guidanceProfile?.labelUk || '',
        articleCode: gpArticleCode,
      });
      specification.totalPrice += gpTotalPrice;
      specification.retailTotalPrice += +(gpAmount * doorOpeningWidthInMeters * gpCostRetail).toFixed(2);
    }

    /**  Ходові Профілі або Резервні Ходові Профілі (X2) */

    if (isX2ProfileOn) {
      const shouldUseStandbyX2 = hasBottomLatchMechanism(doorsAndSections);
      let x2ArticleCode = `${aluminiumColorValue}-${shouldUseStandbyX2
        ? standbyCarriagesProfilesDependence[0] : carriageProfilesDependence[0]}`;
      if (currentSystem === 'assembling') {
        x2ArticleCode = carriageProfilesDependence ? carriageProfilesDependence[0] : '';
      }
      if (currentSystem === 'hinged') {
        x2ArticleCode = `${defaultAluminiumColor}-${shouldUseStandbyX2
          ? standbyCarriagesProfilesDependence[0] : carriageProfilesDependence[0]}`;
      }

      const x2ProfileRetail = priceList?.find((p) => p.articleCode === x2ArticleCode
        && p.packageName === defaultPackageName) || {};
      const x2Profile = priceList?.find((p) => p.articleCode === x2ArticleCode && p.packageName === packageName)
        || x2ProfileRetail;
      const x2CostRetail = x2ProfileRetail?.price || 0;
      const x2Cost = x2Profile?.price || 0;
      const x2Amount = 1;
      const x2TotalPrice = +(x2Amount * doorOpeningWidthInMeters * x2Cost).toFixed(2);
      let x2Size = isSlim ? doorOpeningWidth - 1 : doorOpeningWidth;
      if (currentSystem === 'hinged') x2Size = guidanceProfileSize;

      if (_.isEmpty(x2Profile)) console.log(`x2Profile ${x2ArticleCode} is not found`);

      specification.items.push({
        item: 'x2Profile',
        amount: x2Amount,
        size: x2Size,
        unitPrice: x2Cost,
        itemTotalPrice: x2TotalPrice,
        labelRu: x2Profile?.labelRu || '',
        labelUk: x2Profile?.labelUk || '',
        articleCode: x2ArticleCode,
      });
      specification.totalPrice += x2TotalPrice;
      specification.retailTotalPrice += +(x2Amount * doorOpeningWidthInMeters * x2CostRetail).toFixed(2);
    }

    /** З'єднувальні Профілі, Монтажні винти для них, Збірка дверей */

    // Монтажні винти додаються по 2 на кожен з'єднувальний профіль для:
    // 1. з'єднувальних профілів 31, 32, 231
    // 2. та для бокового профілю Slim (4шт - без секцій, з секціями - по 2 шт на з'єднувальний профіль)
    // Монтажні винти додаються по 4шт на двері для Складальної системи

    let cpCost = 0;
    let cpCostRetail = 0;
    let cpHorizontalAmount = 0;
    let cpStrengtheningAmount = 0;
    let cpVerticalAmount = 0;
    let assemblyScrewAmount = 0;
    let doorAssemblingAmount = 0;
    let connectingProfile = {}; // Connecting profile is the same for all doors
    let connectingProfileRetail = {};
    let cpArticleCode = '';
    let strainersAmount = 0;

    _.forEach(doors, (door) => {
      const {
        main: {
          connectingProfile: cProfile,
          directionOfSections: { value: directionOfSections },
          sectionsAmount: { value: sectionsAmount },
          isDoorAssemblingOn: { value: isDoorAssemblingOn },
        },
        sections,
      } = door;
      const cProfileValue = cProfile?.value;

      if (isDoorAssemblingOn) doorAssemblingAmount += 1;

      if ((isSlim && !sections.length) || hasOpeningSide(currentSystem)) assemblyScrewAmount += 4;

      if (!sections.length && currentSystem !== 'hinged') return;

      if (sections.length) {
        cpArticleCode = cProfileValue === 'Slim 03'
          ? `AS-${cProfileValue}` // use default color for Slim
          : aluminiumColorValue && cProfileValue
            ? `${aluminiumColorValue}-${cProfileValue}`
            : '';

        connectingProfileRetail = priceList?.find((cp) => cp.articleCode === cpArticleCode
          && cp.packageName === defaultPackageName) || {};
        connectingProfile = priceList?.find((cp) => cp.articleCode === cpArticleCode && cp.packageName === packageName)
          || connectingProfileRetail;

        cpCostRetail = connectingProfileRetail?.price || 0;
        cpCost = connectingProfile?.price || 0;

        if (_.isEmpty(connectingProfile)) {
          console.log(`connectingProfile ${cpArticleCode} is not found`);
        }
      }

      if (sections.length && directionOfSections === 'vertical') cpVerticalAmount += +sectionsAmount - 1;
      if (sections.length && directionOfSections === 'horizontal') cpHorizontalAmount += +sectionsAmount - 1;

      // Навісна: Якщо конкретна дверка не має 403, то по замовчуванні додаємо 2 шт 431 профілю до цієї дверки.
      // Якщо конкретна дверка має хоча б один 403, то 431 не додаємо до цїєї дверки взагалі.

      // якщо конкретна дверка поділена на дві секції 431-ою перемичкою,
      // то потрібно додавати лише 1 шт 431 для цієї дверки,
      // тобто умова "Якщо конкретна дверка не має 403, то по замовчуванні додаємо 2 шт 431 профілю до цієї дверки"
      // не застосовується для цього випадку
      if (currentSystem === 'hinged' && !sections.length) cpStrengtheningAmount += 2;

      if ((cProfileValue === '31' || cProfileValue === '32' || cProfileValue === '231') || isSlim) {
        assemblyScrewAmount += +(sections.length - 1) * 2;
      }
    });

    if (cpVerticalAmount && !_.isEmpty(connectingProfile)) {
      const cpSize = doorsHeight + 2 - X12H - hiddingTopSize - hiddingBottomSize;
      const cpVerticalTotalPrice = +(cpVerticalAmount * (cpSize / 1000) * cpCost).toFixed(2);

      specification.items.push({
        item: 'connectingProfile',
        amount: cpVerticalAmount,
        size: cpSize,
        unitPrice: cpCost,
        itemTotalPrice: cpVerticalTotalPrice,
        labelRu: connectingProfile?.labelRu || '',
        labelUk: connectingProfile?.labelUk || '',
        articleCode: cpArticleCode,
      });
      specification.totalPrice += cpVerticalTotalPrice;
      specification.retailTotalPrice += +(cpVerticalAmount * (cpSize / 1000) * cpCostRetail).toFixed(2);
    }

    if (cpHorizontalAmount && !_.isEmpty(connectingProfile)) {
      let cpSize = horizontalProfilesSizeRaw; // * Changed from horizontalProfilesSizeUp to horizontalProfilesSizeRaw
      if (isSlim) cpSize = doorsWidth;

      const cpHorizontalTotalPrice = +(cpHorizontalAmount * (horizontalProfilesSizeRaw / 1000) * cpCost).toFixed(2);

      specification.items.push({
        item: 'connectingProfile',
        amount: cpHorizontalAmount,
        size: cpSize,
        unitPrice: cpCost,
        itemTotalPrice: cpHorizontalTotalPrice,
        labelRu: connectingProfile?.labelRu || '',
        labelUk: connectingProfile?.labelUk || '',
        articleCode: cpArticleCode,
      });
      specification.totalPrice += cpHorizontalTotalPrice;
      specification.retailTotalPrice += +(cpHorizontalAmount * (horizontalProfilesSizeRaw / 1000) * cpCostRetail)
        .toFixed(2);
    }

    // Підсилюючий 431 профіль
    if (cpStrengtheningAmount) {
      const cpStrengtheningArticleCode = `${aluminiumColorValue}-431`;
      const cpStrengtheningRetail = priceList?.find((cp) => cp.articleCode === cpStrengtheningArticleCode
        && cp.packageName === defaultPackageName) || {};
      const cpStrengthening = priceList?.find((cp) => cp.articleCode === cpStrengtheningArticleCode
        && cp.packageName === packageName) || cpStrengtheningRetail;
      const cpStrengtheningCostRetail = cpStrengtheningRetail?.price || 0;
      const cpStrengtheningCost = cpStrengthening?.price || 0;
      const cpStrengtheningTotalPrice = +(cpStrengtheningAmount * (horizontalProfilesSizeRaw / 1000)
        * cpStrengtheningCost).toFixed(2);

      specification.items.push({
        item: 'connectingProfile',
        amount: cpStrengtheningAmount,
        size: horizontalProfilesSizeDown,
        unitPrice: cpStrengtheningCost,
        itemTotalPrice: cpStrengtheningTotalPrice,
        labelRu: cpStrengthening?.labelRu || '',
        labelUk: cpStrengthening?.labelUk || '',
        articleCode: cpStrengtheningArticleCode,
      });
      specification.totalPrice += cpStrengtheningTotalPrice;
      specification.retailTotalPrice += +(cpStrengtheningAmount * (horizontalProfilesSizeRaw / 1000)
        * cpStrengtheningCostRetail).toFixed(2);
    }

    /** Нижні Профілі для Slim (в залежності від наявності / відстутності з'єднувальних профілів) */

    // Додаються 2 додаткових Нижніх Профіля якщо не має поділу на секції
    // Довжина додаткового нижнього профілю === довжині дверей
    // Додаються по 1 додатковому Нижньому Профілю на з'єднувальний профіль якщо є секції

    if (isSlim && !_.isEmpty(bottomProfile)) {
      _.forEach(doors, (door) => {
        const { sections } = door;
        const bpSizeSlim = horizontalProfilesSizeUp; // * Changed from horizontalProfilesSizeDown to horizontalProfilesSizeUp

        // Нижні Профілі для Slim (є секції)
        if (sections.length) {
          const bpAmountSlim = sections.length - 1;
          const itemTotalPrice = +(bpAmountSlim * (horizontalProfilesSizeRaw / 1000) * bpCost).toFixed(2);

          specification.items.push({
            item: 'bottomProfile',
            amount: bpAmountSlim,
            size: bpSizeSlim,
            unitPrice: bpCost,
            itemTotalPrice,
            labelRu: bottomProfile?.labelRu || '',
            labelUk: bottomProfile?.labelUk || '',
            articleCode: bpArticleCode,
          });
          specification.totalPrice += bpTotalPrice;
          specification.retailTotalPrice += bpTotalPriceRetail;
          return;
        }

        // Нижні Профілі для Slim (без секцій)
        const bpAmountSlim = 2;
        const itemTotalPrice = +(bpAmountSlim * (horizontalProfilesSizeRaw / 1000) * bpCost).toFixed(2);

        specification.items.push({
          item: 'bottomProfile',
          amount: bpAmountSlim,
          size: bpSizeSlim,
          unitPrice: bpCost,
          itemTotalPrice,
          labelRu: bottomProfile?.labelRu || '',
          labelUk: bottomProfile?.labelUk || '',
          articleCode: bpArticleCode,
        });
        specification.totalPrice += itemTotalPrice;
        specification.retailTotalPrice += +(bpAmountSlim * (horizontalProfilesSizeRaw / 1000) * bpCostRetail)
          .toFixed(2);
      });
    }

    /** Монтажні винти */

    if (assemblyScrewAmount) {
      const assemblyScrewRetail = priceList?.find((cp) => cp.articleCode === defaultAssemblyScrew
        && cp.packageName === defaultPackageName) || {};
      const assemblyScrew = priceList?.find((cp) => cp.articleCode === defaultAssemblyScrew
          && cp.packageName === packageName) || assemblyScrewRetail;
      const assemblyScrewPrice = assemblyScrew?.price || 0;
      const assemblyScrewPriceRetail = assemblyScrewRetail?.price || 0;
      const assemblyScrewTotalPrice = +(assemblyScrewPrice * assemblyScrewAmount).toFixed(2);

      specification.items.push({
        item: 'assemblyScrew',
        amount: assemblyScrewAmount,
        unitPrice: assemblyScrewPrice,
        itemTotalPrice: assemblyScrewTotalPrice,
        labelRu: assemblyScrew?.labelRu || '',
        labelUk: assemblyScrew?.labelUk || '',
        articleCode: defaultAssemblyScrew,
      });
      specification.totalPrice += assemblyScrewTotalPrice;
      specification.retailTotalPrice += +(assemblyScrewPriceRetail * assemblyScrewAmount).toFixed(2);
    }

    /** Ущільнювачі для скла, дзеркала та лакобелі. Для Slim не додаються */

    if (!isSlim) {
      // Note: Sealing is always default
      const sealingRetail = priceList?.find((s) => s.articleCode === defaultSealing
        && s.packageName === defaultPackageName) || {};
      const sealing = priceList?.find((s) => s.articleCode === defaultSealing && s.packageName === packageName)
        || sealingRetail;
      const sealingCostRetail = sealingRetail?.price || 0;
      const sealingCost = sealing?.price || 0;
      let sealingSize = 0;

      _.forEach(doors, (door) => {
        const {
          main: { filling: doorFiling },
          sections,
        } = door;
        const isChipboardDoor = isChipboard(doorFiling);

        const doorFillingH = isChipboardDoor
          ? +(doorFillingHeightForChipboard).toFixed(2)
          : +(doorFillingHeight).toFixed(2);
        const doorFillingW = isChipboardDoor
          ? +(doorFillingWidthForChipboard).toFixed(2)
          : +(doorFillingWidth).toFixed(2);

        // Sealing for door sections
        if (sections.length) {
          _.forEach(sections, (section) => {
            const {
              filling,
              fillingHeight: { value: fillingHeight = 1 },
              fillingWidth: { value: fillingWidth = 1 },
            } = section;

            if (_.isEmpty(filling)
              || !(filling?.material === 'mirror'
                || filling?.material === 'glass'
                || filling?.material === 'lacobel'
                || filling?.customersOption === 'glass')
            ) return;
            sealingSize += fillingHeight * 2 + fillingWidth * 2;
          });
        } else {
          // Sealing for the door without sections

          if (_.isEmpty(doorFiling)
            || !(doorFiling?.material === 'mirror'
              || doorFiling?.material === 'glass'
              || doorFiling?.material === 'lacobel'
              || doorFiling?.customersOption === 'glass')
          ) return;
          sealingSize += doorFillingH * 2 + doorFillingW * 2;
        }
      });

      if (sealingSize) {
        const sealingTotalPrice = +((sealingSize / 1000) * sealingCost).toFixed(2);

        specification.items.push({
          item: 'sealing',
          amount: 1,
          size: sealingSize,
          unitPrice: sealingCost,
          itemTotalPrice: sealingTotalPrice,
          labelRu: sealing?.labelRu || '',
          labelUk: sealing?.labelUk || '',
          articleCode: defaultSealing,
        });
        specification.totalPrice += sealingTotalPrice;
        specification.retailTotalPrice += +((sealingSize / 1000) * sealingCostRetail).toFixed(2);
      }
    }

    /** Щітка */

    if (currentSystem !== 'hinged') {
      const brushAmount = 1;
      const brush = brushes.find((br) => br.aluminiumColor === aluminiumColorValue
        && br.sideProfile === sideProfileValue);
      const brushArticleCode = brush?.articleCode || '';
      const brushFromPriceListRetail = priceList?.find((br) => br.articleCode === brushArticleCode
        && br.packageName === defaultPackageName) || {};
      const brushFromPriceList = priceList?.find((br) => br.articleCode === brushArticleCode
        && br.packageName === packageName) || brushFromPriceListRetail;
      const brushCost = +brushFromPriceList?.price || 0;
      const brushCostRetail = +brushFromPriceListRetail?.price || 0;
      const brushSize = spAmount * doorsHeight;
      const brushTotalPrice = +(brushAmount * (brushSize / 1000) * brushCost).toFixed(2);

      if (!brushArticleCode) {
        console.log(`brush ${brushArticleCode} is not found`);
      }

      specification.items.push({
        item: 'brush',
        amount: brushAmount,
        size: brushSize,
        unitPrice: brushCost,
        itemTotalPrice: brushTotalPrice,
        labelRu: brushFromPriceList?.labelRu,
        labelUk: brushFromPriceList?.labelUk,
        articleCode: brushArticleCode,
      });
      specification.totalPrice += brushTotalPrice;
      specification.retailTotalPrice += +(brushAmount * (brushSize / 1000) * brushCostRetail).toFixed(2);
    }

    /** Стяжки */

    if (currentSystem === 'hinged') {
      const strainerFromPriceListRetail = priceList?.find((item) => item.articleCode === defaultStrainer
        && item.packageName === defaultPackageName) || {};
      const strainerFromPriceList = priceList?.find((item) => item.articleCode === defaultStrainer
        && item.packageName === packageName) || strainerFromPriceListRetail;
      const strainerCostRetail = +strainerFromPriceListRetail?.price || 0;
      const strainerCost = +strainerFromPriceList?.price || 0;

      if (!strainerFromPriceList) {
        console.log(`strainer ${defaultStrainer} is not found`);
        return;
      }

      _.forEach(doors, (door) => {
        const { sections, main } = door;
        const cpValue = main?.connectingProfile?.value;
        strainersAmount += 6; // 4 for top profile and 2 for bottom profile

        // якщо є 403 зєднувальний профіль, то 2 стяжки до профілю
        // якщо є 431 підсилюючий профіль, то 2 стяжки до профілю
        if (sections.length && (cpValue === '403' || cpValue === '431')) {
          strainersAmount += (sections.length - 1) * 2; // per 2 for connecting profile
        }
      });

      // якщо є 431 підсилюючий профіль, то 2 стяжки до профілю
      if (cpStrengtheningAmount) strainersAmount += cpStrengtheningAmount * 2;

      const strainersTotalPrice = +(strainersAmount * strainerCost).toFixed(2);

      specification.items.push({
        item: 'strainer',
        amount: strainersAmount,
        size: 0,
        unitPrice: strainerCost,
        itemTotalPrice: strainersTotalPrice,
        labelRu: strainerFromPriceList?.labelRu,
        labelUk: strainerFromPriceList?.labelUk,
        articleCode: defaultStrainer,
      });
      specification.totalPrice += strainersTotalPrice;
      specification.retailTotalPrice += +(strainersAmount * strainerCostRetail).toFixed(2);
    }

    /** Механізми (Кріплення) */

    const mechanismArticleCode = mechanism?.value;
    const aMechanismRetail = priceList?.find((m) => m.articleCode === mechanismArticleCode
      && m.packageName === defaultPackageName) || {};
    const mechanismCostRetail = aMechanismRetail?.price || 0;
    const aMechanism = priceList?.find((m) => m.articleCode === mechanismArticleCode && m.packageName === packageName)
      || aMechanismRetail;
    const mechanismCost = aMechanism?.price || 0;

    let mechanismAmount = doorsAmount;
    if (currentSystem === 'assembling') mechanismAmount = doorsAmount / 2;
    if (currentSystem === 'hinged') mechanismAmount = doorsAmount === 4 ? 2 : 1;

    const mechanismTotalPrice = +(mechanismCost * mechanismAmount).toFixed(2);

    if (_.isEmpty(aMechanism)) {
      console.log(`mechanism ${mechanismArticleCode} is not found`);
    }

    if (!_.isEmpty(aMechanism)) {
      specification.items.push({
        item: 'mechanism',
        amount: mechanismAmount,
        size: 0,
        unitPrice: mechanismCost,
        itemTotalPrice: mechanismTotalPrice,
        labelRu: aMechanism?.labelRu || '',
        labelUk: aMechanism?.labelUk || '',
        articleCode: mechanismArticleCode,
      });
      specification.totalPrice += mechanismTotalPrice;
      specification.retailTotalPrice += +(mechanismCostRetail * mechanismAmount).toFixed(2);
    }

    // Additional mechanisms for assembling system
    if (currentSystem === 'assembling') {
      const additionalMechanismRetail = priceList?.find((m) => m.articleCode === assemblingAdditionalMechanism
        && m.packageName === defaultPackageName) || {};
      const additionalMechanism = priceList?.find((m) => m.articleCode === assemblingAdditionalMechanism
        && m.packageName === packageName) || additionalMechanismRetail;
      const additionalMechanismCost = additionalMechanism?.price || 0;
      const additionalMechanismCostRetail = additionalMechanismRetail?.price || 0;
      const additionalMechanismTotalPrice = +(additionalMechanismCost * mechanismAmount).toFixed(2);

      if (_.isEmpty(additionalMechanism)) {
        console.log(`mechanism ${assemblingAdditionalMechanism} is not found`);
      }

      if (!_.isEmpty(additionalMechanism)) {
        specification.items.push({
          item: 'mechanism',
          amount: mechanismAmount,
          size: 0,
          unitPrice: additionalMechanismCost,
          itemTotalPrice: additionalMechanismTotalPrice,
          labelRu: additionalMechanism?.labelRu || '',
          labelUk: additionalMechanism?.labelUk || '',
          articleCode: assemblingAdditionalMechanism,
        });
        specification.totalPrice += additionalMechanismTotalPrice;
        specification.retailTotalPrice += +(additionalMechanismCostRetail * mechanismAmount).toFixed(2);
      }
    }

    if (currentSystem === 'hinged' && isMiddleDoorMechanismOn) {
      const middleMechanismRetail = priceList?.find((m) => m.articleCode === hingedMiddleDoorMechanism
        && m.packageName === defaultPackageName) || {};
      const middleMechanism = priceList?.find((m) => m.articleCode === hingedMiddleDoorMechanism
        && m.packageName === packageName) || middleMechanismRetail;
      const hingedMiddleDoorMechanismCost = middleMechanism?.price ? +(middleMechanism.price).toFixed(2) : 0;
      const hingedMechanismCostRetail = middleMechanism?.price ? +(middleMechanism.price).toFixed(2) : 0;

      if (!_.isEmpty(middleMechanism)) {
        specification.items.push({
          item: 'mechanism',
          amount: 1,
          size: 0,
          unitPrice: hingedMiddleDoorMechanismCost,
          itemTotalPrice: hingedMiddleDoorMechanismCost,
          labelRu: middleMechanism?.labelRu || '',
          labelUk: middleMechanism?.labelUk || '',
          articleCode: hingedMiddleDoorMechanism,
        });
        specification.totalPrice += hingedMiddleDoorMechanismCost;
        specification.retailTotalPrice += hingedMechanismCostRetail;
      }
    }

    /** Дотяги дверей */

    let topLatchMechanismAmount = 0;
    let bottomLatchMechanismAmount = 0;

    const topDoorLatchMechanismRetail = priceList?.find((m) => m.articleCode === topDoorLatchMechanism
      && m.packageName === defaultPackageName) || {};
    const topLatchMechanismCostRetail = topDoorLatchMechanismRetail?.price || 0;

    const topDoorLatchMechanismDoc = priceList?.find((m) => m.articleCode === topDoorLatchMechanism
        && m.packageName === packageName) || topDoorLatchMechanismRetail;
    const topLatchMechanismCost = topDoorLatchMechanismDoc?.price || 0;

    const bottomDoorLatchMechanismRetail = priceList?.find((m) => m.articleCode === bottomDoorLatchMechanism
      && m.packageName === defaultPackageName) || {};
    const bottomLatchMechanismCostRetail = bottomDoorLatchMechanismRetail?.price || 0;

    const bottomDoorLatchMechanismDoc = priceList?.find((m) => m.articleCode === bottomDoorLatchMechanism
        && m.packageName === packageName) || bottomDoorLatchMechanismRetail;
    const bottomLatchMechanismCost = bottomDoorLatchMechanismDoc?.price || 0;

    _.forEach(doors, (door) => {
      const {
        main: {
          doorLatchMechanism,
          doorLatchMechanismPosition: latchMechanismPosition,
          isDoorLatchMechanismOn,
        },
      } = door;

      const doorLatchMechanismArticleCode = isDoorLatchMechanismOn?.value ? doorLatchMechanism?.value : '';
      const doorLatchMechanismPosition = latchMechanismPosition?.value || '';

      if (doorLatchMechanismArticleCode === topDoorLatchMechanism) {
        topLatchMechanismAmount += doorLatchMechanismPosition === 'both-sides' ? 2 : 1;
      }
      if (doorLatchMechanismArticleCode === bottomDoorLatchMechanism) {
        bottomLatchMechanismAmount += doorLatchMechanismPosition === 'both-sides' ? 2 : 1;
      }
    });

    if (topLatchMechanismAmount) {
      const topLatchMechanismTotalPrice = +(topLatchMechanismAmount * topLatchMechanismCost).toFixed(2);

      specification.items.push({
        item: 'doorLatchMechanism',
        amount: topLatchMechanismAmount,
        size: 0,
        unitPrice: topLatchMechanismCost,
        itemTotalPrice: topLatchMechanismTotalPrice,
        labelRu: topDoorLatchMechanismDoc?.labelRu || '',
        labelUk: topDoorLatchMechanismDoc?.labelUk || '',
        articleCode: topDoorLatchMechanism,
      });
      specification.totalPrice += topLatchMechanismTotalPrice;
      specification.retailTotalPrice += +(topLatchMechanismAmount * topLatchMechanismCostRetail).toFixed(2);
    }

    if (bottomLatchMechanismAmount) {
      const bottomLatchMechanismTotalPrice = +(bottomLatchMechanismAmount * bottomLatchMechanismCost).toFixed(2);

      specification.items.push({
        item: 'doorLatchMechanism',
        amount: bottomLatchMechanismAmount,
        size: 0,
        unitPrice: bottomLatchMechanismCost,
        itemTotalPrice: bottomLatchMechanismTotalPrice,
        labelRu: bottomDoorLatchMechanismDoc?.labelRu || '',
        labelUk: bottomDoorLatchMechanismDoc?.labelUk || '',
        articleCode: bottomDoorLatchMechanism,
      });
      specification.totalPrice += bottomLatchMechanismTotalPrice;
      specification.retailTotalPrice += +(bottomLatchMechanismAmount * bottomLatchMechanismCostRetail).toFixed(2);
    }

    /** Стопор */

    if (currentSystem === 'extendable' && isStopperOn) {
      const stopperToAdd = stopper || defaultStopper;
      const stopperRetail = priceList?.find((s) => s.articleCode === stopperToAdd
        && s.packageName === defaultPackageName) || {};
      const stopperDoc = priceList?.find((s) => s.articleCode === stopperToAdd && s.packageName === packageName)
        || stopperRetail;
      const stopperCost = +stopperDoc?.price || 0;
      const stopperCostRetail = +stopperRetail?.price || 0;
      const stopperTotalPrice = +(doorsAmount * stopperCost).toFixed(2);

      specification.items.push({
        item: 'stopper',
        amount: doorsAmount,
        size: 0,
        unitPrice: stopperCost,
        itemTotalPrice: stopperTotalPrice,
        labelRu: stopperDoc?.labelRu || '',
        labelUk: stopperDoc?.labelUk || '',
        articleCode: stopperToAdd,
      });
      specification.totalPrice += stopperTotalPrice;
      specification.retailTotalPrice += +(doorsAmount * stopperCostRetail).toFixed(2);
    }

    /** Заглушка до нижньої направляючої */

    if (currentSystem === 'extendable' && aluminiumColorValue === defaultAluminiumColor
      && !_.some(['219', '119-L', '119-v.p.'], (sp) => sp === sideProfileValue)) {
      const bungAmount = 1;
      const bungRetail = priceList?.find((s) => s.articleCode === defaultBung && s.packageName === defaultPackageName)
        || {};
      const bungDoc = priceList?.find((s) => s.articleCode === defaultBung && s.packageName === packageName)
        || bungRetail;
      const bungCost = +bungDoc?.price || 0;
      const bungCostRetail = +bungRetail?.price || 0;
      const bungTotalPrice = +(bungCost * (guidanceProfileSize / 1000) * bungAmount).toFixed(2);

      if (!_.isEmpty(bungDoc)) {
        specification.items.push({
          item: 'bung',
          amount: bungAmount,
          size: guidanceProfileSize,
          unitPrice: bungCost,
          itemTotalPrice: bungTotalPrice,
          labelRu: bungDoc?.labelRu || '',
          labelUk: bungDoc?.labelUk || '',
          articleCode: defaultBung,
        });
        specification.totalPrice += bungTotalPrice;
        specification.retailTotalPrice += +(doorsAmount * bungCostRetail).toFixed(2);
      }
    }

    /** Робота */

    const cpVerticalAssembling = cpVerticalAmount ? cpVerticalAmount * 30 : 0;
    const cpHorizontalAssembling = cpHorizontalAmount ? cpHorizontalAmount * 10 : 0;

    let doorAssemblingUnitPrice = 0;

    // Сума за роботу з урах-ням к-ті дверей за пакет Розничная (defaultPackageName) >>
    const doorAssemblingUnitPriceForRetailTotalPrice = 50;
    const doorAssemblingTotalFRTP = doorAssemblingUnitPriceForRetailTotalPrice && doorAssemblingAmount
      ? +(doorAssemblingUnitPriceForRetailTotalPrice * doorAssemblingAmount).toFixed(2)
      : 0;
    const workSummaryFRTP = +(doorAssemblingTotalFRTP + cpVerticalAssembling + cpHorizontalAssembling).toFixed(2);
    // Сума за роботу з урах-ням к-ті дверей за пакет Розничная (defaultPackageName) <<

    if (currentSystem === 'extendable' || currentSystem === 'monorail') {
      if (sideProfileValue === 'Slim') {
        doorAssemblingUnitPrice = 250;
      }
      if (sideProfileValue === '207' || sideProfileValue === '220') {
        doorAssemblingUnitPrice = 100;
      }
      if (
        (sideProfileValue !== '207' && sideProfileValue !== '220' && sideProfileValue !== 'Slim')
        && packageName === defaultPackageName
      ) {
        doorAssemblingUnitPrice = 50;
      }
    }

    if (currentSystem === 'hinged') doorAssemblingUnitPrice = 250;

    if (currentSystem === 'opening' || currentSystem === 'assembling') {
      if (packageName === defaultPackageName) {
        doorAssemblingUnitPrice = 50;
      }
    }

    const doorAssemblingTotal = doorAssemblingUnitPrice && doorAssemblingAmount
      ? +(doorAssemblingUnitPrice * doorAssemblingAmount).toFixed(2)
      : 0;

    const workSummary = +(doorAssemblingTotal + cpVerticalAssembling + cpHorizontalAssembling).toFixed(2);

    if (workSummary) {
      specification.items.push({
        item: 'work',
        amount: 1,
        size: 0,
        unitPrice: workSummary,
        itemTotalPrice: workSummary,
        labelRu: 'Сборка',
        labelUk: 'Збірка',
        articleCode: '',
      });
      specification.totalPrice += workSummary;
      specification.retailTotalPrice += workSummary;
    }
    if (!workSummary) {
      specification.retailTotalPrice += workSummaryFRTP;
    }

    /** Наповнення та Послуги до Наповнення  */

    let millingSize = 0;

    _.forEach(doors, (door, doorIndex) => {
      const {
        main: { filling: doorFiling, texture: doorTexture },
        sections,
      } = door;

      const isChipboardDoor = isChipboard(doorFiling);

      const hasPlanishingDoor = isSlim
        && (doorFiling?.material === 'mirror' || doorFiling?.material === 'glass'
        || doorFiling?.material === 'lacobel');

      /**
       * Calculate door filling without sections
       */

      if (!sections.length) {
        if (_.isEmpty(doorFiling) || !doorFiling.material) return;

        const fillingArticleCode = doorFiling.mirrorType || doorFiling.lacobelType
          || doorFiling.glassType || doorFiling.dspOption;
        const fillingItemWithPriceRetail = priceList?.find((f) => f.articleCode === fillingArticleCode
          && f.packageName === defaultPackageName) || {};
        const fillingItemWithPrice = priceList?.find((f) => f.articleCode === fillingArticleCode
          && f.packageName === packageName) || fillingItemWithPriceRetail;
        const fillingItem = fillingConfig?.find((m) => m.articleCode === fillingArticleCode) || {};
        const doorFillingH = isChipboardDoor
          ? +(doorFillingHeightForChipboard).toFixed(2)
          : +(doorFillingHeight).toFixed(2);
        const doorFillingW = isChipboardDoor
          ? +(doorFillingWidthForChipboard).toFixed(2)
          : +(doorFillingWidth).toFixed(2);
        const doorArea = +(doorFillingW * doorFillingH).toFixed(2);
        const textureD = isChipboardDoor ? doorTexture?.value : '';

        // Calculate milling size for our chipboard > 10mm or for custom chipboard
        const chipboardThickness = fillingItem?.chipboardThickness
          ? +(fillingItem.chipboardThickness)?.match(/([0-9]+[, .]?)+/)[0]
          : 0;
        if ((doorFiling?.dspOption && +chipboardThickness > 10)
          || (doorFiling?.customersOption === 'dsp-large' && doorFiling?.isMilling)) {
          const chipboardPerimeter = +(doorFillingWidthForChipboard * 2 + doorFillingHeightForChipboard * 2).toFixed(2);
          millingSize += chipboardPerimeter;
        }

        /** Filling Item */

        // Custom filling
        if (doorFiling?.material === 'customers') {
          const isGlass = doorFiling.customersOption === 'glass';
          const isLargeChipboard = doorFiling.customersOption === 'dsp-large';

          const labelRu = isGlass ? 'Стекло' : isLargeChipboard ? 'ДСП 10+мм' : 'ДСП 10мм';
          const labelUk = isGlass ? 'Скло' : isLargeChipboard ? 'ДСП 10+мм' : 'ДСП 10мм';

          // Should be shown in specification (with no price)
          specification.items.push({
            item: 'filling',
            amount: 1,
            size: doorArea,
            height: doorFillingH,
            width: doorFillingW,
            labelRu: `Материал заказчика: ${labelRu}`,
            labelUk: `Матеріал замовника: ${labelUk}`,
            articleCode: 'custom',
            unitPrice: 0,
            itemTotalPrice: 0,
            position: { doorIndex },
            texture: '',
          });
          return;
        }

        const doorFilingItemUnitPriceRetail = fillingItemWithPriceRetail?.price || 0;
        const doorFilingItemUnitPrice = fillingItemWithPrice?.price || 0;
        const doorFilingItemTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * doorFilingItemUnitPrice)
          .toFixed(2);

        specification.items.push({
          item: 'filling',
          amount: 1,
          size: doorArea,
          height: doorFillingH,
          width: doorFillingW,
          unitPrice: doorFilingItemUnitPrice,
          itemTotalPrice: doorFilingItemTotalPrice,
          labelRu: fillingItem?.labelRu,
          labelUk: fillingItem?.labelUk,
          articleCode: fillingArticleCode,
          position: { doorIndex },
          texture: textureD,
        });
        specification.totalPrice += doorFilingItemTotalPrice;
        specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
          * doorFilingItemUnitPriceRetail).toFixed(2);

        /** Additional Supplements */

        /** Ультрафіолетовий друк - ДСП */

        if (doorFiling?.isDspUVPrinting) {
          const chipboardUvPrintArticleCode = doorFiling?.dspUvPrintType?.startsWith('print_uv_wcb')
            ? 'print_uv_wcb'
            : doorFiling?.dspUvPrintType;
          const chipboardLayersAmount = chipboardUvPrintArticleCode === 'print_uv_wcb'
            && doorFiling?.dspUvPrintType?.length > chipboardUvPrintArticleCode.length
            ? doorFiling.dspUvPrintType.substr(doorFiling.dspUvPrintType.length - 1)
            : 1;
          const chipboardUvPrintTypeRetail = priceList?.find((c) => c.articleCode === chipboardUvPrintArticleCode
            && c.packageName === defaultPackageName) || {};
          const chipboardUvPrintType = priceList?.find((c) => c.articleCode === chipboardUvPrintArticleCode
            && c.packageName === packageName) || chipboardUvPrintTypeRetail;

          if (!_.isEmpty(chipboardUvPrintType)) {
            const chipboardUvPrintUnitPriceRetail = chipboardUvPrintTypeRetail?.price || 0;
            const chipboardUvPrintUnitPrice = chipboardUvPrintType?.price || 0;
            const chipboardUvPrintTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2)
              * chipboardLayersAmount * chipboardUvPrintUnitPrice).toFixed(2);
            const chipboardUvPrintTotalPriceRetail = +((doorArea / squareMillimetersValue).toFixed(2)
              * chipboardLayersAmount * chipboardUvPrintUnitPriceRetail).toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: chipboardUvPrintUnitPrice,
              itemTotalPrice: chipboardUvPrintTotalPrice,
              labelRu: `${chipboardUvPrintType?.labelRu} ${chipboardLayersAmount} шаров`,
              labelUk: `${chipboardUvPrintType?.labelUk} ${chipboardLayersAmount} шарів`,
              articleCode: chipboardUvPrintArticleCode,
              position: { doorIndex },
            });
            specification.totalPrice += chipboardUvPrintTotalPrice;
            specification.retailTotalPrice += chipboardUvPrintTotalPriceRetail;
          } else { console.log(`Error: dspUvPrintType ${chipboardUvPrintArticleCode} is not found`); }
        }

        /** Ультрафіолетовий друк - Дзеркало */

        if (doorFiling?.isMirrorUVPrinting) {
          const mirrorUvPrintTypeRetail = priceList?.find((m) => m.articleCode === doorFiling?.mirrorUvPrintType
            && m.packageName === defaultPackageName) || {};

          const mirrorUvPrintType = priceList?.find((m) => m.articleCode === doorFiling?.mirrorUvPrintType
            && m.packageName === packageName) || mirrorUvPrintTypeRetail;

          if (!_.isEmpty(mirrorUvPrintType)) {
            const mirrorUvPrintUnitPriceRetail = mirrorUvPrintTypeRetail?.price || 0;
            const mirrorUvPrintUnitPrice = mirrorUvPrintType?.price || 0;
            const mirrorUvPrintTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * mirrorUvPrintUnitPrice)
              .toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: mirrorUvPrintUnitPrice,
              itemTotalPrice: mirrorUvPrintTotalPrice,
              labelRu: mirrorUvPrintType?.labelRu,
              labelUk: mirrorUvPrintType?.labelUk,
              articleCode: doorFiling?.mirrorUvPrintType,
              position: { doorIndex },
            });
            specification.totalPrice += mirrorUvPrintTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
              * mirrorUvPrintUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: mirrorUvPrintType ${doorFiling?.mirrorUvPrintType} is not found`); }
        }

        /** Ультрафіолетовий друк - Скло */

        if (doorFiling?.isGlassUVPrinting) {
          const glassUvPrintTypeRetail = priceList?.find((g) => g.articleCode === doorFiling?.glassUvPrintType
              && g.packageName === defaultPackageName) || {};
          const glassUvPrintType = priceList?.find((g) => g.articleCode === doorFiling?.glassUvPrintType
            && g.packageName === packageName) || glassUvPrintTypeRetail;
          const glassUvPrintUnitPriceRetail = glassUvPrintTypeRetail?.price || 0;
          const glassUvPrintUnitPrice = glassUvPrintType?.price || 0;
          const glassUvPrintTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * glassUvPrintUnitPrice)
            .toFixed(2);

          if (!_.isEmpty(glassUvPrintType)) {
            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: glassUvPrintUnitPrice,
              itemTotalPrice: glassUvPrintTotalPrice,
              labelRu: glassUvPrintType?.labelRu,
              labelUk: glassUvPrintType?.labelUk,
              articleCode: doorFiling?.glassUvPrintType,
              position: { doorIndex },
            });
            specification.totalPrice += glassUvPrintTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
              * glassUvPrintUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: glassUvPrintType ${doorFiling?.glassUvPrintType} is not found`); }
        }

        /** Ультрафіолетовий друк - Лакобель */

        if (doorFiling?.isLacobelUVPrinting) {
          const lacobelUvPrintTypeRetail = priceList?.find((l) => l.articleCode === doorFiling?.lacobelUvPrintType
            && l.packageName === defaultPackageName) || {};
          const lacobelUvPrintType = priceList?.find((l) => l.articleCode === doorFiling?.lacobelUvPrintType
            && l.packageName === packageName) || lacobelUvPrintTypeRetail;
          const lacobelUvPrintUnitPriceRetail = lacobelUvPrintTypeRetail?.price || 0;
          const lacobelUvPrintUnitPrice = lacobelUvPrintType?.price || 0;
          const lacobelUvPrintTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * lacobelUvPrintUnitPrice)
            .toFixed(2);

          if (!_.isEmpty(lacobelUvPrintType)) {
            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: lacobelUvPrintUnitPrice,
              itemTotalPrice: lacobelUvPrintTotalPrice,
              labelRu: lacobelUvPrintType?.labelRu,
              labelUk: lacobelUvPrintType?.labelUk,
              articleCode: doorFiling?.lacobelUvPrintType,
              position: { doorIndex },
            });
            specification.totalPrice += lacobelUvPrintTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
              * lacobelUvPrintUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: lacobelUvPrintType ${doorFiling?.lacobelUvPrintType} is not found`); }
        }

        /** Матування по трафарету */

        if (doorFiling?.isMirrorMatted || doorFiling?.isGlassMatted || doorFiling?.isLacobelMatted) {
          const mattedArticleCode = 'sten_mat';
          const mattedItemRetail = priceList?.find((m) => m.articleCode === mattedArticleCode
            && m.packageName === defaultPackageName) || {};
          const mattedItem = priceList?.find((m) => m.articleCode === mattedArticleCode
            && m.packageName === packageName) || mattedItemRetail;

          if (_.isEmpty(mattedItem)) {
            console.log(`Error: ${mattedArticleCode} is not found`);
            return;
          }

          const mattedItemUnitPrice = mattedItem.price || 0;
          const mattedItemUnitPriceRetail = mattedItemRetail.price || 0;
          const mattedItemTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * mattedItemUnitPrice)
            .toFixed(2);

          specification.items.push({
            item: 'fillingFeature',
            amount: 1,
            size: doorArea,
            height: doorFillingH,
            width: doorFillingW,
            unitPrice: mattedItemUnitPrice,
            itemTotalPrice: mattedItemTotalPrice,
            labelRu: mattedItem?.labelRu,
            labelUk: mattedItem?.labelUk,
            articleCode: mattedArticleCode,
            position: { doorIndex },
          });
          specification.totalPrice += mattedItemTotalPrice;
          specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
            * mattedItemUnitPriceRetail).toFixed(2);
        }

        /** Тильне матування */

        if (doorFiling?.isMirrorRearMatted || doorFiling?.isLacobelRearMatted) {
          const rearMattingArticleCode = 'rear_matt';
          const rearMattedItemRetail = priceList?.find((r) => r.articleCode === rearMattingArticleCode
            && r.packageName === defaultPackageName) || {};
          const rearMattedItem = priceList?.find((r) => r.articleCode === rearMattingArticleCode
            && r.packageName === packageName) || rearMattedItemRetail;

          if (!_.isEmpty(rearMattedItem)) {
            const rearMattingUnitPriceRetail = rearMattedItemRetail.price || 0;
            const rearMattingUnitPrice = rearMattedItem.price || 0;
            const rearMattingTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * rearMattingUnitPrice)
              .toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: rearMattingUnitPrice,
              itemTotalPrice: rearMattingTotalPrice,
              labelRu: rearMattedItem?.labelRu,
              labelUk: rearMattedItem?.labelUk,
              articleCode: rearMattingArticleCode,
              position: { doorIndex },
            });
            specification.totalPrice += rearMattingTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
              * rearMattingUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: ${rearMattingArticleCode} is not found`); }
        }

        /** Повне матування */

        if (doorFiling?.isMirrorFullMatted || doorFiling?.isLacobelFullMatted || doorFiling?.isGlassFullMatted) {
          const fullMattingArticleCode = 'matt_compl';
          const fullMattingItemRetail = priceList?.find((m) => m.articleCode === fullMattingArticleCode
            && m.packageName === defaultPackageName) || {};
          const fullMattingItem = priceList?.find((m) => m.articleCode === fullMattingArticleCode
            && m.packageName === packageName) || fullMattingItemRetail;

          if (!_.isEmpty(fullMattingItem)) {
            const fullMattingUnitPriceRetail = fullMattingItemRetail.price || 0;
            const fullMattingUnitPrice = fullMattingItem.price || 0;
            const fullMattingTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * fullMattingUnitPrice)
              .toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: fullMattingUnitPrice,
              itemTotalPrice: fullMattingTotalPrice,
              labelRu: fullMattingItem?.labelRu,
              labelUk: fullMattingItem?.labelUk,
              articleCode: fullMattingArticleCode,
              position: { doorIndex },
            });
            specification.totalPrice += fullMattingTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
              * fullMattingUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: ${fullMattingArticleCode} is not found`); }
        }

        /** Дзеркало RAL */

        if (doorFiling?.isMirrorRearMatted && doorFiling?.mirrorColor) {
          const RALDocRetail = priceList?.find((r) => r.articleCode === doorFiling.mirrorColor
            && r.packageName === defaultPackageName) || {};
          const RALDoc = priceList?.find((r) => r.articleCode === doorFiling.mirrorColor
            && r.packageName === packageName) || RALDocRetail;

          if (!_.isEmpty(RALDoc)) {
            const RALDocUnitPriceRetail = RALDocRetail.price || 0;
            const RALDocUnitPrice = RALDoc.price || 0;
            const RALDocTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * RALDocUnitPrice)
              .toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: RALDocUnitPrice,
              itemTotalPrice: RALDocTotalPrice,
              labelRu: RALDoc?.labelRu,
              labelUk: RALDoc?.labelUk,
              articleCode: doorFiling.mirrorColor,
              position: { doorIndex },
            });
            specification.totalPrice += RALDocTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2) * RALDocUnitPriceRetail)
              .toFixed(2);
          } else { console.log(`Error: Mirror RAL ${doorFiling.mirrorColor} is not found`); }
        }

        /** Лакобель RAL */

        if (doorFiling?.isLacobelRearMatted && doorFiling?.lacobelColor) {
          const RALDocRetail = priceList?.find((r) => r.articleCode === doorFiling.lacobelColor
            && r.packageName === defaultPackageName) || {};
          const RALDoc = priceList?.find((r) => r.articleCode === doorFiling.lacobelColor
            && r.packageName === packageName) || RALDocRetail;

          if (!_.isEmpty(RALDoc)) {
            const RALDocUnitPriceRetail = RALDocRetail.price || 0;
            const RALDocUnitPrice = RALDoc.price || 0;
            const RALDocTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * RALDocUnitPrice)
              .toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: RALDocUnitPrice,
              itemTotalPrice: RALDocTotalPrice,
              labelRu: RALDoc?.labelRu,
              labelUk: RALDoc?.labelUk,
              articleCode: doorFiling?.lacobelColor,
              position: { doorIndex },
            });
            specification.totalPrice += RALDocTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2) * RALDocUnitPriceRetail)
              .toFixed(2);
          } else { console.log(`Error: Lacobel RAL ${doorFiling?.lacobelColor} is not found`); }
        }

        /** Бронь плівка */

        // free service, no articleCode
        if (doorFiling?.isMirrorArmoredFilm || doorFiling?.isLacobelArmoredFilm || doorFiling?.isGlassArmoredFilm) {
          specification.items.push({
            item: 'fillingFeature',
            amount: 1,
            size: doorArea,
            height: doorFillingH,
            width: doorFillingW,
            unitPrice: 0,
            itemTotalPrice: 0,
            labelRu: 'Бронь пленка',
            labelUk: 'Бронь плівка',
            articleCode: 'film_armor',
            position: { doorIndex },
          });
        }

        /** Ламінування білою плівкою */

        if (doorFiling?.isMirrorLaminated || doorFiling?.isLacobelLaminated || doorFiling?.isGlassLaminated) {
          const laminatedArticleCode = 'lam_wfilm';
          const laminatedItemRetail = priceList?.find((l) => l.articleCode === laminatedArticleCode
            && l.packageName === defaultPackageName) || {};
          const laminatedItem = priceList?.find((l) => l.articleCode === laminatedArticleCode
            && l.packageName === packageName) || laminatedItemRetail;

          if (!_.isEmpty(laminatedItem)) {
            const laminatedItemUnitPriceRetail = laminatedItemRetail.price || 0;
            const laminatedItemUnitPrice = laminatedItem.price || 0;
            const laminatedItemTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * laminatedItemUnitPrice)
              .toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: laminatedItemUnitPrice,
              itemTotalPrice: laminatedItemTotalPrice,
              labelRu: laminatedItem?.labelRu,
              labelUk: laminatedItem?.labelUk,
              articleCode: laminatedArticleCode,
              position: { doorIndex },
            });
            specification.totalPrice += laminatedItemTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
              * laminatedItemUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: ${laminatedArticleCode} is not found`); }
        }

        /** Фотодрук на плівці - Скло */

        if (doorFiling?.isGlassPhotoPrinting && doorFiling?.glassPhotoPrintType) {
          const glassPhotoPrintTypeRetail = priceList?.find((g) => g.articleCode === doorFiling?.glassPhotoPrintType
            && g.packageName === defaultPackageName) || {};
          const glassPhotoPrintType = priceList?.find((g) => g.articleCode === doorFiling?.glassPhotoPrintType
            && g.packageName === packageName) || glassPhotoPrintTypeRetail;

          if (!_.isEmpty(glassPhotoPrintType)) {
            const glassPhotoPrintUnitPriceRetail = glassPhotoPrintTypeRetail.price || 0;
            const glassPhotoPrintUnitPrice = glassPhotoPrintType.price || 0;
            const glassPhotoPrintTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2)
              * glassPhotoPrintUnitPrice).toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: glassPhotoPrintUnitPrice,
              itemTotalPrice: glassPhotoPrintTotalPrice,
              labelRu: glassPhotoPrintType?.labelRu,
              labelUk: glassPhotoPrintType?.labelUk,
              articleCode: doorFiling?.glassPhotoPrintType,
              position: { doorIndex },
            });
            specification.totalPrice += glassPhotoPrintTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
              * glassPhotoPrintUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: glassPhotoPrintType ${doorFiling?.glassPhotoPrintType} is not found`); }
        }

        /** Скло - Фарбування в один колір або в два кольори */

        if (doorFiling?.isGlassOneColorPainted || doorFiling?.isGlassTwoColorsPainted) {
          const paintedArticleCode = doorFiling?.isGlassOneColorPainted ? 'paint_1col' : 'paint_2col';
          const paintedItemRetail = priceList?.find((m) => m.articleCode === paintedArticleCode
            && m.packageName === defaultPackageName) || {};
          const paintedItem = priceList?.find((m) => m.articleCode === paintedArticleCode
            && m.packageName === packageName) || paintedItemRetail;

          if (!_.isEmpty(paintedItem)) {
            const paintedItemUnitPriceRetail = paintedItemRetail.price || 0;
            const paintedItemUnitPrice = paintedItem.price || 0;
            const paintedItemTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * paintedItemUnitPrice)
              .toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: paintedItemUnitPrice,
              itemTotalPrice: paintedItemTotalPrice,
              labelRu: paintedItem?.labelRu,
              labelUk: paintedItem?.labelUk,
              articleCode: paintedArticleCode,
              position: { doorIndex },
            });
            specification.totalPrice += paintedItemTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
              * paintedItemUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: ${paintedArticleCode} is not found`); }
        }

        if (doorFiling?.isGlassTwoColorsPainted) {
          const stenPaintArticleCode = 'sten_paint';
          const stenPaintedItemRetail = priceList?.find((m) => m.articleCode === stenPaintArticleCode
            && m.packageName === defaultPackageName) || {};
          const stenPaintedItem = priceList?.find((m) => m.articleCode === stenPaintArticleCode
            && m.packageName === packageName) || stenPaintedItemRetail;

          if (!_.isEmpty(stenPaintedItem)) {
            const stenPaintedItemUnitPriceRetail = stenPaintedItemRetail.price || 0;
            const stenPaintedItemUnitPrice = stenPaintedItem.price || 0;
            const stenPaintedItemTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2)
              * stenPaintedItemUnitPrice).toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: doorArea,
              height: doorFillingH,
              width: doorFillingW,
              unitPrice: stenPaintedItemUnitPrice,
              itemTotalPrice: stenPaintedItemTotalPrice,
              labelRu: stenPaintedItem?.labelRu,
              labelUk: stenPaintedItem?.labelUk,
              articleCode: stenPaintArticleCode,
              position: { doorIndex },
            });
            specification.totalPrice += stenPaintedItemTotalPrice;
            specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
              * stenPaintedItemUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: ${stenPaintArticleCode} is not found`); }
        }

        /** Glass RAL */

        if (doorFiling?.glassColors && doorFiling?.glassColors?.length) {
          _.forEach(doorFiling.glassColors, (articleCode) => {
            const glassRALRetail = priceList?.find((m) => m.articleCode === articleCode
              && m.packageName === defaultPackageName) || {};
            const glassRAL = priceList?.find((m) => m.articleCode === articleCode && m.packageName === packageName)
              || glassRALRetail;

            if (!_.isEmpty(glassRAL)) {
              const RALDocUnitPriceRetail = glassRALRetail?.price || 0;
              const RALDocUnitPrice = glassRAL?.price || 0;
              const RALDocTotalPrice = +((doorArea / squareMillimetersValue).toFixed(2) * RALDocUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: doorArea,
                height: doorFillingH,
                width: doorFillingW,
                unitPrice: RALDocUnitPrice,
                itemTotalPrice: RALDocTotalPrice,
                labelRu: glassRAL?.labelRu,
                labelUk: glassRAL?.labelUk,
                articleCode,
                position: { doorIndex },
              });
              specification.totalPrice += RALDocTotalPrice;
              specification.retailTotalPrice += +((doorArea / squareMillimetersValue).toFixed(2)
                * RALDocUnitPriceRetail).toFixed(2);
            }
          });
        }

        /** Полірування */

        if (hasPlanishingDoor) {
          const planishingArticleCode = 'пол_4-5';
          const planishingItemRetail = priceList?.find((m) => m.articleCode === planishingArticleCode
            && m.packageName === defaultPackageName) || {};
          const planishingItem = priceList?.find((m) => m.articleCode === planishingArticleCode
            && m.packageName === packageName) || planishingItemRetail;

          if (!_.isEmpty(planishingItem)) {
            const planishingItemUnitPriceRetail = planishingItemRetail.price || 0;
            const planishingItemUnitPrice = planishingItem.price || 0;
            const planishingPerimeter = +((doorFillingH * 2 + doorFillingW * 2 - 4) / 1000).toFixed(2);
            const planishingItemTotalPrice = +(planishingPerimeter * planishingItemUnitPrice).toFixed(2);

            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              unitPrice: planishingItemUnitPrice,
              itemTotalPrice: planishingItemTotalPrice,
              labelRu: planishingItem?.labelRu,
              labelUk: planishingItem?.labelUk,
              articleCode: planishingArticleCode,
              position: { doorIndex },
            });
            specification.totalPrice += planishingItemTotalPrice;
            specification.retailTotalPrice += +(planishingPerimeter * planishingItemUnitPriceRetail).toFixed(2);
          } else { console.log(`Error: ${planishingArticleCode} is not found`); }
        }
      } else {
        /**
         * Calculate sections filling
         */

        _.forEach(sections, (section, sectionIndex) => {
          const {
            filling: sectionFilling,
            fillingHeight: { value: fillingHeight },
            fillingWidth: { value: fillingWidth },
            texture: sectionTexture,
          } = section;
          const fillingS = _.isEmpty(sectionFilling) ? doorFiling : sectionFilling;

          const hasPlanishingSection = isSlim
            && (fillingS?.material === 'mirror' || fillingS?.material === 'glass' || fillingS?.material === 'lacobel');

          const originFillingH = +(fillingHeight).toFixed(2);
          const originFillingW = +(fillingWidth).toFixed(2);
          const fillingH = isSlim ? originFillingH - 2 : originFillingH;
          const fillingW = isSlim ? originFillingW - 2 : originFillingW;
          // * - 2: The reason is that Slim additional supplements' sizes are without 1 mm per each side in ADS specifications

          if (_.isEmpty(fillingS) || !fillingS.material) return;

          const fillingArticleCode = fillingS.mirrorType || fillingS.lacobelType
            || fillingS.glassType || fillingS.dspOption;
          const fillingItemWithPriceRetail = priceList?.find((m) => m.articleCode === fillingArticleCode
            && m.packageName === defaultPackageName) || {};
          const fillingItemWithPrice = priceList?.find((m) => m.articleCode === fillingArticleCode
            && m.packageName === packageName) || fillingItemWithPriceRetail;
          const fillingItem = fillingConfig?.find((m) => m.articleCode === fillingArticleCode) || {};
          const sectionArea = +(fillingH * fillingW).toFixed(2);
          const originSectionArea = +(originFillingH * originFillingW).toFixed(2);
          const textureS = isChipboard(sectionFilling) ? sectionTexture?.value : '';

          // Calculate milling size for our chipboard > 10mm or for custom material
          const chipboardThickness = fillingItem?.chipboardThickness
            ? +(fillingItem.chipboardThickness)?.match(/([0-9]+[, .]?)+/)[0]
            : 0;
          if ((fillingS?.dspOption && chipboardThickness > 10)
            || (fillingS?.customersOption === 'dsp-large' && fillingS?.isMilling)) {
            const chipboardPerimeter = +(fillingH * 2 + fillingW * 2).toFixed(2);
            millingSize += chipboardPerimeter;
          }

          /** Filling Item */

          // Custom filling
          if (fillingS?.material === 'customers') {
            const isGlass = fillingS.customersOption === 'glass';
            const isLargeChipboard = fillingS.customersOption === 'dsp-large';

            const labelRu = isGlass ? 'Стекло' : isLargeChipboard ? 'ДСП 10+мм' : 'ДСП 10мм';
            const labelUk = isGlass ? 'Скло' : isLargeChipboard ? 'ДСП 10+мм' : 'ДСП 10мм';

            // Should be shown in specification (with no price)
            specification.items.push({
              item: 'filling',
              amount: 1,
              size: originSectionArea,
              height: fillingS.customersOption !== 'glass' ? originFillingH : originFillingH + 2,
              width: fillingS.customersOption !== 'glass' ? originFillingW : originFillingW + 2,
              labelRu: `Материал заказчика: ${labelRu}`,
              labelUk: `Матеріал замовника: ${labelUk}`,
              articleCode: 'custom',
              unitPrice: 0,
              itemTotalPrice: 0,
              position: { doorIndex, sectionIndex },
              texture: '',
            });
            return;
          }

          const sectionFilingItemUnitPriceRetail = fillingItemWithPriceRetail?.price || 0;
          const sectionFilingItemUnitPrice = fillingItemWithPrice?.price || 0;
          const sectionFilingItemTotalPrice = +((originSectionArea / squareMillimetersValue).toFixed(2)
            * sectionFilingItemUnitPrice).toFixed(2);

          specification.items.push({
            item: 'filling',
            amount: 1,
            size: originSectionArea,
            height: originFillingH,
            width: originFillingW,
            unitPrice: sectionFilingItemUnitPrice,
            itemTotalPrice: sectionFilingItemTotalPrice,
            labelRu: fillingItem?.labelRu,
            labelUk: fillingItem?.labelUk,
            articleCode: fillingArticleCode,
            position: { doorIndex, sectionIndex },
            texture: textureS,
          });
          specification.totalPrice += sectionFilingItemTotalPrice;
          specification.retailTotalPrice += +((originSectionArea / squareMillimetersValue).toFixed(2)
          * sectionFilingItemUnitPriceRetail).toFixed(2);

          /** Additional Supplements */

          /** Ультрафіолетовий друк - ДСП */

          if (fillingS?.isDspUVPrinting) {
            const chipboardUvPrintArticleCode = fillingS?.dspUvPrintType?.startsWith('print_uv_wcb')
              ? 'print_uv_wcb'
              : fillingS?.dspUvPrintType;
            const chipboardLayersAmount = chipboardUvPrintArticleCode === 'print_uv_wcb'
              && fillingS?.dspUvPrintType?.length > chipboardUvPrintArticleCode.length
              ? fillingS.dspUvPrintType.substr(fillingS.dspUvPrintType.length - 1)
              : 1;
            const chipboardUvPrintTypeRetail = priceList?.find((m) => m.articleCode === chipboardUvPrintArticleCode
              && m.packageName === defaultPackageName) || {};
            const chipboardUvPrintType = priceList?.find((m) => m.articleCode === chipboardUvPrintArticleCode
              && m.packageName === packageName) || chipboardUvPrintTypeRetail;

            if (!_.isEmpty(chipboardUvPrintType)) {
              const chipboardUvPrintUnitPriceRetail = chipboardUvPrintTypeRetail?.price || 0;
              const chipboardUvPrintUnitPrice = chipboardUvPrintType?.price || 0;
              const chipboardUvPrintTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2)
                * chipboardLayersAmount * chipboardUvPrintUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: chipboardUvPrintUnitPrice,
                itemTotalPrice: chipboardUvPrintTotalPrice,
                labelRu: `${chipboardUvPrintType?.labelRu} ${chipboardLayersAmount} шаров`,
                labelUk: `${chipboardUvPrintType?.labelUk} ${chipboardLayersAmount} шарів`,
                articleCode: chipboardUvPrintArticleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += chipboardUvPrintTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
              * chipboardLayersAmount * chipboardUvPrintUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: dspUvPrintType ${chipboardUvPrintArticleCode} is not found`); }
          }

          /** Ультрафіолетовий друк - Дзеркало */

          if (fillingS?.isMirrorUVPrinting) {
            const mirrorUvPrintTypeRetail = priceList?.find((m) => m.articleCode === fillingS?.mirrorUvPrintType
              && m.packageName === defaultPackageName) || {};
            const mirrorUvPrintType = priceList?.find((m) => m.articleCode === fillingS?.mirrorUvPrintType
              && m.packageName === packageName) || mirrorUvPrintTypeRetail;

            if (!_.isEmpty(mirrorUvPrintType)) {
              const mirrorUvPrintUnitPriceRetail = mirrorUvPrintTypeRetail?.price || 0;
              const mirrorUvPrintUnitPrice = mirrorUvPrintType?.price || 0;
              const mirrorUvPrintTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2)
                * mirrorUvPrintUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: mirrorUvPrintUnitPrice,
                itemTotalPrice: mirrorUvPrintTotalPrice,
                labelRu: mirrorUvPrintType?.labelRu,
                labelUk: mirrorUvPrintType?.labelUk,
                articleCode: fillingS?.mirrorUvPrintType,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += mirrorUvPrintTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * mirrorUvPrintUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: mirrorUvPrintType ${fillingS?.mirrorUvPrintType} is not found`); }
          }

          /** Ультрафіолетовий друк - Скло */

          if (fillingS?.isGlassUVPrinting) {
            const glassUvPrintTypeRetail = priceList?.find((m) => m.articleCode === fillingS?.glassUvPrintType
              && m.packageName === defaultPackageName) || {};
            const glassUvPrintType = priceList?.find((m) => m.articleCode === fillingS?.glassUvPrintType
              && m.packageName === packageName) || glassUvPrintTypeRetail;

            if (!_.isEmpty(glassUvPrintType)) {
              const glassUvPrintUnitPriceRetail = glassUvPrintTypeRetail?.price || 0;
              const glassUvPrintUnitPrice = glassUvPrintType?.price || 0;
              const glassUvPrintTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2)
                * glassUvPrintUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: glassUvPrintUnitPrice,
                itemTotalPrice: glassUvPrintTotalPrice,
                labelRu: glassUvPrintType?.labelRu,
                labelUk: glassUvPrintType?.labelUk,
                articleCode: fillingS?.glassUvPrintType,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += glassUvPrintTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
              * glassUvPrintUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: glassUvPrintType ${fillingS?.glassUvPrintType} is not found`); }
          }

          /** Ультрафіолетовий друк - Лакобель */

          if (fillingS?.isLacobelUVPrinting) {
            const lacobelUvPrintTypeRetail = priceList?.find((m) => m.articleCode === fillingS?.lacobelUvPrintType
              && m.packageName === defaultPackageName) || {};
            const lacobelUvPrintType = priceList?.find((m) => m.articleCode === fillingS?.lacobelUvPrintType
              && m.packageName === packageName) || lacobelUvPrintTypeRetail;

            if (!_.isEmpty(lacobelUvPrintType)) {
              const lacobelUvPrintUnitPriceRetail = lacobelUvPrintTypeRetail.price || 0;
              const lacobelUvPrintUnitPrice = lacobelUvPrintType.price || 0;
              const lacobelUvPrintTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2)
                * lacobelUvPrintUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: lacobelUvPrintUnitPrice,
                itemTotalPrice: lacobelUvPrintTotalPrice,
                labelRu: lacobelUvPrintType?.labelRu,
                labelUk: lacobelUvPrintType?.labelUk,
                articleCode: fillingS?.lacobelUvPrintType,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += lacobelUvPrintTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * lacobelUvPrintUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: lacobelUvPrintType ${fillingS?.lacobelUvPrintType} is not found`); }
          }

          /** Матування по трафарету */

          if (fillingS?.isMirrorMatted || fillingS?.isGlassMatted || fillingS?.isLacobelMatted) {
            const mattedArticleCode = 'sten_mat';
            const mattedItemRetail = priceList?.find((m) => m.articleCode === mattedArticleCode
              && m.packageName === defaultPackageName) || {};
            const mattedItem = priceList?.find((m) => m.articleCode === mattedArticleCode
              && m.packageName === packageName) || mattedItemRetail;

            if (!_.isEmpty(mattedItem)) {
              const mattedItemUnitPriceRetail = mattedItemRetail.price || 0;
              const mattedItemUnitPrice = mattedItem.price || 0;
              const mattedItemTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2) * mattedItemUnitPrice)
                .toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: mattedItemUnitPrice,
                itemTotalPrice: mattedItemTotalPrice,
                labelRu: mattedItem?.labelRu,
                labelUk: mattedItem?.labelUk,
                articleCode: mattedArticleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += mattedItemTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * mattedItemUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: ${mattedArticleCode} is not found`); }
          }

          /** Тильне матування */

          if (fillingS?.isMirrorRearMatted || fillingS?.isLacobelRearMatted) {
            const rearMattingArticleCode = 'rear_matt';
            const rearMattedItemRetail = priceList?.find((m) => m.articleCode === rearMattingArticleCode
              && m.packageName === defaultPackageName) || {};
            const rearMattedItem = priceList?.find((m) => m.articleCode === rearMattingArticleCode
              && m.packageName === packageName) || rearMattedItemRetail;

            if (!_.isEmpty(rearMattedItem)) {
              const rearMattingUnitPriceRetail = rearMattedItemRetail.price || 0;
              const rearMattingUnitPrice = rearMattedItem.price || 0;
              const rearMattingTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2) * rearMattingUnitPrice)
                .toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: rearMattingUnitPrice,
                itemTotalPrice: rearMattingTotalPrice,
                labelRu: rearMattedItem?.labelRu,
                labelUk: rearMattedItem?.labelUk,
                articleCode: rearMattingArticleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += rearMattingTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * rearMattingUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: ${rearMattingArticleCode} is not found`); }
          }

          /** Повне матування */

          if (fillingS?.isMirrorFullMatted || fillingS?.isLacobelFullMatted || fillingS?.isGlassFullMatted) {
            const fullMattingArticleCode = 'matt_compl';
            const fullMattingItemRetail = priceList?.find((m) => m.articleCode === fullMattingArticleCode
              && m.packageName === defaultPackageName) || {};
            const fullMattingItem = priceList?.find((m) => m.articleCode === fullMattingArticleCode
              && m.packageName === packageName) || fullMattingItemRetail;

            if (!_.isEmpty(fullMattingItem)) {
              const fullMattingUnitPriceRetail = fullMattingItemRetail.price || 0;
              const fullMattingUnitPrice = fullMattingItem.price || 0;
              const fullMattingTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2) * fullMattingUnitPrice)
                .toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: fullMattingUnitPrice,
                itemTotalPrice: fullMattingTotalPrice,
                labelRu: fullMattingItem?.labelRu,
                labelUk: fullMattingItem?.labelUk,
                articleCode: fullMattingArticleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += fullMattingTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * fullMattingUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: ${fullMattingArticleCode} is not found`); }
          }

          /** Дзеркало RAL */

          if (fillingS?.isMirrorRearMatted && fillingS?.mirrorColor) {
            const rearMattingArticleCode = 'rear_matt';
            const RALDocRetail = priceList?.find((m) => m.articleCode === fillingS.mirrorColor
              && m.packageName === defaultPackageName) || {};
            const RALDoc = priceList?.find((m) => m.articleCode === fillingS.mirrorColor
              && m.packageName === packageName) || RALDocRetail;
            const rearMattedItemRetail = priceList?.find((m) => m.articleCode === rearMattingArticleCode
              && m.packageName === defaultPackageName) || {};
            const rearMattedItem = priceList?.find((m) => m.articleCode === rearMattingArticleCode
              && m.packageName === packageName) || rearMattedItemRetail;

            if (!_.isEmpty(rearMattedItem)) {
              const rearMattedItemUnitPriceRetail = rearMattedItemRetail.price || 0;
              const rearMattedItemUnitPrice = rearMattedItem.price || 0;
              const rearMattedItemTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2)
                * rearMattedItemUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: rearMattedItemUnitPrice,
                itemTotalPrice: rearMattedItemTotalPrice,
                labelRu: rearMattedItem?.labelRu,
                labelUk: rearMattedItem?.labelUk,
                articleCode: rearMattingArticleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += rearMattedItemTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * rearMattedItemUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: ${rearMattingArticleCode} is not found`); }

            if (!_.isEmpty(RALDoc)) {
              const RALDocUnitPriceRetail = RALDocRetail.price || 0;
              const RALDocUnitPrice = RALDoc.price || 0;
              const RALDocTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2) * RALDocUnitPrice)
                .toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: RALDocUnitPrice,
                itemTotalPrice: RALDocTotalPrice,
                labelRu: RALDoc?.labelRu,
                labelUk: RALDoc?.labelUk,
                articleCode: fillingS.mirrorColor,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += RALDocTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * RALDocUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: Mirror RAL ${fillingS.mirrorColor} is not found`); }
          }

          /** Лакобель RAL */

          if (fillingS?.isLacobelRearMatted && fillingS?.lacobelColor) {
            const RALDocRetail = priceList?.find((m) => m.articleCode === fillingS.lacobelColor
              && m.packageName === defaultPackageName) || {};
            const RALDoc = priceList?.find((m) => m.articleCode === fillingS.lacobelColor
              && m.packageName === packageName) || RALDocRetail;

            if (!_.isEmpty(RALDoc)) {
              const RALDocUnitPriceRetail = RALDocRetail.price || 0;
              const RALDocUnitPrice = RALDoc.price || 0;
              const RALDocTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2) * RALDocUnitPrice)
                .toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: RALDocUnitPrice,
                itemTotalPrice: RALDocTotalPrice,
                labelRu: RALDoc?.labelRu,
                labelUk: RALDoc?.labelUk,
                articleCode: fillingS.lacobelColor,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += RALDocTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * RALDocUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: Lacobel RAL ${fillingS.lacobelColor} is not found`); }
          }

          /** Бронь плівка */

          // free service, no articleCode
          if (fillingS?.isMirrorArmoredFilm || fillingS?.isLacobelArmoredFilm || fillingS?.isGlassArmoredFilm) {
            specification.items.push({
              item: 'fillingFeature',
              amount: 1,
              size: sectionArea,
              height: fillingH,
              width: fillingW,
              unitPrice: 0,
              itemTotalPrice: 0,
              labelRu: 'Бронь пленка',
              labelUk: 'Бронь плівка',
              articleCode: 'film_armor',
              position: { doorIndex, sectionIndex },
            });
          }

          /** Ламінування білою плівкою */

          if (fillingS?.isMirrorLaminated || fillingS?.isLacobelLaminated || fillingS?.isGlassLaminated) {
            const laminatedArticleCode = 'lam_wfilm';
            const laminatedItemRetail = priceList?.find((m) => m.articleCode === laminatedArticleCode
              && m.packageName === defaultPackageName) || {};
            const laminatedItem = priceList?.find((m) => m.articleCode === laminatedArticleCode
              && m.packageName === packageName) || laminatedItemRetail;

            if (!_.isEmpty(laminatedItem)) {
              const laminatedItemUnitPriceRetail = laminatedItemRetail.price || 0;
              const laminatedItemUnitPrice = laminatedItem.price || 0;
              const laminatedItemTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2)
                * laminatedItemUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: laminatedItemUnitPrice,
                itemTotalPrice: laminatedItemTotalPrice,
                labelRu: laminatedItem?.labelRu,
                labelUk: laminatedItem?.labelUk,
                articleCode: laminatedArticleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += laminatedItemTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
              * laminatedItemUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: ${laminatedArticleCode} is not found`); }
          }

          /** Фотодрук на плівці - Скло */

          if (fillingS?.isGlassPhotoPrinting && fillingS?.glassPhotoPrintType) {
            const glassPhotoPrintTypeRetail = priceList?.find((m) => m.articleCode === fillingS?.glassPhotoPrintType
              && m.packageName === defaultPackageName) || {};
            const glassPhotoPrintType = priceList?.find((m) => m.articleCode === fillingS?.glassPhotoPrintType
              && m.packageName === packageName) || glassPhotoPrintTypeRetail;

            if (!_.isEmpty(glassPhotoPrintType)) {
              const glassPhotoPrintUnitPriceRetail = glassPhotoPrintTypeRetail.price || 0;
              const glassPhotoPrintUnitPrice = glassPhotoPrintType.price || 0;
              const glassPhotoPrintTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2)
                * glassPhotoPrintUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: glassPhotoPrintUnitPrice,
                itemTotalPrice: glassPhotoPrintTotalPrice,
                labelRu: glassPhotoPrintType?.labelRu,
                labelUk: glassPhotoPrintType?.labelUk,
                articleCode: fillingS?.glassPhotoPrintType,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += glassPhotoPrintTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
              * glassPhotoPrintUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: glassPhotoPrintType ${fillingS?.glassPhotoPrintType} is not found`); }
          }

          /** Фарбування в один колір або в два кольори */

          if (fillingS?.isGlassOneColorPainted || fillingS?.isGlassTwoColorsPainted) {
            const paintedArticleCode = fillingS?.isGlassOneColorPainted ? 'paint_1col' : 'paint_2col';
            const paintedItemRetail = priceList?.find((m) => m.articleCode === paintedArticleCode
              && m.packageName === defaultPackageName) || {};
            const paintedItem = priceList?.find((m) => m.articleCode === paintedArticleCode
              && m.packageName === packageName) || paintedItemRetail;

            if (!_.isEmpty(paintedItem)) {
              const paintedItemUnitPriceRetail = paintedItemRetail.price || 0;
              const paintedItemUnitPrice = paintedItem.price || 0;
              const paintedItemTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2) * paintedItemUnitPrice)
                .toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: paintedItemUnitPrice,
                itemTotalPrice: paintedItemTotalPrice,
                labelRu: paintedItem?.labelRu,
                labelUk: paintedItem?.labelUk,
                articleCode: paintedArticleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += paintedItemTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * paintedItemUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: ${paintedArticleCode} is not found`); }
          }

          if (fillingS?.isGlassTwoColorsPainted) {
            const stenPaintArticleCode = 'sten_paint';
            const stenPaintedItemRetail = priceList?.find((m) => m.articleCode === stenPaintArticleCode
              && m.packageName === defaultPackageName) || {};
            const stenPaintedItem = priceList?.find((m) => m.articleCode === stenPaintArticleCode
              && m.packageName === packageName) || stenPaintedItemRetail;

            if (!_.isEmpty(stenPaintedItem)) {
              const stenPaintedItemUnitPriceRetail = stenPaintedItemRetail.price || 0;
              const stenPaintedItemUnitPrice = stenPaintedItem.price || 0;
              const stenPaintedItemTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2)
                * stenPaintedItemUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: stenPaintedItemUnitPrice,
                itemTotalPrice: stenPaintedItemTotalPrice,
                labelRu: stenPaintedItem?.labelRu,
                labelUk: stenPaintedItem?.labelUk,
                articleCode: stenPaintArticleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += stenPaintedItemTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * stenPaintedItemUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: ${stenPaintArticleCode} is not found`); }
          }

          // Glass RAL
          if (fillingS?.glassColors && fillingS?.glassColors?.length) {
            _.forEach(fillingS.glassColors, (articleCode) => {
              const glassRALRetail = priceList?.find((m) => m.articleCode === articleCode
                && m.packageName === defaultPackageName) || {};
              const glassRAL = priceList?.find((m) => m.articleCode === articleCode && m.packageName === packageName)
                || glassRALRetail;
              const RALDocUnitPriceRetail = glassRALRetail?.price || 0;
              const RALDocUnitPrice = glassRAL?.price || 0;
              const RALDocTotalPrice = +((sectionArea / squareMillimetersValue).toFixed(2) * RALDocUnitPrice)
                .toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                size: sectionArea,
                height: fillingH,
                width: fillingW,
                unitPrice: RALDocUnitPrice,
                itemTotalPrice: RALDocTotalPrice,
                labelRu: glassRAL?.labelRu,
                labelUk: glassRAL?.labelUk,
                articleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += RALDocTotalPrice;
              specification.retailTotalPrice += +((sectionArea / squareMillimetersValue).toFixed(2)
                * RALDocUnitPriceRetail).toFixed(2);
            });
          }

          /** Полірування */

          if (hasPlanishingSection) {
            const planishingArticleCode = 'пол_4-5';
            const planishingItemRetail = priceList?.find((m) => m.articleCode === planishingArticleCode
              && m.packageName === defaultPackageName) || {};
            const planishingItem = priceList?.find((m) => m.articleCode === planishingArticleCode
              && m.packageName === packageName) || planishingItemRetail;

            if (!_.isEmpty(planishingItem)) {
              const planishingItemUnitPriceRetail = planishingItemRetail.price || 0;
              const planishingItemUnitPrice = planishingItem.price || 0;
              const planishingPerimeter = +((fillingH * 2 + fillingW * 2 - 4) / 1000).toFixed(2);
              const planishingItemTotalPrice = +(planishingPerimeter * planishingItemUnitPrice).toFixed(2);

              specification.items.push({
                item: 'fillingFeature',
                amount: 1,
                unitPrice: planishingItemUnitPrice,
                itemTotalPrice: planishingItemTotalPrice,
                labelRu: planishingItem?.labelRu,
                labelUk: planishingItem?.labelUk,
                articleCode: planishingArticleCode,
                position: { doorIndex, sectionIndex },
              });
              specification.totalPrice += planishingItemTotalPrice;
              specification.retailTotalPrice += +(planishingPerimeter * planishingItemUnitPriceRetail).toFixed(2);
            } else { console.log(`Error: ${planishingArticleCode} is not found`); }
          }
        });
      }
    });

    /** Фрезерування */

    if (millingSize) {
      const millingDocRetail = priceList?.find((m) => m.articleCode === defaultMilling
        && m.packageName === defaultPackageName) || {};
      const millingDoc = priceList?.find((m) => m.articleCode === defaultMilling && m.packageName === packageName)
        || millingDocRetail;
      const millingUnitPriceRetail = millingDocRetail?.price ? +(millingDocRetail.price).toFixed(2) : 0;
      const millingUnitPrice = millingDoc?.price ? +(millingDoc.price).toFixed(2) : 0;
      const millingTotalPrice = +((millingSize / 1000) * millingUnitPrice).toFixed(2);

      specification.items.push({
        item: 'milling',
        amount: 1,
        size: millingSize,
        unitPrice: millingUnitPrice,
        itemTotalPrice: millingTotalPrice,
        labelRu: millingDoc?.labelRu,
        labelUk: millingDoc?.labelUk,
        articleCode: defaultMilling,
      });
      specification.totalPrice += millingTotalPrice;
      specification.retailTotalPrice += +((millingSize / 1000) * millingUnitPriceRetail).toFixed(2);
    }

    /** Пакування */

    // Пакування направляючої
    const gpPackagingDocRetail = priceList?.find((m) => m.articleCode === packagingOfGuidanceProfile
      && m.packageName === defaultPackageName) || {};
    const gpPackagingDoc = priceList?.find((m) => m.articleCode === packagingOfGuidanceProfile
      && m.packageName === packageName) || gpPackagingDocRetail;
    const gpPackagingUnitPriceRetail = gpPackagingDocRetail?.price ? +(gpPackagingDocRetail.price).toFixed(2) : 0;
    const gpPackagingUnitPrice = gpPackagingDoc?.price ? +(gpPackagingDoc.price).toFixed(2) : 0;

    specification.items.push({
      item: 'gpPackaging',
      amount: 1,
      unitPrice: gpPackagingUnitPrice,
      itemTotalPrice: gpPackagingUnitPrice,
      labelRu: gpPackagingDoc?.labelRu,
      labelUk: gpPackagingDoc?.labelUk,
      articleCode: packagingOfGuidanceProfile,
    });
    specification.totalPrice += gpPackagingUnitPrice;
    specification.retailTotalPrice += gpPackagingUnitPriceRetail;

    // Пакування дверей
    const doorPackagingArticleCode = _.some(['Slim', '419'], (sp) => sp === sideProfileValue)
      ? 'pak_sl'
      : _.some(['119-L', '119-v.p.'], (sp) => sp === sideProfileValue)
        ? 'pak_dl'
        : _.some(['119', '06', '07', '120', '207', '20', '21', '22', '220'], (sp) => sp === sideProfileValue)
          ? 'pak_d'
          : '';

    if (doorPackagingArticleCode) {
      const doorPackagingDocRetail = priceList?.find((m) => m.articleCode === doorPackagingArticleCode
        && m.packageName === defaultPackageName) || {};
      const doorPackagingDoc = priceList?.find((m) => m.articleCode === doorPackagingArticleCode
        && m.packageName === packageName) || doorPackagingDocRetail;
      const doorPackagingUnitPriceRetail = doorPackagingDocRetail?.price
        ? +(doorPackagingDocRetail.price).toFixed(2)
        : 0;
      const doorPackagingUnitPrice = doorPackagingDoc?.price ? +(doorPackagingDoc.price).toFixed(2) : 0;
      const doorPackagingTotalPrice = +(doorPackagingUnitPrice * doorsAmount).toFixed(2);

      specification.items.push({
        item: 'doorPackaging',
        amount: doorsAmount,
        unitPrice: doorPackagingUnitPrice,
        itemTotalPrice: doorPackagingTotalPrice,
        labelRu: doorPackagingDoc?.labelRu,
        labelUk: doorPackagingDoc?.labelUk,
        articleCode: doorPackagingArticleCode,
      });
      specification.totalPrice += doorPackagingTotalPrice;
      specification.retailTotalPrice += +(doorPackagingUnitPriceRetail * doorsAmount).toFixed(2);
    }
  } catch (ex) { console.log(ex); }

  specification.totalPrice = +specification.totalPrice.toFixed(2);
  specification.retailTotalPrice = +specification.retailTotalPrice.toFixed(2);

  return { specification }; // eslint-disable-line
}

export function isChipboard(filling) {
  return filling?.customersOption?.includes('dsp') || filling?.material === 'dsp';
}
