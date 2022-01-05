import PropTypes from 'prop-types';

const notificationPropTypes = {
  add: PropTypes.func,
  remove: PropTypes.func,
  removeAll: PropTypes.func,
  update: PropTypes.func,
  toasts: PropTypes.array,
};

export default notificationPropTypes;
