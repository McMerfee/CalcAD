// TODO: Move some parts from helpers/priceHelper to this service

import _ from 'lodash';

const generateIDForExchange = (isEmpty) => {
  let id = '';
  const symbols = isEmpty ? '0' : '0123456789abcdef0123456789'; // Only HEX-symbols

  for (let i = 0; i < 36; i += 1) {
    id += _.some([8, 13, 18, 23], (x) => x === i) ? '-' : symbols.charAt(Math.floor(Math.random() * symbols.length));
  }
  return id;
};

export default {
  generateIDForExchange,
};
