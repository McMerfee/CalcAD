/**
 * doorOpeningWidthInctudingProfile - ширина проєму з профілем
 * coversAmount - кількість накладок (коли двері йдуть в "нахльост") взалежності від схеми розміщення дверей
 * sectionVisibleHeight, sectionVisibleWidth - видима висота/ширина, ту яку юзер може задати в інпуті (від 0)
 * sectionFillingHeight, sectionFillingWidth - висота/ширина наповнення секції, враховуючи ущілюнювач і розміри схому в профілі
 */

import _ from 'lodash';

import constantsBySystemType from './constantsBySystemType';



export const getDoorFillingHeight = (state, systemConctants, currentSystem) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;
  const sideProfile = state.main?.sideProfile?.value || defaultSideProfile;
  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile)[0] || {};
  const isSlim = sideProfile === 'Slim';

  const {
    topGap = 0,
    bottomGap = 0,
    topSealing = 0,
    bottomSealing = 0,
    X12H = 0,
  } = spConstants;

  const doorsHeight = getDoorHeightInctudingProfiles(state, systemConctants, currentSystem);
  return isSlim
    ? doorsHeight + 2 - X12H - topSealing - bottomSealing - topGap - bottomGap
    : doorsHeight - X12H - topSealing - bottomSealing - topGap - bottomGap;
};



export const getDoorFillingHeightForChipboard = (state, systemConctants, currentSystem) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;
  const sideProfile = state.main?.sideProfile?.value || defaultSideProfile;
  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile)[0] || {};

  const {
    topGap = 0,
    bottomGap = 0,
    X12H = 0,
  } = spConstants;

  const doorsHeight = getDoorHeightInctudingProfiles(state, systemConctants, currentSystem);
  return doorsHeight - X12H - topGap - bottomGap;
};



export const getDoorFillingWidth = (state, systemConctants, currentSystem) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;
  const sideProfile = state.main?.sideProfile?.value || defaultSideProfile;
  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile)[0] || {};
  const isSlim = sideProfile === 'Slim';

  const {
    sideSealing = 0,
    X13W = 0,
  } = spConstants;

  const doorsWidth = getDoorWidthInctudingProfiles(state, systemConctants, currentSystem);
  return isSlim
    ? doorsWidth + 2 - X13W - sideSealing * 2
    : doorsWidth - X13W - sideSealing * 2;
};



export const getDoorFillingWidthForChipboard = (state, systemConctants, currentSystem) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;
  const sideProfile = state.main?.sideProfile?.value || defaultSideProfile;
  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile)[0] || {};
  const { X13W = 0 } = spConstants;

  const doorsWidth = getDoorWidthInctudingProfiles(state, systemConctants, currentSystem);
  return doorsWidth - X13W;
};



export const getCoversAmount = (doorPositioning, sideProfile, doorsAmount) => {
  if (!sideProfile) return 0;
  return doorPositioning === 'symmetrical' ? doorsAmount - 2 : doorsAmount - 1;
};



export const getDoorOpeningWidthInctudingProfile = (state, systemConctants, currentSystem) => {
  const doorOpeningWidth = state.main?.doorOpeningWidth?.value || 0;
  const sideProfile = state.main?.sideProfile?.value || '';
  const doorPositioning = state.main?.doorPositioning?.value;
  const doorsAmount = state.main?.doorsAmount?.value;

  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { minDoorOpeningWidth, maxDoorOpeningWidth } = systemDefaults;

  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile)[0] || {};
  const { X1 = 0 } = spConstants;

  const coversAmount = getCoversAmount(doorPositioning, sideProfile, doorsAmount);

  if (doorOpeningWidth > maxDoorOpeningWidth) return maxDoorOpeningWidth + X1 * coversAmount;
  if (doorOpeningWidth < minDoorOpeningWidth) return minDoorOpeningWidth + X1 * coversAmount;
  return doorOpeningWidth + X1 * coversAmount;
};



export const getMinDoorsAmount = (state, systemConctants, currentSystem) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultDoorsAmount, maxDoorWidth, defaultMinDoorsAmount } = systemDefaults;

  if (currentSystem !== 'extendable') return defaultMinDoorsAmount;

  const doorOpeningWidthWithProfile = getDoorOpeningWidthInctudingProfile(state, systemConctants, currentSystem);

  return Math.ceil(doorOpeningWidthWithProfile / maxDoorWidth) < defaultDoorsAmount
    ? defaultDoorsAmount
    : Math.ceil(doorOpeningWidthWithProfile / maxDoorWidth);
};



export const getMaxDoorsAmount = (state, systemConctants, currentSystem) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { minDoorWidth, defaultMaxDoorsAmount } = systemDefaults;
  const doorOpeningWidth = state.main?.doorOpeningWidth?.value;

  if (currentSystem !== 'extendable' || !doorOpeningWidth) return defaultMaxDoorsAmount;

  const doorOpeningWidthWithProfile = getDoorOpeningWidthInctudingProfile(state, systemConctants, currentSystem);

  return Math.floor(doorOpeningWidthWithProfile / minDoorWidth) > defaultMaxDoorsAmount
    ? defaultMaxDoorsAmount
    : Math.floor(doorOpeningWidthWithProfile / minDoorWidth);
};



// Look for bottom doorLatchMechanism throughout all doors
export const hasBottomLatchMechanism = ({ doors }) => {
  const doorsWithBottomLanchMechanism = doors.filter((d) => d.main.isDoorLatchMechanismOn?.value === true
    && d.main.doorLatchMechanism?.value === 'дотяг_низ');

  return doorsWithBottomLanchMechanism.length > 0;
};



export const getDoorHeightInctudingProfiles = (state, systemConctants, currentSystem) => {
  const doorOpeningHeight = state.main?.doorOpeningHeight?.value || 0;

  if (!doorOpeningHeight) return 0;

  const sideProfile = state.main?.sideProfile?.value || '';
  const shouldUseStandbyX2 = hasBottomLatchMechanism(state);
  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile)[0] || {};
  const {
    X2 = 0,
    X2_standby = 0,
    X4 = 0,
  } = spConstants;

  // Use X2_standby instead X2 if at least one door has bottom doorLatchMechanism.
  // Note: each door should have the same height
  const carriageProfileValue = shouldUseStandbyX2 ? X2_standby : X2;

  if (currentSystem === 'monorail') return +(doorOpeningHeight - X2 - X4).toFixed(3);
  if (currentSystem === 'extendable') return +(doorOpeningHeight - carriageProfileValue - X4).toFixed(3);
  if (currentSystem === 'opening') return +(doorOpeningHeight - X2 * 2).toFixed(3);
  if (currentSystem === 'assembling' || currentSystem === 'hinged') return +(doorOpeningHeight - X2).toFixed(3);

  return 0;
};



export const getDoorWidthInctudingProfiles = (state, systemConctants, currentSystem) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { maxDoorWidth = 0 } = systemDefaults;
  const doorOpeningWidth = state.main?.doorOpeningWidth?.value || 0;
  const monorailSingleDoorWidth = state.main?.monorailSingleDoorWidth?.value || doorOpeningWidth;
  if (!doorOpeningWidth) return 0;

  const sideProfile = state.main?.sideProfile?.value || '';
  const doorsAmount = state.doors?.length;
  const doorPositioning = state.main?.doorPositioning?.value;
  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile)[0] || {};
  const { X1 = 0 } = spConstants;

  if (currentSystem === 'monorail') {
    return monorailSingleDoorWidth > maxDoorWidth ? maxDoorWidth : monorailSingleDoorWidth;
  }

  if (currentSystem === 'opening') return +(doorOpeningWidth / doorsAmount - X1).toFixed(3);

  if (currentSystem === 'hinged') {
    return doorsAmount < 4
      ? Math.floor((doorOpeningWidth + X1 * (doorsAmount - 1)) / doorsAmount)
      : Math.floor(doorOpeningWidth / 4 + X1 / 2);
  }

  if (currentSystem === 'assembling') {
    return +((doorOpeningWidth - X1 - doorsAmount * 1.25) / doorsAmount).toFixed(3);
  }

  if (currentSystem === 'extendable') {
    const coversAmount = getCoversAmount(doorPositioning, sideProfile, doorsAmount);

    return sideProfile === 'sp207'
      ? Math.floor((doorOpeningWidth + X1 * coversAmount) / doorsAmount)
      : +((doorOpeningWidth + X1 * coversAmount) / doorsAmount).toFixed(3);
  }

  return 0;
};



export const sectionsRemeasurement = (state, doorIndex, sections, systemConctants, currentSystem) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;
  const directionOfSections = state.doors[doorIndex]?.main?.directionOfSections?.value;
  const sideProfile = state.main?.sideProfile?.value || defaultSideProfile;
  const connectingProfile = state.doors[doorIndex]?.main?.connectingProfile?.value || '';

  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile)[0] || {};
  const cpConstants = systemConctants?.filter((c) => c.connectingProfile === connectingProfile)[0] || {};

  const isSlim = sideProfile === 'Slim';

  const {
    hiddingTopSize = 0,
    hiddingBottomSize = 0,
    hiddingSideSize = 0,
    topGap = 0,
    bottomGap = 0,
    X12H = 0,
    X13W = 0,
  } = spConstants;

  const {
    hiddingSize: cpHiddingSize = 0,
    thickness: cpThickness = 0,
  } = cpConstants;

  const doorHeight = getDoorHeightInctudingProfiles(state, systemConctants, currentSystem);
  const doorWidth = getDoorWidthInctudingProfiles(state, systemConctants, currentSystem);

  let sectionsToUpdate = sections;

  if (directionOfSections === 'horizontal') {
    let hiddenHeight = 0;
    let visibleHeightWithoutLastSection = 0;

    sectionsToUpdate = sections
      .map((section, index) => {
        const visibleWidth = +(section?.visibleWidth?.value).toFixed(2);
        const filling = section?.filling;

        let {
          topSealing = 0,
          sideSealing = 0,
          connectingSealing = 0,
        } = spConstants;

        let visibleHeight = +(section?.visibleHeight?.value).toFixed(2);
        let fillingHeight = 0;

        if (_.isEmpty(filling) || filling?.customersOption?.includes('dsp') || filling?.material === 'dsp') {
          topSealing = 0;
          sideSealing = 0;
          connectingSealing = 0;
        }

        const fillingWidth = isSlim
          ? +(doorWidth + 2 - X13W - sideSealing - sideSealing).toFixed(2)
          : +(doorWidth - X13W - sideSealing - sideSealing).toFixed(2);

        if (index === 0) { // first section
          fillingHeight = isSlim
            ? +(visibleHeight + 2 + hiddingTopSize + cpHiddingSize - topSealing - connectingSealing - topGap).toFixed(2)
            : +(visibleHeight + hiddingTopSize + cpHiddingSize - topSealing - connectingSealing - topGap).toFixed(2);
          hiddenHeight += +(hiddingTopSize + cpHiddingSize + cpThickness).toFixed(2);
          visibleHeightWithoutLastSection += visibleHeight;
        } else if (index === sections.length - 1) { // last section
          hiddenHeight += +(cpHiddingSize + hiddingBottomSize).toFixed(2);
          visibleHeight = +(doorHeight - X12H - visibleHeightWithoutLastSection - hiddenHeight).toFixed(2);
          fillingHeight = isSlim
            ? +(visibleHeight + 2 + hiddingBottomSize + cpHiddingSize - topSealing - connectingSealing - bottomGap)
              .toFixed(2)
            : +(visibleHeight + hiddingBottomSize + cpHiddingSize - topSealing - connectingSealing - bottomGap)
              .toFixed(2);
        } else { // middle sections
          fillingHeight = isSlim
            ? +(visibleHeight + 2 * (cpHiddingSize - connectingSealing) + 2).toFixed(2)
            : +(visibleHeight + 2 * (cpHiddingSize - connectingSealing)).toFixed(2);
          visibleHeightWithoutLastSection += visibleHeight;
          hiddenHeight += +(cpHiddingSize * 2 + cpThickness).toFixed(2);
        }

        return {
          ...section,
          ...{
            fillingHeight: { value: fillingHeight },
            fillingWidth: { value: fillingWidth },
            visibleHeight: { value: visibleHeight },
            visibleWidth: { value: visibleWidth },
          },
        };
      });
  }

  if (directionOfSections === 'vertical') {
    let hiddenWidth = 0;
    let visibleWidthWithoutLastSection = 0;

    sectionsToUpdate = sections
      .map((section, index) => {
        const visibleHeight = section?.visibleHeight?.value;
        const filling = section?.filling;

        let {
          topSealing = 0,
          bottomSealing = 0,
          sideSealing = 0,
          connectingSealing = 0,
        } = spConstants;

        let visibleWidth = +(section?.visibleWidth?.value).toFixed(2);
        let fillingWidth = 0;

        if (_.isEmpty(filling) || filling?.customersOption?.includes('dsp') || filling?.material === 'dsp') {
          topSealing = 0;
          bottomSealing = 0;
          sideSealing = 0;
          connectingSealing = 0;
        }

        const fillingHeight = isSlim
          ? +(doorHeight + 2 - X12H - topSealing - bottomSealing - topGap - bottomGap).toFixed(2)
          : +(doorHeight - X12H - topSealing - bottomSealing - topGap - bottomGap).toFixed(2);

        if (index === 0) { // first section
          fillingWidth = isSlim
            ? +(visibleWidth + 2 + hiddingSideSize + cpHiddingSize - sideSealing - connectingSealing).toFixed(2)
            : +(visibleWidth + hiddingSideSize + cpHiddingSize - sideSealing - connectingSealing).toFixed(2);

          hiddenWidth += +(hiddingSideSize + cpHiddingSize + cpThickness).toFixed(2);

          visibleWidthWithoutLastSection += visibleWidth;
        } else if (index === sections.length - 1) { // last section
          hiddenWidth += +(cpHiddingSize + hiddingSideSize).toFixed(2);

          visibleWidth = +(doorWidth - X13W - visibleWidthWithoutLastSection - hiddenWidth).toFixed(2);

          fillingWidth = isSlim
            ? +(visibleWidth + 2 + cpHiddingSize + hiddingSideSize - connectingSealing - sideSealing).toFixed(2)
            : +(visibleWidth + cpHiddingSize + hiddingSideSize - connectingSealing - sideSealing).toFixed(2);
        } else { // middle sections
          fillingWidth = isSlim
            ? +(visibleWidth + 2 * (cpHiddingSize - connectingSealing) + 2).toFixed(2)
            : +(visibleWidth + 2 * (cpHiddingSize - connectingSealing)).toFixed(2);

          hiddenWidth += +(cpHiddingSize + cpHiddingSize + cpThickness).toFixed(2);

          visibleWidthWithoutLastSection += visibleWidth;
        }

        return {
          ...section,
          ...{
            fillingHeight: { value: fillingHeight },
            fillingWidth: { value: fillingWidth },
            visibleHeight: { value: visibleHeight },
            visibleWidth: { value: visibleWidth },
          },
        };
      });
  }

  return sectionsToUpdate;
};



export const sectionsRemeasurementAligned = (state, doorIndex, sections, systemConctants, currentSystem) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;

  const directionOfSections = state.doors[doorIndex]?.main?.directionOfSections?.value;
  const sideProfile = state.main?.sideProfile?.value || defaultSideProfile;
  const connectingProfile = state.doors[doorIndex]?.main?.connectingProfile?.value || '';

  const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile)[0] || {};
  const cpConstants = systemConctants?.filter((c) => c.connectingProfile === connectingProfile)[0] || {};

  const doorHeight = getDoorHeightInctudingProfiles(state, systemConctants, currentSystem);
  const doorWidth = getDoorWidthInctudingProfiles(state, systemConctants, currentSystem);
  const connectingProfilesAmount = sections.length - 1;

  const isSlim = sideProfile === 'Slim';

  const {
    hiddingTopSize = 0,
    hiddingBottomSize = 0,
    hiddingSideSize = 0,
    topGap = 0,
    bottomGap = 0,
    X12H = 0,
    X13W = 0,
  } = spConstants;

  const {
    hiddingSize: cpHiddingSize = 0,
    thickness: cpThickness = 0,
  } = cpConstants;

  let sectionsToUpdate = sections;

  if (directionOfSections === 'horizontal') {
    const visibleHeight = +(
      (doorHeight - X12H - hiddingTopSize - hiddingBottomSize
        - connectingProfilesAmount * (2 * cpHiddingSize + cpThickness) - topGap - bottomGap
      ) / sections.length).toFixed(2);

    const visibleWidth = +(doorWidth - X13W - hiddingSideSize - hiddingSideSize).toFixed(2);

    sectionsToUpdate = sections
      .map((section, index) => {
        const filling = section?.filling;

        let {
          topSealing = 0,
          bottomSealing = 0,
          sideSealing = 0,
          connectingSealing = 0,
        } = spConstants;

        if (_.isEmpty(filling) || filling?.customersOption?.includes('dsp') || filling?.material === 'dsp') {
          topSealing = 0;
          bottomSealing = 0;
          sideSealing = 0;
          connectingSealing = 0;
        }

        const fillingWidth = isSlim
          ? +(doorWidth + 2 - X13W - sideSealing - sideSealing).toFixed(2)
          : +(doorWidth - X13W - sideSealing - sideSealing).toFixed(2);

        let fillingHeight = 0;

        if (index === 0) { // first section
          fillingHeight = +(visibleHeight + hiddingTopSize + cpHiddingSize - topSealing - connectingSealing).toFixed(2);
        } else if (index === sections.length - 1) { // last section
          fillingHeight = +(visibleHeight + hiddingBottomSize + cpHiddingSize - bottomSealing - connectingSealing)
            .toFixed(2);
        } else { // middle sections
          fillingHeight = +(visibleHeight + 2 * (cpHiddingSize - connectingSealing)).toFixed(2);
        }

        fillingHeight = isSlim ? fillingHeight + 2 : fillingHeight;

        return {
          ...section,
          ...{
            fillingHeight: { value: fillingHeight },
            fillingWidth: { value: fillingWidth },
            visibleHeight: { value: visibleHeight },
            visibleWidth: { value: visibleWidth },
          },
        };
      });
  }

  if (directionOfSections === 'vertical') {
    const visibleHeight = +(doorHeight - X12H - hiddingTopSize - hiddingBottomSize).toFixed(2);

    const visibleWidth = (doorWidth - X13W - hiddingSideSize - hiddingSideSize
      - connectingProfilesAmount * (2 * cpHiddingSize + cpThickness))
      / sections.length;

    sectionsToUpdate = sections
      .map((section, index) => {
        const filling = section?.filling;
        let fillingWidth = 0;

        let {
          topSealing = 0,
          bottomSealing = 0,
          sideSealing = 0,
          connectingSealing = 0,
        } = spConstants;

        if (_.isEmpty(filling) || filling?.customersOption?.includes('dsp') || filling?.material === 'dsp') {
          topSealing = 0;
          bottomSealing = 0;
          sideSealing = 0;
          connectingSealing = 0;
        }

        const fillingHeight = isSlim
          ? +(doorHeight + 2 - X12H - topSealing - bottomSealing - topGap - bottomGap).toFixed(2)
          : +(doorHeight - X12H - topSealing - bottomSealing - topGap - bottomGap).toFixed(2);

        if (index === 0 || index === sections.length - 1) { // first or last section
          fillingWidth = isSlim
            ? +(visibleWidth + 2 + hiddingSideSize + cpHiddingSize - sideSealing - connectingSealing).toFixed(2)
            : +(visibleWidth + hiddingSideSize + cpHiddingSize - sideSealing - connectingSealing).toFixed(2);
        } else { // middle sections
          fillingWidth = isSlim
            ? +(visibleWidth + 2 * (cpHiddingSize - connectingSealing) + 2).toFixed(2)
            : +(visibleWidth + 2 * (cpHiddingSize - connectingSealing)).toFixed(2);
        }

        return {
          ...section,
          ...{
            fillingHeight: { value: fillingHeight },
            fillingWidth: { value: fillingWidth },
            visibleHeight: { value: visibleHeight },
            visibleWidth: { value: Math.round(visibleWidth) },
          },
        };
      });
  }

  return sectionsToUpdate;
};



export const doorFillingHeightForChipboard = (sideProfile, doorHeight, systemConctants, currentSystem) => {
  if (!doorHeight) return 0;

  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;
  const sp = sideProfile || defaultSideProfile;
  const spConstants = systemConctants?.filter((c) => c.sideProfile === sp)[0] || {};
  const {
    topGap = 0,
    bottomGap = 0,
    X12H = 0,
  } = spConstants;

  const height = doorHeight - X12H - topGap - bottomGap;

  return height;
};
