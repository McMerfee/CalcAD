import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Heading = ({
  className,
  items,
  onClick,
}) => {
  const headingClassName = clsx('table--heading', className);
  const headingsAtRight = ['sum', 'actions'];

  const headingItems = items
    .map((item, i) => {
      const itemClassName = _.some(headingsAtRight, (h) => h === item.value) ? 'right' : 'left';

      return (
        <th
          key={`heading-${i + 1}`}
          onClick={onClick}
          className="table--heading-item"
          width={`${item.width || 100 / items.length}%`}
        >
          <div className={clsx('table--heading-inner', itemClassName)}>
            {item.label}
          </div>
        </th>
      );
    });

  return (
    <thead className={headingClassName}>
      <tr>{headingItems}</tr>
    </thead>
  );
};

Heading.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({})),
};

Heading.defaultProps = {
  onClick: null,
  className: '',
  items: [],
};

export default Heading;
