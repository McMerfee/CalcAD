import { defaultTexture } from './constants';

export const emptyDoor = {
  sequenceNumber: null,
  // Main Tab with settings for all sections of the door
  main: {
    filling: {},
    texture: { value: defaultTexture },
    isDoorLatchMechanismOn: { value: '' },
    doorLatchMechanism: { value: '' },
    doorLatchMechanismPosition: { value: '' },
    sectionsAmount: { value: 0 },
    directionOfSections: { value: 'horizontal' },
    isDoorAssemblingOn: { value: true },
    connectingProfile: { value: '' },
    openingSide: { value: '' },
    doorWidth: 1,
    doorHeight: 1,
    areSectionsAligned: true,
  },
  sections: [],
};

export const emptySection = {
  sequenceNumber: null,
  visibleHeight: { value: 0 },
  visibleWidth: { value: 0 },
  fillingHeight: { value: 1 },
  fillingWidth: { value: 1 },
  texture: { value: defaultTexture },
  filling: {},
};
