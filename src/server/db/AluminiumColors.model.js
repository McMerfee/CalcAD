import mongoose from 'mongoose';

import { articleOfColorValidator } from '../helpers/mongooseValidation';

const { Schema } = mongoose;

const AluminiumColorSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  color: {
    type: String,
    required: true,
  },
  articleCode: {
    type: String,
    validate: articleOfColorValidator,
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
  popularity: Number,
  updatedOn: {
    type: Date,
    default: Date.now,
  },
});

const AluminiumColors = mongoose.model('AluminiumColors', AluminiumColorSchema, 'AluminiumColors');

export default AluminiumColors;
