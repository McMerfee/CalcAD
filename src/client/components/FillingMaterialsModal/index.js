import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';

import constantsBySystemType from '../../helpers/constantsBySystemType';

import FillingMaterialsChoice from '../FillingMaterialsChoice';
import Modal from '../Modal';
import Footer from './Footer';


const FillingMaterialsModal = ({
  clearFilling,
  doorNumber,
  sectionNumber,
  isMainFilling,
  onSubmit,
  isOpen,
  onCloseModal,
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
}) => {
  if (!isOpen) return null;

  clearAllBodyScrollLocks();

  const [isDesktopView, setIsDesktopView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth } = window || {};
      setIsDesktopView(innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { main } = useSelector(({ doorsAndSections }) => doorsAndSections);
  const { currentSystem } = useSelector(({ systems }) => systems);
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;
  const sideProfile = main?.sideProfile?.value || defaultSideProfile;

  const {
    customers: { customersOption: stateCustomersOption },
    dsp: { dspOption: stateDSPOption },
  } = useSelector(({ fillingMaterials }) => fillingMaterials);

  const isSubmitDisabled = () => {
    const isSlim = sideProfile === 'Slim';

    if (activeTrigger === null) return false;

    return (isSlim && activeTrigger === 'dsp')
      || (isSlim && activeTrigger === 'customers' && customersOption?.includes('dsp'))
      || !((activeTrigger === 'customers' && stateCustomersOption)
        || (activeTrigger === 'dsp' && stateDSPOption && isDspUVPrinting && !_.isEmpty(dspUvPrintType))
        || (activeTrigger === 'dsp' && stateDSPOption)
        || (activeTrigger === 'mirror' && !_.isEmpty(mirrorType))
        || (activeTrigger === 'lacobel' && !_.isEmpty(lacobelType))
        || (activeTrigger === 'glass' && !_.isEmpty(glassType))
      )
      || (activeTrigger === 'mirror' && isMirrorRearMatted && !mirrorColor)
      || (activeTrigger === 'lacobel' && isLacobelRearMatted && !lacobelColor)
      || (activeTrigger === 'glass' && isGlassOneColorPainted && !glassColors.length)
      || (activeTrigger === 'glass' && isGlassTwoColorsPainted && glassColors.length < 2);
  };

  if (isDesktopView) return null;

  return (
    <Modal
      closeModal={onCloseModal}
      opened={isOpen}
      type="bottom"
      className="filling-materials-modal"
      shouldDisableBodyScroll
    >
      <FillingMaterialsChoice
        clearFilling={clearFilling}
        doorNumber={doorNumber}
        sectionNumber={sectionNumber}
        isMainFilling={isMainFilling}
        activeTrigger={activeTrigger}
        setActiveTrigger={setActiveTrigger}
        setCustomersOption={setCustomersOption}
        customersOption={customersOption}
        isMilling={isMilling}
        setCustomDSPMilling={setCustomDSPMilling}
        dspOption={dspOption}
        setDspOption={setDspOption}
        dspManufacturer={dspManufacturer}
        setDspManufacturer={setDspManufacturer}
        dspSearch={dspSearch}
        setDspSearch={setDspSearch}
        isDspUVPrinting={isDspUVPrinting}
        setDspUvPrinting={setDspUvPrinting}
        dspUvPrintType={dspUvPrintType}
        setDspUvPrintType={setDspUvPrintType}
        mirrorType={mirrorType}
        setMirrorType={setMirrorType}
        isMirrorMatted={isMirrorMatted}
        setMirrorMatting={setMirrorMatting}
        isMirrorRearMatted={isMirrorRearMatted}
        setMirrorRearMatting={setMirrorRearMatting}
        isMirrorFullMatted={isMirrorFullMatted}
        setMirrorFullMatting={setMirrorFullMatting}
        mirrorColor={mirrorColor}
        setMirrorPaintingColor={setMirrorPaintingColor}
        isMirrorUVPrinting={isMirrorUVPrinting}
        setMirrorUvPrinting={setMirrorUvPrinting}
        mirrorUvPrintType={mirrorUvPrintType}
        glassUvPrintType={glassUvPrintType}
        setMirrorUvPrintType={setMirrorUvPrintType}
        setGlassUvPrintType={setGlassUvPrintType}
        isMirrorArmoredFilm={isMirrorArmoredFilm}
        setMirrorArmoredFilm={setMirrorArmoredFilm}
        isMirrorLaminated={isMirrorLaminated}
        setMirrorLamination={setMirrorLamination}
        mirrorSearch={mirrorSearch}
        setMirrorSearch={setMirrorSearch}
        lacobelType={lacobelType}
        setLacobelType={setLacobelType}
        isLacobelMatted={isLacobelMatted}
        setLacobelMatting={setLacobelMatting}
        isLacobelRearMatted={isLacobelRearMatted}
        setLacobelRearMatting={setLacobelRearMatting}
        isLacobelFullMatted={isLacobelFullMatted}
        setLacobelFullMatting={setLacobelFullMatting}
        lacobelColor={lacobelColor}
        setLacobelPaintingColor={setLacobelPaintingColor}
        isLacobelUVPrinting={isLacobelUVPrinting}
        setLacobelUvPrinting={setLacobelUvPrinting}
        lacobelUvPrintType={lacobelUvPrintType}
        setLacobelUvPrintType={setLacobelUvPrintType}
        isLacobelArmoredFilm={isLacobelArmoredFilm}
        setLacobelArmoredFilm={setLacobelArmoredFilm}
        isLacobelLaminated={isLacobelLaminated}
        setLacobelLamination={setLacobelLamination}
        lacobelSearch={lacobelSearch}
        setLacobelSearch={setLacobelSearch}
        glassType={glassType}
        setGlassType={setGlassType}
        isGlassMatted={isGlassMatted}
        setGlassMatting={setGlassMatting}
        isGlassFullMatted={isGlassFullMatted}
        setGlassFullMatting={setGlassFullMatting}
        isGlassOneColorPainted={isGlassOneColorPainted}
        isGlassTwoColorsPainted={isGlassTwoColorsPainted}
        setGlassIsOneColorPainted={setGlassIsOneColorPainted}
        setGlassIsTwoColorsPainted={setGlassIsTwoColorsPainted}
        glassColors={glassColors}
        setGlassPaintingColors={setGlassPaintingColors}
        isGlassUVPrinting={isGlassUVPrinting}
        setGlassUvPrinting={setGlassUvPrinting}
        isGlassPhotoPrinting={isGlassPhotoPrinting}
        setGlassPhotoPrinting={setGlassPhotoPrinting}
        glassPhotoPrintType={glassPhotoPrintType}
        setGlassPhotoPrintType={setGlassPhotoPrintType}
        glassSearch={glassSearch}
        setGlassSearch={setGlassSearch}
        isGlassArmoredFilm={isGlassArmoredFilm}
        setGlassArmoredFilm={setGlassArmoredFilm}
        isGlassLaminated={isGlassLaminated}
        setGlassLamination={setGlassLamination}
      />

      <Footer
        onSubmit={() => {
          onSubmit();
          onCloseModal();
        }}
        isDisabled={isSubmitDisabled()}
      />
    </Modal>
  );
};

FillingMaterialsModal.propTypes = {
  clearFilling: PropTypes.func,
  isMainFilling: PropTypes.bool,
  doorNumber: PropTypes.string,
  sectionNumber: PropTypes.string,
  onSubmit: PropTypes.func,
  isOpen: PropTypes.bool,
  onCloseModal: PropTypes.func,
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
};

FillingMaterialsModal.defaultProps = {
  clearFilling: () => {},
  isMainFilling: false,
  doorNumber: null,
  sectionNumber: null,
  onSubmit: () => {},
  isOpen: false,
  onCloseModal: () => {},
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
};

export default FillingMaterialsModal;
