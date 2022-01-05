/**
 *
 * Main Tab with settings for all sections
 *
 */

import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { hasOpeningSide } from '../../../../server/helpers/validation';

import {
  doorLatchMechanismPositionOptions,
  directionOfSectionsOptions,
  textures,
  openingSides,
} from '../../../helpers/options';

import {
  canUseAtLeast1DoorLatchMechanism,
  canUse2DoorLatchMechanisms,
  canUseHorizontalTexture,
} from '../../../helpers/validation';

import { doorFillingHeightForChipboard } from '../../../helpers/sizesCalculation';

import DoorsActions from '../../../redux/actions/doorsAndSections';
import FillingActions from '../../../redux/actions/fillingMaterials';
import OrderActions from '../../../redux/actions/order';

import RadioGroup from '../../RadioGroup';
import RadioOption from '../../RadioOption';
import PlusMinusControl from '../../PlusMinusControl';
import Label from '../../Label';
import Switch from '../../Switch';
import Dropdown from '../../Dropdown';
import FillingMaterialsControl from '../../FillingMaterialsControl';
import FillingMaterialsModal from '../../FillingMaterialsModal';


const SectionMainTab = ({
  doorNumber,
}) => {
  const { t } = useTranslation(['components', 'options']);
  const dispatch = useDispatch();

  const {
    minSectionsAmount,
    maxSectionsAmount,
    main: {
      sideProfile,
      doorOpeningHeight,
      doorOpeningWidth,
    },
    doors,
  } = useSelector(({ doorsAndSections }) => doorsAndSections);
  const door = doors[doorNumber - 1];

  const [availableConnectingProfiles, setAvailableConnectingProfiles] = useState([]);
  const [availableDoorLatchMechanisms, setAvailableDoorLatchMechanisms] = useState([]);
  const [availableDirectionsOfSections, setAvailableDirectionsOfSections] = useState([]);
  const [shouldHighlight, setShouldHighlight] = useState(false);
  const [filling, setFilling] = useState([{}]);

  if (!door) return null;

  const {
    main: {
      sectionsAmount,
      isDoorLatchMechanismOn,
      doorLatchMechanism,
      doorLatchMechanismPosition,
      isDoorAssemblingOn,
      directionOfSections,
      connectingProfile,
      filling: mainSectionTabFilling,
      texture,
      doorWidth,
      doorHeight,
      openingSide,
    },
    sections,
  } = door;

  const {
    doorLatchMechanisms,
    connectingProfiles,
    systemConctants,
  } = useSelector(({ config }) => config);

  const { currentSystem } = useSelector(({ systems }) => systems);
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
      isGlassFullMatted,
      isGlassOneColorPainted,
      isGlassTwoColorsPainted,
      glassColors,
      isGlassUVPrinting,
      glassUvPrintType,
      isGlassPhotoPrinting,
      glassPhotoPrintType,
      glassSearch,
    },
    isOpenFillingModal,
  } = fillingMaterialsState;

  const sectionsAmountLabel = t(
    'stickyMenu.mainSectionTab.amount',
    { minSectionsAmount, maxSectionsAmount },
  );

  useEffect(() => {
    setAvailableConnectingProfiles(systemConctants
      .find((c) => c.sideProfile === sideProfile.value)?.connectingProfilesDependence || []);

    setAvailableDoorLatchMechanisms(systemConctants
      .find((c) => c.sideProfile === sideProfile.value)?.doorLatchMechanismsDependence || []);

    setAvailableDirectionsOfSections(systemConctants
      .find((c) => c.sideProfile === sideProfile.value)?.directionsOfSections || []);
  }, [sideProfile.value, systemConctants]);

  useEffect(() => {
    const sectionsFilling = sections
      .filter((section) => !_.isEmpty(section.filling))
      .map((s) => s?.filling);

    const allFilling = sections.length ? sectionsFilling : [mainSectionTabFilling];

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
  }, [mainSectionTabFilling]);

  // Keep dependence on core values to calculate proper visible and filling sizes of each section
  useEffect(() => {
    dispatch(DoorsActions.updateDoorsSizes(systemConctants || [], currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  }, [
    connectingProfile?.value,
    doorLatchMechanism?.value,
  ]);

  const isDoorLatchMechanismAvailable = canUseAtLeast1DoorLatchMechanism(doorWidth);

  const handleSectionsAmount = (value) => {
    if (!_.isEmpty(doorOpeningHeight.error) || !_.isEmpty(doorOpeningWidth.error)) return;

    if (value < minSectionsAmount || value > maxSectionsAmount) {
      setShouldHighlight(true);
      setTimeout(() => {
        setShouldHighlight(false);
      }, 2000);
      return;
    }
    setShouldHighlight(false);

    if (value < sectionsAmount?.value) {
      dispatch(DoorsActions.removeLastSectionRequest(doorNumber - 1, systemConctants, currentSystem));
      dispatch(OrderActions.calculateOrderRequest());
      return;
    }

    dispatch(DoorsActions.addSection(doorNumber - 1, systemConctants, currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const updateMainSectionField = (name, value) => {
    dispatch(DoorsActions.updateMainSectionRequest(
      doorNumber - 1,
      { name, value },
      currentSystem,
    ));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleOptions = (name, options, index) => {
    dispatch(DoorsActions.updateMainSectionRequest(
      doorNumber - 1,
      { name, value: options[index]?.value || options[index] },
      currentSystem,
    ));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleDropdown = (name, selectedOption) => {
    dispatch(DoorsActions.updateMainSectionRequest(
      doorNumber - 1,
      { name, value: selectedOption?.value || '' },
      currentSystem,
    ));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleSubmitMainSectionFilling = () => {
    const mainSectionMaterialToSet = {
      ...fillingMaterialsState[activeTrigger],
      ...{ material: activeTrigger },
    };
    dispatch(DoorsActions.updateMainSectionFilling(
      doorNumber - 1,
      mainSectionMaterialToSet,
    ));
    dispatch(OrderActions.calculateOrderRequest());
    dispatch(FillingActions.resetFillingMaterialModal());
  };

  // Check if all chipboards are horizontal or vertical
  const textureChecker = (textureVal) => {
    const checker = () => {
      if (!door.sections?.length) return door.main.texture?.value === textureVal;
      else {
        const chipboardS = door.sections.filter((s) => s.filling?.material === 'dsp')?.length;
        const chipboardSTexture = door.sections
          .filter((s) => s.filling?.material === 'dsp' && s.texture?.value === textureVal)?.length;
        return chipboardSTexture === chipboardS;
      }
    };

    return checker();
  };

  const atLeastSomethingIsChipboard = () => {
    if (!sections?.length) return mainSectionTabFilling?.material === 'dsp';
    const chipboardArray = sections.map((s) => s.filling?.material === 'dsp');
    return _.some(chipboardArray, (s) => s === true);
  };

  const doorLatchMechanismChoice = doorLatchMechanismPositionOptions.map((item, index) => {
    let buttonStylePlace = '';
    switch (index) {
      case 0: buttonStylePlace = 'left'; break;
      case 1: buttonStylePlace = 'middle'; break;
      case 2: buttonStylePlace = 'right'; break;
      default: break;
    }
    const isChecked = doorLatchMechanismPosition?.value === item.value;

    return (
      <RadioOption
        key={item.value}
        className={clsx('text-button', isChecked && 'checked', buttonStylePlace)}
        name={`doorLatchMechanismPosition-${index}`}
        label={t(`options:doorLatchMechanismPositionOptions.${item.value}`)}
        checked={isChecked}
        isDisabled={item.value === 'both-sides' && !canUse2DoorLatchMechanisms(doorWidth)}
        onChange={() => handleOptions('doorLatchMechanismPosition', doorLatchMechanismPositionOptions, index)}
      />
    );
  });

  const directionOfSectionsChoice = directionOfSectionsOptions.map((item, index) => {
    const canBeUsed = Boolean(availableDirectionsOfSections.find((i) => i === item.value));
    const isChecked = directionOfSections?.value === item.value;

    return (
      <RadioOption
        key={item.value}
        className={clsx(
          'text-button',
          isChecked && 'checked',
          !canBeUsed && 'disabled',
          index === 0 ? 'left' : 'right',
        )}
        name={`directionOfSections-${index}`}
        label={t(`options:directionOfSectionsOptions.${item.value}`)}
        checked={isChecked}
        isDisabled={!canBeUsed}
        onChange={() => {
          if (!_.isEmpty(doorOpeningHeight.error) || !_.isEmpty(doorOpeningWidth.error)) return;
          handleOptions('directionOfSections', directionOfSectionsOptions, index);
          dispatch(DoorsActions.alignSections(doorNumber - 1, systemConctants, currentSystem));
          dispatch(OrderActions.calculateOrderRequest());
        }}
      />
    );
  });

  const textureChoice = textures.map((item, index) => {
    const isChecked = index === 0
      ? texture?.value === item.value && textureChecker('vertical')
      : texture?.value === item.value && textureChecker('horizontal');

    const doorFillingHeight = doorFillingHeightForChipboard(sideProfile?.value, doorHeight, systemConctants,
      currentSystem);
    const doorHasProperSection = _.some(sections, (s) => s?.filling?.material === 'dsp'
      && canUseHorizontalTexture(s?.fillingHeight?.value));

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
        isDisabled={index > 0 && (
          sections?.length ? !doorHasProperSection : !canUseHorizontalTexture(doorFillingHeight)
        )}
      />
    );
  });

  const openingSideChoice = openingSides.map((item, index) => {
    const isChecked = openingSide?.value === item.value;

    return (
      <RadioOption
        key={item.value}
        className={clsx(
          'text-button',
          isChecked && 'checked',
          index === 0 ? 'left' : 'right',
        )}
        name={`opening-side-${index}`}
        label={t(`options:openingSides.${item.value}`)}
        checked={isChecked}
        onChange={() => handleOptions('openingSide', openingSides, index)}
      />
    );
  });

  return (
    <div className={clsx('section-content', 'main-section')}>
      <div className="main-section--inner">
        { _.some(['extendable', 'monorail'], (item) => item === currentSystem) && availableDoorLatchMechanisms.length
          && (
            <div className="main-section--row-space-between">
              <Label
                value={t('stickyMenu.mainSectionTab.door-latch-mechanism')}
                infoTagValue={t('tooltips.door-latch-mechanism')}
                htmlFor="toggle-control door-latch-mechanism"
                withInfoTag
              />
              <Switch
                className="door-latch-mechanism"
                isToggled={isDoorLatchMechanismOn.value}
                setToggleValue={() => {
                  if (!isDoorLatchMechanismAvailable) return;
                  dispatch(DoorsActions.updateDoorLatchMechanism(doorNumber - 1, !isDoorLatchMechanismOn.value));
                  dispatch(OrderActions.calculateOrderRequest());
                }}
                isDisabled={!sideProfile?.value || !isDoorLatchMechanismAvailable}
              />
            </div>
          )}
        { _.some(['extendable', 'monorail'], (item) => item === currentSystem)
          && isDoorLatchMechanismOn.value && isDoorLatchMechanismAvailable
          && (
            <>
              <Dropdown
                hasInternalTranslation
                placeholder={t('stickyMenu.mainSectionTab.door-latch-mechanism')}
                options={doorLatchMechanisms?.length
                  ? doorLatchMechanisms
                    .filter((m) => availableDoorLatchMechanisms.indexOf(m.articleCode) !== -1)
                    .map((m) => ({
                      value: m.articleCode,
                      labelRu: m.labelRu || '',
                      labelUk: m.labelUk || '',
                      image: m.image || '',
                    }))
                  : []}
                value={
                  (doorLatchMechanism.value && doorLatchMechanisms
                    && doorLatchMechanisms[
                      doorLatchMechanisms?.findIndex((m) => m.articleCode === doorLatchMechanism.value)
                    ]) || null
                }
                onChange={(selectedOption) => handleDropdown('doorLatchMechanism', selectedOption)}
              />
              <RadioGroup className="text-button">
                {doorLatchMechanismChoice}
              </RadioGroup>
            </>
          )}

        <div className="main-section--column">
          <FillingMaterialsControl
            label={t('stickyMenu.mainSectionTab.filling-material')}
            filling={filling}
            onClick={() => dispatch(FillingActions.toggleFillingMaterialModal(true))}
          />

          { filling?.material === 'dsp' || atLeastSomethingIsChipboard()
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

        <div className="main-section--item-group">
          <div className="main-section--item-group-caption">
            <p className="main-section--item-group-caption-title">
              {t('stickyMenu.mainSectionTab.number-of-sections')}
            </p>
            <p className={clsx('main-section--item-group-caption-subtitle', shouldHighlight && 'highlighted')}>
              {sectionsAmountLabel}
            </p>
          </div>
          <PlusMinusControl
            amount={sectionsAmount.value}
            name="sectionsAmount"
            setAmount={handleSectionsAmount}
          />
        </div>

        { sectionsAmount.value
          ? (
            <>
              <Label value={t('stickyMenu.mainSectionTab.sectioning-direction')} />
              <RadioGroup className="text-button">
                {directionOfSectionsChoice}
              </RadioGroup>
              <Label
                value={t('stickyMenu.mainSectionTab.connecting-profile')}
                infoTagValue={t('tooltips.connecting-profile')}
                withInfoTag
              />
              <Dropdown
                hasInternalTranslation
                placeholder={t('stickyMenu.mainSectionTab.choose-profile')}
                isClearable={false}
                options={connectingProfiles?.length
                  ? connectingProfiles
                    .filter((p) => availableConnectingProfiles.indexOf(p.articleCode) !== -1)
                    .map((p) => ({
                      value: p.articleCode,
                      labelRu: p.labelRu || '',
                      labelUk: p.labelUk || '',
                      image: p.image || '',
                    }))
                  : []}
                value={
                  (connectingProfile?.value && connectingProfiles
                    && connectingProfiles[
                      connectingProfiles?.findIndex((c) => c.articleCode === connectingProfile.value)
                    ]) || null
                }
                onChange={(selectedOption) => {
                  if (!selectedOption) return;
                  handleDropdown('connectingProfile', selectedOption);
                }}
              />
            </>
          )
          : null }

        { hasOpeningSide(currentSystem)
          ? (
            <>
              <Label
                value={t('stickyMenu.mainDoorTab.opening-side')}
              />
              <RadioGroup className="text-button">
                {openingSideChoice}
              </RadioGroup>
            </>
          ) : null }

        <div className="main-section--row-space-between">
          <Label
            value={t('stickyMenu.mainSectionTab.door-assembly')}
            infoTagValue={t('tooltips.door-assembly')}
            htmlFor="toggle-control door-assembling"
            withInfoTag
          />
          <Switch
            className="door-assembling"
            isToggled={isDoorAssemblingOn.value}
            setToggleValue={() => updateMainSectionField('isDoorAssemblingOn', !isDoorAssemblingOn.value)}
          />
        </div>
      </div>
      <br />

      <FillingMaterialsModal
        doorNumber={`${doorNumber}`}
        isOpen={isOpenFillingModal}
        onCloseModal={() => dispatch(FillingActions.toggleFillingMaterialModal(false))}
        activeTrigger={activeTrigger || filling?.material || ''}
        setActiveTrigger={(trigger) => dispatch(FillingActions.setActiveTrigger(trigger))}
        onSubmit={handleSubmitMainSectionFilling}
        clearFilling={() => {
          dispatch(DoorsActions.clearFilling(doorNumber - 1, null));
          dispatch(OrderActions.calculateOrderRequest());
          dispatch(FillingActions.resetFillingMaterialModal());
        }}

        setCustomersOption={(option) => dispatch(FillingActions.setCustomersOption(option))}
        customersOption={customersOption || filling?.customersOption || ''}
        isMilling={isMilling}
        setCustomDSPMilling={(isOn) => dispatch(FillingActions.setCustomDSPMilling(isOn))}
        dspOption={dspOption || filling?.dspOption || ''}
        setDspOption={(option) => dispatch(FillingActions.setDspOption(option))}
        dspManufacturer={manufacturer || filling?.manufacturer || ''}
        setDspManufacturer={(manufacture) => dispatch(FillingActions.setDspManufacturer(manufacture))}
        dspSearch={searchField}
        setDspSearch={(search) => dispatch(FillingActions.setDspSearch(search))}
        isDspUVPrinting={isDspUVPrinting}
        setDspUvPrinting={(isOn) => dispatch(FillingActions.setDspUvPrinting(isOn))}
        dspUvPrintType={dspUvPrintType || filling?.dspUvPrintType || ''}
        setDspUvPrintType={(printType) => dispatch(FillingActions.setDspUvPrintType(printType))}

        mirrorType={mirrorType || filling?.mirrorType || ''}
        setMirrorType={(type) => dispatch(FillingActions.setMirrorType(type))}
        isMirrorMatted={isMirrorMatted}
        setMirrorMatting={(isOn) => dispatch(FillingActions.setMirrorMatting(isOn))}
        isMirrorRearMatted={isMirrorRearMatted}
        setMirrorRearMatting={(isOn) => dispatch(FillingActions.setMirrorRearMatting(isOn))}
        setMirrorFullMatting={(isOn) => dispatch(FillingActions.setMirrorFullMatting(isOn))}
        isMirrorFullMatted={isMirrorFullMatted}
        mirrorColor={mirrorColor || filling?.mirrorColor || ''}
        setMirrorPaintingColor={(color) => dispatch(FillingActions.setMirrorPaintingColor(color))}
        isMirrorUVPrinting={isMirrorUVPrinting}
        setMirrorUvPrinting={(isOn) => dispatch(FillingActions.setMirrorUvPrinting(isOn))}
        mirrorUvPrintType={mirrorUvPrintType || filling?.mirrorUvPrintType || ''}
        setMirrorUvPrintType={(printType) => dispatch(FillingActions.setMirrorUvPrintType(printType))}
        isMirrorArmoredFilm={isMirrorArmoredFilm}
        setMirrorArmoredFilm={(isOn) => dispatch(FillingActions.setMirrorArmoredFilm(isOn))}
        isMirrorLaminated={isMirrorLaminated}
        setMirrorLamination={(isOn) => dispatch(FillingActions.setMirrorLamination(isOn))}
        mirrorSearch={mirrorSearch}
        setMirrorSearch={(search) => dispatch(FillingActions.setMirrorSearch(search))}

        lacobelType={lacobelType || filling?.lacobelType || ''}
        setLacobelType={(type) => dispatch(FillingActions.setLacobelType(type))}
        isLacobelMatted={isLacobelMatted}
        setLacobelMatting={(isOn) => dispatch(FillingActions.setLacobelMatting(isOn))}
        isLacobelRearMatted={isLacobelRearMatted}
        setLacobelRearMatting={(isOn) => dispatch(FillingActions.setLacobelRearMatting(isOn))}
        isLacobelFullMatted={isLacobelFullMatted}
        setLacobelFullMatting={(isOn) => dispatch(FillingActions.setLacobelFullMatting(isOn))}
        lacobelColor={lacobelColor || filling?.lacobelColor || ''}
        setLacobelPaintingColor={(color) => dispatch(FillingActions.setLacobelPaintingColor(color))}
        isLacobelUVPrinting={isLacobelUVPrinting}
        setLacobelUvPrinting={(isOn) => dispatch(FillingActions.setLacobelUvPrinting(isOn))}
        lacobelUvPrintType={lacobelUvPrintType || filling?.lacobelUvPrintType || ''}
        setLacobelUvPrintType={(printType) => dispatch(FillingActions.setLacobelUvPrintType(printType))}
        isLacobelArmoredFilm={isLacobelArmoredFilm}
        setLacobelArmoredFilm={(isOn) => dispatch(FillingActions.setLacobelArmoredFilm(isOn))}
        isLacobelLaminated={isLacobelLaminated}
        setLacobelLamination={(isOn) => dispatch(FillingActions.setLacobelLamination(isOn))}
        lacobelSearch={lacobelSearch}
        setLacobelSearch={(search) => dispatch(FillingActions.setLacobelSearch(search))}

        glassType={glassType || filling?.glassType || ''}
        setGlassType={(type) => dispatch(FillingActions.setGlassType(type))}
        isGlassMatted={isGlassMatted}
        setGlassMatting={(isOn) => dispatch(FillingActions.setGlassMatting(isOn))}
        isGlassFullMatted={isGlassFullMatted}
        setGlassFullMatting={(isOn) => dispatch(FillingActions.setGlassFullMatting(isOn))}
        isGlassOneColorPainted={isGlassOneColorPainted}
        isGlassTwoColorsPainted={isGlassTwoColorsPainted}
        setGlassIsOneColorPainted={(type) => dispatch(FillingActions.setGlassIsOneColorPainted(type))}
        setGlassIsTwoColorsPainted={(type) => dispatch(FillingActions.setGlassIsTwoColorsPainted(type))}
        glassColors={glassColors || filling?.glassColors || []}
        setGlassPaintingColors={(colors) => dispatch(FillingActions.setGlassPaintingColors(colors))}
        isGlassUVPrinting={isGlassUVPrinting}
        setGlassUvPrinting={(isOn) => dispatch(FillingActions.setGlassUvPrinting(isOn))}
        isGlassPhotoPrinting={isGlassPhotoPrinting}
        setGlassPhotoPrinting={(isOn) => dispatch(FillingActions.setGlassPhotoPrinting(isOn))}
        glassPhotoPrintType={glassPhotoPrintType || filling?.glassPhotoPrintType || ''}
        setGlassPhotoPrintType={(printType) => dispatch(FillingActions.setGlassPhotoPrintType(printType))}
        glassUvPrintType={glassUvPrintType || filling?.glassUvPrintType || ''}
        setGlassUvPrintType={(printType) => dispatch(FillingActions.setGlassUvPrintType(printType))}
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

SectionMainTab.propTypes = {
  doorNumber: PropTypes.number.isRequired,
};

export default SectionMainTab;
