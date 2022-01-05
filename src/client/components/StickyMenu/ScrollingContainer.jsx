import React from 'react';
import PropTypes from 'prop-types';

const ScrollingContainer = ({
  children,
}) => (
  <div className="scrolling-container">
    <div className="scrolling-container--inner">
      {children}
    </div>
  </div>
);

ScrollingContainer.defaultProps = {
  children: null,
};

ScrollingContainer.propTypes = {
  children: PropTypes.node,
};

export default ScrollingContainer;
