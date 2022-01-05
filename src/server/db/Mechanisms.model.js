import mongoose from 'mongoose';

const { Schema } = mongoose;

const MechanismSchema = new Schema({
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

const Mechanisms = mongoose.model('Mechanisms', MechanismSchema, 'Mechanisms');

export default Mechanisms;
