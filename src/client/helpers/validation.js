import _ from 'lodash';

import { manufacturersList } from './constants';

export const isValidTextField = (value, minLength, maxLength) => !_.isEmpty(value)
 && value.length >= minLength
 && value.length <= maxLength;

export const isValidNumberField = (value, minLength, maxLength) => _.inRange(value, minLength, maxLength);

export const isOnlyLetters = (value) => /^[a-zA-Z]+$/.test(value);

export const isOnlyNumbers = (value) => /^[1-9]\d*$/.test(value);

export const isManufacturerValid = (manufacturer) => manufacturersList.indexOf(manufacturer) !== -1;

export const canUseAtLeast1DoorLatchMechanism = (doorWidth) => +doorWidth >= 460;

export const canUse2DoorLatchMechanisms = (doorWidth) => +doorWidth >= 780;

export const canUseHorizontalTexture = (fillingHeight) => fillingHeight <= 1700;

export const isValidPassword = (password) => /^[а-яА-ЯёЁїЇіІa-zA-Z0-9!@#$%^&*]{6,30}$/.test(password);

export const isValidEmail = (email) => {
  if (_.isEmpty(email)) return false;

  // eslint-disable-next-line
  const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return pattern.test(String(email).toLowerCase());
};

export const isValidFirstOrLastName = (name) => !_.isEmpty(name)
 && /^[а-яА-ЯЄєёЁїЇіІa-zA-Z]{2,30}$/.test(name);

export const isValidMobilePhone = (phone) => {
  if (_.isEmpty(phone)) return false;

  return /^0(\d{9})$/.test(phone);
};
