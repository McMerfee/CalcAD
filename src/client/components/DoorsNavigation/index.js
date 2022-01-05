import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import DoorsActions from '../../redux/actions/doorsAndSections';

const DoorsNavigation = ({ tabs }) => {
  const dispatch = useDispatch();
  const { i18n, t } = useTranslation();
  const labelKey = i18n.language === 'ru' ? 'labelRu' : 'labelUk';

  const {
    doors,
    main: {
      doorOpeningHeight,
      doorOpeningWidth,
    },
    activeDoor = 0,
    activeSection = 0,
  } = useSelector(({ doorsAndSections }) => doorsAndSections);
  const { isOpenFillingModal } = useSelector(({ fillingMaterials }) => fillingMaterials);

  const handleTabChange = (e, index) => {
    e.preventDefault();
    if (isOpenFillingModal) return;

    if (!(doorOpeningHeight?.value && doorOpeningWidth?.value)) {
      dispatch(DoorsActions.hightlightDoorOpeningInputs(labelKey));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    dispatch(DoorsActions.setActiveDoor(index));
    dispatch(DoorsActions.setActiveSection(0));
  };

  const handleSectionChange = (e, doorIndex, sectionIndex) => {
    e.preventDefault();
    if (isOpenFillingModal) return;

    dispatch(DoorsActions.setActiveDoor(doorIndex));
    dispatch(DoorsActions.setActiveSection(sectionIndex));
  };

  const renderSectionsNav = (sections, doorIndex) => {
    if (!sections?.length || !doorIndex) return null;

    const sectionsLabels = sections.map((section, i) => ({
      title: t('fillingMaterialsModal.section-n', { doorNumber: doorIndex, sectionNumber: i + 1 }),
    }));

    const nav = sectionsLabels.map((section, sectionIndex) => {
      const sectionClassName = clsx('sticky-menu-tab-section',
        activeDoor === doorIndex && activeSection === sectionIndex + 1 && 'active');

      return (
        <a
          href="/"
          key={String(sectionIndex)}
          className={sectionClassName}
          onClick={(e) => handleSectionChange(e, doorIndex, sectionIndex + 1)}
          tabIndex={0}
        >
          {section.title}
        </a>
      );
    });

    return nav;
  };

  return (
    <div className="doors-navigation">
      <div className="doors-navigation--inner">
        { tabs.map((tab, index) => {
          const doorClassName = clsx('sticky-menu-tab', activeDoor === index && 'active');
          const dividerClassName = clsx('doors-navigation--divider', activeDoor === index && 'active');
          const door = doors.length ? doors[index - 1] : {};
          const sections = door?.sections || [];

          return (
            <span key={`door-nav-${index + 1}`} className="sticky-menu-tab-wrapper">
              <a
                href="/"
                key={`door-${index + 1}`}
                className={doorClassName}
                onClick={(e) => handleTabChange(e, index)}
                disable={tab.isDisabled}
                tabIndex={0}
              >
                {tab.title}
              </a>
              {renderSectionsNav(sections, index)}
              <div className={dividerClassName} key={`divider-${index + 1}`} />
            </span>
          );
        })}
      </div>
    </div>
  );
};

DoorsNavigation.defaultProps = {
  tabs: null,
};

DoorsNavigation.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
  })),
};

export default DoorsNavigation;
