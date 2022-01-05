import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { dspListWithWhiteMargins } from '../../helpers/visualisationHelper';

import Button from '../Button';
import Label from '../Label';

const IMAGES_PATH = {
  chipboardPath: '/src/client/assets/images/visualisation/chipboard-texture.jpg',
  glassPath: '/src/client/assets/images/fillingMaterials/glass.jpg',
  mirrorPath: '/src/client/assets/images/fillingMaterials/mirror.jpg',
};

const FillingMaterialsControl = ({
  filling,
  label,
  onClick,
}) => {
  const { t, i18n } = useTranslation(['components']);
  const labelKey = i18n.language === 'ru' ? 'labelRu' : 'labelUk';

  const { filling: fillingMaterials } = useSelector(({ config }) => config);

  const renderParams = () => filling.map((material, i) => {
    if (!material?.material) return null;

    const title = t(`fillingMaterialsModal.${material?.material}`);

    const selectedManufacturerOption = material?.dspOption
      ? fillingMaterials.find((f) => f.articleCode === material.dspOption)?.[labelKey]
      : '';

    let customFilling = '';
    let glassColors = '';

    if (material?.material === 'customers') {
      customFilling = material?.customersOption === 'glass'
        ? t('fillingMaterialsModal.glass')
        : `${t('fillingMaterialsModal.dsp')} ${material?.customersOption === 'dsp-small' ? '10mm' : '10+mm'}`;
    }

    if (material?.glassColors?.length) {
      material.glassColors.forEach((item, j) => {
        const color = item ? item.replace('_', ' ').toUpperCase() : '';
        glassColors += `${color}${material.glassColors.length > 1 && !j ? ', ' : ''}`;
      });
    }

    return (
      <div className="filling-materails-control__item" key={material + i}>
        <div className="filling-materails-control--image">
          {renderIcon(material)}
        </div>
        <div
          key={`filling-${i + 1}`}
          className="filling-materails-control--item"
        >
          <div className="filling-materails-control--params-wrapper-title">
            {title}
          </div>
          <div className="filling-materails-control--params-wrapper-text">
            {`
          ${customFilling}
          ${material?.isMilling ? t('fillingMaterialsModal.milling') : ''}

          ${material?.manufacturer || ''} ${selectedManufacturerOption}
          ${material?.mirrorType ? t(`options:mirrorTypes.${material.mirrorType}`) : ''}
          ${material?.lacobelType ? t(`options:lacobelTypes.${material.lacobelType}`) : ''}
          ${material?.glassType ? t(`options:glassTypes.${material.glassType}`) : ''}

          ${material?.isDspUVPrinting || material?.isGlassUVPrinting
            || material?.isMirrorUVPrinting || material?.isLacobelUVPrinting
        ? t('fillingMaterialsModal.uv-print')
        : ''}

          ${material?.isDspUVPrinting && material?.dspUvPrintType
        ? t(`options:chipboardUVPrintingTypes.${material.dspUvPrintType}`).toLowerCase()
        : ''}

          ${material?.isMirrorUVPrinting && material?.mirrorUvPrintType
        ? t(`options:mirrorUVPrintingTypes.${material.mirrorUvPrintType}`).toLowerCase()
        : ''}

          ${material?.isLacobelUVPrinting && material?.lacobelUvPrintType
        ? t(`options:lacobelUVPrintingTypes.${material.lacobelUvPrintType}`).toLowerCase()
        : ''}

          ${material?.isGlassUVPrinting && material?.glassUvPrintType
        ? t(`options:glassUVPrintingTypes.${material.glassUvPrintType}`).toLowerCase()
        : ''}

          ${material?.isMirrorArmoredFilm || material?.isLacobelArmoredFilm || material?.isGlassArmoredFilm
        ? t('fillingMaterialsModal.armored-film')
        : ''}
          ${material?.isMirrorLaminated || material?.isLacobelLaminated || material?.isGlassLaminated
        ? t('fillingMaterialsModal.white-lamination')
        : ''}
          ${material?.isMirrorMatted || material?.isLacobelMatted || material?.isGlassMatted
        ? t('fillingMaterialsModal.stencil-matting')
        : ''}

          ${material?.isMirrorRearMatted || material?.isLacobelRearMatted
        ? t('fillingMaterialsModal.rear-matting')
        : ''}

          ${material?.isMirrorFullMatted || material?.isLacobelFullMatted || material?.isGlassFullMatted
        ? t('fillingMaterialsModal.full-matting')
        : ''}

          ${material?.isGlassPhotoPrinting ? t('fillingMaterialsModal.photo-print-on-cover') : ''}
          ${material?.isGlassPhotoPrinting && material?.glassPhotoPrintType
        ? t(`options:glassPhotoPrintingTypes.${material.glassPhotoPrintType}`).toLowerCase()
        : ''}

          ${material?.mirrorColor
        ? material?.mirrorColor.replace('_', ' ').toUpperCase()
        : ''}
          ${material?.lacobelColor
        ? material?.lacobelColor.replace('_', ' ').toUpperCase()
        : ''}

          ${material?.isGlassOneColorPainted ? t('fillingMaterialsModal.painting-in-one-colors') : ''}
          ${material?.isGlassTwoColorsPainted ? t('fillingMaterialsModal.painting-in-two-colors') : ''}
          ${material?.glassColors?.length ? glassColors : ''}
            `}
          </div>
        </div>
      </div>
    );
  });

  const getImagePath = (fillingItem) => {
    const { dspOption } = fillingItem;
    const isChipboard = fillingItem?.customersOption?.includes('dsp') || fillingItem?.material === 'dsp';

    const glass = (fillingItem?.material === 'customers' && fillingItem?.customersOption === 'glass')
    || fillingItem?.material === 'glass'
      ? IMAGES_PATH.glassPath
      : '';

    const chipboard = isChipboard && dspOption && _.some(dspListWithWhiteMargins, (item) => item === dspOption)
      ? IMAGES_PATH.chipboardPath
      : isChipboard && dspOption
        ? fillingMaterials?.find((f) => f.articleCode === dspOption)?.image
        : IMAGES_PATH.chipboardPath;

    const mirrorOrLacobel = fillingItem?.material === 'mirror' || fillingItem?.material === 'lacobel'
      ? IMAGES_PATH.mirrorPath
      : '';

    return glass || mirrorOrLacobel || chipboard;
  };

  const renderIcon = (material) => (
    <div className="filling-materails-control--image-wrapper-inner">
      <img
        alt="img"
        src={getImagePath(material)}
      />
    </div>
  );

  return (
    <>
      <div className="filling-materails-control-label-wrapper">
        <Label
          value={label}
          infoTagValue={t('tooltips.filling-material')}
          withInfoTag
        />
        <Button
          value={filling[0] && filling[0]?.material
            ? t('fillingMaterialsControl.change')
            : t('fillingMaterialsControl.choose')}
          onClick={onClick}
          type="outlined-white"
        />
      </div>
      <div className="filling-materails-control">
        {!_.isEmpty(filling[0] && filling[0]?.material) && (
          <div className="filling-materails-control--params-wrapper">
            {renderParams()}
          </div>
        )}
      </div>
    </>
  );
};

FillingMaterialsControl.propTypes = {
  filling: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default FillingMaterialsControl;
