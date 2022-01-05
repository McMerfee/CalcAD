import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  setMinDoorsAmount: ['systemConctants', 'currentSystem'],

  setMaxDoorsAmount: ['systemConctants', 'currentSystem'],

  increaseDoorsAmountRequest: ['amountToAdd', 'systemConctants'],
  increaseDoorsAmountSuccess: null,
  increaseDoorsAmountFailure: ['errorMessage'],

  decreaseDoorsAmountRequest: ['amountToRemove', 'systemConctants', 'currentSystem'],
  decreaseDoorsAmountSuccess: null,
  decreaseDoorsAmountFailure: ['errorMessage'],

  updateMainDoor: ['field', 'systemConctants', 'currentSystem'],

  updateDoorsSizes: ['systemConctants', 'currentSystem'],

  addDoorRequest: ['systemConctants', 'currentSystem'],
  addDoorSuccess: null,
  addDoorFailure: ['errorMessage'],

  copyDoorRequest: ['doorIndexFrom', 'doorIndexesTo'],
  copyDoorSuccess: null,
  copyDoorFailure: ['errorMessage'],

  removeDoorRequest: ['doorIndex', 'systemConctants', 'currentSystem'],
  removeDoorSuccess: null,
  removeDoorFailure: ['errorMessage'],

  updateMainDoorFilling: ['filling'],

  updateMainSectionRequest: ['doorIndex', 'field', 'currentSystem'],
  updateMainSectionSuccess: null,
  updateMainSectionFailure: ['errorMessage'],

  updateSectionRequest: ['doorIndex', 'sectionIndex', 'field'],
  updateSectionSuccess: null,
  updateSectionFailure: ['errorMessage'],

  addSection: ['doorIndex', 'systemConctants', 'currentSystem'],

  copySectionRequest: ['doorIndex', 'sectionIndexFrom', 'sectionIndexesTo'],
  copySectionSuccess: null,
  copySectionFailure: ['errorMessage'],

  mergeSectionRequest: ['doorIndex', 'sectionIndexToRemove', 'mergeOption', 'systemConctants', 'currentSystem'],
  mergeSectionSuccess: null,
  mergeSectionFailure: ['errorMessage'],

  removeSectionsRequest: ['doorIndex', 'sectionIndexToRemove'],
  removeSectionsSuccess: null,
  removeSectionsFailure: ['errorMessage'],

  removeLastSectionRequest: ['doorIndex', 'systemConctants', 'currentSystem'],
  removeLastSectionSuccess: null,
  removeLastSectionFailure: ['errorMessage'],

  alignSections: ['doorIndex', 'systemConctants', 'currentSystem'],

  updateSectionsSizesOnEdit: ['doorIndex', 'sectionIndex', 'field', 'systemConctants', 'currentSystem'],

  updateMainSectionFilling: ['doorIndex', 'filling'],

  updateSectionFilling: ['doorIndex', 'sectionIndex', 'filling'],

  updateSideProfile: ['sideProfile', 'systemConctants', 'currentSystem', 'isCurrentColorAvailable'],

  clearFilling: ['doorIndex', 'sectionIndex'],

  toggleCopyDoorModal: ['isOpen'],
  toggleDeleteDoorModal: ['isOpen'],
  toggleCopySectionModal: ['isOpen'],
  toggleMergeSectionModal: ['isOpen'],
  toggleDeleteSectionModal: ['isOpen'],
  toggleZoomModal: ['isOpen'],

  setActiveDoor: ['number'],
  setActiveSection: ['number'],

  hightlightDoorOpeningInputs: ['labelKey'],

  updateDoorLatchMechanism: ['doorIndex', 'isOn'],

  setOrderBySnippet: ['doorsSnippet'],

  resetOrderDefaults: null,

  setDefaultsBySystemType: ['currentSystem'],

  toggleCarriageProfile: ['isOn'],
  toggleGuidanceProfile: ['isOn'],
  toggleMiddleDoorMechanism: ['isOn'],
  toggleStopper: ['isOn', 'sideProfile', 'systemConctants'],
});

export const DoorTypes = Types;
export default Creators;
