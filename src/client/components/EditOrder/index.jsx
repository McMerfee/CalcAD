import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { navigate } from 'hookrouter';
import Collapsible from 'react-collapsible';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ReactSVG } from 'react-svg';

import MyAcceptedOrdersActions from '../../redux/actions/myAcceptedOrders';
import DoorsActions from '../../redux/actions/doorsAndSections';
import { isChipboard } from '../../helpers/priceHelper';

import Label from '../Label';


const EditOrder = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation(['components']);
  const labelKey = i18n.language === 'ru' ? 'labelRu' : 'labelUk';

  const [activeTrigger, setActiveTrigger] = useState(null);
  const [isMainParamsOpen, setIsMainParamsOpen] = useState(true);

  const {
    aluminiumColors,
    doorLatchMechanisms,
    mechanisms,
  } = useSelector(({ config }) => config);

  const { orders } = useSelector(({ myAcceptedOrders }) => myAcceptedOrders);

  const {
    main: {
      mechanism,
      sideProfile,
      doorOpeningHeight,
      doorOpeningWidth,
      doorsAmount,
      doorPositioning,
      aluminiumColor,
      stopper,
      sidewallThickness,
    },
    activeDoor = 0,
    doors,
  } = useSelector(({ doorsAndSections }) => doorsAndSections);

  const {
    currentOrderId,
    isOrderAccepted,
  } = useSelector(({ order }) => order);

  useEffect(() => {
    dispatch(MyAcceptedOrdersActions.getMyAcceptedOrdersRequest());
  }, []);

  const { currentSystem } = useSelector(({ systems }) => systems);
  const { systemConctants } = useSelector(({ config }) => config);

  const mechanismLabel = mechanism?.value && mechanisms
    ? mechanisms[mechanisms?.findIndex((m) => m.articleCode === mechanism.value)]?.[labelKey]
    : '';

  const aluminiumColorLabel = aluminiumColor?.value && aluminiumColors
    ? `${aluminiumColor?.value} ${aluminiumColors[aluminiumColors
        ?.findIndex((c) => c.articleCode === aluminiumColor.value)]?.[labelKey]}`
    : '';

  const doorPositioningLabel = doorPositioning?.value && currentSystem === 'hinged'
    ? t(`options:hingedDoorPositioningOptions.${doorPositioning.value}`)
    : doorPositioning?.value
      ? t(`options:doorPositioningOptions.${doorPositioning.value}`)
      : '';

  const stopperLabel = stopper?.value ? t(`options:stoppers.${stopper.value}`) : '';
  const doorWidth = doors[0]?.main?.doorWidth && Number.isInteger(doors[0].main.doorWidth)
    ? doors[0].main.doorWidth
    : doors[0]?.main?.doorWidth ? doors[0].main.doorWidth.toFixed(1) : '';
  const doorHeight = doors[0]?.main?.doorHeight && Number.isInteger(doors[0].main.doorHeight)
    ? doors[0].main.doorHeight
    : doors[0]?.main?.doorHeight ? doors[0].main.doorHeight.toFixed(1) : '';

  useEffect(() => { if (activeDoor) setActiveTrigger(activeDoor - 1); }, [activeDoor]);

  const onEditDoorClick = (doorIndex) => {
    if (currentOrderId) {
      navigate(`/${currentSystem}/${currentOrderId}/edit`);
      dispatch(DoorsActions.setActiveDoor(doorIndex));
      return;
    }
    navigate(`/${currentSystem}/edit`);
    dispatch(DoorsActions.setActiveDoor(doorIndex));
  };

  const triggers = [];

  const statusName = orders.find(({ _id }) => _id === currentOrderId)?.status;

  useEffect(() => {
    if (statusName !== 'new' && typeof statusName !== 'undefined') navigate(`/order/${currentOrderId}/view`);
  });

  const mainParamsTrigger = () => (
    <div className={clsx('edit-order--trigger-wrapper', isMainParamsOpen && 'open')}>
      <p className="trigger-text">
        <span>{t('editOrder.basic')}</span>
        { !isOrderAccepted
          ? (
            <button
              type="button"
              className={window.location.href.endsWith('/view') ? 'disabled' : 'rectangle '}
              onClick={() => onEditDoorClick(0)}
            >
              <ReactSVG
                wrapper="span"
                src="/src/client/assets/icons/edit-pencil.svg"
              />
              <span className="button-label">
                &nbsp;
                {t('fillingMaterialsControl.change')}
              </span>
            </button>
          )
          : null }
      </p>

      <img
        className="trigger-image"
        src={isMainParamsOpen
          ? '/src/client/assets/icons/orderPage/white-arrow-down.svg'
          : '/src/client/assets/icons/orderPage/white-arrow-up.svg'}
        alt="arrow"
      />
    </div>
  );

  doors.map((door, doorIndex) => {
    const isOpen = activeTrigger === doorIndex;
    const triggerClassName = clsx(
      'edit-order--trigger-wrapper',
      isOpen && 'open',
    );

    triggers[doorIndex] = (
      <div
        className={triggerClassName}
        key={`trigger-${doorIndex + 1}`}
      >
        <p className="trigger-text">
          <span>{t('editOrder.door-n', { number: doorIndex + 1 })}</span>
          { !isOrderAccepted
            ? (
              <span>
                <button
                  type="button"
                  className={window.location.href.endsWith('/view') ? 'disabled' : 'rectangle '}
                  onClick={() => onEditDoorClick(doorIndex + 1)}
                >
                  <ReactSVG
                    wrapper="span"
                    src="/src/client/assets/icons/edit-pencil.svg"
                  />
                  <span className="button-label">
                    &nbsp;
                    {t('fillingMaterialsControl.change')}
                  </span>
                </button>
              </span>
            )
            : null }
        </p>

        <img
          className="trigger-image"
          src={isOpen
            ? '/src/client/assets/icons/orderPage/white-arrow-down.svg'
            : '/src/client/assets/icons/orderPage/white-arrow-up.svg'}
          alt="arrow"
        />
      </div>
    );
    return door;
  });

  const getFilling = (filling = {}) => {
    if (_.isEmpty(filling) || !filling?.material) return <span>-</span>;

    const title = t(`fillingMaterialsModal.${filling?.material}`);

    let customFilling = '';
    let glassColors = '';

    if (filling?.material === 'customers') {
      customFilling = filling?.customersOption === 'glass'
        ? t('fillingMaterialsModal.glass')
        : `${t('fillingMaterialsModal.dsp')} ${filling?.customersOption === 'dsp-small' ? '10mm' : '10+mm'}`;
    }

    if (filling?.glassColors?.length) {
      filling.glassColors.forEach((item, j) => {
        const color = item;
        glassColors += `${color}${filling.glassColors.length > 1 && !j ? ', ' : ''}`;
      });
    }

    return `${title},
    ${customFilling || ''}
    ${filling?.manufacturer || ''}
    ${filling?.mirrorType ? t(`options:mirrorTypes.${filling.mirrorType}`) : ''}
    ${filling?.lacobelType ? t(`options:lacobelTypes.${filling.lacobelType}`) : ''}
    ${filling?.glassType ? t(`options:glassTypes.${filling.glassType}`) : ''}
    ${filling?.glassColors?.length ? glassColors : ''}

    ${filling?.isDspUVPrinting || filling?.isGlassUVPrinting
      || filling?.isMirrorUVPrinting || filling?.isLacobelUVPrinting
  ? t('fillingMaterialsModal.uv-print')
  : ''}

    ${filling?.isDspUVPrinting && filling?.dspUvPrintType
  ? t(`options:chipboardUVPrintingTypes.${filling.dspUvPrintType}`).toLowerCase()
  : ''}

    ${filling?.isMirrorUVPrinting && filling?.mirrorUvPrintType
  ? t(`options:mirrorUVPrintingTypes.${filling.mirrorUvPrintType}`).toLowerCase()
  : ''}

    ${filling?.isLacobelUVPrinting && filling?.lacobelUvPrintType
  ? t(`options:lacobelUVPrintingTypes.${filling.lacobelUvPrintType}`).toLowerCase()
  : ''}

    ${filling?.isGlassUVPrinting && filling?.glassUvPrintType
  ? t(`options:glassUVPrintingTypes.${filling.glassUvPrintType}`).toLowerCase()
  : ''}

    ${filling?.isMirrorArmoredFilm || filling?.isLacobelArmoredFilm || filling?.isGlassArmoredFilm
  ? t('fillingMaterialsModal.armored-film')
  : ''}
    ${filling?.isMirrorLaminated || filling?.isLacobelLaminated || filling?.isGlassLaminated
  ? t('fillingMaterialsModal.white-lamination')
  : ''}
    ${filling?.isMirrorMatted || filling?.isLacobelMatted || filling?.isGlassMatted
  ? t('fillingMaterialsModal.stencil-matting')
  : ''}

    ${filling?.isMirrorRearMatted || filling?.isLacobelRearMatted
  ? t('fillingMaterialsModal.rear-matting')
  : ''}

    ${filling?.isMirrorFullMatted || filling?.isLacobelFullMatted || filling?.isGlassFullMatted
  ? t('fillingMaterialsModal.full-matting')
  : ''}

    ${filling?.isGlassPhotoPrinting ? t('fillingMaterialsModal.photo-print-on-cover') : ''}
    ${filling?.isGlassPhotoPrinting && filling?.glassPhotoPrintType
  ? t(`options:glassPhotoPrintingTypes.${filling.glassPhotoPrintType}`).toLowerCase()
  : ''}

    ${filling?.mirrorColor
  ? filling?.mirrorColor.replace('_', ' ').toUpperCase()
  : ''}
    ${filling?.lacobelColor
  ? filling?.lacobelColor.replace('_', ' ').toUpperCase()
  : ''}

    ${filling?.isGlassOneColorPainted ? t('fillingMaterialsModal.painting-in-one-colors') : ''}
    ${filling?.isGlassTwoColorsPainted ? t('fillingMaterialsModal.painting-in-two-colors') : ''}
    ${filling?.glassColors?.length ? glassColors : ''}`;
  };

  const renderMainParams = () => (
    <Collapsible
      trigger={mainParamsTrigger()}
      onTriggerOpening={() => setIsMainParamsOpen(true)}
      onTriggerClosing={() => setIsMainParamsOpen(false)}
      open={isMainParamsOpen}
    >
      <div className="edit-order--main-params">
        <div className="edit-order--block">
          <div className="edit-order--block-row">
            <div className="edit-order--block-column">
              <Label value={t('editOrder.system-type')} />
            </div>
            <div className="edit-order--block-column">
              <div className="label--wrapper value">
                <div className="label">{t(`systemsChoise.${currentSystem}`)}</div>
              </div>
            </div>
          </div>

          <div className="edit-order--block-row">
            <div className="edit-order--block-column">
              <Label value={t('editOrder.door-opening-height')} />
            </div>
            <div className="edit-order--block-column">
              <div className="label--wrapper value">
                <div className="label">
                  {doorOpeningHeight?.value ? `${doorOpeningHeight?.value} мм` : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="edit-order--block-row">
            <div className="edit-order--block-column">
              <Label value={t('editOrder.door-opening-width')} />
            </div>
            <div className="edit-order--block-column">
              <div className="label--wrapper value">
                <div className="label">
                  {doorOpeningWidth?.value ? `${doorOpeningWidth?.value} мм` : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="edit-order--block-row">
            <div className="edit-order--block-column">
              <Label value={t('editOrder.door-height')} />
            </div>
            <div className="edit-order--block-column">
              <div className="label--wrapper value">
                <div className="label">{doorHeight ? `${doorHeight} мм` : ''}</div>
              </div>
            </div>
          </div>

          <div className="edit-order--block-row">
            <div className="edit-order--block-column">
              <Label value={t('editOrder.door-width')} />
            </div>
            <div className="edit-order--block-column">
              <div className="label--wrapper value">
                <div className="label">{doorWidth ? `${doorWidth} мм` : ''}</div>
              </div>
            </div>
          </div>

          <div className="edit-order--block-row">
            <div className="edit-order--block-column">
              <Label value={t('editOrder.door-amount')} />
            </div>
            <div className="edit-order--block-column">
              <div className="label--wrapper value">
                <div className="label">
                  {doorsAmount?.value ? `${doorsAmount?.value}шт` : ''}
                </div>
              </div>
            </div>
          </div>

          {!doorPositioningLabel || (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.door-positioning-scheme')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">{doorPositioningLabel}</div>
                </div>
              </div>
            </div>
          )}

          <div className="edit-order--block-row">
            <div className="edit-order--block-column">
              <Label value={t('editOrder.side-profile')} />
            </div>
            <div className="edit-order--block-column">
              <div className="label--wrapper value">
                <div className="label">{sideProfile?.value}</div>
              </div>
            </div>
          </div>

          <div className="edit-order--block-row">
            <div className="edit-order--block-column">
              <Label value={t('editOrder.profile-color')} />
            </div>
            <div className="edit-order--block-column">
              <div className="label--wrapper value">
                <div className="label">{aluminiumColorLabel}</div>
              </div>
            </div>
          </div>

          {!stopperLabel || (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.stopper')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">{stopperLabel}</div>
                </div>
              </div>
            </div>
          )}

          {!mechanismLabel || (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.mechanism')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">{mechanismLabel}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Collapsible>
  );

  const renderSectionsParams = (doorIndex, sections) => (
    <>
      {sections.map((s, i) => {
        const { filling } = s;
        const visibleHeight = Math.floor(s.visibleHeight?.value).toFixed(0);
        const visibleWidth = Math.floor(s.visibleWidth?.value).toFixed(0);
        const fillingHeight = Math.floor(s.fillingHeight?.value).toFixed(0);
        const fillingWidth = Math.floor(s.fillingWidth?.value).toFixed(0);

        return (
          <div key={`s-params-${i + 1}`} className="edit-order--section-wrapper">
            <div className="edit-order--separator" />
            <div className="edit-order--section-name">
              {t('editOrder.section-n', { doorNumber: doorIndex + 1, sectionNumber: i + 1 })}
            </div>

            <div className="edit-order--block">
              <div className="edit-order--block-row">
                <div className="edit-order--block-column">
                  <Label value={t('editOrder.filling-size')} />
                </div>
                <div className="edit-order--block-column">
                  <div className="label--wrapper value">
                    <div className="label">
                      {`${fillingHeight} x ${fillingWidth} мм`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="edit-order--block-row">
                <div className="edit-order--block-column">
                  <Label value={t('editOrder.visible-filling-size')} />
                </div>
                <div className="edit-order--block-column">
                  <div className="label--wrapper value">
                    <div className="label">
                      {`${visibleHeight} x ${visibleWidth} мм`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="edit-order--block-row">
                <div className="edit-order--block-column">
                  <Label value={t('editOrder.section-filling')} />
                </div>
                <div className="edit-order--block-column">
                  <div className="label--wrapper value">
                    <div className="label">
                      {getFilling(s.filling)}
                    </div>
                  </div>
                </div>
              </div>

              {!(isChipboard(filling) && s.texture?.value) || (
                <div className="edit-order--block-row">
                  <div className="edit-order--block-column">
                    <Label value={t('editOrder.section-texture')} />
                  </div>
                  <div className="edit-order--block-column">
                    <div className="label--wrapper value">
                      <div className="label">
                        {t(`options:textures.${s.texture?.value}`)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );


  const renderDoorParams = (doorIndex, items) => {
    const {
      connectingProfile,
      directionOfSections,
      doorLatchMechanism,
      doorLatchMechanismPosition,
      sectionsAmount,
      openingSide,
      filling,
      texture,
    } = items?.main;

    const spConstants = systemConctants?.filter((c) => c.sideProfile === sideProfile?.value)[0] || {};
    const {
      hiddingTopSize = 0,
      hiddingBottomSize = 0,
      hiddingSideSize = 0,
      topGap = 0,
      bottomGap = 0,
      topSealing = 0,
      bottomSealing = 0,
      sideSealing = 0,
      X12H = 0,
      X13W = 0,
    } = spConstants;

    const doorFillingHeight = sideProfile?.value === 'Slim'
      ? Math.floor(doorHeight + 2 - X12H - topSealing - bottomSealing - topGap - bottomGap)
      : Math.floor(doorHeight - X12H - topSealing - bottomSealing - topGap - bottomGap);
    const doorFillingHForChipboard = Math.floor(doorHeight - X12H - topGap - bottomGap);
    const doorFillingWidth = sideProfile?.value === 'Slim'
      ? Math.floor(doorWidth + 2 - X13W - sideSealing * 2)
      : Math.floor(doorWidth - X13W - sideSealing * 2);
    const doorFillingWForChipboard = Math.floor(doorWidth - X13W);
    const isChipboardDoor = isChipboard(filling);

    const doorFillingH = isChipboardDoor ? +(doorFillingHForChipboard).toFixed(0) : +(doorFillingHeight).toFixed(0);
    const doorFillingW = isChipboardDoor ? +(doorFillingWForChipboard).toFixed(0) : +(doorFillingWidth).toFixed(0);
    const doorVisibleH = Math.floor(doorHeight - X12H - hiddingTopSize - hiddingBottomSize - topGap - bottomGap)
      .toFixed(0);
    const doorVisibleW = Math.floor(doorWidth - X13W - hiddingSideSize - hiddingSideSize).toFixed(0);

    const openingSideLabel = openingSide?.value ? t(`options:openingSides.${openingSide.value}`) : '';
    const doorLatchMechanismPositionLabel = doorLatchMechanismPosition?.value
      ? t(`options:doorLatchMechanismPositionOptions.${doorLatchMechanismPosition?.value}`)
      : '';
    const doorLatchMechanismLabel = doorLatchMechanism?.value && doorLatchMechanisms
      ? doorLatchMechanisms[doorLatchMechanisms?.findIndex((m) => m.articleCode === doorLatchMechanism.value)]
        ?.[labelKey]
      : '';

    return (
      <>
        <div className="edit-order--block">
          {!sectionsAmount?.value ? (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.filling-size')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">
                    {`${doorFillingH} x ${doorFillingW} мм`}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!sectionsAmount?.value ? (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.visible-filling-size')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">
                    {`${doorVisibleH} x ${doorVisibleW} мм`}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {sidewallThickness?.value ? (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.sidewall-thickness')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">
                    {`${sidewallThickness.value} мм`}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!doorLatchMechanismLabel || (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.door-latch-mechanism')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">{doorLatchMechanismLabel}</div>
                </div>
              </div>
            </div>
          )}

          {!doorLatchMechanismLabel || (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.door-latch-mechanism-position')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">{doorLatchMechanismPositionLabel}</div>
                </div>
              </div>
            </div>
          )}

          {!openingSideLabel || (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.opening-side')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">{openingSideLabel}</div>
                </div>
              </div>
            </div>
          )}

          {!(sectionsAmount?.value && connectingProfile?.value) || (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.connecting-profile')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">
                    { connectingProfile.value }
                  </div>
                </div>
              </div>
            </div>
          )}

          {!(sectionsAmount?.value && connectingProfile?.value) || (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.connecting-profile-color')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">{aluminiumColorLabel}</div>
                </div>
              </div>
            </div>
          )}

          {sectionsAmount?.value ? (
            <div className="edit-order--block-row">
              <div className="edit-order--block-column">
                <Label value={t('editOrder.sections-direction')} />
              </div>
              <div className="edit-order--block-column">
                <div className="label--wrapper value">
                  <div className="label">
                    {t(`options:directionOfSectionsOptions.${directionOfSections?.value}`)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          { !sectionsAmount?.value ? (
            <>
              <div className="edit-order--block-row">
                <div className="edit-order--block-column">
                  <Label value={t('editOrder.section-filling')} />
                </div>

                <div className="edit-order--block-column">
                  <div className="label--wrapper value">
                    <div className="label">{getFilling(filling)}</div>
                  </div>
                </div>
              </div>

              {!(isChipboard(filling) && texture?.value) || (
                <div className="edit-order--block-row">
                  <div className="edit-order--block-column">
                    <Label value={t('editOrder.section-texture')} />
                  </div>

                  <div className="edit-order--block-column">
                    <div className="label--wrapper value">
                      <div className="label">
                        {t(`options:textures.${texture?.value}`)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null }
        </div>

        {!items?.sections.length || renderSectionsParams(doorIndex, items.sections)}
      </>
    );
  };

  const renderCollapsibleBlocks = () => doors.map((door, doorIndex) => {
    const isOpen = activeTrigger === doorIndex;

    return (
      <Collapsible
        key={`container-${doorIndex + 1}`}
        trigger={triggers[doorIndex]}
        containerElementProps={isOpen ? { doorIndex } : null}
        onTriggerOpening={() => {
          setActiveTrigger(doorIndex);
          dispatch(DoorsActions.setActiveDoor(doorIndex + 1));
        }}
        onTriggerClosing={() => {
          setActiveTrigger(null);
          dispatch(DoorsActions.setActiveDoor(0));
        }}
        disabled={!isOpen}
        open={isOpen}
      >
        {renderDoorParams(doorIndex, door)}
      </Collapsible>
    );
  });


  return (
    <div className="edit-order--wrapper">
      {renderMainParams()}
      <div className="edit-order--doors-collapsible">
        {renderCollapsibleBlocks()}
      </div>
    </div>
  );
};

export default EditOrder;
