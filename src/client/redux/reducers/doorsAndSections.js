import _ from 'lodash';
import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import {
  emptyDoor,
  emptySection,
} from '../../helpers/initialStateHelper';

import {
  defaultTexture,
  defaultAluminiumColor,
  defaultDoorLatchMechanism,
  minWidthFor4AssemblingDoors,
} from '../../helpers/constants';

import constantsBySystemType from '../../helpers/constantsBySystemType';

import {
  canUseAtLeast1DoorLatchMechanism,
  canUse2DoorLatchMechanisms,
  canUseHorizontalTexture,
} from '../../helpers/validation';

import {
  getMinDoorsAmount,
  getMaxDoorsAmount,
  getDoorHeightInctudingProfiles,
  getDoorWidthInctudingProfiles,
  sectionsRemeasurement,
  sectionsRemeasurementAligned,
  doorFillingHeightForChipboard,
} from '../../helpers/sizesCalculation';

import { DoorTypes } from '../actions/doorsAndSections';


const INITIAL_STATE = {
  isLoading: false,
  errorMessage: null,
  successMessage: null,
  minDoorsAmount: 0,
  maxDoorsAmount: 0,
  minSectionsAmount: 0,
  maxSectionsAmount: 0,

  isOpenCopyDoorModal: false,
  isOpenDeleteDoorModal: false,
  isOpenCopySectionModal: false,
  isOpenMergeSectionModal: false,
  isOpenDeleteSectionModal: false,
  isOpenZoomModal: false,
  hasChanges: false,

  activeDoor: 0,
  activeSection: 0,

  doors: [],

  // Main Tab with settings for all doors
  main: {
    doorOpeningHeight: { value: '' }, // Высота дверного проёма
    doorOpeningWidth: { value: '' }, // Ширина дверного проёма
    doorsAmount: { value: 0 },
    doorPositioning: { value: 'chessboard' },
    texture: { value: defaultTexture },
    sideProfile: {},
    filling: {},
    aluminiumColor: { value: '' },
    mechanism: { value: '' },
    stopper: { value: '' },
    isX2ProfileOn: true, // Ходовий профіль
    isX4ProfileOn: true, // Направляючий профіль
    isMiddleDoorMechanismOn: false,
    isStopperOn: true,
    monorailSingleDoorWidth: { value: '' }, // Ширина единственной двери для Монорельс
    sidewallThickness: { value: '' }, // Товщина боковини X14 для Навісної системи
  },
};

/**
 * Reducers handlers
 */

/**
 * Doors
 */

/** Set active Door */

const setActiveDoor = (state = INITIAL_STATE, { number }) => update(state, {
  activeDoor: { $set: number },
});

/** Set min Doors Amount */

const setMinDoorsAmount = (state = INITIAL_STATE, { systemConctants, currentSystem }) => {
  const minDoorsAmountToUpdate = getMinDoorsAmount(state, systemConctants, currentSystem);

  return update(state, { minDoorsAmount: { $set: minDoorsAmountToUpdate } });
};

/** Set max Doors Amount */

const setMaxDoorsAmount = (state = INITIAL_STATE, { systemConctants, currentSystem }) => {
  const maxDoorsAmount = getMaxDoorsAmount(state, systemConctants, currentSystem);

  return update(state, { maxDoorsAmount: { $set: maxDoorsAmount } });
};

/** Extendable system */
/** Handle doors amount to set it within the range limits specified by the min and max */
/** Increase doors amount (push new doors) */
const increaseDoorsAmountRequest = (state = INITIAL_STATE, { amountToAdd, systemConctants, currentSystem }) => {
  const doorsToAdd = Array
    .from(Array(amountToAdd))
    .map((door, index) => {
      const openingSideValue = currentSystem !== 'opening'
        ? null
        : index === 0 ? 'left' : 'right';

      return {
        ...emptyDoor,
        ...{
          sequenceNumber: state.doors.length + index + 1,
          main: {
            ...emptyDoor.main,
            ...{
              filling: state.main?.filling,
              openingSide: { value: openingSideValue },
            },
          },
        },
      };
    });

  const updatedStateWithAddedDoors = update(state, {
    main: { doorsAmount: { value: { $set: state.main.doorsAmount.value + amountToAdd } } },
    doors: { $push: doorsToAdd },
  });

  const doorWidth = getDoorWidthInctudingProfiles(updatedStateWithAddedDoors, systemConctants, currentSystem);
  const isDoorLatchMechanismAvailable = canUseAtLeast1DoorLatchMechanism(doorWidth);
  const isSomeLatchMechanism = state.doors.filter((d) => d.main?.isDoorLatchMechanismOn.value === true)?.length;

  const updatedStateWithDoorsSizes = update(updatedStateWithAddedDoors, {
    doors: {
      $apply: (doors) => doors.map((door) => update(door, {
        main: {
          doorHeight: {
            $set: getDoorHeightInctudingProfiles(updatedStateWithAddedDoors, systemConctants, currentSystem),
          },
          doorWidth: { $set: doorWidth },
          isDoorLatchMechanismOn: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value || isSomeLatchMechanism
                ? isDoorLatchMechanismAvailable
                : false,
            },
          },
          doorLatchMechanism: {
            value: {
              $set: (door.main?.isDoorLatchMechanismOn?.value || isSomeLatchMechanism) && isDoorLatchMechanismAvailable
                ? door.main?.doorLatchMechanism?.value || defaultDoorLatchMechanism
                : '',
            },
          },
          doorLatchMechanismPosition: {
            value: {
              $set: (door.main?.isDoorLatchMechanismOn?.value || isSomeLatchMechanism)
                && canUse2DoorLatchMechanisms(doorWidth)
                ? 'both-sides'
                : (door.main?.isDoorLatchMechanismOn?.value || isSomeLatchMechanism) && isDoorLatchMechanismAvailable
                  ? 'at-right'
                  : '',
            },
          },
        },
      })),
    },
  });

  return update(updatedStateWithDoorsSizes, {
    doors: {
      $apply: (doors) => doors.map((door, doorIndex) => update(door, {
        sections: {
          $set: door.main.areSectionsAligned
            ? sectionsRemeasurementAligned(updatedStateWithDoorsSizes, doorIndex, door.sections, systemConctants,
              currentSystem)
            : sectionsRemeasurement(updatedStateWithDoorsSizes, doorIndex, door.sections, systemConctants,
              currentSystem),
        },
      })),
    },
  });
};

const increaseDoorsAmountSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
});

const increaseDoorsAmountFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Extendable system */
/** Handle doors amount to set it within the range limits specified by the min and max */
/** Decrease doors amount (slice last doors) */
const decreaseDoorsAmountRequest = (state = INITIAL_STATE, {
  amountToRemove,
  systemConctants,
  currentSystem,
}) => {
  const updatedStateWithoutDoors = update(state, {
    main: { doorsAmount: { value: { $set: state.main.doorsAmount.value - amountToRemove } } },
    doors: { $set: state.doors.slice(0, state.doors.length - amountToRemove) },
  });

  const doorWidth = getDoorWidthInctudingProfiles(updatedStateWithoutDoors, systemConctants, currentSystem);
  const doorHeight = getDoorHeightInctudingProfiles(updatedStateWithoutDoors, systemConctants, currentSystem);
  const isDoorLatchMechanismAvailable = canUseAtLeast1DoorLatchMechanism(doorWidth);

  const updatedStateWithDoorsSizes = update(updatedStateWithoutDoors, {
    doors: {
      $apply: (doors) => doors.map((door) => update(door, {
        main: {
          doorHeight: { $set: doorHeight },
          doorWidth: { $set: doorWidth },
          isDoorLatchMechanismOn: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value
                ? isDoorLatchMechanismAvailable
                : false,
            },
          },
          doorLatchMechanism: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value && isDoorLatchMechanismAvailable
                ? door.main?.doorLatchMechanism?.value || defaultDoorLatchMechanism
                : '',
            },
          },
          doorLatchMechanismPosition: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value && canUse2DoorLatchMechanisms(doorWidth)
                ? 'both-sides'
                : door.main?.isDoorLatchMechanismOn?.value && isDoorLatchMechanismAvailable
                  ? 'at-right'
                  : '',
            },
          },
          openingSide: { value: { $set: currentSystem === 'opening' ? 'left' : '' } },
        },
      })),
    },
  });

  return update(updatedStateWithDoorsSizes, {
    doors: {
      $apply: (doors) => doors.map((door, index) => update(door, {
        sections: {
          $set: door.main.areSectionsAligned
            ? sectionsRemeasurementAligned(updatedStateWithDoorsSizes, index, door.sections, systemConctants,
              currentSystem)
            : sectionsRemeasurement(updatedStateWithDoorsSizes, index, door.sections, systemConctants, currentSystem),
        },
      })),
    },
  });
};

const decreaseDoorsAmountSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
});

const decreaseDoorsAmountFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Update Door's Main Tab */

const updateMainDoor = (state = INITIAL_STATE, { field, systemConctants, currentSystem }) => {
  const { name } = field;

  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { defaultSideProfile } = systemDefaults;

  let updatedStateWithField = update(state, {
    main: {
      [name]: {
        value: { $set: field.value },
        error: { $set: field.error },
      },
    },
  });

  const doorHeight = getDoorHeightInctudingProfiles(updatedStateWithField, systemConctants, currentSystem);
  const doorFillingH = doorFillingHeightForChipboard(defaultSideProfile, doorHeight, systemConctants,
    currentSystem);

  if (name === 'texture') {
    updatedStateWithField = update(state, {
      main: {
        [name]: {
          value: { $set: field.value },
          error: { $set: field.error },
        },
      },
      doors: {
        $apply: (doors) => doors.map((door) => update(door, {
          main: {
            texture: {
              value: {
                $set: field.value === 'horizontal'
                  ? canUseHorizontalTexture(doorFillingH)
                    ? field.value
                    : door.main.texture?.value
                  : field.value,
              },
            },
          },
          sections: {
            $apply: (sections) => sections.map((section) => update(section, {
              texture: {
                value: {
                  $set: field.value === 'horizontal'
                    ? canUseHorizontalTexture(section.fillingHeight?.value)
                      ? field.value
                      : section.texture?.value
                    : field.value,
                },
              },
            })),
          },
        })),
      },
    });
  }

  if (name === 'doorOpeningHeight') {
    const doorsHeight = doorHeight || field.value;
    const doorFillingHeight = doorFillingHeightForChipboard(defaultSideProfile, doorsHeight, systemConctants,
      currentSystem);

    updatedStateWithField = update(state, {
      main: {
        [name]: {
          value: { $set: field.value },
          error: { $set: field.error },
        },
        texture: {
          value: { $set: !canUseHorizontalTexture(doorFillingHeight) ? 'vertical' : state.main.texture?.value },
        },
      },
      doors: {
        $apply: (doors) => doors.map((door, i) => update(door, {
          main: {
            texture: {
              value: {
                $set: !canUseHorizontalTexture(doorFillingHeight) ? 'vertical' : state.doors[i].main.texture?.value,
              },
            },
          },
        })),
      },
    });
  }

  const doorWidth = getDoorWidthInctudingProfiles(updatedStateWithField, systemConctants, currentSystem);
  const isDoorLatchMechanismAvailable = canUseAtLeast1DoorLatchMechanism(doorWidth);

  let monorailSingleDoorWidth = name === 'monorailSingleDoorWidth' ? field.value : doorWidth;

  if (currentSystem === 'monorail' && name === 'doorOpeningWidth') {
    monorailSingleDoorWidth = monorailSingleDoorWidth > field.value
      ? field.value
      : monorailSingleDoorWidth;
  }

  const updatedStateWithDoorsSizes = update(updatedStateWithField, {
    main: { monorailSingleDoorWidth: { value: { $set: monorailSingleDoorWidth } } },
    doors: {
      $apply: (doors) => doors.map((door) => update(door, {
        main: {
          doorHeight: { $set: getDoorHeightInctudingProfiles(updatedStateWithField, systemConctants, currentSystem) },
          doorWidth: { $set: doorWidth },
          isDoorLatchMechanismOn: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value
                ? isDoorLatchMechanismAvailable
                : false,
            },
          },
          doorLatchMechanism: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value && isDoorLatchMechanismAvailable
                ? door.main?.doorLatchMechanism?.value || defaultDoorLatchMechanism
                : '',
            },
          },
          doorLatchMechanismPosition: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value && canUse2DoorLatchMechanisms(doorWidth)
                ? 'both-sides'
                : door.main?.isDoorLatchMechanismOn?.value && isDoorLatchMechanismAvailable
                  ? 'at-right'
                  : '',
            },
          },
        },
      })),
    },
  });

  return update(updatedStateWithDoorsSizes, {
    hasChanges: { $set: true },
    doors: {
      $apply: (doors) => doors.map((door, doorIndex) => update(door, {
        sections: {
          $set: door.main.areSectionsAligned
            ? sectionsRemeasurementAligned(updatedStateWithDoorsSizes, doorIndex,
              updatedStateWithDoorsSizes.doors[doorIndex].sections,
              systemConctants, currentSystem)
            : sectionsRemeasurement(updatedStateWithDoorsSizes, doorIndex,
              updatedStateWithDoorsSizes.doors[doorIndex].sections,
              systemConctants, currentSystem),
        },
      })),
    },
  });
};

/** Update Door's Sizes */

const updateDoorsSizes = (state = INITIAL_STATE, { systemConctants, currentSystem }) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { maxDoorWidth } = systemDefaults;
  let monorailSingleDoorWidth = '';

  let doorWidth = getDoorWidthInctudingProfiles(state, systemConctants, currentSystem);
  const doorHeight = getDoorHeightInctudingProfiles(state, systemConctants, currentSystem);

  if (currentSystem === 'monorail') {
    monorailSingleDoorWidth = state.main.monorailSingleDoorWidth?.value || state.main.doorOpeningWidth?.value || '';
    if (monorailSingleDoorWidth > maxDoorWidth) monorailSingleDoorWidth = maxDoorWidth;
    doorWidth = monorailSingleDoorWidth;
  }

  const updatedStateWithDoorsSizes = update(state, {
    main: { monorailSingleDoorWidth: { value: { $set: monorailSingleDoorWidth } } },
    doors: {
      $apply: (doors) => doors.map((door) => update(door, {
        main: {
          doorHeight: { $set: doorHeight },
          doorWidth: { $set: doorWidth },
        },
      })),
    },
  });

  const updatedState = update(updatedStateWithDoorsSizes, {
    doors: {
      $apply: (doors) => doors.map((door, doorIndex) => update(door, {
        sections: {
          $set: door.main.areSectionsAligned
            ? sectionsRemeasurementAligned(updatedStateWithDoorsSizes, doorIndex,
              updatedStateWithDoorsSizes.doors[doorIndex].sections, systemConctants, currentSystem)
            : sectionsRemeasurement(updatedStateWithDoorsSizes, doorIndex,
              updatedStateWithDoorsSizes.doors[doorIndex].sections, systemConctants, currentSystem),
        },
      })),
    },
  });

  return update(state, { doors: { $set: updatedState.doors } });
};

/** Push a new Door */

const addDoorRequest = (state = INITIAL_STATE, { systemConctants, currentSystem }) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { maxDoorWidth, minDoorOpeningWidth, defaultDoorPositioning } = systemDefaults;
  const isAssembling = currentSystem === 'assembling';

  const getStateWithAddedDoors = () => {
    const doorsAmount = state.main.doorsAmount.value;
    const doorOpeningWidth = state.main.doorOpeningWidth?.value;
    const updatedDoorsAmount = isAssembling && doorsAmount === 2 ? 4 : state.main.doorsAmount.value + 1;

    const newDoor = {
      ...emptyDoor,
      ...{
        main: {
          ...emptyDoor.main,
          ...{
            sequenceNumber: state.doors.length + 1,
            filling: state.main?.filling,
          },
        },
      },
    };
    const doorsToAdd = isAssembling && doorsAmount === 2
      ? [newDoor, {
        ...newDoor,
        ...{ sequenceNumber: state.doors.length + 2 },
      }]
      : [newDoor];

    const updatedStateWithDoors = update(state, {
      main: { doorsAmount: { value: { $set: updatedDoorsAmount } } },
      doors: { $push: doorsToAdd },
    });

    if (isAssembling) {
      const firstGroupOpeningSide = updatedStateWithDoors.doors[0].openingSide?.value
        || updatedStateWithDoors.doors[1].openingSide?.value || 'left';
      const secondGroupOpeningSide = firstGroupOpeningSide === 'left' ? 'right' : 'left';

      return update(updatedStateWithDoors, {
        main: {
          doorsAmount: { value: { $set: updatedDoorsAmount } },
          doorOpeningWidth: { value: {
            $set: doorOpeningWidth && doorOpeningWidth < minWidthFor4AssemblingDoors
              ? minWidthFor4AssemblingDoors
              : doorOpeningWidth,
          } },
        },
        doors: {
          $apply: (doors) => doors.map((door, doorIndex) => update(door, {
            main: { openingSide: { value: { $set: doorIndex < 2 ? firstGroupOpeningSide : secondGroupOpeningSide } } },
          })),
        },
      });
    }

    if (currentSystem === 'opening') {
      const firstDoorOpeningSide = updatedStateWithDoors.doors[0].openingSide?.value || 'left';

      return update(updatedStateWithDoors, {
        main: {
          doorsAmount: { value: { $set: updatedDoorsAmount } },
          doorOpeningWidth: { value: {
            $set: doorOpeningWidth && doorOpeningWidth < minDoorOpeningWidth
              ? minDoorOpeningWidth
              : doorOpeningWidth,
          } },
        },
        doors: {
          $apply: (doors) => doors.map((door, doorIndex) => update(door, {
            main: { openingSide: { value: { $set: doorIndex === 0 ? firstDoorOpeningSide : 'right' } } },
          })),
        },
      });
    }

    if (currentSystem === 'hinged') {
      return update(updatedStateWithDoors, {
        main: {
          doorsAmount: { value: { $set: updatedDoorsAmount } },
          doorPositioning: { value: { $set: defaultDoorPositioning } },
        },
      });
    }

    return updatedStateWithDoors;
  };
  const stateWithAddedDoors = getStateWithAddedDoors();

  let monorailSingleDoorWidth = '';
  let doorWidth = getDoorWidthInctudingProfiles(stateWithAddedDoors, systemConctants, currentSystem);

  if (currentSystem === 'monorail') {
    monorailSingleDoorWidth = state.main.monorailSingleDoorWidth?.value || state.main.doorOpeningWidth?.value || '';
    if (monorailSingleDoorWidth > maxDoorWidth) monorailSingleDoorWidth = maxDoorWidth;
    doorWidth = monorailSingleDoorWidth;
  }

  const isDoorLatchMechanismAvailable = canUseAtLeast1DoorLatchMechanism(doorWidth);

  const updatedStateWithDoorsSizes = update(stateWithAddedDoors, {
    main: { monorailSingleDoorWidth: { value: { $set: monorailSingleDoorWidth } } },
    doors: {
      $apply: (doors) => doors.map((door) => update(door, {
        main: {
          doorHeight: { $set: getDoorHeightInctudingProfiles(stateWithAddedDoors, systemConctants, currentSystem) },
          doorWidth: { $set: doorWidth },
          isDoorLatchMechanismOn: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value ? isDoorLatchMechanismAvailable : false,
            },
          },
          doorLatchMechanism: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value && isDoorLatchMechanismAvailable
                ? door.main?.doorLatchMechanism?.value || defaultDoorLatchMechanism
                : '',
            },
          },
          doorLatchMechanismPosition: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value && canUse2DoorLatchMechanisms(doorWidth)
                ? 'both-sides'
                : door.main?.isDoorLatchMechanismOn?.value && isDoorLatchMechanismAvailable
                  ? 'at-right'
                  : '',
            },
          },
        },
      })),
    },
  });

  return update(updatedStateWithDoorsSizes, {
    hasChanges: { $set: true },
    doors: {
      $apply: (doors) => doors.map((door, doorIndex) => update(door, {
        sections: {
          $set: door.main.areSectionsAligned
            ? sectionsRemeasurementAligned(updatedStateWithDoorsSizes, doorIndex, door.sections, systemConctants,
              currentSystem)
            : sectionsRemeasurement(updatedStateWithDoorsSizes, doorIndex, door.sections, systemConctants,
              currentSystem),
        },
      })),
    },
  });
};

const addDoorSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
});

const addDoorFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Copy main Section params and sections of the Door to selected doors */

const copyDoorRequest = (state = INITIAL_STATE, { doorIndexFrom, doorIndexesTo }) => {
  const mainSectionParamsToApply = state.doors[doorIndexFrom]?.main;
  const sectionsToApply = state.doors[doorIndexFrom]?.sections;

  // Note: It will replace main Section params and sections if they created

  return update(state, {
    isLoading: { $set: true },
    hasChanges: { $set: true },
    doors: {
      $apply: (doors) => doors.map((door, index) => {
        if (doorIndexesTo.indexOf(`${index}`) !== -1) {
          return update(door, {
            main: { $set: mainSectionParamsToApply },
            sections: { $set: sectionsToApply },
          });
        }

        return update(door, { $set: door });
      }),
    },
  });
};

const copyDoorSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
});

const copyDoorFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Remove the Door */

const removeDoorRequest = (state = INITIAL_STATE, { doorIndex, systemConctants, currentSystem }) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const { maxDoorWidth } = systemDefaults;
  let monorailSingleDoorWidth = '';

  const getStateWithoutDoor = () => {
    const doorOpeningWidth = state.main.doorOpeningWidth?.value;
    const doorsAmount = state.main.doorsAmount.value;
    const isAssembling = currentSystem === 'assembling';
    const updatedDoorsAmount = isAssembling && doorsAmount === 4 ? 2 : state.main.doorsAmount.value - 1;
    const doorIndexForAssembling = doorIndex === 0 ? 0 : doorIndex === 2 ? 2 : doorIndex - 1; // removing a group
    const query = isAssembling && doorsAmount === 4
      ? [[doorIndexForAssembling, 2]]
      : [[doorIndex, 1]];

    const updatedState = update(state, {
      main: { doorsAmount: { value: { $set: updatedDoorsAmount } } },
      doors: { $splice: query },
    });

    if (isAssembling) {
      return update(updatedState, {
        main: {
          doorOpeningWidth: { value: {
            $set: doorOpeningWidth && doorOpeningWidth > maxDoorWidth
              ? maxDoorWidth
              : doorOpeningWidth,
          } },
        },
      });
    }

    if (currentSystem === 'opening') {
      return update(updatedState, {
        main: {
          doorOpeningWidth: { value: {
            $set: doorOpeningWidth && doorOpeningWidth > maxDoorWidth
              ? maxDoorWidth
              : doorOpeningWidth,
          } },
        },
      });
    }

    return updatedState;
  };
  const updatedStateWithoutDoor = getStateWithoutDoor();

  let doorWidth = getDoorWidthInctudingProfiles(updatedStateWithoutDoor, systemConctants, currentSystem);

  if (currentSystem === 'monorail') {
    monorailSingleDoorWidth = state.main.monorailSingleDoorWidth?.value
      || updatedStateWithoutDoor.main.doorOpeningWidth?.value || '';
    if (monorailSingleDoorWidth > maxDoorWidth) monorailSingleDoorWidth = maxDoorWidth;
    doorWidth = monorailSingleDoorWidth;
  }

  const doorHeight = getDoorHeightInctudingProfiles(updatedStateWithoutDoor, systemConctants, currentSystem);
  const isDoorLatchMechanismAvailable = canUseAtLeast1DoorLatchMechanism(doorWidth);

  const updatedStateWithDoorsSizes = update(updatedStateWithoutDoor, {
    main: { monorailSingleDoorWidth: { value: { $set: monorailSingleDoorWidth } } },
    doors: {
      $apply: (doors) => doors.map((door) => update(door, {
        main: {
          doorHeight: { $set: doorHeight },
          doorWidth: { $set: doorWidth },
          isDoorLatchMechanismOn: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value ? isDoorLatchMechanismAvailable : false,
            },
          },
          doorLatchMechanism: {
            value: {
              $set: door.main?.isDoorLatchMechanismOn?.value && door.main?.doorLatchMechanism?.value
              && isDoorLatchMechanismAvailable
                ? door.main?.doorLatchMechanism?.value || defaultDoorLatchMechanism
                : '',
            },
          },
          doorLatchMechanismPosition: { value: { $set: door.main?.doorLatchMechanismPosition?.value || '' } },
        },
      })),
    },
  });

  return update(updatedStateWithDoorsSizes, {
    hasChanges: { $set: true },
    doors: {
      $apply: (doors) => doors.map((door, index) => update(door, {
        sections: {
          $set: door.main.areSectionsAligned
            ? sectionsRemeasurementAligned(updatedStateWithDoorsSizes, index, door.sections, systemConctants,
              currentSystem)
            : sectionsRemeasurement(updatedStateWithDoorsSizes, index, door.sections, systemConctants, currentSystem),
        },
      })),
    },
  });
};

const removeDoorSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
});

const removeDoorFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Update Main Filling Materials */

const updateMainDoorFilling = (state = INITIAL_STATE, { filling }) => {
  const texture = filling?.material !== 'dsp'
    ? defaultTexture
    : state.main.texture?.value || defaultTexture;

  return update(state, {
    hasChanges: { $set: true },
    main: {
      filling: { $set: filling },
      texture: { value: { $set: texture } },
    },
    doors: {
      $apply: (items) => items.map((door) => update(door, {
        main: {
          filling: { $set: filling },
          texture: { value: { $set: texture } },
        },
        sections: {
          $apply: (sections) => sections.map((section) => update(section, {
            filling: { $set: filling },
            texture: { value: { $set: texture } },
          })),
        },
      })),
    },
  });
};


/**
 * Sections
 */

/** Set active Door */

const setActiveSection = (state = INITIAL_STATE, { number }) => update(state, {
  activeSection: { $set: number },
});


/** Set Section sizes including profiles and constants after editing section size */

const updateSectionsSizesOnEdit = (state = INITIAL_STATE, {
  doorIndex,
  sectionIndex,
  field,
  systemConctants,
  currentSystem,
}) => {
  // Note: it will recalculate visible and filling sizes of
  // section that has been changed and the last section of the door

  const sections = state.doors[doorIndex]?.sections;
  const updatedSections = update(sections, {
    [sectionIndex]: {
      [field.name]: {
        value: { $set: field.value },
        error: { $set: field.error },
      },
    },
  });

  const sectionsToUpdate = sectionsRemeasurement(state, doorIndex, updatedSections, systemConctants, currentSystem);

  return update(state, {
    hasChanges: { $set: true },
    doors: { [doorIndex]: {
      main: { areSectionsAligned: { $set: false } },
      sections: { $set: sectionsToUpdate } },
    },
  });
};

/** Update Main Tab of the Door Section */

const updateMainSectionRequest = (state = INITIAL_STATE, { doorIndex, field, currentSystem }) => {
  let stateSource = state;

  if (field.name === 'doorLatchMechanism') {
    stateSource = update(state, {
      doors: {
        $apply: (doors) => doors.map((door) => update(door, {
          main: {
            doorLatchMechanism: {
              value: {
                $set: door.main.isDoorLatchMechanismOn ? field.value : door.main.doorLatchMechanism?.value,
              },
            },
          },
        })),
      },
    });
  }

  if (field.name === 'connectingProfile') {
    stateSource = update(state, {
      doors: {
        $apply: (doors) => doors.map((door) => update(door, {
          main: { connectingProfile: { value: { $set: field.value } } },
        })),
      },
    });
  }

  if (field.name === 'texture') {
    const isTextureEqualForAllDoors = state.doors.filter((d) => d.main.texture?.value !== field.value).length <= 1;

    stateSource = update(state, {
      main: {
        texture: { value: { $set: isTextureEqualForAllDoors ? field.value : state.main.texture?.value || '' } },
      },
      doors: {
        [doorIndex]: {
          sections: {
            $apply: (sections) => sections.map((section) => update(section, {
              texture: {
                value: {
                  $set: field.value === 'horizontal'
                    ? canUseHorizontalTexture(section.fillingHeight?.value)
                      ? field.value
                      : section.texture?.value
                    : field.value,
                },
              },
            })),
          },
        },
      },
    });
  }

  if (field.name === 'openingSide' && currentSystem === 'assembling') {
    const oppositeValue = field.value === 'left' ? 'right' : 'left';
    const firstGroupOpeningSide = doorIndex < 2 ? field.value : oppositeValue;
    const secondGroupOpeningSide = doorIndex >= 2 ? field.value : oppositeValue;

    stateSource = update(state, {
      doors: {
        $apply: (doors) => doors.map((door, index) => update(door, {
          main: { openingSide: { value: { $set: index < 2 ? firstGroupOpeningSide : secondGroupOpeningSide } } },
        })),
      },
    });
  }

  return update(stateSource, {
    isLoading: { $set: true },
    hasChanges: { $set: true },
    doors: {
      [doorIndex]: {
        main: {
          [field.name]: {
            value: { $set: field.value },
            error: { $set: field.error },
          },
        },
      },
    },
  });
};

const updateMainSectionSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
});

const updateMainSectionFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Update Section of the Door */

const updateSectionRequest = (state = INITIAL_STATE, { doorIndex, sectionIndex, field }) => update(state, {
  isLoading: { $set: true },
  hasChanges: { $set: true },
  doors: {
    [doorIndex]: {
      sections: {
        [sectionIndex]: {
          [field.name]: {
            value: { $set: field.value },
            error: { $set: field.error },
          },
        },
      },
    },
  },
});

const updateSectionSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
});

const updateSectionFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Push new Section(s) and align */

const addSection = (state = INITIAL_STATE, { doorIndex, systemConctants, currentSystem }) => {
  const sections = state.doors[doorIndex]?.sections;
  const texture = state.doors[doorIndex]?.main?.texture?.value || defaultTexture;
  const sideProfile = state.main.sideProfile?.value;
  const currentSectionsAmount = state.doors[doorIndex]?.main?.sectionsAmount?.value;
  const fillingToFill = !_.isEmpty(state.doors[doorIndex].main.filling)
    ? state.doors[doorIndex].main.filling
    : {};

  // Note: It will add sections from 0 to 2 in one go

  const sectionsToAdd = currentSectionsAmount === 0
    ? [{
      ...emptySection,
      ...{
        filling: fillingToFill,
        texture: { value: texture },
        sequenceNumber: state.doors[doorIndex].sections.length + 1,
      },
    }, {
      ...emptySection,
      ...{
        filling: fillingToFill,
        texture: { value: texture },
        sequenceNumber: state.doors[doorIndex].sections.length + 2,
      },
    }]
    : [{
      ...emptySection,
      ...{
        filling: fillingToFill,
        texture: { value: texture },
        sequenceNumber: state.doors[doorIndex].sections.length + 1,
      },
    }];

  const updatedSections = update(sections, { $push: sectionsToAdd });

  const availableConnectingProfiles = systemConctants
    .find((c) => c.sideProfile === sideProfile)?.connectingProfilesDependence || [];

  const cpToSet = state.doors.find((d) => d.main?.connectingProfile?.value)?.main?.connectingProfile?.value
    || availableConnectingProfiles[0];

  return update(state, {
    hasChanges: { $set: true },
    doors: {
      [doorIndex]: {
        main: {
          areSectionsAligned: { $set: true },
          connectingProfile: { $set: { value: cpToSet } },
          sectionsAmount: {
            value: {
              $set: currentSectionsAmount === 0
                ? currentSectionsAmount + 2
                : currentSectionsAmount + 1,
            },
          },
        },
        sections: {
          $set: sectionsRemeasurementAligned(state, doorIndex, updatedSections, systemConctants, currentSystem),
        },
      },
    },
  });
};

/** Apply Section filling to other sections inside current Door  */

const copySectionRequest = (state = INITIAL_STATE, {
  doorIndex,
  sectionIndexFrom,
  sectionIndexesTo,
}) => update(state, {
  successMessage: { $set: 'successMessages.section-copied-successfully' },
  isLoading: { $set: true },
  hasChanges: { $set: true },
  doors: {
    [doorIndex]: {
      sections: {
        $apply: (sections) => sections.map((section, index) => {
          if (sectionIndexesTo.indexOf(`${index}`) !== -1) {
            return update(section, {
              filling: { $set: state.doors[doorIndex].sections[sectionIndexFrom].filling },
              texture: {
                value: {
                  $set: state.doors[doorIndex].sections[sectionIndexFrom].filling?.material !== 'dsp'
                    ? defaultTexture
                    : state.doors[doorIndex].sections[sectionIndexFrom].texture.value,
                },
              },
            });
          }
          return update(section, { $set: section });
        }),
      },
    },
  },
});

const copySectionSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
  successMessage: { $set: '' },
});

const copySectionFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Merge Section with another (first or last) one OR just remove with aligning */

const mergeSectionRequest = (state = INITIAL_STATE, {
  doorIndex,
  sectionIndexToRemove,
  mergeOption,
  systemConctants,
  currentSystem,
}) => {
  const sectionToRemove = state.doors[doorIndex].sections[sectionIndexToRemove];
  const currentSectionsAmount = state.doors[doorIndex]?.main?.sectionsAmount?.value;
  const directionOfSections = state.doors[doorIndex]?.main?.directionOfSections?.value;
  const currentSections = state.doors[doorIndex]?.sections;
  const sectionsAmountToUpdate = currentSectionsAmount - 1;
  const shouldAlign = mergeOption === 'align-all';

  let sectionsToUpdate = currentSections;

  const sectionsWithoutRemovedOne = update(currentSections, {
    $splice: [[sectionIndexToRemove, 1]],
  });

  // Just remove the section and align other sections
  if (shouldAlign) {
    sectionsToUpdate = sectionsRemeasurementAligned(state, doorIndex, sectionsWithoutRemovedOne,
      systemConctants, currentSystem);
  } else {
    // Merge Section with sections[sectionIndexToMergeWith]

    const sectionIndexToMergeWith = mergeOption === 'last'
      ? sectionIndexToRemove + 1
      : sectionIndexToRemove - 1;

    let visibleHeight = state.doors[doorIndex].sections[sectionIndexToMergeWith].visibleHeight?.value;
    let visibleWidth = state.doors[doorIndex].sections[sectionIndexToMergeWith].visibleWidth?.value;

    if (directionOfSections === 'horizontal') {
      visibleHeight = sectionToRemove.visibleHeight?.value
        + state.doors[doorIndex].sections[sectionIndexToMergeWith].visibleHeight?.value;
    }

    if (directionOfSections === 'vertical') {
      visibleWidth = sectionToRemove.visibleWidth?.value
        + state.doors[doorIndex].sections[sectionIndexToMergeWith].visibleWidth?.value;
    }

    const index = mergeOption === 'last' ? sectionIndexToMergeWith - 1 : sectionIndexToMergeWith;
    const mergedSections = update(sectionsWithoutRemovedOne, {
      [index]: {
        filling: { $set: sectionToRemove?.filling },
        texture: {
          value: {
            $set: sectionToRemove?.filling?.material !== 'dsp'
              ? defaultTexture
              : sectionToRemove?.texture.value,
          },
        },
        visibleHeight: { value: { $set: visibleHeight } },
        visibleWidth: { value: { $set: visibleWidth } },
      },
    });

    sectionsToUpdate = sectionsRemeasurement(state, doorIndex, mergedSections, systemConctants, currentSystem);
  }

  return update(state, {
    hasChanges: { $set: true },
    successMessage: { $set: 'successMessages.section-merged-successfully' },
    doors: {
      [doorIndex]: {
        main: {
          sectionsAmount: { value: { $set: sectionsAmountToUpdate } },
          areSectionsAligned: { $set: shouldAlign },
        },
        sections: { $set: sectionsToUpdate },
      },
    },
  });
};

const mergeSectionSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
  successMessage: { $set: '' },
});

const mergeSectionFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Remove last Section(s) and align all remaining sections */

const removeLastSectionRequest = (state = INITIAL_STATE, { doorIndex, systemConctants, currentSystem }) => {
  const currentSectionsAmount = state.doors[doorIndex]?.main?.sectionsAmount?.value;
  const sectionsAmount = currentSectionsAmount === 2 ? 0 : currentSectionsAmount - 1;
  const currentSections = state.doors[doorIndex]?.sections;
  let sectionsToUpdate = currentSections;

  const sectionsWithoutLastOne = update(currentSections, {
    $splice: [[currentSectionsAmount - 1, 1]],
  });

  sectionsToUpdate = sectionsRemeasurementAligned(state, doorIndex, sectionsWithoutLastOne,
    systemConctants, currentSystem);

  // Note: It will reduce sections from 2 to 0 in one go

  return update(state, {
    isLoading: { $set: true },
    hasChanges: { $set: true },
    doors: {
      [doorIndex]: {
        main: { sectionsAmount: { value: { $set: sectionsAmount } } },
        sections: sectionsAmount > 0
          ? { $set: sectionsToUpdate }
          : { $set: [] },
      },
    },
  });
};

const removeLastSectionSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
});

const removeLastSectionFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Align all sections of the door */

const alignSections = (state = INITIAL_STATE, { doorIndex, systemConctants, currentSystem }) => {
  const sectionsAmount = state.doors[doorIndex]?.main?.sectionsAmount?.value;
  const sections = state.doors[doorIndex]?.sections;
  if (!sectionsAmount) return state;

  return update(state, {
    doors: {
      [doorIndex]: {
        main: { areSectionsAligned: { $set: true } },
        sections: { $set: sectionsRemeasurementAligned(state, doorIndex, sections, systemConctants, currentSystem) },
      },
    },
  });
};

/** Reduce sections from 2 to 0 in one go and apply other section's filling */

const removeSectionsRequest = (state = INITIAL_STATE, { doorIndex, sectionIndexToRemove }) => {
  const sections = state.doors[doorIndex]?.sections.filter((s, i) => i !== sectionIndexToRemove);

  return update(state, {
    isLoading: { $set: true },
    hasChanges: { $set: true },
    doors: {
      [doorIndex]: {
        main: {
          sectionsAmount: { value: { $set: 0 } },
          filling: { $set: sections[0]?.filling },
          texture: {
            value: {
              $set: sections[0]?.filling?.material !== 'dsp'
                ? defaultTexture
                : state.doors[doorIndex].main.texture?.value,
            },
          },
        },
        sections: { $set: [] },
      },
    },
  });
};

const removeSectionsSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
});

const removeSectionsFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Update Door (Main Sections Tab) Filling Materials */

const updateMainSectionFilling = (state = INITIAL_STATE, { doorIndex, filling }) => update(state, {
  hasChanges: { $set: true },
  doors: {
    [doorIndex]: {
      main: { filling: { $set: filling } },
      sections: {
        $apply: (sections) => sections.map((section) => update(section, {
          filling: { $set: filling },
          texture: {
            value: {
              $set: filling?.material !== 'dsp'
                ? defaultTexture
                : state.doors[doorIndex].main.texture?.value,
            },
          },
        })),
      },
    },
  },
});

/** Update Section Filling Materials */

const updateSectionFilling = (state = INITIAL_STATE, { doorIndex, sectionIndex, filling }) => update(state, {
  hasChanges: { $set: true },
  doors: {
    [doorIndex]: {
      sections: {
        [sectionIndex]: {
          filling: { $set: filling },
          texture: {
            value: {
              $set: filling?.material !== 'dsp'
                ? defaultTexture
                : state.doors[doorIndex].sections[sectionIndex].texture.value,
            },
          },
        },
      },
    },
  },
});

/** Update side profile and dependent values */

const updateSideProfile = (state = INITIAL_STATE, {
  sideProfile,
  systemConctants,
  currentSystem,
  isCurrentColorAvailable,
}) => {
  try {
    const doorsAmount = state.main.doorsAmount?.value;
    const prevSP = state.main.sideProfile?.value;
    const isSlim = sideProfile === 'Slim';

    const availableConnectingProfiles = systemConctants
      .find((c) => c.sideProfile === sideProfile)?.connectingProfilesDependence || [];

    const spConctants = systemConctants.find((c) => c.sideProfile === sideProfile) || [];
    const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
    const { defaultSideProfile } = systemDefaults;

    const { defaultStopper = '' } = spConctants;
    let { mechanismsDependence = [] } = spConctants;
    if (currentSystem === 'hinged' && doorsAmount === 3) mechanismsDependence = ['3_двер_Tutti'];
    if (currentSystem === 'hinged' && doorsAmount !== 3) mechanismsDependence = ['2_двер_Tutti'];

    const shoudResetFilling = (filling) => {
      if (!isSlim) return false;
      return filling?.material === 'dsp' || filling?.customersOption?.includes('dsp');
    };

    const shouldAlignSections = (isSlim && prevSP !== 'Slim' && prevSP !== '207')
      || (sideProfile === '207' && prevSP !== '207' && prevSP !== 'Slim');

    const shouldChangeDirection = (direction) => {
      if (!direction) return false;
      return (isSlim || sideProfile === '207') && direction === 'vertical';
    };

    const mechanism = state.main.mechanism?.value && mechanismsDependence.find((item) => item === mechanism)
      ? state.main.mechanism.value : mechanismsDependence[0];

    const stopper = state.main.isStopperOn ? defaultStopper : '';

    const aluminiumColorToSet = isCurrentColorAvailable && state.main.aluminiumColor?.value
      ? state.main.aluminiumColor.value : defaultAluminiumColor;

    return update(state, {
      main: {
        aluminiumColor: { value: { $set: aluminiumColorToSet } },
        mechanism: { value: { $set: mechanism } },
        sideProfile: { value: { $set: sideProfile || defaultSideProfile } },
        filling: {
          $set: shoudResetFilling(state.main.filling)
            ? {}
            : {
              ...state.main.filling,
              ...{
                isMirrorArmoredFilm: isSlim ? false : state.main.filling?.isMirrorArmoredFilm,
                isMirrorLaminated: isSlim ? true : state.main.filling?.isMirrorLaminated,
              },
            },
        },
        stopper: { value: { $set: stopper } },
      },
      doors: {
        $apply: (doors) => doors.map((door, doorIndex) => {
          const connectingProfile = door.sections?.length
            ? { value: door.main?.connectingProfile?.value || availableConnectingProfiles[0] }
            : { value: '' };

          return update(door, {
            sections: {
              $set: shouldAlignSections && shouldChangeDirection(door.main.directionOfSections?.value)
                ? sectionsRemeasurementAligned(state, doorIndex, state.doors[doorIndex].sections,
                  systemConctants, currentSystem)
                  .map((section) => update(section, {
                    filling: {
                      $set: shoudResetFilling(section.filling)
                        ? {}
                        : {
                          ...section.filling,
                          ...{
                            isMirrorArmoredFilm: isSlim ? false : section.filling?.isMirrorArmoredFilm,
                            isMirrorLaminated: isSlim ? true : section.filling?.isMirrorLaminated,
                          },
                        },
                    },
                  }))
                : state.doors[doorIndex].sections
                  .map((section) => update(section, {
                    filling: {
                      $set: shoudResetFilling(section.filling)
                        ? {}
                        : {
                          ...section.filling,
                          ...{
                            isMirrorArmoredFilm: isSlim ? false : section.filling?.isMirrorArmoredFilm,
                            isMirrorLaminated: isSlim ? true : section.filling?.isMirrorLaminated,
                          },
                        },
                    },
                  })),
            },
            main: {
              areSectionsAligned: { $set: shouldAlignSections || door.main.areSectionsAligned },
              connectingProfile: { $set: connectingProfile },
              filling: {
                $set: shoudResetFilling(door.main.filling)
                  ? {}
                  : {
                    ...door.main.filling,
                    ...{
                      isMirrorArmoredFilm: isSlim ? false : door.main.filling?.isMirrorArmoredFilm,
                      isMirrorLaminated: isSlim ? true : door.main.filling?.isMirrorLaminated,
                    },
                  },
              },
              directionOfSections: {
                $set: shouldChangeDirection(door.main.directionOfSections?.value)
                  ? { value: 'horizontal' }
                  : door.main.directionOfSections,
              },
            },
          });
        }),
      },
    });
  } catch (ex) {
    console.error(ex);
    return state;
  }
};

/** Clear Filling Materials */

const clearFilling = (state = INITIAL_STATE, { doorIndex, sectionIndex }) => {
  if (sectionIndex !== null) {
    return update(state, {
      hasChanges: { $set: true },
      doors: {
        [doorIndex]: {
          sections: {
            [sectionIndex]: {
              filling: { $set: {} },
              texture: { value: { $set: defaultTexture } },
            },
          },
        },
      },
    });
  }

  if (doorIndex !== null) {
    return update(state, {
      hasChanges: { $set: true },
      doors: {
        [doorIndex]: {
          main: {
            filling: { $set: {} },
            texture: { value: { $set: defaultTexture } },
          },
        },
      },
    });
  }

  return update(state, {
    hasChanges: { $set: true },
    main: {
      filling: { $set: {} },
      texture: { value: { $set: defaultTexture } },
    },
  });
};

/** Hightlight empty Door Opening inputs */

const hightlightDoorOpeningInputs = (state = INITIAL_STATE, { labelKey }) => {
  const doorOpeningHeight = state.main?.doorOpeningHeight?.value;
  const doorOpeningWidth = state.main?.doorOpeningWidth?.value;
  const errorMessage = labelKey === 'labelUk'
    ? 'пусте значення'
    : 'пустое значение';

  return update(state, {
    main: {
      doorOpeningHeight: {
        value: { $set: doorOpeningHeight },
        error: { $set: !doorOpeningHeight ? errorMessage : '' },
      },
      doorOpeningWidth: {
        value: { $set: doorOpeningWidth },
        error: { $set: !doorOpeningWidth ? errorMessage : '' },
      },
    },
  });
};

/** Update Door Latch Mechanism */

const updateDoorLatchMechanism = (state = INITIAL_STATE, { doorIndex, isOn }) => {
  const doorWidth = state.doors[doorIndex].main?.doorWidth;
  const isAvailable = canUseAtLeast1DoorLatchMechanism(doorWidth);

  const doorsLanchMechanismToSet = state.doors.find((d) => d.main.isDoorLatchMechanismOn?.value === true
    && d.main.doorLatchMechanism?.value)?.main?.doorLatchMechanism?.value || defaultDoorLatchMechanism;

  if (isOn && !isAvailable) return state;

  return update(state, {
    isLoading: { $set: true },
    hasChanges: { $set: true },
    doors: {
      [doorIndex]: {
        main: {
          isDoorLatchMechanismOn: { value: { $set: isOn } },
          doorLatchMechanism: { value: { $set: isOn ? doorsLanchMechanismToSet : '' } },
          doorLatchMechanismPosition: {
            value: {
              $set: isOn && canUse2DoorLatchMechanisms(doorWidth)
                ? 'both-sides'
                : isOn
                  ? 'at-right'
                  : '',
            },
          },
        },
      },
    },
  });
};

const setOrderBySnippet = (state = INITIAL_STATE, { doorsSnippet }) => update(state, {
  minDoorsAmount: { $set: doorsSnippet.minDoorsAmount },
  maxDoorsAmount: { $set: doorsSnippet.maxDoorsAmount },
  minSectionsAmount: { $set: doorsSnippet.minSectionsAmount },
  maxSectionsAmount: { $set: doorsSnippet.maxSectionsAmount },
  main: { $set: doorsSnippet?.main },
  doors: { $set: doorsSnippet?.doors },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});

const resetOrderDefaults = (state = INITIAL_STATE) => update(state, {
  minDoorsAmount: { $set: 0 },
  maxDoorsAmount: { $set: 0 },
  minSectionsAmount: { $set: 0 },
  maxSectionsAmount: { $set: 0 },
  main: { $set: INITIAL_STATE.main },
  doors: { $set: INITIAL_STATE.doors },
  hasChanges: { $set: false },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});

const setDefaultsBySystemType = (state = INITIAL_STATE, { currentSystem }) => {
  const systemDefaults = constantsBySystemType.find((c) => c.systemType === currentSystem) || {};
  const {
    defaultDoorsAmount,
    defaultMinDoorsAmount,
    defaultMaxDoorsAmount,
    defaultMinSectionsAmount,
    defaultMaxSectionsAmount,
    defaultDirectionOfSections,
    defaultSidewallThickness,
    defaultDoorPositioning,
  } = systemDefaults;

  const doorsToAdd = Array
    .from(Array(defaultDoorsAmount))
    .map((door, index) => {
      const openingSideValue = currentSystem === 'opening'
        ? index === 0 ? 'left' : 'right'
        : currentSystem === 'assembling'
          ? 'left'
          : null;

      return {
        ...emptyDoor,
        ...{
          sequenceNumber: index + 1,
          main: {
            ...emptyDoor.main,
            ...{
              sectionsAmount: { value: defaultMinSectionsAmount },
              directionOfSections: { value: defaultDirectionOfSections },
              openingSide: { value: openingSideValue },
            },
          },
        },
      };
    });

  return update(state, {
    minDoorsAmount: { $set: defaultMinDoorsAmount || 0 },
    maxDoorsAmount: { $set: defaultMaxDoorsAmount || 0 },
    minSectionsAmount: { $set: defaultMinSectionsAmount || 0 },
    maxSectionsAmount: { $set: defaultMaxSectionsAmount || 0 },
    main: {
      doorsAmount: { value: { $set: defaultDoorsAmount || 0 } },
      doorPositioning: { value: { $set: defaultDoorPositioning } },
      sidewallThickness: { value: { $set: currentSystem === 'hinged' ? defaultSidewallThickness : '' } },
    },
    doors: { $set: doorsToAdd },
    hasChanges: { $set: false },
    errorMessage: { $set: '' },
    successMessage: { $set: '' },
  });
};


const toggleCarriageProfile = (state = INITIAL_STATE, { isOn }) => update(state, {
  hasChanges: { $set: true },
  main: { isX2ProfileOn: { $set: isOn } },
});

const toggleGuidanceProfile = (state = INITIAL_STATE, { isOn }) => update(state, {
  hasChanges: { $set: true },
  main: { isX4ProfileOn: { $set: isOn } },
});

const toggleMiddleDoorMechanism = (state = INITIAL_STATE, { isOn }) => update(state, {
  hasChanges: { $set: true },
  main: { isMiddleDoorMechanismOn: { $set: isOn } },
});

const toggleStopper = (state = INITIAL_STATE, { isOn, sideProfile, systemConctants }) => {
  const spConctants = systemConctants.find((c) => c.sideProfile === sideProfile) || [];
  const { defaultStopper = '' } = spConctants;

  return update(state, {
    hasChanges: { $set: true },
    main: {
      isStopperOn: { $set: isOn },
      stopper: { value: { $set: isOn ? defaultStopper : '' } },
    },
  });
};


/**
 * Modals
 */

const toggleCopyDoorModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isOpenCopyDoorModal: { $set: isOpen },
});

const toggleDeleteDoorModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isOpenDeleteDoorModal: { $set: isOpen },
});

const toggleCopySectionModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isOpenCopySectionModal: { $set: isOpen },
});

const toggleMergeSectionModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isOpenMergeSectionModal: { $set: isOpen },
});

const toggleDeleteSectionModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isOpenDeleteSectionModal: { $set: isOpen },
});

const toggleZoomModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isOpenZoomModal: { $set: isOpen },
});


/**
 * Reducers
 */

export default createReducer(INITIAL_STATE, {

  /** Doors */

  [DoorTypes.SET_ACTIVE_DOOR]: setActiveDoor,

  [DoorTypes.SET_MIN_DOORS_AMOUNT]: setMinDoorsAmount,

  [DoorTypes.SET_MAX_DOORS_AMOUNT]: setMaxDoorsAmount,

  [DoorTypes.INCREASE_DOORS_AMOUNT_REQUEST]: increaseDoorsAmountRequest,
  [DoorTypes.INCREASE_DOORS_AMOUNT_SUCCESS]: increaseDoorsAmountSuccess,
  [DoorTypes.INCREASE_DOORS_AMOUNT_FAILURE]: increaseDoorsAmountFailure,

  [DoorTypes.DECREASE_DOORS_AMOUNT_REQUEST]: decreaseDoorsAmountRequest,
  [DoorTypes.DECREASE_DOORS_AMOUNT_SUCCESS]: decreaseDoorsAmountSuccess,
  [DoorTypes.DECREASE_DOORS_AMOUNT_FAILURE]: decreaseDoorsAmountFailure,

  [DoorTypes.UPDATE_MAIN_DOOR]: updateMainDoor,

  [DoorTypes.UPDATE_DOORS_SIZES]: updateDoorsSizes,

  [DoorTypes.ADD_DOOR_REQUEST]: addDoorRequest,
  [DoorTypes.ADD_DOOR_SUCCESS]: addDoorSuccess,
  [DoorTypes.ADD_DOOR_FAILURE]: addDoorFailure,

  [DoorTypes.COPY_DOOR_REQUEST]: copyDoorRequest,
  [DoorTypes.COPY_DOOR_SUCCESS]: copyDoorSuccess,
  [DoorTypes.COPY_DOOR_FAILURE]: copyDoorFailure,

  [DoorTypes.REMOVE_DOOR_REQUEST]: removeDoorRequest,
  [DoorTypes.REMOVE_DOOR_SUCCESS]: removeDoorSuccess,
  [DoorTypes.REMOVE_DOOR_FAILURE]: removeDoorFailure,

  [DoorTypes.UPDATE_MAIN_DOOR_FILLING]: updateMainDoorFilling,

  /** Sections */

  [DoorTypes.SET_ACTIVE_SECTION]: setActiveSection,

  [DoorTypes.UPDATE_SECTIONS_SIZES_ON_EDIT]: updateSectionsSizesOnEdit,

  [DoorTypes.UPDATE_MAIN_SECTION_REQUEST]: updateMainSectionRequest,
  [DoorTypes.UPDATE_MAIN_SECTION_SUCCESS]: updateMainSectionSuccess,
  [DoorTypes.UPDATE_MAIN_SECTION_FAILURE]: updateMainSectionFailure,

  [DoorTypes.UPDATE_SECTION_REQUEST]: updateSectionRequest,
  [DoorTypes.UPDATE_SECTION_SUCCESS]: updateSectionSuccess,
  [DoorTypes.UPDATE_SECTION_FAILURE]: updateSectionFailure,

  [DoorTypes.ADD_SECTION]: addSection,

  [DoorTypes.COPY_SECTION_REQUEST]: copySectionRequest,
  [DoorTypes.COPY_SECTION_SUCCESS]: copySectionSuccess,
  [DoorTypes.COPY_SECTION_FAILURE]: copySectionFailure,

  [DoorTypes.MERGE_SECTION_REQUEST]: mergeSectionRequest,
  [DoorTypes.MERGE_SECTION_SUCCESS]: mergeSectionSuccess,
  [DoorTypes.MERGE_SECTION_FAILURE]: mergeSectionFailure,

  [DoorTypes.REMOVE_LAST_SECTION_REQUEST]: removeLastSectionRequest,
  [DoorTypes.REMOVE_LAST_SECTION_SUCCESS]: removeLastSectionSuccess,
  [DoorTypes.REMOVE_LAST_SECTION_FAILURE]: removeLastSectionFailure,

  [DoorTypes.REMOVE_SECTIONS_REQUEST]: removeSectionsRequest,
  [DoorTypes.REMOVE_SECTIONS_SUCCESS]: removeSectionsSuccess,
  [DoorTypes.REMOVE_SECTIONS_FAILURE]: removeSectionsFailure,

  [DoorTypes.ALIGN_SECTIONS]: alignSections,

  [DoorTypes.UPDATE_MAIN_SECTION_FILLING]: updateMainSectionFilling,

  [DoorTypes.UPDATE_SECTION_FILLING]: updateSectionFilling,

  [DoorTypes.UPDATE_SIDE_PROFILE]: updateSideProfile,

  [DoorTypes.CLEAR_FILLING]: clearFilling,

  [DoorTypes.HIGHTLIGHT_DOOR_OPENING_INPUTS]: hightlightDoorOpeningInputs,

  [DoorTypes.UPDATE_DOOR_LATCH_MECHANISM]: updateDoorLatchMechanism,

  [DoorTypes.SET_ORDER_BY_SNIPPET]: setOrderBySnippet,

  [DoorTypes.RESET_ORDER_DEFAULTS]: resetOrderDefaults,

  [DoorTypes.SET_DEFAULTS_BY_SYSTEM_TYPE]: setDefaultsBySystemType,

  [DoorTypes.TOGGLE_CARRIAGE_PROFILE]: toggleCarriageProfile,

  [DoorTypes.TOGGLE_GUIDANCE_PROFILE]: toggleGuidanceProfile,

  [DoorTypes.TOGGLE_MIDDLE_DOOR_MECHANISM]: toggleMiddleDoorMechanism,

  [DoorTypes.TOGGLE_STOPPER]: toggleStopper,

  /** Modals */

  [DoorTypes.TOGGLE_COPY_DOOR_MODAL]: toggleCopyDoorModal,
  [DoorTypes.TOGGLE_DELETE_DOOR_MODAL]: toggleDeleteDoorModal,
  [DoorTypes.TOGGLE_COPY_SECTION_MODAL]: toggleCopySectionModal,
  [DoorTypes.TOGGLE_MERGE_SECTION_MODAL]: toggleMergeSectionModal,
  [DoorTypes.TOGGLE_DELETE_SECTION_MODAL]: toggleDeleteSectionModal,
  [DoorTypes.TOGGLE_ZOOM_MODAL]: toggleZoomModal,
});
