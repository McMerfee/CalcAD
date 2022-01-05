import mongoose from 'mongoose';

const { Schema } = mongoose;

const FillingFeatureSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  articleCode: {
    type: String,
    required: true,
  },
  image: String,
  stockKeepingUnit: String,
  labelRu: {
    type: String,
    required: true,
  },
  labelUk: {
    type: String,
    required: true,
  },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
});

const FillingFeatures = mongoose.model('FillingFeatures', FillingFeatureSchema, 'FillingFeatures');

export default FillingFeatures;
