import mongoose from 'mongoose';

const { Schema } = mongoose;

const SystemConctantsSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  systemType: {
    type: String,
    required: true,
  },
  sideProfile: String,
  connectingProfile: String,
  bottomProfile: String,
  directionsOfSections: [String],
  connectingProfilesDependence: [String],
  topProfilesDependence: [String],
  bottomProfilesDependence: [String],
  carriageProfilesDependence: [String],
  standbyCarriagesProfilesDependence: [String],
  guidanceProfilesDependence: [String],
  mechanismsDependence: [String],
  doorLatchMechanismsDependence: [String],
  defaultConnectingProfile: String,
  defaultMechanism: String,
  defaultStopper: String,
  X1: Number,
  X2: Number,
  X2_standby: Number,
  X4: Number,
  X5: Number,
  X12H: Number,
  X13W: Number,
  topGap: Number,
  bottomGap: Number,
  hiddingTopSize: Number,
  hiddingBottomSize: Number,
  hiddingSideSize: Number,
  topSealing: Number,
  bottomSealing: Number,
  sideSealing: Number,
  connectingSealing: Number,
  hiddingSize: Number,
  thickness: Number,
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
  exchangedOn: {
    type: Date,
  },
});

const SystemConctants = mongoose.model('SystemConctants', SystemConctantsSchema, 'SystemConctants');

export default SystemConctants;
