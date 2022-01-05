import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import DoorsActions from '../../../redux/actions/doorsAndSections';

const Tabs = ({
  tabs,
  onChange,
  className,
  activeTabIndex,
}) => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const labelKey = i18n.language === 'ru' ? 'labelRu' : 'labelUk';
  const rootClassName = clsx('sticky-menu-tabs', className);

  const {
    main: {
      doorOpeningHeight,
      doorOpeningWidth,
    },
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const handleChange = (e, index) => {
    e.preventDefault();

    if (!(doorOpeningHeight?.value && doorOpeningWidth?.value)) {
      dispatch(DoorsActions.hightlightDoorOpeningInputs(labelKey));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onChange(index);
  };

  return (
    <div className={rootClassName}>
      { tabs.map((tab, index) => {
        const itemClassName = clsx('sticky-menu-tab', activeTabIndex === index && 'active');

        return (
          <a
            href="/"
            key={String(index)}
            className={itemClassName}
            onClick={(e) => handleChange(e, index)}
            disable={tab.isDisabled}
            tabIndex={0}
          >
            {tab.title}
          </a>
        );
      })}
    </div>
  );
};

Tabs.defaultProps = {
  tabs: [],
  className: null,
  activeTabIndex: 0,
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    isDisabled: PropTypes.bool,
  })),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  activeTabIndex: PropTypes.number,
};

export default Tabs;
