import mongoose from 'mongoose';

// import { ordersStatuses } from '../helpers/constants';

const { Schema } = mongoose;
const modelName = 'OrdersDraft';
// const statusesEnum = ordersStatuses.map((x) => x.value);

const OrderDraftSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  systemType: {
    type: String,
    required: true,
  },
  user: {
    userId: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    region: { type: String },
  },
  description: {
    doorOpeningHeight: { type: Number },
    doorOpeningWidth: { type: Number },
    doorsAmount: { type: Number },
    doorsHeight: { type: Number },
    doorsWidth: { type: Number },
    doorPositioning: { type: String },
    aluminiumColor: { type: String },
  },
  items: [{
    item: { type: String },
    amount: { type: Number },
    size: { type: Number },
    height: { type: Number },
    width: { type: Number },
    unitPrice: { type: Number },
    itemTotalPrice: { type: Number },
    labelRu: { type: String },
    labelUk: { type: String },
    articleCode: { type: String },
    position: {
      doorIndex: { type: Number },
      sectionIndex: { type: Number },
    },
    exchange1C: {
      ID: { type: String },
      FID: { type: String },
    },
  }],
  totalPrice: { type: Number },
  retailTotalPrice: { type: Number },
  doorsSnippet: { type: Object },
  packageName: String,
  status: {
    type: String,
    // enum: statusesEnum,
    default: 'new',
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
});

const OrdersDraft = mongoose.model(modelName, OrderDraftSchema, 'OrdersDraft');

export default OrdersDraft;
