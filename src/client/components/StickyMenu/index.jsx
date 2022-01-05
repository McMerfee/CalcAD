import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Sticky from 'react-sticky-el';
import { Scrollbars } from 'react-custom-scrollbars';

import DoorsActions from '../../redux/actions/doorsAndSections';
import FillingActions from '../../redux/actions/fillingMaterials';
import OrderActions from '../../redux/actions/order';

import FillingMaterialsChoice from '../FillingMaterialsChoice';
import StickyHeaderDesktop from './StickyHeaderDesktop';
import ZoomVizualizationButton from '../ZoomVizualizationButton';
import Tabs from './doors/Tabs';
import TabContent from './doors/TabContent';
import TabHeader from './doors/TabHeader';
import BottomNavPanel from './BottomNavPanel';
import ScrollingContainer from './ScrollingContainer';


const StickyMenu = ({ tabs }) => {
  const dispatch = useDispatch();

  const [isDesktopView, setIsDesktopView] = useState(false);
  const [activeFilling, setActiveFilling] = useState({});

  const {
    activeDoor = 0,
    activeSection = 0,
    main: { filling: mainDoorFilling },
    doors,
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const fillingMaterialsState = useSelector(({ fillingMaterials }) => fillingMaterials);
  const {
    isOpenFillingModal,
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
      isGlassFullMatted,
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
    },
  } = fillingMaterialsState;


  useEffect(() => {
    const handleResize = () => {
      const { innerWidth } = window || {};
      setIsDesktopView(innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const currentFilling = getActiveFilling();
    if (currentFilling?.material) {
      setActiveFilling(currentFilling);
    }
  }, [activeDoor, activeSection]);

  const getActiveFilling = () => {
    if (activeDoor === 0) return mainDoorFilling;
    if (activeSection === 0) return doors[activeDoor - 1]?.main?.filling || {};
    if (activeDoor > 0 && activeSection > 0) return doors[activeDoor - 1]?.sections[activeSection - 1]?.filling || {};
    return null;
  };

  const handleTabChange = (index) => {
    dispatch(DoorsActions.setActiveDoor(index));
    dispatch(DoorsActions.setActiveSection(0));
  };

  return (
    <div className="sticky-menu-wrapper">
      <Sticky className="sticky-menu">
        <div className="sticky-menu--offset">
          <ZoomVizualizationButton className="mobile" />
        </div>
        <div className="sticky-menu--inner">
          <div className="sticky-menu--head-mobile">
            <div className="sticky-menu--snap"><span /></div>
            <Tabs
              tabs={tabs}
              onChange={handleTabChange}
              activeTabIndex={activeDoor}
            />
          </div>
          <div className="sticky-menu--head-desktop">
            { isDesktopView && isOpenFillingModal
              ? <StickyHeaderDesktop titleKey="stickyMenu.desktop.filling" />
              : <TabHeader doorNumber={activeDoor} /> }
          </div>
        </div>
      </Sticky>
      <Scrollbars
        autoHeight
        style={isDesktopView ? { width: 433 } : { width: '100%' }}
        autoHeightMin="10vh"
        autoHeightMax="77vh"
        renderTrackVertical={({ style }) => <div className="scrollbar-background" style={{ ...style }} />}
        renderThumbVertical={({ style }) => <div className="scrollbar-line" style={{ ...style }} />}
      >
        <ScrollingContainer className="scroll-area">
          { isDesktopView && isOpenFillingModal
            ? (
              <FillingMaterialsChoice
                className="desktop-sticky-filling"
                isMainFilling={activeDoor === 0 && activeSection === 0}
                doorNumber={activeDoor}
                sectionNumber={activeSection}
                isOpen={isOpenFillingModal}
                onCloseModal={() => dispatch(FillingActions.toggleFillingMaterialModal(false))}
                activeTrigger={activeTrigger || activeFilling?.material || null}
                setActiveTrigger={(trigger) => dispatch(FillingActions.setActiveTrigger(trigger))}
                clearFilling={() => {
                  dispatch(DoorsActions.clearFilling(null, null));
                  dispatch(OrderActions.calculateOrderRequest());
                  dispatch(FillingActions.resetFillingMaterialModal());
                }}

                setCustomersOption={(option) => dispatch(FillingActions.setCustomersOption(option))}
                customersOption={customersOption || activeFilling?.customersOption || ''}
                isMilling={isMilling}
                setCustomDSPMilling={(isOn) => dispatch(FillingActions.setCustomDSPMilling(isOn))}
                dspOption={dspOption || activeFilling?.dspOption || ''}
                setDspOption={(option) => dispatch(FillingActions.setDspOption(option))}
                dspManufacturer={manufacturer || activeFilling?.manufacturer || ''}
                setDspManufacturer={(manufacture) => dispatch(FillingActions.setDspManufacturer(manufacture))}
                dspSearch={searchField}
                setDspSearch={(search) => dispatch(FillingActions.setDspSearch(search))}
                isDspUVPrinting={isDspUVPrinting}
                setDspUvPrinting={(isOn) => dispatch(FillingActions.setDspUvPrinting(isOn))}
                dspUvPrintType={dspUvPrintType || activeFilling?.dspUvPrintType || ''}
                setDspUvPrintType={(printType) => dispatch(FillingActions.setDspUvPrintType(printType))}

                mirrorType={mirrorType || activeFilling?.mirrorType || ''}
                setMirrorType={(type) => dispatch(FillingActions.setMirrorType(type))}
                isMirrorMatted={isMirrorMatted}
                setMirrorMatting={(isOn) => dispatch(FillingActions.setMirrorMatting(isOn))}
                isMirrorRearMatted={isMirrorRearMatted}
                setMirrorRearMatting={(isOn) => dispatch(FillingActions.setMirrorRearMatting(isOn))}
                isMirrorFullMatted={isMirrorFullMatted}
                setMirrorFullMatting={(isOn) => dispatch(FillingActions.setMirrorFullMatting(isOn))}
                mirrorColor={mirrorColor || activeFilling?.mirrorColor || ''}
                setMirrorPaintingColor={(color) => dispatch(FillingActions.setMirrorPaintingColor(color))}
                isMirrorUVPrinting={isMirrorUVPrinting}
                setMirrorUvPrinting={(isOn) => dispatch(FillingActions.setMirrorUvPrinting(isOn))}
                mirrorUvPrintType={mirrorUvPrintType || activeFilling?.mirrorUvPrintType || ''}
                setMirrorUvPrintType={(printType) => dispatch(FillingActions.setMirrorUvPrintType(printType))}
                isMirrorArmoredFilm={isMirrorArmoredFilm}
                setMirrorArmoredFilm={(isOn) => dispatch(FillingActions.setMirrorArmoredFilm(isOn))}
                isMirrorLaminated={isMirrorLaminated}
                setMirrorLamination={(isOn) => dispatch(FillingActions.setMirrorLamination(isOn))}
                mirrorSearch={mirrorSearch}
                setMirrorSearch={(search) => dispatch(FillingActions.setMirrorSearch(search))}

                lacobelType={lacobelType || activeFilling?.lacobelType || ''}
                setLacobelType={(type) => dispatch(FillingActions.setLacobelType(type))}
                isLacobelMatted={isLacobelMatted}
                setLacobelMatting={(isOn) => dispatch(FillingActions.setLacobelMatting(isOn))}
                isLacobelRearMatted={isLacobelRearMatted}
                setLacobelRearMatting={(isOn) => dispatch(FillingActions.setLacobelRearMatting(isOn))}
                isLacobelFullMatted={isLacobelFullMatted}
                setLacobelFullMatting={(isOn) => dispatch(FillingActions.setLacobelFullMatting(isOn))}
                lacobelColor={lacobelColor || activeFilling?.lacobelColor || ''}
                setLacobelPaintingColor={(color) => dispatch(FillingActions.setLacobelPaintingColor(color))}
                isLacobelUVPrinting={isLacobelUVPrinting}
                setLacobelUvPrinting={(isOn) => dispatch(FillingActions.setLacobelUvPrinting(isOn))}
                lacobelUvPrintType={lacobelUvPrintType || activeFilling?.lacobelUvPrintType || ''}
                setLacobelUvPrintType={(printType) => dispatch(FillingActions.setLacobelUvPrintType(printType))}
                isLacobelArmoredFilm={isLacobelArmoredFilm}
                setLacobelArmoredFilm={(isOn) => dispatch(FillingActions.setLacobelArmoredFilm(isOn))}
                isLacobelLaminated={isLacobelLaminated}
                setLacobelLamination={(isOn) => dispatch(FillingActions.setLacobelLamination(isOn))}
                lacobelSearch={lacobelSearch}
                setLacobelSearch={(search) => dispatch(FillingActions.setLacobelSearch(search))}

                glassType={glassType || activeFilling?.glassType || ''}
                setGlassType={(type) => dispatch(FillingActions.setGlassType(type))}
                isGlassMatted={isGlassMatted}
                setGlassMatting={(isOn) => dispatch(FillingActions.setGlassMatting(isOn))}
                isGlassFullMatted={isGlassFullMatted}
                setGlassFullMatting={(isOn) => dispatch(FillingActions.setGlassFullMatting(isOn))}
                isGlassOneColorPainted={isGlassOneColorPainted}
                isGlassTwoColorsPainted={isGlassTwoColorsPainted}
                setGlassIsOneColorPainted={(type) => dispatch(FillingActions.setGlassIsOneColorPainted(type))}
                setGlassIsTwoColorsPainted={(type) => dispatch(FillingActions.setGlassIsTwoColorsPainted(type))}
                glassColors={glassColors || activeFilling?.glassColors || []}
                setGlassPaintingColors={(colors) => dispatch(FillingActions.setGlassPaintingColors(colors))}
                isGlassUVPrinting={isGlassUVPrinting}
                setGlassUvPrinting={(isOn) => dispatch(FillingActions.setGlassUvPrinting(isOn))}
                isGlassPhotoPrinting={isGlassPhotoPrinting}
                setGlassPhotoPrinting={(isOn) => dispatch(FillingActions.setGlassPhotoPrinting(isOn))}
                glassUvPrintType={glassUvPrintType || activeFilling?.glassUvPrintType || ''}
                setGlassUvPrintType={(printType) => dispatch(FillingActions.setGlassUvPrintType(printType))}
                glassPhotoPrintType={glassPhotoPrintType || activeFilling?.glassPhotoPrintType || ''}
                setGlassPhotoPrintType={(printType) => dispatch(FillingActions.setGlassPhotoPrintType(printType))}
                glassSearch={glassSearch}
                setGlassSearch={(search) => dispatch(FillingActions.setGlassSearch(search))}
                isGlassArmoredFilm={isGlassArmoredFilm}
                setGlassArmoredFilm={(isOn) => dispatch(FillingActions.setGlassArmoredFilm(isOn))}
                isGlassLaminated={isGlassLaminated}
                setGlassLamination={(isOn) => dispatch(FillingActions.setGlassLamination(isOn))}
              />
            ) : (
              <>
                <TabContent activeTabIndex={activeDoor} />
                <BottomNavPanel
                  nextDoorNumber={activeDoor + 1}
                  showNext={activeDoor < tabs.length - 1}
                  onNavigate={handleTabChange}
                />
              </>
            )}
        </ScrollingContainer>
      </Scrollbars>
    </div>
  );
};

StickyMenu.defaultProps = {
  tabs: null,
};

StickyMenu.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
  })),
};

export default StickyMenu;
