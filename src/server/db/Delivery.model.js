import mongoose from 'mongoose';

const { Schema } = mongoose;

const DeliverySchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  region: { type: String },
  type: { type: String },
  city1C: {
    uk: { type: String },
    ru: { type: String },
  },
  addressLine1C: {
    uk: { type: String },
    ru: { type: String },
  },
  addressLineCustomer: { type: String },
  // isOffice requirement:
  // якщо true, то по факту для АДС це тип доставки "Транспорт ADS",
  // але для клієнта показувати що це відноситься до типу доставки "Самовивіз"
  isOffice: { type: Boolean },
  code1C: { type: String },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
});

const Delivery = mongoose.model('Delivery', DeliverySchema, 'Delivery');

export default Delivery;
