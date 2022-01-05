import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Collapsible from 'react-collapsible';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { hasOpeningSide } from '../../../server/helpers/validation';

import {
  glassUVPrintingTypes,
  glassPhotoPrintingTypes,
  chipboardUVPrintingTypes,
  mirrorUVPrintingTypes,
  lacobelUVPrintingTypes,
  glassTypes,
  mirrorTypes,
  lacobelTypes,
} from '../../helpers/options';
import { isManufacturerValid } from '../../helpers/validation';
import constantsBySystemType from '../../helpers/constantsBySystemType';
import { defaultPackageName } from '../../helpers/constants';
import Button from '../Button';
import RadioGroup from '../RadioGroup';
import RadioOption from '../RadioOption';
import Switch from '../Switch';
import Label from '../Label';
import Dropdown from '../Dropdown';

import ManufacturersOptions from './ManufacturersOptions';


const FillingMaterialsChoice = ({
  clearFilling,
  doorNumber,
  sectionNumber,
  isMainFilling,
  activeTrigger,
  setActiveTrigger,
  setCustomersOption,
  customersOption,
  isMilling,
  setCustomDSPMilling,
  dspOption,
  setDspOption,
  dspManufacturer,
  setDspManufacturer,
  dspSearch,
  setDspSearch,
  isDspUVPrinting,
  setDspUvPrinting,
  dspUvPrintType,
  setDspUvPrintType,
  mirrorType,
  setMirrorType,
  isMirrorMatted,
  setMirrorMatting,
  isMirrorRearMatted,
  setMirrorRearMatting,
  isMirrorFullMatted,
  setMirrorFullMatting,
  mirrorColor,
  setMirrorPaintingColor,
  isMirrorUVPrinting,
  setMirrorUvPrinting,
  mirrorUvPrintType,
  glassUvPrintType,
  setMirrorUvPrintType,
  setGlassUvPrintType,
  isMirrorArmoredFilm,
  setMirrorArmoredFilm,
  isMirrorLaminated,
  setMirrorLamination,
  mirrorSearch,
  setMirrorSearch,
  lacobelType,
  setLacobelType,
  isLacobelMatted,
  setLacobelMatting,
  isLacobelRearMatted,
  setLacobelRearMatting,
  isLacobelFullMatted,
  setLacobelFullMatting,
  lacobelColor,
  setLacobelPaintingColor,
  isLacobelUVPrinting,
  setLacobelUvPrinting,
  lacobelUvPrintType,
  setLacobelUvPrintType,
  isLacobelArmoredFilm,
  setLacobelArmoredFilm,
  isLacobelLaminated,
  setLacobelLamination,
  lacobelSearch,
  setLacobelSearch,
  glassType,
  setGlassType,
  isGlassMatted,
  setGlassMatting,
  isGlassFullMatted,
  setGlassFullMatting,
  isGlassOneColorPainted,
  isGlassTwoColorsPainted,
  setGlassIsOneColorPainted,
  setGlassIsTwoColorsPainted,
  glassColors,
  setGlassPaintingColors,
  isGlassUVPrinting,
  setGlassUvPrinting,
  isGlassPhotoPrinting,
  setGlassPhotoPrinting,
  glassPhotoPrintType,
  setGlassPhotoPrintType,
  glassSearch,
  setGlassSearch,
  isGlassArmoredFilm,
  setGlassArmoredFilm,
  isGlassLaminated,
  setGlassLamination,
  className,
}) => {
  const { t, i18n } = useTranslation(['components']);
  const labelKey = i18n.language === 'ru' ? 'labelRu' : 'labelUk';

  const { main } = useSelector(({ doorsAndSections }) => doorsAndSections);
  const { currentSystem } = useSelector(({ systems }) => systems);
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;
  const sideProfile = main?.sideProfile?.value || defaultSideProfile;

  const { filling, fillingFeatures: features } = useSelector(({ config }) => config);
  const { priceList } = useSelector(({ priceList: pricesList }) => pricesList);
  let fillingFeatures = [features.find((f) => f.articleCode === 'color_cust'),
    ...features.filter((f) => f.articleCode?.startsWith('ral_'))];

  fillingFeatures = _.map(fillingFeatures, (f) => ({
    ...f,
    ...{ number: +f.articleCode.substring(f.articleCode.indexOf('_') + 1) },
  })).sort((a, b) => a.number - b.number);

  const fillingChipboard = filling.filter((f) => isManufacturerValid(f.manufacturer));
  const availableManufacturers = _.uniq(fillingChipboard.map(({ manufacturer }) => manufacturer));

  const labelMatches = (item, search) => (new RegExp(search, 'i')).test(item[labelKey]);
  const hasDefaultPrice = (code) => priceList?.some(({ articleCode, packageName }) => articleCode === code
    && packageName === defaultPackageName);

  const manufacturerOptions = availableManufacturers.map((item) => ({
    name: item,
    options: fillingChipboard
      .filter((chipboard) => chipboard.manufacturer === item && labelMatches(chipboard, dspSearch)
        && hasDefaultPrice(chipboard.articleCode))
      .map((f) => ({
        value: f.articleCode,
        iconPath: f.image,
        labelRu: f.labelRu,
        labelUk: f.labelUk,
      })),
  }));

  const manufacturersDropdownOptions = availableManufacturers.map((m) => ({ value: m, label: m }));

  const [manufacturers, setManufacturers] = useState(manufacturerOptions);

  useEffect(() => {
    setManufacturers(() => _.sortBy(manufacturerOptions, ({ name }, i) => (name === dspManufacturer ? -1 : i)));
  }, [dspManufacturer, dspSearch]);

  useEffect(() => {
    if (activeTrigger) setActiveTrigger(activeTrigger);
  }, [activeTrigger]);

  useEffect(() => {
    setTimeout(() => {
      if (activeTrigger === 'dsp' && dspOption) {
        document.getElementById(dspOption).scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  }, [dspOption, activeTrigger]);

  // Set Slim params
  useEffect(() => {
    const isNotSlim = main.sideProfile.value !== 'Slim';
    if (isNotSlim) return;

    setMirrorArmoredFilm(false);
    setMirrorLamination(true);
    setGlassArmoredFilm(false);
    setGlassLamination(true);
  }, [main?.sideProfile?.value]);

  // Set params depending on currentSystem
  useEffect(() => {
    if (currentSystem !== 'opening') return;

    setMirrorArmoredFilm(false);
    setMirrorLamination(true);
    setGlassArmoredFilm(false);
    setGlassLamination(false);
    setLacobelArmoredFilm(false);
    setLacobelLamination(true);
  }, [currentSystem]);

  const customersClassName = clsx(
    'trigger-wrapper',
    activeTrigger === 'customers' && 'open',
  );
  const dspClassName = clsx(
    'trigger-wrapper',
    sideProfile === 'Slim' && 'disabled',
    activeTrigger === 'dsp' && sideProfile !== 'Slim' && 'open',
  );
  const mirrorClassName = clsx(
    'trigger-wrapper',
    activeTrigger === 'mirror' && 'open',
  );
  const lacobelClassName = clsx(
    'trigger-wrapper',
    activeTrigger === 'lacobel' && 'open',
  );
  const glassClassName = clsx(
    'trigger-wrapper',
    activeTrigger === 'glass' && 'open',
  );

  const customersDspSmallClassName = clsx('icon icon-button-large',
    activeTrigger === 'customers' && customersOption === 'dsp-small' && 'active');

  const customersDspLargeClassName = clsx('icon icon-button-large',
    activeTrigger === 'customers' && customersOption === 'dsp-large' && 'active');

  const customersGlassClassName = clsx('icon icon-button',
    activeTrigger === 'customers' && customersOption === 'glass' && 'active');

  const triggers = {
    customers: (
      <div className={customersClassName}>
        <div className="trigger-check" />
        <img
          className="trigger-image"
          src="src/client/assets/icons/fillingMaterials/customers-material.svg"
          alt="customers"
        />
        <p className="trigger-text">{t('fillingMaterialsModal.customers')}</p>
      </div>),
    dsp: (
      <div className={dspClassName}>
        <div className="trigger-check" />
        <img
          className="trigger-image"
          src="src/client/assets/icons/fillingMaterials/dsp.svg"
          alt="chipboard"
        />
        <p className="trigger-text">{t('fillingMaterialsModal.dsp')}</p>
      </div>
    ),
    mirror: (
      <div className={mirrorClassName}>
        <div className="trigger-check" />
        <img
          className="trigger-image"
          src="src/client/assets/icons/fillingMaterials/mirror.svg"
          alt="mirror"
        />
        <p className="trigger-text">{t('fillingMaterialsModal.mirror')}</p>
      </div>),
    lacobel: (
      <div className={lacobelClassName}>
        <div className="trigger-check" />
        <img
          className="trigger-image"
          src="src/client/assets/icons/fillingMaterials/mirror.svg"
          alt="lacobel"
        />
        <p className="trigger-text">{t('fillingMaterialsModal.lacobel')}</p>
      </div>),
    glass: (
      <div className={glassClassName}>
        <div className="trigger-check" />
        <img
          className="trigger-image"
          src="src/client/assets/icons/fillingMaterials/glass.svg"
          alt="glass"
        />
        <p className="trigger-text">{t('fillingMaterialsModal.glass')}</p>
      </div>),
  };

  return (
    <div className={clsx('filling-materials-choise', className)}>
      <h2 className="headings-h2">{t('fillingMaterialsModal.filling-choice')}</h2>
      <div className="filling-materials-modal--subtitle">
        {isMainFilling && t('fillingMaterialsModal.main-filling')}
        {doorNumber > 0 && t('fillingMaterialsModal.door-n', { doorNumber })}
        {sectionNumber > 0 ? '. ' : ''}
        {sectionNumber > 0 && t('fillingMaterialsModal.section-n', { doorNumber, sectionNumber })}
      </div>

      {/** Custom materials */}

      <Collapsible
        trigger={triggers.customers}
        containerElementProps={activeTrigger === 'customers' ? { activeTrigger } : null}
        onTriggerOpening={() => setActiveTrigger('customers')}
        onTriggerClosing={() => setActiveTrigger(null)}
        disabled={activeTrigger !== 'customers'}
        open={activeTrigger === 'customers'}
      >
        <RadioGroup className="icon-button">
          <RadioOption
            className={clsx(customersDspSmallClassName, sideProfile === 'Slim' && 'disabled')}
            iconPath="/src/client/assets/icons/fillingMaterials/dsp-small.svg"
            label="ДСП 10mm"
            onChange={() => setCustomersOption('dsp-small')}
            isDisabled={sideProfile === 'Slim'}
          />
          <RadioOption
            className={clsx(customersDspLargeClassName, sideProfile === 'Slim' && 'disabled')}
            iconPath="/src/client/assets/icons/fillingMaterials/dsp-large.svg"
            label="ДСП 10+mm"
            onChange={() => setCustomersOption('dsp-large')}
            isDisabled={sideProfile === 'Slim'}
          />
          <RadioOption
            className={customersGlassClassName}
            iconPath="/src/client/assets/icons/fillingMaterials/large-mirror.svg"
            label={t('fillingMaterialsModal.glass')}
            onChange={() => setCustomersOption('glass')}
          />
        </RadioGroup>
        {customersOption !== 'dsp-large' || (
          <div className="milling-section">
            <Label className="milling-section-title" value={t('fillingMaterialsModal.milling')} />
            <Switch
              isToggled={isMilling}
              setToggleValue={() => setCustomDSPMilling(!isMilling)}
            />
          </div>
        )}
      </Collapsible>

      {/** Chipboard */}

      <Collapsible
        trigger={triggers.dsp}
        triggerDisabled={sideProfile === 'Slim'}
        containerElementProps={activeTrigger === 'dsp' ? { activeTrigger } : null}
        onTriggerOpening={() => {
          if (sideProfile === 'Slim') return;
          setActiveTrigger('dsp');
        }}
        onTriggerClosing={() => setActiveTrigger(null)}
        disabled={sideProfile === 'Slim' || activeTrigger !== 'dsp'}
        open={activeTrigger === 'dsp' && sideProfile !== 'Slim'}
      >
        <div className="dsp-section-wrapper">
          <div className="dsp-section-inner">
            <Dropdown
              placeholder={t('fillingMaterialsModal.choose-manufacturer')}
              options={manufacturersDropdownOptions}
              onChange={(option) => {
                if (!option?.value) return;
                setDspManufacturer(option?.value);
              }}
              value={dspManufacturer
                ? manufacturersDropdownOptions.find((item) => item.value === dspManufacturer)
                : manufacturersDropdownOptions[0]}
            />
            <br />

            {/** Ультрафіолетовий друк */}
            <div className="uv-print-section">
              <Label
                value={t('fillingMaterialsModal.uv-print')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isDspUVPrinting}
                setToggleValue={() => setDspUvPrinting(!isDspUVPrinting)}
              />
            </div>
            <br />

            {/** Тип ДСП друка */}
            {!isDspUVPrinting || (
              <>
                <Dropdown
                  placeholder={t('fillingMaterialsModal.choose-type')}
                  options={chipboardUVPrintingTypes}
                  onChange={(option) => {
                    if (!option?.value) return;
                    setDspUvPrintType(option?.value);
                  }}
                  translationNs="options:chipboardUVPrintingTypes"
                  value={chipboardUVPrintingTypes.find((item) => item.value === dspUvPrintType)}
                />
              </>
            )}

            {/** Пошук за назвою або артикулу */}
            <div className="dsp-section-search">
              <div className="dsp-section-search-glass" />
              <input
                placeholder={t('fillingMaterialsModal.search-by-name-or-article')}
                className="dsp-section-search-input"
                onChange={(e) => setDspSearch(e.target.value)}
                value={dspSearch}
              />
            </div>

            {/** Виробники та опції */}
            <div className="dsp-options-wrapper">
              {manufacturers && manufacturers.map((manufacturer, i) => (
                <div key={`manufacturer-${i + 1}`}>
                  <p
                    id={manufacturer?.name}
                    className="dsp-options-caption"
                  >
                    {manufacturer?.name}
                  </p>
                  <RadioGroup
                    key={`manufacturer-group-${i + 1}`}
                    className="image-button"
                  >
                    {manufacturer?.options?.map((option, j) => (
                      <ManufacturersOptions
                        key={`option-${j + 1}`}
                        manufacturerName={manufacturer.name}
                        optionValue={option.value}
                        optionLabel={option[labelKey]}
                        optionIcon={option.iconPath}
                        chosenOption={dspOption}
                        onClick={() => {
                          setDspManufacturer(manufacturer.name);
                          setDspOption(option.value);
                        }}
                      />
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Collapsible>

      {/** Mirror */}

      <Collapsible
        trigger={triggers.mirror}
        containerElementProps={activeTrigger === 'mirror' ? { activeTrigger } : null}
        onTriggerOpening={() => {
          setActiveTrigger('mirror');
          if (!mirrorType) setMirrorType(mirrorTypes[0].value);
        }}
        onTriggerClosing={() => setActiveTrigger(null)}
        disabled={activeTrigger !== 'mirror'}
        open={activeTrigger === 'mirror'}
      >
        <div className="mirror-section-wrapper">
          <div className="mirror-section-inner">
            <Dropdown
              placeholder={t('fillingMaterialsModal.choose-type')}
              options={mirrorTypes}
              onChange={(option) => {
                if (!option?.value) return;
                setMirrorType(option?.value);
              }}
              translationNs="options:mirrorTypes"
              value={mirrorTypes.find((item) => item.value === mirrorType)}
            />
            <br />

            {/** Повне матування */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.full-matting')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isMirrorFullMatted}
                setToggleValue={() => {
                  if (!isMirrorFullMatted && currentSystem !== 'opening') {
                    setMirrorMatting(false);
                    setMirrorUvPrinting(false);
                    setMirrorRearMatting(false);
                    setMirrorLamination(false);
                    setMirrorArmoredFilm(true);
                  }
                  if (isMirrorFullMatted && currentSystem === 'opening') {
                    setMirrorArmoredFilm(false);
                    setMirrorLamination(true);
                  }
                  if (!isMirrorFullMatted && currentSystem === 'opening') {
                    setMirrorArmoredFilm(false);
                    setMirrorLamination(true);
                    setMirrorMatting(false);
                    setMirrorUvPrinting(false);
                    setMirrorRearMatting(false);
                  }
                  setMirrorFullMatting(!isMirrorFullMatted);
                }}
              />
            </div>
            <br />

            {/** Матування за трафаретом */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.stencil-matting')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isMirrorMatted}
                setToggleValue={() => {
                  if (!isMirrorMatted && currentSystem !== 'opening') {
                    setMirrorUvPrinting(false);
                    setMirrorRearMatting(false);
                    setMirrorFullMatting(false);
                    setMirrorArmoredFilm(true);
                    setMirrorLamination(false);
                  }
                  if (isMirrorMatted && currentSystem === 'opening') {
                    setMirrorArmoredFilm(false);
                    setMirrorLamination(true);
                  }
                  if (!isMirrorMatted && currentSystem === 'opening') {
                    setMirrorArmoredFilm(false);
                    setMirrorLamination(true);
                    setMirrorUvPrinting(false);
                    setMirrorRearMatting(false);
                    setMirrorFullMatting(false);
                  }
                  setMirrorMatting(!isMirrorMatted);
                }}
              />
            </div>
            <br />

            {/** Тильне матування */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.rear-matting')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isMirrorRearMatted}
                setToggleValue={() => {
                  if (!isMirrorRearMatted && currentSystem !== 'opening') {
                    setMirrorMatting(false);
                    setMirrorUvPrinting(false);
                    setMirrorLamination(false);
                    setMirrorFullMatting(false);
                    setMirrorArmoredFilm(false);
                  }
                  if (isMirrorRearMatted && currentSystem !== 'opening') {
                    setMirrorArmoredFilm(true);
                  }
                  if (isMirrorRearMatted && currentSystem === 'opening') {
                    setMirrorArmoredFilm(false);
                    setMirrorLamination(true);
                  }
                  if (!isMirrorRearMatted && currentSystem === 'opening') {
                    setMirrorArmoredFilm(false);
                    setMirrorLamination(true);
                    setMirrorMatting(false);
                    setMirrorUvPrinting(false);
                    setMirrorFullMatting(false);
                  }
                  setMirrorRearMatting(!isMirrorRearMatted);
                }}
              />
            </div>
            <br />

            {/** Пошук за назвою або артикулу */}
            {!isMirrorRearMatted || (
              <>
                <div className="mirror-section-search">
                  <div className="mirror-section-search-glass" />
                  <input
                    placeholder={t('fillingMaterialsModal.search-by-name-or-article')}
                    className="mirror-section-search-input"
                    onChange={(e) => setMirrorSearch(e.target.value)}
                    value={mirrorSearch}
                  />
                </div>
                <div className="mirror-options-wrapper">
                  <RadioGroup className="color">
                    {fillingFeatures.filter((feat) => labelMatches(feat, mirrorSearch)).map((el, i) => (
                      <RadioOption
                        checked={mirrorColor === el.articleCode}
                        key={`mirror-${i + 1}`}
                        className={clsx('color', mirrorColor === el.articleCode && 'checked')}
                        backgroundColor={el.image}
                        onChange={() => setMirrorPaintingColor(el.articleCode)}
                        label={el[labelKey]}
                      />
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {/** Ультрафіолетовий друк */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.uv-print')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isMirrorUVPrinting}
                setToggleValue={() => {
                  if (!isMirrorUVPrinting) {
                    setMirrorMatting(false);
                    setMirrorRearMatting(false);
                    setMirrorFullMatting(false);
                  }
                  if (currentSystem === 'opening') {
                    setMirrorArmoredFilm(false);
                    setMirrorLamination(true);
                  }
                  setMirrorUvPrinting(!isMirrorUVPrinting);
                }}
              />
            </div>
            <br />

            {/** Тип ультрафіолетового друка */}
            {!isMirrorUVPrinting || (
              <>
                <Dropdown
                  placeholder={t('fillingMaterialsModal.choose-type')}
                  options={mirrorUVPrintingTypes}
                  onChange={(option) => {
                    if (!option?.value) return;
                    setMirrorUvPrintType(option?.value);
                  }}
                  translationNs="options:mirrorUVPrintingTypes"
                  value={mirrorUVPrintingTypes.find((item) => item.value === mirrorUvPrintType)}
                />
                <br />
              </>
            )}
            <hr />
            <br />

            {/** Бронь плівка */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.armored-film')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isMirrorArmoredFilm}
                setToggleValue={() => {
                  if (sideProfile === 'Slim') {
                    setMirrorArmoredFilm(false);
                    return;
                  }
                  if (isMirrorRearMatted) return;
                  setMirrorArmoredFilm(!isMirrorArmoredFilm);
                  setMirrorLamination(isMirrorArmoredFilm);
                }}
              />
            </div>
            <br />

            {/** Ламінування білою плівкою */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.white-lamination')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isMirrorLaminated}
                setToggleValue={() => {
                  if (sideProfile === 'Slim') {
                    setMirrorLamination(true);
                    return;
                  }
                  if (isMirrorRearMatted) {
                    setMirrorLamination(!isMirrorLaminated);
                    return;
                  }
                  setMirrorLamination(!isMirrorLaminated);
                  setMirrorArmoredFilm(isMirrorLaminated);
                }}
              />
            </div>
          </div>
          <br />
        </div>
      </Collapsible>

      {/** Lacobel */}

      <Collapsible
        trigger={triggers.lacobel}
        containerElementProps={activeTrigger === 'lacobel' ? { activeTrigger } : null}
        onTriggerOpening={() => {
          setActiveTrigger('lacobel');
          if (!lacobelType) setLacobelType(lacobelTypes[0].value);
        }}
        onTriggerClosing={() => setActiveTrigger(null)}
        disabled={activeTrigger !== 'lacobel'}
        open={activeTrigger === 'lacobel'}
      >
        <div className="mirror-section-wrapper">
          <div className="mirror-section-inner">
            <Dropdown
              placeholder={t('fillingMaterialsModal.choose-type')}
              options={lacobelTypes}
              onChange={(option) => {
                if (!option?.value) return;
                setLacobelType(option?.value);
              }}
              translationNs="options:lacobelTypes"
              value={lacobelTypes.find((item) => item.value === lacobelType)}
            />
            <br />

            {/** Повне матування */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.full-matting')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isLacobelFullMatted}
                setToggleValue={() => {
                  if (!isLacobelFullMatted && currentSystem !== 'opening') {
                    setLacobelMatting(false);
                    setLacobelUvPrinting(false);
                    setLacobelRearMatting(false);
                    setLacobelLamination(false);
                    setLacobelArmoredFilm(true);
                  }
                  if (isLacobelFullMatted && currentSystem === 'opening') {
                    setLacobelArmoredFilm(false);
                    setLacobelLamination(true);
                  }
                  if (!isLacobelFullMatted && currentSystem === 'opening') {
                    setLacobelArmoredFilm(false);
                    setLacobelLamination(true);
                    setLacobelMatting(false);
                    setLacobelUvPrinting(false);
                    setLacobelRearMatting(false);
                  }
                  setLacobelFullMatting(!isLacobelFullMatted);
                }}
              />
            </div>
            <br />

            {/** Матування за трафаретом */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.stencil-matting')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isLacobelMatted}
                setToggleValue={() => {
                  if (!isLacobelMatted && currentSystem !== 'opening') {
                    setLacobelUvPrinting(false);
                    setLacobelRearMatting(false);
                    setLacobelArmoredFilm(true);
                    setLacobelLamination(false);
                    setLacobelFullMatting(false);
                  }
                  if (isLacobelMatted && currentSystem === 'opening') {
                    setLacobelArmoredFilm(false);
                    setLacobelLamination(true);
                  }
                  if (!isLacobelMatted && currentSystem === 'opening') {
                    setLacobelArmoredFilm(false);
                    setLacobelLamination(true);
                    setLacobelUvPrinting(false);
                    setLacobelRearMatting(false);
                    setLacobelFullMatting(false);
                  }
                  setLacobelMatting(!isLacobelMatted);
                }}
              />
            </div>
            <br />

            {/** Тильне матування */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.rear-matting')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isLacobelRearMatted}
                setToggleValue={() => {
                  if (!isLacobelRearMatted && currentSystem !== 'opening') {
                    setLacobelMatting(false);
                    setLacobelUvPrinting(false);
                    setLacobelLamination(false);
                    setLacobelArmoredFilm(false);
                    setLacobelFullMatting(false);
                  }
                  if (isLacobelRearMatted) {
                    setLacobelArmoredFilm(true);
                  }
                  if (isLacobelRearMatted && currentSystem === 'opening') {
                    setLacobelLamination(true);
                    setLacobelArmoredFilm(false);
                  }
                  if (!isLacobelRearMatted && currentSystem === 'opening') {
                    setLacobelLamination(true);
                    setLacobelArmoredFilm(false);
                    setLacobelUvPrinting(false);
                    setLacobelArmoredFilm(false);
                    setLacobelFullMatting(false);
                    setLacobelMatting(false);
                  }
                  setLacobelRearMatting(!isLacobelRearMatted);
                }}
              />
            </div>
            <br />

            {/** Пошук за назвою або артикулу */}
            {!isLacobelRearMatted || (
              <>
                <div className="mirror-section-search">
                  <div className="mirror-section-search-glass" />
                  <input
                    placeholder={t('fillingMaterialsModal.search-by-name-or-article')}
                    className="mirror-section-search-input"
                    onChange={(e) => setLacobelSearch(e.target.value)}
                    value={lacobelSearch}
                  />
                </div>
                <div className="mirror-options-wrapper">
                  <RadioGroup className="color">
                    {fillingFeatures.filter((feat) => labelMatches(feat, lacobelSearch)).map((el, i) => (
                      <RadioOption
                        checked={lacobelColor === el.articleCode}
                        key={`lacobel-${i + 1}`}
                        className={clsx('color', lacobelColor === el.articleCode && 'checked')}
                        backgroundColor={el.image}
                        onChange={() => setLacobelPaintingColor(el.articleCode)}
                        label={el[labelKey]}
                      />
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {/** Ультрафіолетовий друк */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.uv-print')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isLacobelUVPrinting}
                setToggleValue={() => {
                  if (!isLacobelUVPrinting) {
                    setLacobelMatting(false);
                    setLacobelRearMatting(false);
                    setLacobelFullMatting(false);
                  }
                  if (currentSystem === 'opening') {
                    setLacobelArmoredFilm(false);
                    setLacobelLamination(true);
                  }
                  setLacobelUvPrinting(!isLacobelUVPrinting);
                }}
              />
            </div>
            <br />

            {/** Тип ультрафіолетового друка */}
            {!isLacobelUVPrinting || (
              <>
                <Dropdown
                  placeholder={t('fillingMaterialsModal.choose-type')}
                  options={lacobelUVPrintingTypes}
                  onChange={(option) => {
                    if (!option?.value) return;
                    setLacobelUvPrintType(option?.value);
                  }}
                  translationNs="options:lacobelUVPrintingTypes"
                  value={lacobelUVPrintingTypes.find((item) => item.value === lacobelUvPrintType)}
                />
                <br />
              </>
            )}
            <hr />
            <br />

            {/** Бронь плівка */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.armored-film')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isLacobelArmoredFilm}
                setToggleValue={() => {
                  if (isLacobelRearMatted) return;
                  setLacobelArmoredFilm(!isLacobelArmoredFilm);
                  setLacobelLamination(isLacobelArmoredFilm);
                }}
              />
            </div>
            <br />

            {/** Ламінування білою плівкою */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.white-lamination')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isLacobelLaminated}
                setToggleValue={() => {
                  if (isLacobelRearMatted) {
                    setLacobelLamination(!isLacobelLaminated);
                    return;
                  }
                  setLacobelLamination(!isLacobelLaminated);
                  setLacobelArmoredFilm(isLacobelLaminated);
                }}
              />
            </div>
          </div>
          <br />
        </div>
      </Collapsible>

      {/** Glass */}

      <Collapsible
        trigger={triggers.glass}
        containerElementProps={activeTrigger === 'glass' ? { activeTrigger } : null}
        onTriggerOpening={() => {
          setActiveTrigger('glass');
          if (!glassType) setGlassType(glassTypes[0].value);
        }}
        onTriggerClosing={() => setActiveTrigger(null)}
        disabled={activeTrigger !== 'glass'}
        open={activeTrigger === 'glass'}
      >
        <div className="glass-section-wrapper">
          <div className="glass-section-inner">
            <Dropdown
              placeholder={t('fillingMaterialsModal.choose-type')}
              options={glassTypes}
              onChange={(option) => {
                if (!option?.value) return;
                setGlassType(option?.value);
              }}
              translationNs="options:glassTypes"
              value={glassTypes.find((item) => item.value === glassType)}
            />
            <br />

            {/** Повне матування */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.full-matting')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isGlassFullMatted}
                setToggleValue={() => {
                  if (!isGlassFullMatted) {
                    setGlassUvPrinting(false);
                    setGlassPhotoPrinting(false);
                    setGlassMatting(false);
                    setGlassIsOneColorPainted(false);
                    setGlassIsTwoColorsPainted(false);
                  }
                  setGlassFullMatting(!isGlassFullMatted);
                  if (!hasOpeningSide(currentSystem)) setGlassArmoredFilm(!isGlassFullMatted);
                }}
              />
            </div>
            <br />

            {/** Фарбування в один колір */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.painting-in-one-colors')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isGlassOneColorPainted}
                setToggleValue={() => {
                  if (!isGlassOneColorPainted) {
                    setGlassUvPrinting(false);
                    setGlassPhotoPrinting(false);
                    setGlassMatting(false);
                    setGlassIsTwoColorsPainted(false);
                    setGlassFullMatting(false);
                  }
                  setGlassIsOneColorPainted(!isGlassOneColorPainted);
                }}
              />
            </div>
            <br />

            {/** Фарбування в два кольори за трафаретом */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.painting-in-two-colors')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isGlassTwoColorsPainted}
                setToggleValue={() => {
                  if (!isGlassTwoColorsPainted) {
                    setGlassUvPrinting(false);
                    setGlassPhotoPrinting(false);
                    setGlassMatting(false);
                    setGlassFullMatting(false);
                    setGlassIsOneColorPainted(false);
                  }
                  setGlassIsTwoColorsPainted(!isGlassTwoColorsPainted);
                }}
              />
            </div>

            {/** Пошук за назвою або артикулу */}
            { isGlassOneColorPainted || isGlassTwoColorsPainted
              ? (
                <>
                  <div className="glass-section-search">
                    <div className="glass-section-search-glass" />
                    <input
                      placeholder={t('fillingMaterialsModal.search-by-name-or-article')}
                      className="glass-section-search-input"
                      onChange={(e) => setGlassSearch(e.target.value)}
                      value={glassSearch}
                    />
                  </div>
                  <div className="glass-options-wrapper">
                    <RadioGroup className="color">
                      {fillingFeatures.filter((feat) => labelMatches(feat, glassSearch)).map((el, i) => (
                        <RadioOption
                          checked={glassColors?.indexOf(el.articleCode) > -1}
                          key={`glass-${i + 1}`}
                          className={clsx('color', glassColors?.indexOf(el.articleCode) > -1 && 'checked')}
                          backgroundColor={el.image}
                          onChange={() => {
                            const isSelected = glassColors?.indexOf(el.articleCode) !== -1;
                            const availableNumber = isGlassTwoColorsPainted ? 2 : 1;
                            if (availableNumber === 1) {
                              setGlassPaintingColors([el.articleCode]);
                              return;
                            }
                            if (isSelected && availableNumber === 2) _.pull(glassColors, el.articleCode);
                            if (!isSelected && glassColors.length < availableNumber) glassColors.push(el.articleCode);
                            setGlassPaintingColors(_.uniq(glassColors));
                          }}
                          label={el[labelKey]}
                        />
                      ))}
                    </RadioGroup>
                  </div>
                </>
              ) : (<br />) }

            {/** Матування за трафаретом */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.stencil-matting')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isGlassMatted}
                setToggleValue={() => {
                  if (!isGlassMatted) {
                    setGlassUvPrinting(false);
                    setGlassPhotoPrinting(false);
                    setGlassIsOneColorPainted(false);
                    setGlassIsTwoColorsPainted(false);
                    setGlassFullMatting(false);
                  }
                  setGlassMatting(!isGlassMatted);
                }}
              />
            </div>
            <br />

            {/** Ультрафіолетовий друк */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.uv-print')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isGlassUVPrinting}
                setToggleValue={() => {
                  if (!isGlassUVPrinting) {
                    setGlassMatting(false);
                    setGlassPhotoPrinting(false);
                    setGlassIsOneColorPainted(false);
                    setGlassIsTwoColorsPainted(false);
                    setGlassFullMatting(false);
                  }
                  setGlassUvPrinting(!isGlassUVPrinting);
                }}
              />
            </div>

            {/** Тип ультрафіолетового друка */}
            {!isGlassUVPrinting || (
              <>
                <br />
                <Dropdown
                  className="glass-uvp-printing"
                  placeholder={t('fillingMaterialsModal.choose-type')}
                  options={glassUVPrintingTypes}
                  onChange={(option) => {
                    if (!option?.value) return;
                    setGlassUvPrintType(option?.value);
                  }}
                  translationNs="options:glassUVPrintingTypes"
                  value={glassUVPrintingTypes.find((item) => item.value === glassUvPrintType)}
                />
              </>
            )}
            <br />

            {/** Фотодрук на плівці */}
            <div className="switch-section">
              <Label
                value={t('fillingMaterialsModal.photo-print-on-cover')}
                infoTagValue={t('options:sample-hint')}
                withInfoTag
              />
              <Switch
                isToggled={isGlassPhotoPrinting}
                setToggleValue={() => {
                  if (!isGlassPhotoPrinting) {
                    setGlassUvPrinting(false);
                    setGlassMatting(false);
                    setGlassIsOneColorPainted(false);
                    setGlassIsTwoColorsPainted(false);
                    setGlassFullMatting(false);
                  }
                  setGlassPhotoPrinting(!isGlassPhotoPrinting);
                }}
              />
            </div>

            {/** Тип фотодрука на плівці */}
            {!isGlassPhotoPrinting || (
              <>
                <br />
                <Dropdown
                  placeholder={t('fillingMaterialsModal.choose-type')}
                  options={glassPhotoPrintingTypes}
                  onChange={(option) => {
                    if (!option?.value) return;
                    setGlassPhotoPrintType(option?.value);
                  }}
                  translationNs="options:glassPhotoPrintingTypes"
                  value={glassPhotoPrintingTypes.find((item) => item.value === glassPhotoPrintType)}
                />
              </>
            )}
            { !(!isGlassFullMatted && isGlassPhotoPrinting) || (
              <>
                <br />
                <br />
              </>
            )}

            { hasOpeningSide(currentSystem) || (!hasOpeningSide(currentSystem) && isGlassFullMatted)
              ? (
                <>
                  <br />
                  <hr />
                  <br />

                  {/** Бронь плівка */}
                  <div className="switch-section">
                    <Label
                      value={t('fillingMaterialsModal.armored-film')}
                      infoTagValue={t('options:sample-hint')}
                      withInfoTag
                    />
                    <Switch
                      isToggled={isGlassArmoredFilm}
                      setToggleValue={() => {
                        if (sideProfile === 'Slim') {
                          setGlassArmoredFilm(false);
                          return;
                        }
                        setGlassArmoredFilm(!isGlassArmoredFilm);
                        if (hasOpeningSide(currentSystem)) {
                          setGlassLamination(false);
                          return;
                        }
                        setGlassLamination(isGlassArmoredFilm);
                      }}
                    />
                  </div>
                  <br />

                  {/** Ламінування білою плівкою */}
                  <div className="switch-section">
                    <Label
                      value={t('fillingMaterialsModal.white-lamination')}
                      infoTagValue={t('options:sample-hint')}
                      withInfoTag
                    />
                    <Switch
                      isToggled={isGlassLaminated}
                      setToggleValue={() => {
                        if (sideProfile === 'Slim') {
                          setGlassLamination(true);
                          return;
                        }
                        setGlassLamination(!isGlassLaminated);
                        if (hasOpeningSide(currentSystem)) {
                          setGlassArmoredFilm(false);
                          return;
                        }
                        setGlassArmoredFilm(isGlassLaminated);
                      }}
                    />
                  </div>
                </>
              ) : null }
          </div>
          <br />
        </div>
      </Collapsible>

      <Button
        value={t('fillingMaterialsModal.clear-filling')}
        onClick={clearFilling}
      />
    </div>
  );
};

FillingMaterialsChoice.propTypes = {
  clearFilling: PropTypes.func,
  isMainFilling: PropTypes.bool,
  doorNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sectionNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  activeTrigger: PropTypes.string,
  setActiveTrigger: PropTypes.func,
  customersOption: PropTypes.string,
  setCustomersOption: PropTypes.func,
  isMilling: PropTypes.bool,
  setCustomDSPMilling: PropTypes.func,
  dspOption: PropTypes.string,
  setDspOption: PropTypes.func,
  dspManufacturer: PropTypes.string,
  setDspManufacturer: PropTypes.func,
  dspSearch: PropTypes.string,
  setDspSearch: PropTypes.func,
  isDspUVPrinting: PropTypes.bool,
  setDspUvPrinting: PropTypes.func,
  dspUvPrintType: PropTypes.string,
  setDspUvPrintType: PropTypes.func,
  mirrorType: PropTypes.string,
  setMirrorType: PropTypes.func,
  isMirrorMatted: PropTypes.bool,
  setMirrorMatting: PropTypes.func,
  isMirrorRearMatted: PropTypes.bool,
  setMirrorRearMatting: PropTypes.func,
  isMirrorFullMatted: PropTypes.bool,
  setMirrorFullMatting: PropTypes.func,
  mirrorColor: PropTypes.string,
  setMirrorPaintingColor: PropTypes.func,
  isMirrorUVPrinting: PropTypes.bool,
  setMirrorUvPrinting: PropTypes.func,
  mirrorUvPrintType: PropTypes.string,
  glassUvPrintType: PropTypes.string,
  setMirrorUvPrintType: PropTypes.func,
  setGlassUvPrintType: PropTypes.func,
  isMirrorArmoredFilm: PropTypes.bool,
  setMirrorArmoredFilm: PropTypes.func,
  isMirrorLaminated: PropTypes.bool,
  setMirrorLamination: PropTypes.func,
  mirrorSearch: PropTypes.string,
  setMirrorSearch: PropTypes.func,
  lacobelType: PropTypes.string,
  setLacobelType: PropTypes.func,
  isLacobelMatted: PropTypes.bool,
  setLacobelMatting: PropTypes.func,
  isLacobelRearMatted: PropTypes.bool,
  setLacobelRearMatting: PropTypes.func,
  isLacobelFullMatted: PropTypes.bool,
  setLacobelFullMatting: PropTypes.func,
  lacobelColor: PropTypes.string,
  setLacobelPaintingColor: PropTypes.func,
  isLacobelUVPrinting: PropTypes.bool,
  setLacobelUvPrinting: PropTypes.func,
  lacobelUvPrintType: PropTypes.string,
  setLacobelUvPrintType: PropTypes.func,
  isLacobelArmoredFilm: PropTypes.bool,
  setLacobelArmoredFilm: PropTypes.func,
  isLacobelLaminated: PropTypes.bool,
  setLacobelLamination: PropTypes.func,
  lacobelSearch: PropTypes.string,
  setLacobelSearch: PropTypes.func,
  glassType: PropTypes.string,
  setGlassType: PropTypes.func,
  isGlassMatted: PropTypes.bool,
  setGlassMatting: PropTypes.func,
  isGlassFullMatted: PropTypes.bool,
  setGlassFullMatting: PropTypes.func,
  isGlassOneColorPainted: PropTypes.bool,
  isGlassTwoColorsPainted: PropTypes.bool,
  setGlassIsOneColorPainted: PropTypes.func,
  setGlassIsTwoColorsPainted: PropTypes.func,
  glassColors: PropTypes.arrayOf(PropTypes.string),
  setGlassPaintingColors: PropTypes.func,
  isGlassUVPrinting: PropTypes.bool,
  setGlassUvPrinting: PropTypes.func,
  isGlassPhotoPrinting: PropTypes.bool,
  setGlassPhotoPrinting: PropTypes.func,
  glassPhotoPrintType: PropTypes.string,
  setGlassPhotoPrintType: PropTypes.func,
  glassSearch: PropTypes.string,
  setGlassSearch: PropTypes.func,
  isGlassArmoredFilm: PropTypes.bool,
  setGlassArmoredFilm: PropTypes.func,
  isGlassLaminated: PropTypes.bool,
  setGlassLamination: PropTypes.func,
  className: PropTypes.string,
};

FillingMaterialsChoice.defaultProps = {
  clearFilling: () => {},
  isMainFilling: false,
  doorNumber: null,
  sectionNumber: null,
  activeTrigger: null,
  setActiveTrigger: () => {},
  customersOption: null,
  setCustomersOption: () => {},
  isMilling: true,
  setCustomDSPMilling: () => {},
  dspOption: null,
  setDspOption: () => {},
  dspManufacturer: null,
  setDspManufacturer: () => {},
  dspSearch: null,
  setDspSearch: () => {},
  isDspUVPrinting: null,
  setDspUvPrinting: () => {},
  dspUvPrintType: null,
  setDspUvPrintType: () => {},
  mirrorType: null,
  setMirrorType: () => {},
  isMirrorMatted: false,
  setMirrorMatting: () => {},
  isMirrorRearMatted: false,
  setMirrorRearMatting: () => {},
  isMirrorFullMatted: false,
  setMirrorFullMatting: () => {},
  mirrorColor: null,
  setMirrorPaintingColor: () => {},
  isMirrorUVPrinting: false,
  setMirrorUvPrinting: () => {},
  mirrorUvPrintType: null,
  setMirrorUvPrintType: () => {},
  isMirrorArmoredFilm: false,
  setMirrorArmoredFilm: () => {},
  isMirrorLaminated: false,
  setMirrorLamination: () => {},
  mirrorSearch: null,
  setMirrorSearch: () => {},
  lacobelType: null,
  setLacobelType: () => {},
  isLacobelMatted: false,
  setLacobelMatting: () => {},
  isLacobelRearMatted: false,
  setLacobelRearMatting: () => {},
  isLacobelFullMatted: false,
  setLacobelFullMatting: () => {},
  lacobelColor: null,
  setLacobelPaintingColor: () => {},
  isLacobelUVPrinting: false,
  setLacobelUvPrinting: () => {},
  lacobelUvPrintType: null,
  setLacobelUvPrintType: () => {},
  isLacobelArmoredFilm: false,
  setLacobelArmoredFilm: () => {},
  isLacobelLaminated: false,
  setLacobelLamination: () => {},
  lacobelSearch: null,
  setLacobelSearch: () => {},
  glassType: null,
  setGlassType: () => {},
  glassUvPrintType: null,
  setGlassUvPrintType: () => {},
  isGlassMatted: false,
  setGlassMatting: () => {},
  isGlassFullMatted: false,
  setGlassFullMatting: () => {},
  isGlassOneColorPainted: false,
  isGlassTwoColorsPainted: false,
  setGlassIsOneColorPainted: () => {},
  setGlassIsTwoColorsPainted: () => {},
  glassColors: [],
  setGlassPaintingColors: () => {},
  isGlassUVPrinting: false,
  setGlassUvPrinting: () => {},
  isGlassPhotoPrinting: false,
  setGlassPhotoPrinting: () => {},
  glassPhotoPrintType: null,
  setGlassPhotoPrintType: () => {},
  glassSearch: null,
  setGlassSearch: () => {},
  isGlassArmoredFilm: false,
  setGlassArmoredFilm: () => {},
  isGlassLaminated: false,
  setGlassLamination: () => {},
  className: '',
};

export default FillingMaterialsChoice;
