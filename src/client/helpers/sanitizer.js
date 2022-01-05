import _ from 'lodash';

export const sanitizeValueToNumber = (value) => Number(value.replace(/\D/g, ''));

export const sanitizeValueToNumberStringLike = (value) => value.replace(/\D/g, '');

export const capitalizeFirstLetter = (word) => {
  if (_.isEmpty(word)) return '';

  return word.charAt(0).toUpperCase() + word.slice(1);
};
