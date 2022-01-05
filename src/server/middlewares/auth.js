import _ from 'lodash';

import { verifyToken } from '../helpers/jwt';

const authMiddleware = (req, res, next) => {
  if ([
    '/users/signin-admin',
    '/users/signin',
    '/users/signup-by/.*',
    '/users/set-password',
    '/users/profile/password/reset',
    '/tfa',
    '/orders/.*/pdf',
    '/orders-draft/.*/pdf',
    '/json/customers',
    '/json/items-list',
    '/json/zipped-items-list',
    '/json/delivery',
    '/json/get-comparing-users-info',
    '/orders/1c/.*',
    '/system-constants/1c',
  ].find((x) => (new RegExp(x, 'i')).test(req.path))) return next();

  if (req.path.includes('/config')
    || req.path.includes('/tfa')
    || req.path.includes('/price-list')) return next();

  const authorizationHeader = _.get(req.headers, 'authorization', '');

  if (!/^Bearer/.test(authorizationHeader)) {
    return res
      .status(401)
      .send({ message: 'Unauthorized' });
  }

  try {
    req.user = verifyToken(authorizationHeader.split(' ')[1]);
  } catch (err) {
    return res.send(err);
  }
  return next();
};

export default authMiddleware;
