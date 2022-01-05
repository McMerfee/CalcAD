import validate from 'mongoose-validator';

export const emailValidator = [
  validate({
    validator: 'isEmail',
    message: (props) => `${props.value} is not a valid email address!`,
  }),
];

export const phoneNumberValidator = [
  validate({
    validator: (phone) => /^380(\d{9})$/.test(phone.toString()),
    message: (props) => `${props.value} is not a valid phone number!`,
  }),
];

export const integerValidator = [
  validate({
    validator: Number.isInteger,
    message: (props) => `${props.value} is not an integer value!`,
  }),
];

export const nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 30],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters',
  }),
];

export const articleOfColorValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 3],
    message: 'articleCode should be between {ARGS[0]} and {ARGS[1]} characters',
  }),
];
