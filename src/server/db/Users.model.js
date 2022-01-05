import mongoose from 'mongoose';

import {
  nameValidator,
} from '../helpers/mongooseValidation';

import {
  defaultPackageName,
} from '../helpers/constants';

require('mongoose-long')(mongoose);

const { Types: { Long } } = mongoose;

const { Schema } = mongoose;

const UserSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  email: {
    type: String,
    required: false,
    unique: false,
    set: (v) => v.toLowerCase(),
  },
  password: {
    type: String,
  },
  phone: {
    type: Long,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    validate: nameValidator,
    trim: true,
  },
  lastName: {
    type: String,
    validate: nameValidator,
    trim: true,
  },
  role: {
    type: String,
    trim: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
  lastLoginOn: {
    type: Date,
    default: Date.now,
  },
  passwordToken: {
    type: String,
  },
  passwordExpiresOn: {
    type: Date,
  },
  adminAccessToken: {
    type: String,
  },
  adminAccessTokenExpiresOn: {
    type: Date,
  },
  language: {
    type: String,
    default: 'uk',
  },
  packageName: {
    type: String,
    default: defaultPackageName,
  },
  primaryRegion: {
    type: String,
  },
  delivery: { type: Object },
  regionsList: {
    type: [String],
  },
  id1C: String,
  isPhoneNumberVerified: {
    type: Boolean,
    default: false,
  },
  totpSecret: String,
});

const Users = mongoose.model('Users', UserSchema, 'Users');

export default Users;
