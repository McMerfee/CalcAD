import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  setActiveTrigger: ['trigger'],

  toggleFillingMaterialModal: ['isOpen'],
  resetFillingMaterialModal: null,

  setCustomersOption: ['option'],
  setCustomDSPMilling: ['isOn'],

  setDspOption: ['option'],
  setDspManufacturer: ['manufacture'],
  setDspSearch: ['search'],
  setDspUvPrinting: ['isOn'],
  setDspUvPrintType: ['printType'],

  setMirrorType: ['mirrorType'],
  setMirrorMatting: ['isOn'],
  setMirrorRearMatting: ['isOn'],
  setMirrorFullMatting: ['isOn'],
  setMirrorPaintingColor: ['color'],
  setMirrorUvPrinting: ['isOn'],
  setMirrorUvPrintType: ['printType'],
  setMirrorArmoredFilm: ['isOn'],
  setMirrorLamination: ['isOn'],
  setMirrorSearch: ['search'],

  setLacobelType: ['lacobelType'],
  setLacobelMatting: ['isOn'],
  setLacobelRearMatting: ['isOn'],
  setLacobelFullMatting: ['isOn'],
  setLacobelPaintingColor: ['color'],
  setLacobelUvPrinting: ['isOn'],
  setLacobelUvPrintType: ['printType'],
  setLacobelArmoredFilm: ['isOn'],
  setLacobelLamination: ['isOn'],
  setLacobelSearch: ['search'],

  setGlassType: ['glassType'],
  setGlassMatting: ['isOn'],
  setGlassFullMatting: ['isOn'],
  setGlassArmoredFilm: ['isOn'],
  setGlassLamination: ['isOn'],
  setGlassUvPrintType: ['printType'],
  setGlassIsOneColorPainted: ['isOn'],
  setGlassIsTwoColorsPainted: ['isOn'],
  setGlassPaintingColors: ['colors'],
  setGlassUvPrinting: ['isOn'],
  setGlassPhotoPrinting: ['isOn'],
  setGlassPhotoPrintType: ['printType'],
  setGlassSearch: ['search'],
});

export const ModalTypes = Types;
export default Creators;
