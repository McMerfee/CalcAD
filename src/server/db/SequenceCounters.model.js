import mongoose from 'mongoose';

const { Schema } = mongoose;
const modelName = 'SequenceCounters';

const SequenceCountersSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  nextSequence: {
    type: Number,
    required: true,
  },
});

const SequenceCounters = mongoose.model(modelName, SequenceCountersSchema, 'SequenceCounters');

export default SequenceCounters;
