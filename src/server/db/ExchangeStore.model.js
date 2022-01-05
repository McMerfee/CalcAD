import mongoose from 'mongoose';

const { Schema } = mongoose;
const modelName = 'ExchangeStore';

const ExchangeStoreSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  name: {
    type: String,
    enum: ['customers', 'orders-statuses', 'system-constants', 'items-list', 'delivery'],
    required: true,
  },
  data: JSON,
  outcome: { type: Object },
  rejectedRecords: {
    IDs: { type: Array },
    count: { type: Number },
  },
  successfulRecords: {
    IDs: { type: Array },
    count: { type: Number },
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

const ExchangeStore = mongoose.model(modelName, ExchangeStoreSchema, 'ExchangeStore');

export default ExchangeStore;
