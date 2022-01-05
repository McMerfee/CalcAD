import mongoose from 'mongoose';

const { Schema } = mongoose;

const FillingSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  articleCode: {
    type: String,
    required: true,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  fillingType: {
    type: String,
    required: true,
  },
  glassType: String,
  mirrorType: String,
  manufacturer: String,
  color: String,
  image: String,
  size: String,
  chipboardThickness: String,
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

const Filling = mongoose.model('Filling', FillingSchema, 'Filling');

export default Filling;
