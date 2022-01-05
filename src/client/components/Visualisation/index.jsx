import _ from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  Stage,
  Layer,
  Group,
  Text,
} from 'react-konva';

import DoorsActions from '../../redux/actions/doorsAndSections';
import { FRAME_PROFILES_SIZE } from '../../helpers/visualisationHelper';

import DoorFrame from './DoorFrame';
import Spliter from './Spliter';
import Section from './Section';
import Dimensions from './Dimensions';

const MAX_RENDER_HEIGHT = 300; // Maximum canvas height
const START_OFFSET = 0;
const LEFT_OFFSET = 120;
const STAGE_OFFSET_X = 30; // canvas padding from left
const STAGE_OFFSET_Y = 50; // canvas padding canvas from top
const PADDING = 100; // canvas padding for left and right
const INDENTS = 20;
const MAIN_SIDE_ARROW = 15; // side dash of dimension
const DIMENSION_OFFSET = 5;
const SECTION_FONT_SIZE = 10;
const MAIN_FONT_SIZE = 12.5;

const Visualisation = ({ isZoomedIn }) => {
  const dispatch = useDispatch();
  const layerRef = useRef(null);

  const {
    isOpenZoomModal,
    activeDoor = 0,
    activeSection = 0,
    main: {
      doorOpeningHeight: { value: openingHeight } = {},
      doorOpeningWidth: { value: openingWidth } = {},
      monorailSingleDoorWidth: { value: monorailDoorW } = {},
      doorsAmount: { value: doorsAmount } = {},
      sideProfile: { value: sideProfile } = {},
      doorPositioning: { value: doorPosition },
      aluminiumColor: { value: color },
      texture: { value: mainTexture },
      filling: mainFilling,
    } = {},
    doors,
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const {
    aluminiumColors,
    filling: fillingMaterials,
    systemConctants,
  } = useSelector(({ config }) => config);

  const { currentSystem } = useSelector(({ systems }) => systems);
  const isMonorail = currentSystem === 'monorail';
  const isOpening = currentSystem === 'opening';
  const isAssembling = currentSystem === 'assembling';

  const frameColor = color && aluminiumColors.find((c) => c.articleCode === color)?.color;

  const [scale, setScale] = useState(1);
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [stageHeight, setStageHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth, innerHeight } = window || {};
      const container = document.querySelector('.modal-inner-children') || {};
      const { offsetWidth } = container;

      const scaleToFitFullWidth = (offsetWidth - PADDING - STAGE_OFFSET_X) / openingWidth;
      const scaleX = isZoomedIn
        ? scaleToFitFullWidth / 1.5
        : (innerWidth - PADDING) / openingWidth;
      const scaleY = isZoomedIn
        ? innerHeight / (openingHeight * scale * 1.5)
        : MAX_RENDER_HEIGHT / openingHeight;
      const ratio = Math.min(scaleX, scaleY);

      setScale(ratio);
      setStageWidth(offsetWidth || innerWidth);
      setStageHeight(innerHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [openingHeight, openingWidth, monorailDoorW]);

  const doorsHeight = doors[0]?.main?.doorHeight;

  const renderDoorsAndSections = () => {
    const renderSections = [];
    const renderSpliters = [];
    const renderDimensions = [];
    const symmetricalFrontDoorsFor4 = [1, 2];
    const symmetricalFrontDoorsFor6 = [0, 2, 3, 5];
    const symmetricalFrontDoorsFor8 = [1, 3, 4, 6];

    const renderSectionsNumbers = () => doors.map((door, i) => {
      const {
        sections = [],
        main: {
          doorHeight,
          connectingProfile: { value: connectingProfile } = {},
          directionOfSections: {
            value: sectionsDirection,
          } = {},
        } = {},
      } = door;
      const sideProfileWidth = systemConctants.find((c) => c.sideProfile === sideProfile)?.X5;
      const cpConstants = systemConctants?.filter((c) => c.connectingProfile === connectingProfile)[0] || {};
      const { thickness: cpThickness = 1.5 } = cpConstants;

      let sectionOffsetX = START_OFFSET + (i * openingWidth) / doorsAmount;
      let sectionOffsetY = START_OFFSET;
      let spliterH = 0;

      return sections.map((section, j) => {
        const {
          visibleHeight: { value: sHeight = 0 },
          visibleWidth: { value: sWidth = 0 },
        } = section;

        const sectionH = sectionsDirection === 'vertical'
          ? doorHeight
          : sHeight + cpThickness + spliterH / 2;

        const textX = LEFT_OFFSET + sectionOffsetX + sWidth / 2 - DIMENSION_OFFSET / scale;
        const textY = sectionOffsetY + (sectionH / 2);
        const additionalText = sectionsDirection === 'vertical' ? sWidth : sHeight;

        const textEl = (
          <>
            <Text
              key={`text-${i + 1}-${j + 1}`}
              x={textX}
              y={textY}
              text={`${i + 1}.${j + 1}\n(${additionalText})`}
              align="center"
              verticalAlign="middle"
              strokeWidth={2 / scale}
              scale={scale}
              fontSize={SECTION_FONT_SIZE / scale}
              onClick={() => {
                if (isOpenZoomModal) return;
                dispatch(DoorsActions.setActiveDoor(i + 1));
                dispatch(DoorsActions.setActiveSection(j + 1));
              }}
            />
          </>
        );

        if (sectionsDirection === 'vertical') {
          sectionOffsetX += sWidth - sideProfileWidth / 2;
          spliterH = doorHeight;
          return textEl;
        }
        sectionOffsetY += sHeight + cpThickness;
        spliterH = cpThickness;
        return textEl;
      });
    });

    const renderDoors = doors.map((door, i) => {
      const {
        sections = [],
        main: {
          doorWidth,
          doorHeight,
          connectingProfile: { value: connectingProfile } = {},
          directionOfSections: {
            value: sectionsDirection,
          } = {},
          filling: doorFilling,
          texture: { value: doorTexture },
          openingSide,
        } = {},
      } = door;

      let sectionOffsetX = START_OFFSET + (i * openingWidth) / doorsAmount;
      let sectionOffsetY = START_OFFSET;
      let spliterOffsetX = START_OFFSET + (i * openingWidth) / doorsAmount;
      let spliterOffsetY = START_OFFSET;
      let spliterH = 0;
      let spliterW = 0;

      const isFirstDoor = i === 0;
      const isLastDoor = i + 1 === doorsAmount;
      const isOneOfBorderVisible = currentSystem === 'extendable' || currentSystem === 'hinged';
      const isFrontDoor = doorPosition === 'chessboard' || doorPosition === 'left-front'
        ? (i + 1) % 2 === 0
        : doorsAmount === 8
          ? symmetricalFrontDoorsFor8.indexOf(i) !== -1
          : doorsAmount === 6
            ? symmetricalFrontDoorsFor6.indexOf(i) !== -1
            : symmetricalFrontDoorsFor4.indexOf(i) !== -1;

      const sideProfileWidth = systemConctants.find((c) => c.sideProfile === sideProfile)?.X5 || 0;
      const cpConstants = systemConctants?.filter((c) => c.connectingProfile === connectingProfile)[0] || {};
      const { thickness: cpThickness = 1.5 } = cpConstants;

      // Door width dimension
      renderDimensions.push(<Dimensions
        key={`dimension-width-${i + 1}`}
        direction="horizontal"
        scale={scale}
        label={doorWidth ? (doorWidth * 1).toFixed(0) : ''}
        width={isMonorail ? monorailDoorW : openingWidth / doorsAmount}
        x={sectionOffsetX + LEFT_OFFSET}
        sizeBackground="#E5E5E5"
        textOffset={STAGE_OFFSET_X - 1}
        sideArrowSise={MAIN_SIDE_ARROW / scale}
        sideArrowStartCord={(-STAGE_OFFSET_X + DIMENSION_OFFSET) / scale}
        isLastSection={isLastDoor}
        fontSize={MAIN_FONT_SIZE}
      />);

      // SECTIONS
      sections.forEach((section, j) => {
        const {
          visibleHeight: { value: sHeight = 0 },
          visibleWidth: { value: sWidth = 0 },
        } = section;

        const sectionX = sectionsDirection === 'vertical'
          ? (sectionOffsetX + LEFT_OFFSET + sideProfileWidth / 2) + spliterW / 2
          : sectionOffsetX + LEFT_OFFSET + spliterH / 2;

        const sectionH = sectionsDirection === 'vertical'
          ? doorHeight
          : sHeight + cpThickness + spliterH / 2;

        const sectionW = sectionsDirection === 'vertical'
          ? sWidth + cpThickness
          : isMonorail
            ? (monorailDoorW - sideProfileWidth / 2)
            : (openingWidth - sideProfileWidth) / doorsAmount;

        renderSections.push(<Section
          key={`section-${i + 1}-${j + 1}`}
          x={sectionX + sideProfileWidth / 2}
          y={sectionOffsetY + FRAME_PROFILES_SIZE.up}
          width={sectionW || 0}
          height={sectionH || 0}
          isActive={(i + 1 === activeDoor && j + 1 === activeSection)
            || (i + 1 === activeDoor && activeSection === 0)}
          texture={section?.texture?.value}
          fillingMaterials={fillingMaterials}
          filling={!_.isEmpty(section?.filling)
            ? section?.filling
            : !_.isEmpty(doorFilling)
              ? doorFilling
              : mainFilling}
          onClick={() => {
            if (isOpenZoomModal) return;
            dispatch(DoorsActions.setActiveDoor(i + 1));
            dispatch(DoorsActions.setActiveSection(j + 1));
          }}
        />);

        // SPLITERS
        if (sectionsDirection === 'vertical') {
          sectionOffsetX += sWidth - sideProfileWidth / 2;
          spliterW = cpThickness;
          spliterOffsetX = (sectionOffsetX + sideProfileWidth) - spliterW / 2;
          spliterH = doorHeight;
        } else {
          sectionOffsetY += sHeight + cpThickness;
          spliterH = cpThickness;
          spliterOffsetY = (sectionOffsetY - cpThickness) - spliterH / 2;
          spliterW = doorWidth - cpThickness - 2 - sideProfileWidth / 2;
        }

        if (j + 1 < sections.length) {
          renderSpliters.push(<Spliter
            key={`spliter-${i + 1}-${j + 1}`}
            x={spliterOffsetX + LEFT_OFFSET + 1 + sideProfileWidth / 2}
            y={spliterOffsetY + FRAME_PROFILES_SIZE.up}
            width={spliterW}
            height={spliterH}
            fill={frameColor}
          />);
        }
      });

      return (
        <DoorFrame
          key={`doorframe-${i + 1}`}
          y={START_OFFSET}
          x={START_OFFSET + LEFT_OFFSET}
          sideProfileOffset={isMonorail
            ? START_OFFSET + (i * monorailDoorW) + LEFT_OFFSET
            : START_OFFSET + (i * openingWidth) / doorsAmount + LEFT_OFFSET}
          doorWidth={isMonorail ? monorailDoorW : openingWidth / doorsAmount}
          fullWidth={isMonorail && doorsAmount === 1 ? monorailDoorW : openingWidth}
          sideProfileWidth={sideProfileWidth}
          height={openingHeight}
          scale={scale}
          frameColor={frameColor}
          isFrontDoor={isMonorail || isFrontDoor}
          isLeftBorderVisible={isOneOfBorderVisible ? (isFrontDoor || isFirstDoor) : true}
          isRightBorderVisible={isOneOfBorderVisible ? (isFrontDoor || isLastDoor) : true}
          isActive={i + 1 === activeDoor && activeSection === 0}
          texture={doorTexture || mainTexture}
          fillingMaterials={fillingMaterials}
          filling={door?.sections?.length
            ? null
            : !_.isEmpty(doorFilling)
              ? doorFilling
              : mainFilling}
          onClick={() => {
            if (door?.sections?.length || isOpenZoomModal) return;
            dispatch(DoorsActions.setActiveDoor(i + 1));
            dispatch(DoorsActions.setActiveSection(0));
          }}
          hasSections={!!door?.sections?.length}
          isLeft={(isOpening || isAssembling) && openingSide?.value === 'left'}
          isRight={(isOpening || isAssembling) && openingSide?.value === 'right'}
        />
      );
    });

    return (
      <Group>
        <Group>
          {renderSections}
        </Group>
        <Group zIndex={1}>
          {renderSpliters}
        </Group>
        <Group zIndex={2}>
          {renderDoors}
        </Group>
        {renderDimensions}
        {renderSectionsNumbers()}

        {/* Door opening height dimensions on left */}
        <Dimensions
          x={START_OFFSET}
          y={START_OFFSET}
          height={openingHeight}
          label={openingHeight}
          scale={scale}
          sizeBackground="#E5E5E5"
          sideArrowSise={MAIN_SIDE_ARROW / scale}
          sideArrowStartCord={(-STAGE_OFFSET_X + DIMENSION_OFFSET) / scale}
          isLastSection
          textOffset={STAGE_OFFSET_X - 1}
          direction="vertical"
          fontSize={MAIN_FONT_SIZE}
        />

        {/* Door opening width dimensions on top */}
        <Dimensions
          x={START_OFFSET + LEFT_OFFSET}
          y={START_OFFSET + LEFT_OFFSET}
          width={openingWidth}
          scale={scale}
          sizeBackground="#E5E5E5"
          sideArrowSise={MAIN_SIDE_ARROW / scale}
          sideArrowStartCord={(-STAGE_OFFSET_Y + DIMENSION_OFFSET) / scale}
          isLastSection
          textOffset={STAGE_OFFSET_Y - 1}
          direction="horizontal"
          fontSize={MAIN_FONT_SIZE}
        />
      </Group>
    );
  };

  const renderDoorHeightDimention = () => (
    <Group x={LEFT_OFFSET + 10}>
      {/* Door visible height dimensions on left */}
      <Dimensions
        direction="vertical"
        y={(openingHeight - doorsHeight) / 2}
        height={doorsHeight}
        label={doorsHeight}
        scale={scale}
        sizeBackground="#E5E5E5"
        sideArrowSise={MAIN_SIDE_ARROW / scale}
        sideArrowStartCord={(-STAGE_OFFSET_X + DIMENSION_OFFSET) / scale}
        isLastSection
        textOffset={STAGE_OFFSET_X - 1}
        fontSize={MAIN_FONT_SIZE}
      />
    </Group>
  );

  if (!(openingHeight && openingWidth)) return null;

  const container = document.querySelector('.modal-inner-children') || {};
  const { offsetWidth } = container;

  return (
    <div className="konva-visualisation">
      <div className="konva-visualisation--inner">
        <Stage
          listening
          className="konva-visualisation--stage"
          x={isZoomedIn && offsetWidth
            ? offsetWidth / 4
            : START_OFFSET}
          y={isZoomedIn
            ? START_OFFSET
            : STAGE_OFFSET_Y + INDENTS}
          width={isZoomedIn
            ? stageWidth + INDENTS + DIMENSION_OFFSET
            : openingWidth * scale + INDENTS + STAGE_OFFSET_X + DIMENSION_OFFSET}
          height={isZoomedIn
            ? stageHeight + PADDING
            : MAX_RENDER_HEIGHT + INDENTS + STAGE_OFFSET_Y}
        >
          <Layer
            scaleX={scale}
            scaleY={scale}
            x={STAGE_OFFSET_X}
            y={isZoomedIn ? INDENTS + STAGE_OFFSET_Y : START_OFFSET}
            ref={layerRef}
          >
            {renderDoorsAndSections()}
            {renderDoorHeightDimention()}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

Visualisation.defaultProps = {
  isZoomedIn: false,
};

Visualisation.propTypes = {
  isZoomedIn: PropTypes.bool,
};

export default Visualisation;
