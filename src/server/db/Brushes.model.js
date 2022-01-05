import mongoose from 'mongoose';

const { Schema } = mongoose;

const BrushSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  aluminiumColor: {
    type: String,
    required: true,
  },
  sideProfile: {
    type: String,
    required: true,
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
  updatedOn: {
    type: Date,
    default: Date.now,
  },
});

const Brushes = mongoose.model('Brushes', BrushSchema, 'Brushes');

export default Brushes;
