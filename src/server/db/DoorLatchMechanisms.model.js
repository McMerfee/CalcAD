import mongoose from 'mongoose';

const { Schema } = mongoose;

const doorLatchMechanismSchema = new Schema({
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
  updatedOn: {
    type: Date,
    default: Date.now,
  },
});

const DoorLatchMechanisms = mongoose.model('DoorLatchMechanisms', doorLatchMechanismSchema, 'DoorLatchMechanisms');

export default DoorLatchMechanisms;
