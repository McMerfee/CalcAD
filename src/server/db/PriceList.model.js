import mongoose from 'mongoose';

const { Schema } = mongoose;

const PriceListSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  articleCode: {
    type: String,
    required: true,
  },
  id1C: {
    type: String,
    required: true,
  },
  itemType: String,
  region: String,
  prices: [{
    packageName: String,
    price: Number,
  }],
  isHidden: {
    type: Boolean,
    default: false,
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

const PriceList = mongoose.model('PriceList', PriceListSchema, 'PriceList');

export default PriceList;
