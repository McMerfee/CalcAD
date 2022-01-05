import _ from 'lodash';
import logger from './logger';

export default (err, req) => {
  const status = _.get(err, 'status', '');
  const message = _.get(err, 'message', '');
  const method = _.get(req, 'method', '');
  const url = _.get(req, 'url', '');
  const stack = _.get(err, 'stack', '');

  logger.error(`${method} ${url} ${status} - ${message}. \n ${stack}`);
};
