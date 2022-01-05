import mongoose from 'mongoose';

// import { ordersStatuses } from '../helpers/constants';

const { Schema } = mongoose;
const modelName = 'Orders';
// const statusesEnum = ordersStatuses.map((x) => x.value);

const OrderSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  number1C: { type: String },
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
    texture: { type: String },
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
  orderNumber: { type: Number }, // TODO: remove once removed from UI
  title: { type: String },
  status: {
    type: String,
    // enum: statusesEnum,
    default: 'new',
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  isExchangedWith1C: {
    type: Boolean,
    default: false,
  },
  isChangedIn1C: {
    type: Boolean,
    default: false,
  },
  doorsSnippet: { type: Object },
  packageName: String,
  comments: {
    customer: String,
    manager: String,
  },
  delivery: { type: Object },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
  exchangedOn: {
    type: Date,
  },
});

const Orders = mongoose.model(modelName, OrderSchema, 'Orders');

export default Orders;
