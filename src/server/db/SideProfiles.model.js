import mongoose from 'mongoose';

const { Schema } = mongoose;

const SideProfileSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  articleCode: {
    type: String,
    required: true,
  },
  labelRu: String,
  labelUk: String,
  image: String,
  popularity: Number,
  colorsDependence: [String],
  updatedOn: {
    type: Date,
    default: Date.now,
  },
});

const SideProfiles = mongoose.model('SideProfiles', SideProfileSchema, 'SideProfiles');

export default SideProfiles;
