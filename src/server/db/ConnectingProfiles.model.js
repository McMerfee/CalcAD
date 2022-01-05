import mongoose from 'mongoose';

const { Schema } = mongoose;

const ConnectingProfileSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  articleCode: {
    type: String,
    required: true,
  },
  labelRu: {
    type: String,
    required: true,
  },
  labelUk: {
    type: String,
    required: true,
  },
  id1C: {
    type: String,
  },
  image: String,
  popularity: Number,
  updatedOn: {
    type: Date,
    default: Date.now,
  },
});

const ConnectingProfiles = mongoose.model('ConnectingProfiles', ConnectingProfileSchema, 'ConnectingProfiles');

export default ConnectingProfiles;
