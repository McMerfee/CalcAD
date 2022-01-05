import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Notification = ({
  appearance,
  children,
  className,
}) => {
  const notificationClassName = clsx(
    'notification',
    appearance === 'error' && 'error',
    appearance === 'success' && 'success',
    appearance === 'warning' && 'warning',
    appearance === 'info' && 'info',
    className,
  );
  const notificationRef = React.createRef();

  return (
    <div
      className={notificationClassName}
      ref={notificationRef}
    >
      {children}
    </div>
  );
};

Notification.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.node,
    PropTypes.object,
  ]).isRequired,
  appearance: PropTypes.oneOf([
    'success',
    'error',
    'warning',
    'info',
  ]),
  className: PropTypes.string,
};

Notification.defaultProps = {
  appearance: 'info',
  className: null,
};

export default Notification;
