import _ from 'lodash';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import DoorsActions from '../../../redux/actions/doorsAndSections';
import FillingActions from '../../../redux/actions/fillingMaterials';
import OrderActions from '../../../redux/actions/order';

import { textures } from '../../../helpers/options';
import { isValidNumberField, canUseHorizontalTexture } from '../../../helpers/validation';
import { minSectionHeight, minSectionWidth } from '../../../helpers/constants';

import FillingMaterialsModal from '../../FillingMaterialsModal';
import FillingMaterialsControl from '../../FillingMaterialsControl';
import MergeSectionModal from '../../MergeSectionModal';
import DeleteSectionModal from '../../DeleteSectionModal';
import CopySectionModal from '../../CopySectionModal';
import RadioOption from '../../RadioOption';
import Label from '../../Label';
import Button from '../../Button';
import Input from '../../Input';


const Section = ({
  doorNumber,
  sectionNumber,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => () => dispatch(FillingActions.resetFillingMaterialModal()), []);

  const { currentSystem } = useSelector(({ systems }) => systems);
  const { systemConctants } = useSelector(({ config }) => config);
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

  const {
    main: {
      doorOpeningHeight,
      doorOpeningWidth,
    },
    doors,
    isOpenMergeSectionModal,
    isOpenDeleteSectionModal,
    isOpenCopySectionModal,
    activeSection = 0,
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const door = doors[doorNumber - 1];
  const sectionsAmount = door?.main?.sectionsAmount?.value;

  if (!sectionsAmount) return null;

  const directionOfSections = door.main?.directionOfSections?.value;
  const section = door.sections[sectionNumber - 1] || {};
  const {
    visibleHeight,
    visibleWidth,
    fillingHeight,
    texture,
    filling,
  } = section;

  const handleOptions = (name, options, index) => {
    dispatch(DoorsActions.updateSectionRequest(
      doorNumber - 1,
      sectionNumber - 1,
      {
        name,
        value: options[index]?.value || options[index],
      },
    ));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const textureChoice = textures.map((item, index) => {
    const isChecked = texture?.value === item.value;

    return (
      <RadioOption
        key={item.label}
        className={clsx(
          'icon',
          isChecked && 'checked',
          index === 0 ? 'vertical' : 'horizontal',
        )}
        iconPath={item.iconPath}
        name={`texture-${index}`}
        label={item.label}
        checked={isChecked}
        onChange={() => handleOptions('texture', textures, index)}
        isDisabled={index > 0 && !canUseHorizontalTexture(fillingHeight?.value)}
      />
    );
  });

  const handleTrashIconClick = (e) => {
    e.preventDefault();

    if (sectionsAmount <= 2) {
      dispatch(DoorsActions.toggleDeleteSectionModal(true));
      return;
    }

    dispatch(DoorsActions.toggleMergeSectionModal(true));
  };

  const copySection = (e) => {
    e.preventDefault();

    dispatch(DoorsActions.toggleCopySectionModal(true));
  };

  const handleSectionVisibleSize = ({ target: { name, value } }) => {
    const isOk = name === 'visibleHeight'
      ? isValidNumberField(+value, minSectionHeight, doorOpeningHeight.value + 1)
      : isValidNumberField(+value, minSectionWidth, doorOpeningWidth.value + 1);

    if (!isOk) return;

    dispatch(DoorsActions.updateSectionsSizesOnEdit(
      doorNumber - 1,
      sectionNumber - 1,
      {
        name,
        value: !_.isEmpty(value) ? +value : 0,
      },
      systemConctants,
      currentSystem,
    ));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const validateWidth = ({ target: { name, value } }) => {
    const isValid = !_.isEmpty(value) && isValidNumberField(+value, minSectionWidth, doorOpeningWidth.value + 1);
    let sanitizedValue = minSectionWidth;

    if (value && isValid) sanitizedValue = +value;
    if (!isValid && +value > doorOpeningWidth.value) {
      sanitizedValue = doorOpeningWidth.value;
    }

    dispatch(DoorsActions.updateSectionsSizesOnEdit(
      doorNumber - 1,
      sectionNumber - 1,
      {
        name,
        value: sanitizedValue,
      },
      systemConctants,
      currentSystem,
    ));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const validateHeight = ({ target: { name, value } }) => {
    const isValid = !_.isEmpty(value) && isValidNumberField(+value, minSectionHeight, doorOpeningHeight.value + 1);
    let sanitizedValue = minSectionHeight;

    if (value && isValid) sanitizedValue = +value;
    if (!isValid && +value > doorOpeningHeight.value) {
      sanitizedValue = doorOpeningHeight.value;
    }

    dispatch(DoorsActions.updateSectionsSizesOnEdit(
      doorNumber - 1,
      sectionNumber - 1,
      {
        name,
        value: sanitizedValue,
      },
      systemConctants,
      currentSystem,
    ));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleAlignSections = () => {
    if (!_.isEmpty(doorOpeningHeight.error) || !_.isEmpty(doorOpeningWidth.error)) return;
    dispatch(DoorsActions.alignSections(doorNumber - 1, systemConctants, currentSystem));
    dispatch(OrderActions.calculateOrderRequest());
  };

  const handleSubmitSectionFilling = () => {
    const sectionMaterialToSet = {
      ...fillingMaterialsState[activeTrigger],
      ...{ material: activeTrigger },
    };
    dispatch(DoorsActions.updateSectionFilling(
      doorNumber - 1,
      sectionNumber - 1,
      sectionMaterialToSet,
    ));
    dispatch(OrderActions.calculateOrderRequest());
    dispatch(FillingActions.resetFillingMaterialModal());
  };

  return (
    <div className={clsx('section-content', 'section')}>
      <div className="section-content--inner">
        <div className="section-content--title-wrapper">
          <div className="section-content--title">
            <span>{t('stickyMenu.section.section')}</span>
            <span>{sectionNumber}</span>
          </div>
          <div className="section-content--action-buttons">
            <button
              type="button"
              className="circle"
              onClick={copySection}
            >
              <ReactSVG
                wrapper="span"
                src="/src/client/assets/icons/copy.svg"
              />
            </button>
            <button
              type="button"
              className="circle"
              onClick={handleTrashIconClick}
            >
              <ReactSVG
                wrapper="span"
                src="/src/client/assets/icons/trash.svg"
              />
            </button>
          </div>
        </div>

        { directionOfSections === 'horizontal'
          && (
            <div className="section--item-group">
              <div className="section--item-group-caption">
                <p className="section--item-group-caption-title">
                  {t('stickyMenu.section.visible-height')}
                </p>
                <p className="section--item-group-caption-subtitle">
                  <Button
                    value={t('stickyMenu.section.align-height')}
                    onClick={handleAlignSections}
                  />
                </p>
              </div>
              <Input
                className="small"
                type="number"
                placeholder="0"
                direction="rtl"
                max={doorOpeningHeight.value}
                value={_.isNumber(visibleHeight?.value) ? Math.trunc(visibleHeight.value) : ''}
                onChange={handleSectionVisibleSize}
                onBlur={validateHeight}
                name="visibleHeight"
                error={visibleHeight?.error ? t('options:wrong-value') : ''}
                isDisabled={sectionsAmount === sectionNumber}
              />
            </div>
          )}

        { directionOfSections === 'vertical'
          && (
            <div className="section--item-group">
              <div className="section--item-group-caption">
                <p className="section--item-group-caption-title">
                  {t('stickyMenu.section.visible-width')}
                </p>
                <p className="section--item-group-caption-subtitle">
                  <Button
                    value={t('stickyMenu.section.align-width')}
                    onClick={handleAlignSections}
                  />
                </p>
              </div>
              <Input
                className="small"
                type="number"
                placeholder="0"
                direction="rtl"
                max={doorOpeningWidth.value}
                value={_.isNumber(visibleWidth?.value) ? Math.trunc(visibleWidth.value) : ''}
                onChange={handleSectionVisibleSize}
                onBlur={validateWidth}
                name="visibleWidth"
                error={visibleWidth?.error ? t('options:wrong-value') : ''}
                isDisabled={sectionsAmount === sectionNumber}
              />
            </div>
          )}

        <div className="section--column">
          <FillingMaterialsControl
            label={t('stickyMenu.section.filling-material')}
            filling={[filling]}
            onClick={() => dispatch(FillingActions.toggleFillingMaterialModal(true))}
          />
        </div>

        { filling?.material === 'dsp'
          ? (
            <>
              <Label
                value="Текстура"
                infoTagValue={t('tooltips.texture')}
                withInfoTag
              />
              <div className="section--row">
                {textureChoice}
              </div>
            </>
          ) : null}
      </div>

      <MergeSectionModal
        isOpen={isOpenMergeSectionModal}
        onCloseModal={() => dispatch(DoorsActions.toggleMergeSectionModal(false))}
        onMerge={(doorIndex, sectionIndexToRemove, mergeOption) => {
          dispatch(
            DoorsActions.mergeSectionRequest(
              doorIndex,
              sectionIndexToRemove,
              mergeOption,
              systemConctants,
              currentSystem,
            ),
          );
          dispatch(OrderActions.calculateOrderRequest());
          if (mergeOption === 'first') dispatch(DoorsActions.setActiveSection(activeSection - 1));
        }}
        doorNumber={doorNumber}
        sectionNumber={sectionNumber}
      />

      <DeleteSectionModal
        isOpen={isOpenDeleteSectionModal}
        onCloseModal={() => dispatch(DoorsActions.toggleDeleteSectionModal(false))}
        onDeleteSection={() => {
          dispatch(DoorsActions.removeSectionsRequest(doorNumber - 1, sectionNumber - 1));
          dispatch(OrderActions.calculateOrderRequest());
          dispatch(DoorsActions.setActiveDoor(doorNumber - 1));
          dispatch(DoorsActions.setActiveSection(0));
        }}
        sectionNumber={sectionNumber}
      />

      <CopySectionModal
        isOpen={isOpenCopySectionModal}
        onCloseModal={() => dispatch(DoorsActions.toggleCopySectionModal(false))}
        onCopy={(sectionIndex, selectedSections) => {
          dispatch(DoorsActions.copySectionRequest(doorNumber - 1, sectionIndex, selectedSections));
          dispatch(OrderActions.calculateOrderRequest());
        }}
        doorNumber={doorNumber}
        sectionNumber={sectionNumber}
        sectionsAmount={sectionsAmount}
      />

      <FillingMaterialsModal
        doorNumber={`${doorNumber}`}
        sectionNumber={`${sectionNumber}`}
        isOpen={isOpenFillingModal}
        onCloseModal={() => dispatch(FillingActions.toggleFillingMaterialModal(false))}
        activeTrigger={activeTrigger || filling?.material || ''}
        setActiveTrigger={(trigger) => dispatch(FillingActions.setActiveTrigger(trigger))}
        onSubmit={handleSubmitSectionFilling}
        clearFilling={() => {
          dispatch(DoorsActions.clearFilling(doorNumber - 1, sectionNumber - 1));
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
        glassUvPrintType={glassUvPrintType || filling?.glassUvPrintType || ''}
        glassPhotoPrintType={glassPhotoPrintType || filling?.glassPhotoPrintType || ''}
        setGlassPhotoPrintType={(printType) => dispatch(FillingActions.setGlassPhotoPrintType(printType))}
        setMirrorUvPrintType={(printType) => dispatch(FillingActions.setMirrorUvPrintType(printType))}
        setGlassUvPrintType={(printType) => dispatch(FillingActions.setGlassUvPrintType(printType))}
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

Section.propTypes = {
  doorNumber: PropTypes.number.isRequired,
  sectionNumber: PropTypes.number.isRequired,
};

export default Section;
