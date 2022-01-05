/**
 * sideProfile - Боковий профіль
 * topProfiles, bottomProfiles - Верхні, нижні профілі (X5)
 * connectingProfiles - Зєднувальні профілі
 * carriageProfiles - Ходові профілі (X2)
 * standbyCarriagesProfiles - Резервні ходові профілі (X2_standby)
 * guidanceProfiles - Направляючі профілі (X4)
 * mechanisms - Механізми (Кріплення)
 * doorLatchMechanisms - Дотяги дверей
 * topGap, bottomGap - Зазор по висоті зверху, знизу
 * hiddingTopSize, hiddingBottomSize, hiddingSideSize - Розміри схову
 * Sealing - Ущільнювачі для скла та дзеркала
 */

const mongoose = require('mongoose');

module.exports = [
  /** Extendable System's Constants */
  {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '119',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 26,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 50,
    X12H: 60,
    X13W: 35,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '06',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    carriageProfile: [],
    mechanismsDependence: ['сил_2', 'вт_2', 'під_2'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_2',
    defaultStopper: 'stopor_new',
    X1: 32,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 64,
    X12H: 60,
    X13W: 49,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '07',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 41,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 50,
    X12H: 60,
    X13W: 35,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '117',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_2', 'вт_2', 'під_2'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_2',
    defaultStopper: 'stopor_new',
    X1: 50,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 100,
    X12H: 60,
    X13W: 85,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '120',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_2', 'вт_2', 'під_2'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_2',
    defaultStopper: 'stopor_new',
    X1: 41,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 82,
    X12H: 60,
    X13W: 67,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '207',
    connectingProfilesDependence: ['231'],
    topProfilesDependence: ['202'],
    bottomProfilesDependence: ['201'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_207_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal'],
    defaultConnectingProfile: '231',
    defaultMechanism: 'сил_207_1',
    defaultStopper: 'stopor_new',
    X1: 13,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 23,
    X12H: 4,
    X13W: 7,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 0.0,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: 'Slim',
    connectingProfilesDependence: ['Slim 03', 'invisible'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_2', 'вт_2', 'під_2'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal'],
    defaultConnectingProfile: 'Slim 03',
    defaultMechanism: 'сил_2',
    defaultStopper: 'stopor_new',
    X1: 8,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 64,
    X12H: 0,
    X13W: 8,
    topGap: 1,
    bottomGap: 2,
    hiddingTopSize: 0,
    hiddingBottomSize: 0,
    hiddingSideSize: 0,
    topSealing: 0.0,
    bottomSealing: 0.0,
    sideSealing: 0.0,
    connectingSealing: 0.0,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '219',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['208'],
    standbyCarriagesProfilesDependence: [],
    guidanceProfilesDependence: ['204'],
    mechanismsDependence: ['R-219_сил', 'R-219_вт'],
    doorLatchMechanismsDependence: [],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'R-219_сил',
    defaultStopper: 'stop_arc',
    X1: 30,
    X2: 11,
    X2_standby: 11,
    X4: 27,
    X5: 60,
    X12H: 60,
    X13W: 45,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '119-L',
    connectingProfilesDependence: ['03-L'],
    topProfilesDependence: ['02-L'],
    bottomProfilesDependence: ['01-L'],
    carriageProfilesDependence: ['108-L'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104-L'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03-L',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stop_arc',
    X1: 25,
    X2: 11,
    X2_standby: 11,
    X4: 32,
    X5: 49,
    X12H: 57,
    X13W: 34,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '119-v.p.',
    connectingProfilesDependence: ['03-L'],
    topProfilesDependence: ['02-L'],
    bottomProfilesDependence: ['01-L'],
    carriageProfilesDependence: ['108-L'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104-L'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03-L',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stop_arc',
    X1: 26,
    X2: 11,
    X2_standby: 11,
    X4: 32,
    X5: 52,
    X12H: 57,
    X13W: 39,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '20',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 33,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 50,
    X12H: 60,
    X13W: 35,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '21',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 28,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 45,
    X12H: 60,
    X13W: 29,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '22',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 20,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 38,
    X12H: 60,
    X13W: 22,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    sideProfile: '220',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 33,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 64,
    X12H: 4,
    X13W: 48,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    connectingProfile: '03',
    hiddingSize: 8,
    thickness: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    connectingProfile: '03-L',
    hiddingSize: 8,
    thickness: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    connectingProfile: '31',
    hiddingSize: 8,
    thickness: 8,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    connectingProfile: '32',
    hiddingSize: 8,
    thickness: 34,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    connectingProfile: '231',
    hiddingSize: 4,
    thickness: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    connectingProfile: 'Slim 03',
    hiddingSize: 0,
    thickness: 6,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'extendable',
    bottomProfile: '01',
    hiddingSize: 0,
    thickness: 0,
  },


  /** Monorail System's Constants */
  {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '119',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['10'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 26,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 50,
    X12H: 60,
    X13W: 35,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '06',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['10'],
    guidanceProfilesDependence: ['111'],
    carriageProfile: [],
    mechanismsDependence: ['сил_2', 'вт_2', 'під_2'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_2',
    defaultStopper: 'stopor_new',
    X1: 32,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 64,
    X12H: 60,
    X13W: 49,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '07',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['10'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 41,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 50,
    X12H: 60,
    X13W: 35,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '117',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['10'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['сил_2', 'вт_2', 'під_2'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_2',
    defaultStopper: 'stopor_new',
    X1: 50,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 100,
    X12H: 60,
    X13W: 85,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '120',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['10'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['сил_2', 'вт_2', 'під_2'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_2',
    defaultStopper: 'stopor_new',
    X1: 41,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 82,
    X12H: 60,
    X13W: 67,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '207',
    connectingProfilesDependence: ['231'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['10'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['сил_207_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal'],
    defaultConnectingProfile: '231',
    defaultMechanism: 'сил_207_1',
    defaultStopper: 'stopor_new',
    X1: 13,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 82,
    X12H: 4,
    X13W: 7,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 0.0,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: 'Slim',
    connectingProfilesDependence: ['Slim 03', 'invisible'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['10'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['сил_2', 'вт_2', 'під_2'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal'],
    defaultConnectingProfile: 'Slim 03',
    defaultMechanism: 'сил_2',
    defaultStopper: 'stopor_new',
    X1: 8,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 64,
    X12H: 0,
    X13W: 6,
    topGap: 1,
    bottomGap: 2,
    hiddingTopSize: 0,
    hiddingBottomSize: 0,
    hiddingSideSize: 0,
    topSealing: 0.0,
    bottomSealing: 0.0,
    sideSealing: 0.0,
    connectingSealing: 0.0,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '119-L',
    connectingProfilesDependence: ['03-L'],
    topProfilesDependence: ['02-L'],
    bottomProfilesDependence: ['01-L'],
    carriageProfilesDependence: ['10'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03-L',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stop_arc',
    X1: 25,
    X2: 11,
    X2_standby: 11,
    X4: 32,
    X5: 49,
    X12H: 57,
    X13W: 34,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '119-v.p.',
    connectingProfilesDependence: ['03-L'],
    topProfilesDependence: ['02-L'],
    bottomProfilesDependence: ['01-L'],
    carriageProfilesDependence: ['10'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03-L',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stop_arc',
    X1: 26,
    X2: 11,
    X2_standby: 11,
    X4: 32,
    X5: 52,
    X12H: 57,
    X13W: 39,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '20',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 33,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 50,
    X12H: 60,
    X13W: 35,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '21',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 28,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 45,
    X12H: 60,
    X13W: 29,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '22',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 20,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 38,
    X12H: 60,
    X13W: 22,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    sideProfile: '220',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['02'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['108'],
    standbyCarriagesProfilesDependence: ['308'],
    guidanceProfilesDependence: ['104'],
    mechanismsDependence: ['сил_1', 'вт_1', 'під_1'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'сил_1',
    defaultStopper: 'stopor_new',
    X1: 33,
    X2: 11,
    X2_standby: 17,
    X4: 32,
    X5: 64,
    X12H: 4,
    X13W: 48,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    connectingProfile: '03',
    hiddingSize: 8,
    thickness: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    connectingProfile: '03-L',
    hiddingSize: 8,
    thickness: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    connectingProfile: '31',
    hiddingSize: 8,
    thickness: 8,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    connectingProfile: '32',
    hiddingSize: 8,
    thickness: 34,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    connectingProfile: '231',
    hiddingSize: 4,
    thickness: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    connectingProfile: 'Slim 03',
    hiddingSize: 0,
    thickness: 6,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'monorail',
    bottomProfile: '01',
    hiddingSize: 0,
    thickness: 0,
  },


  /** Opening System's Constants */
  {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'opening',
    sideProfile: '119',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['01'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['13'],
    guidanceProfilesDependence: ['13'],
    mechanismsDependence: ['кріп_відкр'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'кріп_відкр',
    defaultStopper: 'stopor_new',
    X1: 6,
    X2: 10.5,
    X2_standby: 10.5,
    X4: 10.5,
    X5: 50,
    X12H: 94,
    X13W: 35,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'opening',
    sideProfile: '07',
    connectingProfilesDependence: ['03', '31', '32'],
    directionsOfSections: ['horizontal', 'vertical'],
    topProfilesDependence: ['01'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['13'],
    standbyCarriagesProfilesDependence: ['13'],
    guidanceProfilesDependence: ['13'],
    mechanismsDependence: ['кріп_відкр'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'кріп_відкр',
    defaultStopper: 'stopor_new',
    X1: 6,
    X2: 10.5,
    X2_standby: 10.5,
    X4: 10.5,
    X5: 50,
    X12H: 94,
    X13W: 35,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'opening',
    connectingProfile: '03',
    hiddingSize: 8,
    thickness: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'opening',
    connectingProfile: '31',
    hiddingSize: 8,
    thickness: 8,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'opening',
    connectingProfile: '32',
    hiddingSize: 8,
    thickness: 34,
  },

  /** Assembling System's Constants */

  {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'assembling',
    sideProfile: '119',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['01'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['AS-U21-un'],
    standbyCarriagesProfilesDependence: ['AS-U21-un'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['кріп_комп_склад', '10100217301'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal', 'vertical'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'кріп_комп_склад',
    defaultStopper: 'stopor_new',
    X1: 2.5,
    X2: 61,
    X2_standby: 61,
    X4: 0,
    X5: 50,
    X12H: 94,
    X13W: 34,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'assembling',
    sideProfile: '07',
    connectingProfilesDependence: ['03', '31', '32'],
    topProfilesDependence: ['01'],
    bottomProfilesDependence: ['01'],
    carriageProfilesDependence: ['AS-U21-un'],
    standbyCarriagesProfilesDependence: ['AS-U21-un'],
    guidanceProfilesDependence: ['111'],
    mechanismsDependence: ['кріп_комп_склад', '10100217301'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK', 'дотяг_низ'],
    defaultConnectingProfile: '03',
    defaultMechanism: 'кріп_комп_склад',
    defaultStopper: 'stopor_new',
    X1: 2.5,
    X2: 61,
    X2_standby: 61,
    X4: 0,
    X5: 50,
    X12H: 94,
    X13W: 40,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 8,
    hiddingBottomSize: 8,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'assembling',
    connectingProfile: '03',
    hiddingSize: 8,
    thickness: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'assembling',
    connectingProfile: '31',
    hiddingSize: 8,
    thickness: 8,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'assembling',
    connectingProfile: '32',
    hiddingSize: 8,
    thickness: 34,
  },

  /** Hinged System's Constants */

  {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'hinged',
    sideProfile: '419',
    connectingProfilesDependence: ['403', '431'],
    topProfilesDependence: ['401'],
    bottomProfilesDependence: ['401'],
    carriageProfilesDependence: ['408 Tutti'],
    guidanceProfilesDependence: ['AS-404 Tutti'],
    mechanismsDependence: ['дотяг_Tutti', '2_двер_Tutti', '3_двер_Tutti'],
    doorLatchMechanismsDependence: ['дотяг_верх_OPK'],
    directionsOfSections: ['horizontal'],
    defaultConnectingProfile: '403',
    defaultMechanism: '2_двер_Tutti',
    defaultStopper: 'stopor_new',
    X1: 12,
    X2: -90,
    X2_standby: -90,
    X4: 0,
    X5: 24,
    X12H: 5,
    X13W: 6,
    topGap: 0,
    bottomGap: 0,
    hiddingTopSize: 9.5,
    hiddingBottomSize: 9.5,
    hiddingSideSize: 8,
    topSealing: 1.5,
    bottomSealing: 1.5,
    sideSealing: 1.5,
    connectingSealing: 1.5,
  }, {
    _id: new mongoose.Types.ObjectId(),
    systemType: 'hinged',
    connectingProfile: '403',
    hiddingSize: 5,
    thickness: 2,
  },
];