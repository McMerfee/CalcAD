/**
 *
 * Main Tab with settings for all doors
 *
 */

import _ from 'lodash';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import {
  doorPositioningOptions,
  hingedDoorPositioningOptions,
  textures,
  stoppers,
} from '../../../helpers/options';

import {
  minWidthForSingleOpeningDoor,
  maxWidthForSingleOpeningDoor,
  minWidthForTwoOpeningDoors,
  maxWidthForTwoOpeningDoors,
  minWidthFor4AssemblingDoors,
  maxWidthFor4AssemblingDoors,
  assemblingAdditionalMechanism,
} from '../../../helpers/constants';

import { isColorSideProfileAvailable, isMechanismAvailable } from '../../../helpers/priceHelper';
import { isValidNumberField, canUseHorizontalTexture } from '../../../helpers/validation';
import { sanitizeValueToNumber } from '../../../helpers/sanitizer';
import constantsBySystemType from '../../../helpers/constantsBySystemType';
import { doorFillingHeightForChipboard } from '../../../helpers/sizesCalculation';

import DoorsActions from '../../../redux/actions/doorsAndSections';
import FillingActions from '../../../redux/actions/fillingMaterials';
import OrderActions from '../../../redux/actions/order';

import Checkbox from '../../Checkbox';
import RadioGroup from '../../RadioGroup';
import RadioOption from '../../RadioOption';
import Input from '../../Input';
import PlusMinusControl from '../../PlusMinusControl';
import Label from '../../Label';
import Dropdown from '../../Dropdown';
import FillingMaterialsModal from '../../FillingMaterialsModal';
import FillingMaterialsControl from '../../FillingMaterialsControl';
import Switch from '../../Switch';

const DoorMainTab = () => {
  const { t, i18n } = useTranslation(['components', 'options']);
  const labelKey = i18n.language === 'ru' ? 'labelRu' : 'labelUk';
  const dispatch = useDispatch();
  const inputRefH = useRef(null);
  const inputRefW = useRef(null);
  const inputRefMonoW = useRef(null);
  const inputRefSidewallThickness = useRef(null);

  const [canChooseSymmetrical, setCanChooseSymmetrical] = useState(false);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableMechanisms, setAvailableMechanisms] = useState([]);
  const [deprecatedMechanisms, setDeprecatedMechanisms] = useState([]);
  const [filling, setFilling] = useState([{}]);
  const [shouldHighlight, setShouldHighlight] = useState(false);

  const { currentOrderId } = useSelector(({ order }) => order);

  const { currentSystem } = useSelector(({ systems }) => systems);
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const {
    defaultSideProfile,
    minDoorOpeningHeight = 0,
    maxDoorOpeningHeight = 0,
    minDoorOpeningWidth = 0,
    maxDoorOpeningWidth = 0,
    maxDoorWidth = 0,
    minDoorWidth = 0,
    minSidewallThickness = 16,
    maxSidewallThickness = 36,
  } = systemDefaults;

  const {
    isConfigFetched,
    aluminiumColors,
    systemConctants,
    sideProfiles,
    mechanisms,
  } = useSelector(({ config }) => config);

  const { priceList: prices, isHidden } = useSelector(({ priceList }) => priceList);

  const {
    minDoorsAmount,
    maxDoorsAmount,
    main: {
      filling: mainDoorFilling,
      mechanism,
      sideProfile,
      doorOpeningHeight,
      doorOpeningWidth,
      monorailSingleDoorWidth,
      doorsAmount,
      doorPositioning,
      aluminiumColor,
      stopper,
      texture,
      sidewallThickness,
      isX2ProfileOn,
      isX4ProfileOn,
      isMiddleDoorMechanismOn,
      isStopperOn,
    },
    doors,
  } = useSelector(({ doorsAndSections }) => doorsAndSections);
  const doorsHeight = doors[0]?.main?.doorHeight;

  const [height, setHeight] = useState(null);
  const [width, setWidth] = useState(null);
  const [minDoorOpeningW, setMinDoorOpeningW] = useState(0);
  const [maxDoorOpeningW, setMaxDoorOpeningW] = useState(0);
  const [maxMonorailDoorWidth, setMaxMonorailDoorWidth] = useState(0);
  const [monorailDoorWidth, setMonorailDoorWidth] = useState(null);
  const [sidewallThicknessValue, setSidewallThicknessValue] = useState(null);

  const fillingMaterialsState = useSelector(({ fillingMaterials }) => fillingMaterials);
  const {
    activeTrigger,
    customers: {
      customersOption,
      isMilling,
    },
    dsp: {
      manufacturer,
      isDspUVPrinting,
      searchField,
      dspOption,
      dspUvPrintType,
    },
    mirror: {
      mirrorType,
      isMirrorMatted,
      isMirrorRearMatted,
      isMirrorFullMatted,
      mirrorColor,
      isMirrorUVPrinting,
      mirrorUvPrintType,
      isMirrorArmoredFilm,
      isMirrorLaminated,
      mirrorSearch,
    },
    lacobel: {
      lacobelType,
      isLacobelMatted,
      isLacobelRearMatted,
      isLacobelFullMatted,
      lacobelColor,
      isLacobelUVPrinting,
      lacobelUvPrintType,
      isLacobelArmoredFilm,
      isLacobelLaminated,
      lacobelSearch,
    },
    glass: {
      glassType,
      isGlassMatted,
      isGlassArmoredFilm,
      isGlassLaminated,
      isGlassOneColorPainted,
      isGlassTwoColorsPainted,
      glassColors,
      isGlassUVPrinting,
      glassUvPrintType,
      isGlassPhotoPrinting,
      glassPhotoPrintType,
      glassSearch,
      isGlassFullMatted,
    },
    isOpenFillingModal,
  } = fillingMaterialsState;

  useEffect(() => setHeight(doorOpeningHeight), [doorOpeningHeight.value]);
  useEffect(() => setWidth(doorOpeningWidth), [doorOpeningWidth.value]);
  useEffect(() => setMinDoorOpeningW(minDoorOpeningWidth), [minDoorOpeningWidth]);
  useEffect(() => setMaxDoorOpeningW(maxDoorOpeningWidth), [maxDoorOpeningWidth]);
  useEffect(() => setMaxMonorailDoorWidth(maxDoorWidth), [maxDoorWidth]);
  useEffect(() => setMonorailDoorWidth(monorailSingleDoorWidth), [monorailSingleDoorWidth?.value]);
  useEffect(() => setSidewallThicknessValue(sidewallThickness), [sidewallThickness?.value]);


  const doorOpeningHeightLabel = t(
    'stickyMenu.mainDoorTab.from-min-to-max',
    { min: minDoorOpeningHeight, max: maxDoorOpeningHeight },
  );
  const doorOpeningWidthLabel = t(
    'stickyMenu.mainDoorTab.from-min-to-max',
    { min: minDoorOpeningW, max: maxDoorOpeningW },
  );
  const monorailDoorWidthLabel = t(
    'stickyMenu.mainDoorTab.from-min-to-max',
    { min: minDoorWidth, max: maxMonorailDoorWidth },
  );
  const sidewallThicknessLabel = t(
    'stickyMenu.mainDoorTab.from-min-to-max',
    { min: minSidewallThickness, max: maxSidewallThickness },
  );
  const doorsAmountLabel = currentSystem === 'assembling'
    ? t('stickyMenu.mainDoorTab.min-or-max', { min: minDoorsAmount, max: maxDoorsAmount })
    : t('stickyMenu.mainDoorTab.from-min-to-max', { min: minDoorsAmount, max: maxDoorsAmount });


  // Show filling materials of Main Door tab and Doors tabs in one place
  useEffect(() => {
    if (!sideProfile?.value) return;

    const doorsFilling = doors
      .filter((door) => !_.isEmpty(door?.main?.filling))
      .map((door) => door?.main?.filling);

    const sectionsFilling = _.flattenDeep(doors
      .filter((door) => !_.isEmpty(door?.sections))
      .map((door) => door.sections
        .filter((section) => !_.isEmpty(section.filling))
        .map((s) => s?.filling)));

    const allFilling = [
      ...doorsFilling,
      ...sectionsFilling,
    ];

    const groupedFilling = !_.isEmpty(allFilling[0]) ? _.groupBy(allFilling, 'material') : {};

    const dspMaterials = _.uniqBy(groupedFilling.dsp, 'dspOption');
    const glassMaterials = _.uniqBy(groupedFilling.glass, 'glassType');
    const mirrorMaterials = _.uniqBy(groupedFilling.mirror, 'mirrorType');
    const lacobelMaterials = _.uniqBy(groupedFilling.lacobel, 'lacobelType');
    const customersMaterials = _.uniqBy(groupedFilling.customers, 'customersOption');

    setFilling([
      ...dspMaterials,
      ...glassMaterials,
      ...mirrorMaterials,
      ...lacobelMaterials,
      ...customersMaterials,
    ]);

    dispatch(OrderActions.calculateOrderRequest());
  }, [mainDoorFilling, sideProfile?.value]);


  // Set ability to choose symmetrical schema
  useEffect(() => {
    setCanChooseSymmetrical(doorsAmount.value === 4 || doorsAmount.value === 6 || doorsAmount.value === 8);
  }, [
    doorsAmount.value,
    doorPositioning.value,
  ]);


  // Set Monorail max door width
  useEffect(() => {
    if (currentSystem !== 'monorail') return;
    if (doorOpeningWidth?.value && doorOpeningWidth.value < maxDoorWidth) {
      setMaxMonorailDoorWidth(doorOpeningWidth.value);
    }
    if (doorOpeningWidth?.value && doorOpeningWidth.value > maxDoorWidth) {
      setMaxMonorailDoorWidth(maxDoorWidth);
    }
  }, [doorOpeningWidth.value, currentSystem]);


  // Set Side Profile by default
  useEffect(() => {
    if (isConfigFetched && !currentOrderId) {
      const spToSet = sideProfile?.value || defaultSideProfile;
      const isCurrentColorAvailable = isColorSideProfileAvailable(aluminiumColor?.value, spToSet, prices);
      dispatch(DoorsActions.updateSideProfile(spToSet, systemConctants, currentSystem, isCurrentColorAvailable));
      dispatch(DoorsActions.updateDoorsSizes(systemConctants, currentSystem));
    }
  }, [currentSystem, systemConctants, isConfigFetched]);


  // Set/Reset values dependent on side profile
  useEffect(() => {
    if (!systemConctants.length) return;
    const colorsToSet = sideProfiles.find((sp) => sp.articleCode === sideProfile?.value)?.colorsDependence || [];
    const mechanismsToSet = systemConctants
      .find((c) => c.sideProfile === sideProfile?.value)?.mechanismsDependence || [];

    setAvailableColors(colorsToSet.filter((color) => isColorSideProfileAvailable(color, sideProfile?.value, prices)));
    setAvailableMechanisms(mechanismsToSet.filter((item) => isMechanismAvailable(item, prices)));

    dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
  }, [sideProfile?.value, prices, systemConctants]);


  // Set values dependent on currentSystem
  useEffect(() => {
    if (currentSystem === 'assembling') {
      setDeprecatedMechanisms([assemblingAdditionalMechanism]);
    }
    if (currentSystem === 'hinged' && doorsAmount.value !== 3) {
      setDeprecatedMechanisms(['дотяг_Tutti', '3_двер_Tutti']);
      dispatch(DoorsActions.toggleMiddleDoorMechanism(false));
      dispatch(DoorsActions
        .updateMainDoor({ name: 'mechanism', value: '2_двер_Tutti' }, systemConctants, currentSystem));
    }
    if (currentSystem === 'hinged' && doorsAmount.value === 3) {
      setDeprecatedMechanisms(['дотяг_Tutti', '2_двер_Tutti']);
      dispatch(DoorsActions
        .updateMainDoor({ name: 'mechanism', value: '3_двер_Tutti' }, systemConctants, currentSystem));
    }
  }, [currentSystem, doorsAmount?.value, sideProfile?.value]);


  // Recalculate min max doors amount because of changing constants
  // dependent on currentSystem, sideProfile, doorPositioning, doorOpeningWidth
  useEffect(() => {
    if (!systemConctants || !systemConctants.length) return;

    dispatch(DoorsActions.setMinDoorsAmount(systemConctants, currentSystem));
    dispatch(DoorsActions.setMaxDoorsAmount(systemConctants, currentSystem));
  }, [
    doorPositioning.value,
    doorOpeningWidth.value,
    systemConctants.length,
    currentSystem,
  ]);


  // Handle doors amount to set it within the range limits specified by the min and max
  useEffect(() => {
    if (!currentSystem || currentSystem !== 'extendable') return;

    // Increase doors amount
    if (doorsAmount.value < minDoorsAmount) {
      dispatch(DoorsActions
        .increaseDoorsAmountRequest(minDoorsAmount - doorsAmount.value, systemConctants, currentSystem));
      dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
      dispatch(OrderActions.calculateOrderRequest());
      return;
    }

    // Decrease doors amount
    if (doorsAmount.value > maxDoorsAmount) {
      dispatch(DoorsActions
        .decreaseDoorsAmountRequest(doorsAmount.value - maxDoorsAmount, systemConctants, currentSystem));
      dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
      dispatch(OrderActions.calculateOrderRequest());
    }
  }, [
    currentSystem,
    minDoorsAmount,
    maxDoorsAmount,
    doorsAmount.value,
  ]);

  // Handle doors position change dependent on doors amount
  useEffect(() => {
    if (doorPositioning.value === 'symmetrical'
      && (doorsAmount.value !== 4 && doorsAmount.value !== 6 && doorsAmount.value !== 8)) {
      dispatch(DoorsActions.updateMainDoor(
        { name: 'doorPositioning', value: 'chessboard' },
        systemConctants,
        currentSystem,
      ));
      dispatch(OrderActions.calculateOrderRequest());
    }
  }, [doorsAmount.value]);


  // Handle min and max values for doorOpeningWidth by systemType
  useEffect(() => {
    if (currentSystem === 'opening' && doorsAmount.value === 1) {
      setMinDoorOpeningW(minWidthForSingleOpeningDoor);
      setMaxDoorOpeningW(maxWidthForSingleOpeningDoor);
    }
    if (currentSystem === 'opening' && doorsAmount.value === 2) {
      setMinDoorOpeningW(minWidthForTwoOpeningDoors);
      setMaxDoorOpeningW(maxWidthForTwoOpeningDoors);
    }

    if (currentSystem === 'assembling' && doorsAmount.value === 2 && doorOpeningWidth.value) {
      setMinDoorOpeningW(minDoorOpeningWidth);
      setMaxDoorOpeningW(maxDoorOpeningWidth);
    }
    if (currentSystem === 'assembling' && doorsAmount.value === 4) {
      setMinDoorOpeningW(minWidthFor4AssemblingDoors);
      setMaxDoorOpeningW(maxWidthFor4AssemblingDoors);
    }
  }, [doorsAmount.value]);


  const onDoorsAmountChange = (value) => {
    if (!(doorOpeningHeight?.value && doorOpeningWidth?.value)
      && !_.some(['assembling', 'opening'], (item) => item === currentSystem)) {
      dispatch(DoorsActions.hightlightDoorOpeningInputs(labelKey));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (value < minDoorsAmount || value > maxDoorsAmount) {
      setShouldHighlight(true);
      setTimeout(() => { setShouldHighlight(false); }, 2000);
      return;
    }
    setShouldHighlight(false);

    if (value < doorsAmount.value) {
      dispatch(DoorsActions.removeDoorRequest(doors.length - 1, systemConctants, currentSystem));
      dispatch(OrderActions.calculateOrderRequest());
      return;
    }
    dispatch(DoorsActions.addDoorRequest(systemConctants, currentSystem, currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleOptions = (name, options, index) => {
    dispatch(DoorsActions.updateMainDoor({
      name,
      value: options[index]?.value || options[index],
    }, systemConctants, currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleColorOptions = (articleCode) => {
    dispatch(DoorsActions.updateMainDoor(
      { name: 'aluminiumColor', value: articleCode },
      systemConctants,
      currentSystem,
    ));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleDropdown = (name, selectedOption) => {
    dispatch(DoorsActions.updateMainDoor({
      name,
      value: selectedOption?.value || '',
    }, systemConctants, currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleSubmitMainDoorFilling = () => {
    const mainDoorMaterialToSet = {
      ...fillingMaterialsState[activeTrigger],
      ...{ material: activeTrigger },
    };
    dispatch(DoorsActions.updateMainDoorFilling(mainDoorMaterialToSet));
  };

  const handleUpdateHeight = ({ target: { value } }) => {
    const sanitizedValue = sanitizeValueToNumber(value);
    if (sanitizedValue < 0 || sanitizedValue > maxDoorOpeningHeight) return;

    setHeight({ value });
  };

  const handleUpdateWidth = ({ target: { value } }) => {
    const sanitizedValue = sanitizeValueToNumber(value);
    if (sanitizedValue < 0 || sanitizedValue > maxDoorOpeningW) return;

    setWidth({ value });
  };

  const handleUpdateMonorailDoorWidth = ({ target: { value } }) => {
    const sanitizedValue = sanitizeValueToNumber(value);
    if (sanitizedValue < 0 || sanitizedValue > maxMonorailDoorWidth) return;

    setMonorailDoorWidth({ value });
  };

  const handleUpdateSidewallThickness = ({ target: { value } }) => {
    const sanitizedValue = sanitizeValueToNumber(value);
    if (sanitizedValue < 0 || sanitizedValue > maxSidewallThickness) return;

    setSidewallThicknessValue({ value });
  };

  const sanitizeAndSaveHeight = ({ target: { name, value } }) => {
    const isValid = isValidNumberField(+value, minDoorOpeningHeight, maxDoorOpeningHeight + 1);
    let sanitizedValue = value;

    if (value && isValid) sanitizedValue = +value;
    if (!isValid) {
      sanitizedValue = +value < minDoorOpeningHeight
        ? minDoorOpeningHeight
        : maxDoorOpeningHeight;
      setHeight({ value: sanitizedValue.toString() });
    }

    dispatch(DoorsActions.updateMainDoor({ name, value: sanitizedValue }, systemConctants, currentSystem));
    dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const sanitizeAndSaveWidth = ({ target: { name, value } }) => {
    const isValid = isValidNumberField(+value, minDoorOpeningW, maxDoorOpeningW + 1);
    let sanitizedValue = value;

    if (value && isValid) sanitizedValue = +value;
    if (!isValid) {
      sanitizedValue = +value < minDoorOpeningW
        ? minDoorOpeningW
        : maxDoorOpeningW;
      setWidth({ value: sanitizedValue.toString() });
    }

    dispatch(DoorsActions.updateMainDoor({ name, value: sanitizedValue }, systemConctants, currentSystem));
    dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const sanitizeAndSaveMonorailDoorWidth = ({ target: { name, value } }) => {
    const isValid = isValidNumberField(+value, minDoorOpeningW, maxMonorailDoorWidth + 1);
    let sanitizedValue = value;

    if (value && isValid) sanitizedValue = +value;
    if (!isValid) {
      sanitizedValue = +value < minDoorOpeningW
        ? minDoorOpeningW
        : maxMonorailDoorWidth;

      setMonorailDoorWidth({ value: sanitizedValue.toString() });
    }

    dispatch(DoorsActions.updateMainDoor({ name, value: sanitizedValue }, systemConctants, currentSystem));
    dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const sanitizeAndSaveSidewallThickness = ({ target: { name, value } }) => {
    const isValid = isValidNumberField(+value, minSidewallThickness, maxSidewallThickness + 1);
    let sanitizedValue = value;

    if (value && isValid) sanitizedValue = +value;
    if (!isValid) {
      sanitizedValue = +value < minSidewallThickness
        ? minSidewallThickness
        : maxSidewallThickness;

      setSidewallThicknessValue({ value: sanitizedValue.toString() });
    }

    dispatch(DoorsActions.updateMainDoor({ name, value: sanitizedValue }, systemConctants, currentSystem));
    dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleIsX2ProfileOn = () => {
    dispatch(DoorsActions.toggleCarriageProfile(!isX2ProfileOn));
    dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleIsX4ProfileOn = () => {
    dispatch(DoorsActions.toggleGuidanceProfile(!isX4ProfileOn));
    dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleIsMiddleDoorMechanismOn = () => {
    dispatch(DoorsActions.toggleMiddleDoorMechanism(!isMiddleDoorMechanismOn));
    dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  // Check if all chipboards are horizontal or vertical
  const textureChecker = (textureVal) => {
    const checker = doors.map((d) => {
      if (!d.sections?.length) return d.main.texture?.value === textureVal;
      else {
        const chipboardS = d.sections.filter((s) => s.filling?.material === 'dsp')?.length;
        const chipboardSTexture = d.sections
          .filter((s) => s.filling?.material === 'dsp' && s.texture?.value === textureVal)?.length;
        return chipboardSTexture === chipboardS;
      }
    });

    return !_.some(checker, (s) => s === false);
  };

  const atLeastSomethingIsChipboard = () => {
    const chipboardArray = doors.map((d) => {
      if (!d.sections?.length) return d.main?.filling?.material === 'dsp';
      return d.sections.filter((s) => s.filling?.material === 'dsp').length > 0;
    });

    return _.some(chipboardArray, (s) => s === true);
  };

  const doorPositioningChoice = () => {
    if (currentSystem === 'hinged') {
      return hingedDoorPositioningOptions.map((item, index) => {
        const isChecked = doorPositioning?.value === item;

        return (
          <RadioOption
            key={item}
            className={clsx(
              'text-button',
              isChecked && 'checked',
              index === 0 ? 'left' : 'right',
            )}
            name={`${item}-doors-position`}
            label={t(`options:hingedDoorPositioningOptions.${item}`)}
            checked={isChecked}
            isDisabled={doorsAmount?.value > 2}
            onChange={() => handleOptions('doorPositioning', hingedDoorPositioningOptions, index)}
          />
        );
      });
    }

    return doorPositioningOptions.map((item, index) => {
      const isChecked = doorPositioning?.value === item.value;

      return (
        <RadioOption
          key={item.value}
          className={clsx(
            'icon',
            isChecked && 'checked',
            item.value === 'symmetrical' && !canChooseSymmetrical && 'disabled',
            index === 0 ? 'chessboard' : 'symmetrically',
          )}
          iconPath={item.iconPath}
          name={`${item.value}-doors-position`}
          label={t(`options:doorPositioningOptions.${item.value}`)}
          checked={isChecked}
          isDisabled={item.value === 'symmetrical' && !canChooseSymmetrical}
          onChange={() => handleOptions('doorPositioning', doorPositioningOptions, index)}
        />
      );
    });
  };

  const textureChoice = textures.map((item, index) => {
    const isChecked = index === 0
      ? texture?.value === item.value && textureChecker('vertical')
      : texture?.value === item.value && textureChecker('horizontal');

    const doorFillingHeight = doorFillingHeightForChipboard(sideProfile?.value, doorsHeight, systemConctants,
      currentSystem);
    const hasDoorsWithSections = _.some(doors, (d) => d.sections?.length);
    const someDoorHasProperSection = _.some(doors, (d) => {
      if (!d.sections?.length) return false;
      return _.some(d.sections, (s) => s?.filling?.material === 'dsp'
        && canUseHorizontalTexture(s?.fillingHeight?.value));
    });

    return (
      <RadioOption
        key={item.value}
        className={clsx(
          'icon',
          isChecked && 'checked',
          index === 0 ? 'vertical' : 'horizontal',
        )}
        iconPath={item.iconPath}
        name={`texture-${item.value}`}
        label={t(`options:textures.${item.value}`)}
        checked={isChecked}
        onChange={() => handleOptions('texture', textures, index)}
        isDisabled={index > 0 && (hasDoorsWithSections
          ? !someDoorHasProperSection
          : !canUseHorizontalTexture(doorFillingHeight))}
      />
    );
  });

  const stopperChoice = stoppers.map((item, index) => {
    const isChecked = stopper?.value === item.value;

    return (
      <RadioOption
        key={item.value}
        className={clsx(
          'text-button',
          isChecked && 'checked',
          index === 0 ? 'left' : 'right',
        )}
        name={`stopper-${index}`}
        label={t(`options:stoppers.${item.value}`)}
        checked={isChecked}
        onChange={() => handleOptions('stopper', stoppers, index)}
        isDisabled={index > 0 && currentSystem === 'monorail'}
      />
    );
  });

  const aluminiumColorChoice = aluminiumColors
    .filter(({ articleCode }) => availableColors.findIndex((color) => color === articleCode) !== -1)
    .map((item) => {
      const articleCode = item?.articleCode;
      const isChecked = aluminiumColor?.value === articleCode;
      const isDisabled = availableColors.findIndex((color) => color === articleCode) === -1;

      return (
        <RadioOption
          key={articleCode}
          className={clsx(
            'color',
            isChecked && !isDisabled && 'checked',
            isDisabled && 'disabled',
          )}
          backgroundColor={item.color}
          name={`aluminium-color-${articleCode}`}
          label={item[labelKey]}
          checked={isChecked && !isDisabled}
          onChange={() => handleColorOptions(articleCode)}
          isDisabled={isDisabled}
        />
      );
    });

  const renderMonorailDoorWidth = () => {
    if (currentSystem !== 'monorail') return null;

    return (
      <div className="main-tab--item-group">
        <div className="main-tab--item-group-caption">
          <p className="main-tab--item-group-caption-title">
            {t('stickyMenu.mainDoorTab.monorail-door-width')}
          </p>
          <p className="main-tab--item-group-caption-subtitle">{monorailDoorWidthLabel}</p>
        </div>
        <Input
          inputRef={inputRefMonoW}
          className="small"
          type="number"
          min={Number(minDoorOpeningWidth)}
          max={Number(maxMonorailDoorWidth)}
          placeholder="0"
          direction="rtl"
          value={monorailDoorWidth?.value ?? ''}
          onChange={handleUpdateMonorailDoorWidth}
          onBlur={sanitizeAndSaveMonorailDoorWidth}
          onKeyDown={(e) => { if (e.keyCode === 13) inputRefMonoW.current.blur(); }}
          key="monorailSingleDoorWidth"
          name="monorailSingleDoorWidth"
          error={monorailSingleDoorWidth?.error}
          isDisabled={!doorOpeningWidth.value}
        />
      </div>
    );
  };

  const renderSidewallThickness = () => {
    if (currentSystem !== 'hinged') return null;

    return (
      <div className="main-tab--item-group">
        <div className="main-tab--item-group-caption">
          <p className="main-tab--item-group-caption-title">
            {t('stickyMenu.mainDoorTab.sidewall-thickness')}
          </p>
          <p className="main-tab--item-group-caption-subtitle">{sidewallThicknessLabel}</p>
        </div>
        <Input
          inputRef={inputRefSidewallThickness}
          className="small"
          type="number"
          min={minSidewallThickness}
          max={maxSidewallThickness}
          placeholder="0"
          direction="rtl"
          value={sidewallThicknessValue?.value ?? ''}
          onChange={handleUpdateSidewallThickness}
          onBlur={sanitizeAndSaveSidewallThickness}
          onKeyDown={(e) => { if (e.keyCode === 13) inputRefSidewallThickness.current.blur(); }}
          key="sidewallThickness"
          name="sidewallThickness"
          error={sidewallThickness?.error}
        />
      </div>
    );
  };

  const renderMonorailCheckboxes = () => {
    if (currentSystem !== 'monorail') return null;

    return (
      <>
        <div className="main-tab--item-group">
          <Checkbox
            isChecked={isX2ProfileOn}
            label={t('stickyMenu.mainDoorTab.x2Profile')}
            onChange={handleIsX2ProfileOn}
            key="isX2ProfileOn"
            name="isX2ProfileOn"
          />
        </div>
        <div className="main-tab--item-group">
          <Checkbox
            isChecked={isX4ProfileOn}
            label={t('stickyMenu.mainDoorTab.x4Profile')}
            onChange={handleIsX4ProfileOn}
            key="isX4ProfileOn"
            name="isX4ProfileOn"
          />
        </div>
      </>
    );
  };

  const filteredOptions = useMemo(() =>
      sideProfiles.filter(({ colorsDependence, articleCode, isHidden }) => colorsDependence.some((item) =>
        !isHidden ? isColorSideProfileAvailable(item, articleCode, prices) : null)
      ), [sideProfiles, prices, isHidden]);

  return (
    <div className={clsx('tab-content', 'main-tab')} key="door-main-tab">
      <div className="main-tab--inner">
        <div className="main-tab--item-group">
          <div className="main-tab--item-group-caption">
            <p className="main-tab--item-group-caption-title">
              {t('stickyMenu.mainDoorTab.aperture-height')}
            </p>
            <p className="main-tab--item-group-caption-subtitle">{doorOpeningHeightLabel}</p>
          </div>
          <Input
            inputRef={inputRefH}
            className="small"
            type="number"
            min={minDoorOpeningHeight}
            max={maxDoorOpeningHeight}
            placeholder="0"
            direction="rtl"
            value={height?.value ?? ''}
            onChange={handleUpdateHeight}
            onBlur={sanitizeAndSaveHeight}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                inputRefH.current.blur();
                inputRefW.current.focus();
              }
            }}
            key="doorOpeningHeight"
            name="doorOpeningHeight"
            error={doorOpeningHeight?.error}
          />
        </div>
        <div className="main-tab--item-group">
          <div className="main-tab--item-group-caption">
            <p className="main-tab--item-group-caption-title">
              {t('stickyMenu.mainDoorTab.aperture-width')}
            </p>
            <p className="main-tab--item-group-caption-subtitle">{doorOpeningWidthLabel}</p>
          </div>
          <Input
            inputRef={inputRefW}
            className="small"
            type="number"
            min={minDoorOpeningW}
            max={maxDoorOpeningW}
            placeholder="0"
            direction="rtl"
            value={width?.value ?? ''}
            onChange={handleUpdateWidth}
            onBlur={sanitizeAndSaveWidth}
            onKeyDown={(e) => {
              if (e.keyCode !== 13) return;
              inputRefW.current.blur();
              if (currentSystem === 'monorail') inputRefMonoW.current.focus();
            }}
            key="doorOpeningWidth"
            name="doorOpeningWidth"
            error={doorOpeningWidth?.error}
          />
        </div>
        {renderMonorailDoorWidth()}
        {renderSidewallThickness()}
        <div className="main-tab--item-group">
          <div className="main-tab--item-group-caption">
            <p className="main-tab--item-group-caption-title">
              {t('stickyMenu.mainDoorTab.number-of-doors')}
            </p>
            <p className={clsx('main-tab--item-group-caption-subtitle', shouldHighlight && 'highlighted')}>
              {doorsAmountLabel}
            </p>
          </div>
          <PlusMinusControl
            amount={doorsAmount.value}
            name="doorsAmount"
            setAmount={onDoorsAmountChange}
          />
        </div>

        { !_.some(['monorail', 'assembling'], (item) => item === currentSystem)
          && (
            <>
              <Label
                value={t('stickyMenu.mainDoorTab.door-layout')}
                infoTagValue={t('tooltips.door-layout')}
                htmlFor="radio-group icons"
                withInfoTag
              />
              <RadioGroup className={currentSystem === 'hinged' ? 'text-button' : 'icons'}>
                {doorPositioningChoice()}
              </RadioGroup>
            </>
          )}

        <Label
          value={t('stickyMenu.mainDoorTab.side-profile')}
          infoTagValue={t('tooltips.side-profile')}
          withInfoTag
        />
        <Dropdown
          placeholder={t('stickyMenu.mainDoorTab.choose-profile')}
          isClearable={false}
          options={filteredOptions
            .filter((sp) => sp.colorsDependence.length)
            .map((sp) => ({
              value: sp.articleCode,
              label: sp.articleCode,
              image: sp.image,
            }))}
          onChange={(selectedOption) => {
            if (!selectedOption?.value) return;
            const isCurrentColorAvailable = isColorSideProfileAvailable(aluminiumColor?.value, selectedOption?.value,
              prices);
            dispatch(DoorsActions
              .updateSideProfile(selectedOption?.value, systemConctants, currentSystem, isCurrentColorAvailable));
            dispatch(OrderActions.calculateOrderRequest());
          }}
          value={
            filteredOptions.length && sideProfile?.value
              ? sideProfiles.find((item) => item.articleCode === sideProfile?.value)
              : null
          }
        />

        <Label
          value={t('stickyMenu.mainDoorTab.aluminum-profile-color')}
          infoTagValue={t('tooltips.aluminum-profile-color')}
          withInfoTag
        />
        {
          aluminiumColorChoice.length
            ? (
              <RadioGroup className="color">{aluminiumColorChoice}</RadioGroup>
            ) : <div className="label--secondary">{t('stickyMenu.mainDoorTab.no-available-aluminum-profiles')}</div>
        }

        {renderMonorailCheckboxes()}

        <Label
          value={t('stickyMenu.mainDoorTab.mechanism')}
          infoTagValue={t('tooltips.mechanism')}
          withInfoTag
        />
        <Dropdown
          placeholder={t('stickyMenu.mainDoorTab.choose-mechanism')}
          hasInternalTranslation
          isDisabled={!sideProfile?.value}
          options={mechanisms?.length
            ? mechanisms
              .filter((m) => availableMechanisms.indexOf(m.articleCode) !== -1)
              .filter((m) => deprecatedMechanisms.indexOf(m.articleCode) === -1)
              .map((m) => ({
                value: m.articleCode,
                labelRu: m.labelRu || '',
                labelUk: m.labelUk || '',
                image: m.image || '',
              }))
            : []}
          onChange={(selectedOption) => {
            if (!selectedOption?.value) return;
            handleDropdown('mechanism', selectedOption);
          }}
          value={
            (mechanism.value && mechanisms
              && mechanisms[mechanisms?.findIndex((m) => m.articleCode === mechanism.value)]
            ) || null
          }
        />
        { currentSystem === 'hinged' && doorsAmount.value === 3
          ? (
            <>
              <br />
              <div className="main-tab--item-group">
                <Checkbox
                  isChecked={isMiddleDoorMechanismOn}
                  label={t('stickyMenu.mainDoorTab.middle-door-mechanism')}
                  onChange={handleIsMiddleDoorMechanismOn}
                  key="isMiddleDoorMechanismOn"
                  name="isMiddleDoorMechanismOn"
                />
              </div>
            </>
          ) : null}

        { currentSystem === 'extendable'
          && (
            <div className="main-section--row-space-between">
              <Label value={t('stickyMenu.mainDoorTab.stopper')} />
              <Switch
                className="door-latch-mechanism"
                isToggled={isStopperOn}
                setToggleValue={() => {
                  dispatch(DoorsActions.toggleStopper(!isStopperOn, sideProfile?.value, systemConctants));
                  dispatch(OrderActions.calculateOrderRequest());
                }}
              />
            </div>
          )}

        { currentSystem === 'extendable' && isStopperOn
          ? (
            <RadioGroup className="text-button">{stopperChoice}</RadioGroup>
          ) : null }

        <FillingMaterialsControl
          label={t('stickyMenu.mainDoorTab.filling-material')}
          filling={filling}
          onClick={() => dispatch(FillingActions.toggleFillingMaterialModal(true))}
        />

        { mainDoorFilling?.material === 'dsp' || atLeastSomethingIsChipboard()
          ? (
            <>
              <Label
                value={t('stickyMenu.mainDoorTab.texture')}
                infoTagValue={t('tooltips.texture')}
                withInfoTag
              />
              <RadioGroup className="icons">
                {textureChoice}
              </RadioGroup>
            </>
          ) : null}
      </div>
      <br />

      <FillingMaterialsModal
        isMainFilling
        isOpen={isOpenFillingModal}
        onCloseModal={() => dispatch(FillingActions.toggleFillingMaterialModal(false))}
        activeTrigger={activeTrigger || mainDoorFilling?.material || ''}
        setActiveTrigger={(trigger) => dispatch(FillingActions.setActiveTrigger(trigger))}
        onSubmit={handleSubmitMainDoorFilling}
        clearFilling={() => {
          dispatch(DoorsActions.clearFilling(null, null));
          dispatch(OrderActions.calculateOrderRequest());
          dispatch(FillingActions.resetFillingMaterialModal());
        }}

        setCustomersOption={(option) => dispatch(FillingActions.setCustomersOption(option))}
        customersOption={customersOption || mainDoorFilling?.customersOption || ''}
        isMilling={isMilling}
        setCustomDSPMilling={(isOn) => dispatch(FillingActions.setCustomDSPMilling(isOn))}
        dspOption={dspOption || mainDoorFilling?.dspOption || ''}
        setDspOption={(option) => dispatch(FillingActions.setDspOption(option))}
        dspManufacturer={manufacturer || mainDoorFilling?.manufacturer || ''}
        setDspManufacturer={(manufacture) => dispatch(FillingActions.setDspManufacturer(manufacture))}
        dspSearch={searchField}
        setDspSearch={(search) => dispatch(FillingActions.setDspSearch(search))}
        isDspUVPrinting={isDspUVPrinting}
        setDspUvPrinting={(isOn) => dispatch(FillingActions.setDspUvPrinting(isOn))}
        dspUvPrintType={dspUvPrintType || mainDoorFilling?.dspUvPrintType || ''}
        setDspUvPrintType={(printType) => dispatch(FillingActions.setDspUvPrintType(printType))}

        mirrorType={mirrorType || mainDoorFilling?.mirrorType || ''}
        setMirrorType={(type) => dispatch(FillingActions.setMirrorType(type))}
        isMirrorMatted={isMirrorMatted}
        setMirrorMatting={(isOn) => dispatch(FillingActions.setMirrorMatting(isOn))}
        isMirrorRearMatted={isMirrorRearMatted}
        setMirrorRearMatting={(isOn) => dispatch(FillingActions.setMirrorRearMatting(isOn))}
        setMirrorFullMatting={(isOn) => dispatch(FillingActions.setMirrorFullMatting(isOn))}
        isMirrorFullMatted={isMirrorFullMatted}
        mirrorColor={mirrorColor || mainDoorFilling?.mirrorColor || ''}
        setMirrorPaintingColor={(color) => dispatch(FillingActions.setMirrorPaintingColor(color))}
        isMirrorUVPrinting={isMirrorUVPrinting}
        setMirrorUvPrinting={(isOn) => dispatch(FillingActions.setMirrorUvPrinting(isOn))}
        mirrorUvPrintType={mirrorUvPrintType || mainDoorFilling?.mirrorUvPrintType || ''}
        setMirrorUvPrintType={(printType) => dispatch(FillingActions.setMirrorUvPrintType(printType))}
        isMirrorArmoredFilm={isMirrorArmoredFilm}
        setMirrorArmoredFilm={(isOn) => dispatch(FillingActions.setMirrorArmoredFilm(isOn))}
        isMirrorLaminated={isMirrorLaminated}
        setMirrorLamination={(isOn) => dispatch(FillingActions.setMirrorLamination(isOn))}
        mirrorSearch={mirrorSearch}
        setMirrorSearch={(search) => dispatch(FillingActions.setMirrorSearch(search))}

        lacobelType={lacobelType || mainDoorFilling?.lacobelType || ''}
        setLacobelType={(type) => dispatch(FillingActions.setLacobelType(type))}
        isLacobelMatted={isLacobelMatted}
        setLacobelMatting={(isOn) => dispatch(FillingActions.setLacobelMatting(isOn))}
        isLacobelRearMatted={isLacobelRearMatted}
        setLacobelRearMatting={(isOn) => dispatch(FillingActions.setLacobelRearMatting(isOn))}
        isLacobelFullMatted={isLacobelFullMatted}
        setLacobelFullMatting={(isOn) => dispatch(FillingActions.setLacobelFullMatting(isOn))}
        lacobelColor={lacobelColor || mainDoorFilling?.lacobelColor || ''}
        setLacobelPaintingColor={(color) => dispatch(FillingActions.setLacobelPaintingColor(color))}
        isLacobelUVPrinting={isLacobelUVPrinting}
        setLacobelUvPrinting={(isOn) => dispatch(FillingActions.setLacobelUvPrinting(isOn))}
        lacobelUvPrintType={lacobelUvPrintType || mainDoorFilling?.lacobelUvPrintType || ''}
        setLacobelUvPrintType={(printType) => dispatch(FillingActions.setLacobelUvPrintType(printType))}
        isLacobelArmoredFilm={isLacobelArmoredFilm}
        setLacobelArmoredFilm={(isOn) => dispatch(FillingActions.setLacobelArmoredFilm(isOn))}
        isLacobelLaminated={isLacobelLaminated}
        setLacobelLamination={(isOn) => dispatch(FillingActions.setLacobelLamination(isOn))}
        lacobelSearch={lacobelSearch}
        setLacobelSearch={(search) => dispatch(FillingActions.setLacobelSearch(search))}

        glassType={glassType || mainDoorFilling?.glassType || ''}
        setGlassType={(type) => dispatch(FillingActions.setGlassType(type))}
        isGlassMatted={isGlassMatted}
        setGlassMatting={(isOn) => dispatch(FillingActions.setGlassMatting(isOn))}
        isGlassFullMatted={isGlassFullMatted}
        setGlassFullMatting={(isOn) => dispatch(FillingActions.setGlassFullMatting(isOn))}
        isGlassOneColorPainted={isGlassOneColorPainted}
        isGlassTwoColorsPainted={isGlassTwoColorsPainted}
        setGlassIsOneColorPainted={(type) => dispatch(FillingActions.setGlassIsOneColorPainted(type))}
        setGlassIsTwoColorsPainted={(type) => dispatch(FillingActions.setGlassIsTwoColorsPainted(type))}
        glassColors={glassColors || mainDoorFilling?.glassColors || []}
        setGlassPaintingColors={(colors) => dispatch(FillingActions.setGlassPaintingColors(colors))}
        isGlassUVPrinting={isGlassUVPrinting}
        setGlassUvPrinting={(isOn) => dispatch(FillingActions.setGlassUvPrinting(isOn))}
        isGlassPhotoPrinting={isGlassPhotoPrinting}
        setGlassPhotoPrinting={(isOn) => dispatch(FillingActions.setGlassPhotoPrinting(isOn))}
        glassUvPrintType={glassUvPrintType || mainDoorFilling?.glassUvPrintType || ''}
        setGlassUvPrintType={(printType) => dispatch(FillingActions.setGlassUvPrintType(printType))}
        glassPhotoPrintType={glassPhotoPrintType || mainDoorFilling?.glassPhotoPrintType || ''}
        setGlassPhotoPrintType={(printType) => dispatch(FillingActions.setGlassPhotoPrintType(printType))}
        glassSearch={glassSearch}
        setGlassSearch={(search) => dispatch(FillingActions.setGlassSearch(search))}
        isGlassArmoredFilm={isGlassArmoredFilm}
        setGlassArmoredFilm={(isOn) => dispatch(FillingActions.setGlassArmoredFilm(isOn))}
        isGlassLaminated={isGlassLaminated}
        setGlassLamination={(isOn) => dispatch(FillingActions.setGlassLamination(isOn))}
      />
    </div>
  );
};

export default DoorMainTab;
