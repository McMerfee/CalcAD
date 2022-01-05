import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Loader = ({ className }) => {
  const loaderClassName = clsx('loader', className);

  return (
    <div className={loaderClassName}>
      <div className="loader--inner">
        <div className="loader--spinner">
          <div className="loader--spinner__box" />
          <div className="loader--spinner__box" />
          <div className="loader--spinner__box" />
          <div className="loader--spinner__box" />
          <div className="loader--spinner__box" />
          <div className="loader--spinner__box" />
          <div className="loader--spinner__box" />
          <div className="loader--spinner__box" />
          <div className="loader--spinner__box" />
        </div>
      </div>
    </div>
  );
};

Loader.propTypes = {
  className: PropTypes.string,
};

Loader.defaultProps = {
  className: null,
};

export default Loader;
