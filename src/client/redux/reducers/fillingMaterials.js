import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { ModalTypes } from '../actions/fillingMaterials';

import {
  defaultMirrorType,
  defaultMirrorUvPrintType,
  defaultGlassType,
  defaultGlassPhotoPrintType,
  defaultGlassUvPrintType,
  defaultLacobelType,
  defaultLacobelUVPrintType,
  manufacturersList,
} from '../../helpers/constants';

import {
  glassUVPrintingTypes,
  glassPhotoPrintingTypes,
  mirrorUVPrintingTypes,
  lacobelUVPrintingTypes,
  chipboardUVPrintingTypes,
} from '../../helpers/options';

const INITIAL_STATE = {
  activeTrigger: null,
  customers: {
    customersOption: '',
    isMilling: true,
  },
  dsp: {
    manufacturer: manufacturersList[0],
    isDspUVPrinting: false,
    searchField: '',
    dspOption: null,
    dspUvPrintType: chipboardUVPrintingTypes[0].value,
  },
  mirror: {
    isMirrorMatted: false, // articleCode: sten_mat
    isMirrorRearMatted: false, // articleCode: rear_matt
    isMirrorFullMatted: false, // articleCode: matt_compl
    isMirrorUVPrinting: false,
    isMirrorArmoredFilm: true, // no articleCode
    isMirrorLaminated: false, // articleCode: lam_wfilm
    mirrorType: defaultMirrorType,
    mirrorUvPrintType: defaultMirrorUvPrintType,
    mirrorColor: '', // RAL
    mirrorSearch: '',
  },
  lacobel: {
    isLacobelMatted: false, // articleCode: sten_mat
    isLacobelRearMatted: false, // articleCode: rear_matt
    isLacobelFullMatted: false, // articleCode: matt_compl
    isLacobelUVPrinting: false,
    isLacobelArmoredFilm: true, // no articleCode
    isLacobelLaminated: false, // articleCode: lam_wfilm
    lacobelType: defaultLacobelType,
    lacobelUvPrintType: defaultLacobelUVPrintType,
    lacobelColor: '', // RAL
    lacobelSearch: '',
  },
  glass: {
    isGlassMatted: false, // articleCode: sten_mat
    isGlassFullMatted: false, // articleCode: matt_compl
    isGlassOneColorPainted: false, // articleCode: paint_1col
    isGlassTwoColorsPainted: false, // articleCode: paint_2col
    isGlassUVPrinting: false,
    isGlassPhotoPrinting: false,
    glassColors: [], // RAL
    glassType: defaultGlassType,
    glassUvPrintType: defaultGlassUvPrintType,
    glassPhotoPrintType: defaultGlassPhotoPrintType,
    glassSearch: '',
    isGlassArmoredFilm: false,
    isGlassLaminated: false,
  },
  isOpenFillingModal: false,
};

const setActiveTrigger = (state = INITIAL_STATE, { trigger }) => update(state, {
  activeTrigger: { $set: trigger },
});

const toggleFillingMaterialModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isOpenFillingModal: { $set: isOpen },
});

const resetFillingMaterialModal = (state = INITIAL_STATE) => update(state, {
  activeTrigger: { $set: null },
  customers: { $set: INITIAL_STATE.customers },
  dsp: { $set: INITIAL_STATE.dsp },
  mirror: { $set: INITIAL_STATE.mirror },
  glass: { $set: INITIAL_STATE.glass },
});

/** Custom DSP */

const setCustomDSPMilling = (state = INITIAL_STATE, { isOn }) => update(state, {
  customers: { isMilling: { $set: isOn } },
});

const setCustomerOption = (state = INITIAL_STATE, { option }) => update(state, {
  customers: {
    customersOption: { $set: option },
    isMilling: { $set: option === 'dsp-large' },
  },
});

/** DSP */

const setDspOption = (state = INITIAL_STATE, { option }) => update(state, {
  dsp: { dspOption: { $set: option } },
});

const setDspManufacturer = (state = INITIAL_STATE, { manufacture }) => update(state, {
  dsp: { manufacturer: { $set: manufacture } },
});

const setDspUvPrinting = (state = INITIAL_STATE, { isOn }) => update(state, {
  dsp: { isDspUVPrinting: { $set: isOn } },
  dspUvPrintType: { $set: isOn ? chipboardUVPrintingTypes[0].value : '' },
});

const setDspSearch = (state = INITIAL_STATE, { search }) => update(state, {
  dsp: { searchField: { $set: search } },
});

const setDspUvPrintType = (state = INITIAL_STATE, { printType }) => update(state, {
  dsp: { dspUvPrintType: { $set: printType } },
});

/** Mirror */

const setMirrorType = (state = INITIAL_STATE, { mirrorType }) => update(state, {
  mirror: {
    mirrorType: { $set: mirrorType },
  },
});

const setMirrorMatting = (state = INITIAL_STATE, { isOn }) => update(state, {
  mirror: {
    isMirrorMatted: { $set: isOn },
  },
});

const setMirrorRearMatting = (state = INITIAL_STATE, { isOn }) => update(state, {
  mirror: {
    isMirrorRearMatted: { $set: isOn },
  },
});

const setMirrorFullMatting = (state = INITIAL_STATE, { isOn }) => update(state, {
  mirror: {
    isMirrorFullMatted: { $set: isOn },
  },
});

const setMirrorPaintingColor = (state = INITIAL_STATE, { color }) => update(state, {
  mirror: {
    mirrorColor: { $set: color },
  },
});

const setMirrorUvPrinting = (state = INITIAL_STATE, { isOn }) => update(state, {
  mirror: {
    isMirrorUVPrinting: { $set: isOn },
    mirrorUvPrintType: { $set: isOn ? mirrorUVPrintingTypes[0].value : '' },
  },
});

const setMirrorUvPrintType = (state = INITIAL_STATE, { printType }) => update(state, {
  mirror: {
    mirrorUvPrintType: { $set: printType },
  },
});

const setMirrorArmoredFilm = (state = INITIAL_STATE, { isOn }) => update(state, {
  mirror: {
    isMirrorArmoredFilm: { $set: isOn },
  },
});

const setMirrorLamination = (state = INITIAL_STATE, { isOn }) => update(state, {
  mirror: {
    isMirrorLaminated: { $set: isOn },
  },
});

const setMirrorSearch = (state = INITIAL_STATE, { search }) => update(state, {
  mirror: {
    mirrorSearch: { $set: search },
  },
});

/** Lacobel */

const setLacobelType = (state = INITIAL_STATE, { lacobelType }) => update(state, {
  lacobel: {
    lacobelType: { $set: lacobelType },
  },
});

const setLacobelMatting = (state = INITIAL_STATE, { isOn }) => update(state, {
  lacobel: {
    isLacobelMatted: { $set: isOn },
  },
});

const setLacobelRearMatting = (state = INITIAL_STATE, { isOn }) => update(state, {
  lacobel: {
    isLacobelRearMatted: { $set: isOn },
  },
});

const setLacobelFullMatting = (state = INITIAL_STATE, { isOn }) => update(state, {
  lacobel: {
    isLacobelFullMatted: { $set: isOn },
  },
});

const setLacobelPaintingColor = (state = INITIAL_STATE, { color }) => update(state, {
  lacobel: {
    lacobelColor: { $set: color },
  },
});

const setLacobelUvPrinting = (state = INITIAL_STATE, { isOn }) => update(state, {
  lacobel: {
    isLacobelUVPrinting: { $set: isOn },
    lacobelUvPrintType: { $set: isOn ? lacobelUVPrintingTypes[0].value : '' },
  },
});

const setLacobelUvPrintType = (state = INITIAL_STATE, { printType }) => update(state, {
  lacobel: {
    lacobelUvPrintType: { $set: printType },
  },
});

const setLacobelArmoredFilm = (state = INITIAL_STATE, { isOn }) => update(state, {
  lacobel: {
    isLacobelArmoredFilm: { $set: isOn },
  },
});

const setLacobelLamination = (state = INITIAL_STATE, { isOn }) => update(state, {
  lacobel: {
    isLacobelLaminated: { $set: isOn },
  },
});

const setLacobelSearch = (state = INITIAL_STATE, { search }) => update(state, {
  lacobel: {
    lacobelSearch: { $set: search },
  },
});

/** Glass */

const setGlassType = (state = INITIAL_STATE, { glassType }) => update(state, {
  glass: {
    glassType: { $set: glassType },
  },
});

const setGlassMatting = (state = INITIAL_STATE, { isOn }) => update(state, {
  glass: {
    isGlassMatted: { $set: isOn },
  },
});

const setGlassFullMatting = (state = INITIAL_STATE, { isOn }) => update(state, {
  glass: {
    isGlassFullMatted: { $set: isOn },
  },
});

const setGlassArmoredFilm = (state = INITIAL_STATE, { isOn }) => update(state, {
  glass: {
    isGlassArmoredFilm: { $set: isOn },
  },
});

const setGlassLamination = (state = INITIAL_STATE, { isOn }) => update(state, {
  glass: {
    isGlassLaminated: { $set: isOn },
  },
});

const setGlassUvPrintType = (state = INITIAL_STATE, { printType }) => update(state, {
  glass: {
    glassUvPrintType: { $set: printType },
  },
});

const setGlassIsOneColorPainted = (state = INITIAL_STATE, { isOn }) => update(state, {
  glass: {
    isGlassOneColorPainted: { $set: isOn },
    isGlassTwoColorsPainted: {
      $set: isOn && state?.glass?.isGlassTwoColorsPainted ? !isOn : state?.glass?.isGlassTwoColorsPainted,
    },
    glassColors: { $set: [] },
  },
});

const setGlassIsTwoColorsPainted = (state = INITIAL_STATE, { isOn }) => update(state, {
  glass: {
    isGlassTwoColorsPainted: { $set: isOn },
    isGlassOneColorPainted: {
      $set: isOn && state?.glass?.isGlassOneColorPainted ? !isOn : state?.glass?.isGlassOneColorPainted,
    },
    glassColors: { $set: [] },
  },
});

const setGlassPaintingColors = (state = INITIAL_STATE, { colors }) => update(state, {
  glass: {
    glassColors: { $set: colors || [] },
  },
});

const setGlassUvPrinting = (state = INITIAL_STATE, { isOn }) => update(state, {
  glass: {
    isGlassUVPrinting: { $set: isOn },
    glassUvPrintType: { $set: isOn ? glassUVPrintingTypes[0].value : '' },
  },
});

const setGlassPhotoPrinting = (state = INITIAL_STATE, { isOn }) => update(state, {
  glass: {
    isGlassPhotoPrinting: { $set: isOn },
    glassPhotoPrintType: { $set: isOn ? glassPhotoPrintingTypes[0].value : '' },
  },
});

const setGlassPhotoPrintType = (state = INITIAL_STATE, { printType }) => update(state, {
  glass: {
    glassPhotoPrintType: { $set: printType },
  },
});

const setGlassSearch = (state = INITIAL_STATE, { search }) => update(state, {
  glass: {
    glassSearch: { $set: search },
  },
});

export default createReducer(INITIAL_STATE, {
  [ModalTypes.SET_ACTIVE_TRIGGER]: setActiveTrigger,
  [ModalTypes.TOGGLE_FILLING_MATERIAL_MODAL]: toggleFillingMaterialModal,
  [ModalTypes.RESET_FILLING_MATERIAL_MODAL]: resetFillingMaterialModal,

  [ModalTypes.SET_CUSTOMERS_OPTION]: setCustomerOption,

  [ModalTypes.SET_DSP_OPTION]: setDspOption,
  [ModalTypes.SET_DSP_MANUFACTURER]: setDspManufacturer,
  [ModalTypes.SET_DSP_UV_PRINTING]: setDspUvPrinting,
  [ModalTypes.SET_DSP_SEARCH]: setDspSearch,
  [ModalTypes.SET_DSP_UV_PRINT_TYPE]: setDspUvPrintType,
  [ModalTypes.SET_CUSTOM_DSP_MILLING]: setCustomDSPMilling,

  [ModalTypes.SET_MIRROR_TYPE]: setMirrorType,
  [ModalTypes.SET_MIRROR_MATTING]: setMirrorMatting,
  [ModalTypes.SET_MIRROR_REAR_MATTING]: setMirrorRearMatting,
  [ModalTypes.SET_MIRROR_FULL_MATTING]: setMirrorFullMatting,
  [ModalTypes.SET_MIRROR_PAINTING_COLOR]: setMirrorPaintingColor,
  [ModalTypes.SET_MIRROR_UV_PRINTING]: setMirrorUvPrinting,
  [ModalTypes.SET_MIRROR_UV_PRINT_TYPE]: setMirrorUvPrintType,
  [ModalTypes.SET_MIRROR_ARMORED_FILM]: setMirrorArmoredFilm,
  [ModalTypes.SET_MIRROR_LAMINATION]: setMirrorLamination,
  [ModalTypes.SET_MIRROR_SEARCH]: setMirrorSearch,

  [ModalTypes.SET_LACOBEL_TYPE]: setLacobelType,
  [ModalTypes.SET_LACOBEL_MATTING]: setLacobelMatting,
  [ModalTypes.SET_LACOBEL_REAR_MATTING]: setLacobelRearMatting,
  [ModalTypes.SET_LACOBEL_FULL_MATTING]: setLacobelFullMatting,
  [ModalTypes.SET_LACOBEL_PAINTING_COLOR]: setLacobelPaintingColor,
  [ModalTypes.SET_LACOBEL_UV_PRINTING]: setLacobelUvPrinting,
  [ModalTypes.SET_LACOBEL_UV_PRINT_TYPE]: setLacobelUvPrintType,
  [ModalTypes.SET_LACOBEL_ARMORED_FILM]: setLacobelArmoredFilm,
  [ModalTypes.SET_LACOBEL_LAMINATION]: setLacobelLamination,
  [ModalTypes.SET_LACOBEL_SEARCH]: setLacobelSearch,

  [ModalTypes.SET_GLASS_TYPE]: setGlassType,
  [ModalTypes.SET_GLASS_MATTING]: setGlassMatting,
  [ModalTypes.SET_GLASS_FULL_MATTING]: setGlassFullMatting,
  [ModalTypes.SET_GLASS_ARMORED_FILM]: setGlassArmoredFilm,
  [ModalTypes.SET_GLASS_LAMINATION]: setGlassLamination,
  [ModalTypes.SET_GLASS_UV_PRINT_TYPE]: setGlassUvPrintType,
  [ModalTypes.SET_GLASS_IS_ONE_COLOR_PAINTED]: setGlassIsOneColorPainted,
  [ModalTypes.SET_GLASS_IS_TWO_COLORS_PAINTED]: setGlassIsTwoColorsPainted,
  [ModalTypes.SET_GLASS_PAINTING_COLORS]: setGlassPaintingColors,
  [ModalTypes.SET_GLASS_UV_PRINTING]: setGlassUvPrinting,
  [ModalTypes.SET_GLASS_PHOTO_PRINTING]: setGlassPhotoPrinting,
  [ModalTypes.SET_GLASS_PHOTO_PRINT_TYPE]: setGlassPhotoPrintType,
  [ModalTypes.SET_GLASS_SEARCH]: setGlassSearch,
});
