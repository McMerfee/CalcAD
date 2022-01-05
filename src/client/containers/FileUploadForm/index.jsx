import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTitle } from 'hookrouter';
import { useTranslation } from 'react-i18next';
import { withToastManager } from 'react-toast-notifications';
import Collapsible from 'react-collapsible';

import notificationPropTypes from '../../helpers/propTypes/notificationPropTypes';
import {
  sampleCustomers,
  sampleItemsJson,
  sampleDeliveryJson,
  sampleStatuses,
  sampleSystemConstants,
  sampleSetOrdersEschanged,
} from '../../helpers/sampleJSONUploads';

import Button from '../../components/Button';
import Label from '../../components/Label';

import AdminActions from '../../redux/actions/admin';

import Main from '../layout/Main';
import API from '../../api';
import { AuthService } from '../../services';


const FileUploadForm = ({ toastManager }) => {
  const { t } = useTranslation(['components']);
  const dispatch = useDispatch();

  const FILE_MAX_SIZE = 20000000;
  const SITE_URL = process.env.SITE_URL || 'http://ads-calc-stage.herokuapp.com';
  const PORT = process.env.PORT || 80;
  const accessToken = AuthService.getAdminAccessToken();
  /* eslint-disable */
  const curlCustomers = `curl -X PUT ${SITE_URL}:${PORT}/api/json/customers -H 'Content-Type: application/json; charset=utf-8' -H 'Accept: application/json' -H 'Authorization: Bearer ${accessToken}' --data-binary '@/${t('jsonForm.file-path')}'`;
  const curlItemsJson = `curl -X PUT ${SITE_URL}:${PORT}/api/json/items-list -H 'Content-Type: application/json; charset=utf-8' -H 'Accept: application/json' -H 'Authorization: Bearer ${accessToken}' --data-binary '@/${t('jsonForm.file-path')}'`;
  const curlDeliveryJson = `curl -X PUT ${SITE_URL}:${PORT}/api/json/delivery -H 'Content-Type: application/json; charset=utf-8' -H 'Accept: application/json' -H 'Authorization: Bearer ${accessToken}' --data-binary '@/${t('jsonForm.file-path')}'`;

  const curlOrdersLviv = `curl -X GET ${SITE_URL}:${PORT}/api/orders/1c/in-processing/lviv -H 'Content-Type: application/json; charset=utf-8' -H 'Authorization: Bearer ${accessToken}'`;
  const curlOrdersKyiv = `curl -X GET ${SITE_URL}:${PORT}/api/orders/1c/in-processing/kyiv -H 'Content-Type: application/json; charset=utf-8' -H 'Authorization: Bearer ${accessToken}'`;
  const curlOrdersKharkiv = `curl -X GET ${SITE_URL}:${PORT}/api/orders/1c/in-processing/kharkiv -H 'Content-Type: application/json; charset=utf-8' -H 'Authorization: Bearer ${accessToken}'`;
  const curlOrdersOdesa = `curl -X GET ${SITE_URL}:${PORT}/api/orders/1c/in-processing/odesa -H 'Content-Type: application/json; charset=utf-8' -H 'Authorization: Bearer ${accessToken}'`;

  const curlStatusesAPI = `curl -X PUT ${SITE_URL}:${PORT}/api/orders/1c/statuses -H 'Content-Type: application/json; charset=utf-8' -H 'Authorization: Bearer ${accessToken}'`;
  const curlOrdersRawAPI = `curl -X GET ${SITE_URL}:${PORT}/api/orders/1c/raw/lviv -H 'Content-Type: application/json; charset=utf-8' -H 'Authorization: Bearer ${accessToken}'`;
  const curlOrdersSetExchangedAPI = `curl -X PATCH ${SITE_URL}:${PORT}/api/orders/1c/set-exchanged -H 'Content-Type: application/json; charset=utf-8' -H 'Authorization: Bearer ${accessToken}'`;
  const curlSystemConstantsAPI = `curl -X PUT ${SITE_URL}:${PORT}/api/system-constants/1c -H 'Content-Type: application/json; charset=utf-8' -H 'Authorization: Bearer ${accessToken}'`;
  /* eslint-enable */

  const uploadItemsAndPricesRef = React.createRef();
  const uploadCustomersRef = React.createRef();

  const [itemsAndPricesFilePath, setItemsAndPricesFilePath] = useState('');
  const [customersFilePath, setCustomersFilePath] = useState('');
  const [itemsAndPricesFileContent, setItemsAndPricesFileContent] = useState('');
  const [itemsAndPricesFileType, setItemsAndPricesFileType] = useState('');
  const [customersFileContent, setCustomersFileContent] = useState('');
  const [itemsAndPricesErrorMessage, setItemsAndPricesErrorMessage] = useState('');
  const [customersErrorMessage, setCustomersErrorMessage] = useState('');
  const [isItemsAndPricesProcessing, setIsItemsAndPricesProcessing] = useState(false);
  const [isCustomersProcessing, setIsCustomersProcessing] = useState(false);
  const [notificationId, setNotificationId] = useState('');


  useTitle(t('routes.upload-json'));


  const {
    ordersCountTotal,
    ordersCountNew,
    ordersCountInProcessing,
    usersCountWithNewOrders,
    usersCountWithInProcessingOrders,
  } = useSelector(({ adminPageInfo }) => adminPageInfo);


  useEffect(() => {
    dispatch(AdminActions.getAdminInfoRequest());
  }, []);


  const showToast = (message, appearance) => {
    const errorContent = <div className="toast-notification">{message}</div>;

    if (notificationId) toastManager.remove(notificationId);

    toastManager.add(errorContent, {
      appearance,
      autoDismiss: true,
    }, (id) => { setNotificationId(id); });
  };


  const checkItemsAndPricesFileSize = (size, type) => {
    if (!size) return;
    setItemsAndPricesErrorMessage(size > FILE_MAX_SIZE && type === 'application/json'
      ? t('errorMessages.please-compress-file')
      : '');
  };


  const checkCustomersFileSize = (size) => {
    if (!size) return;
    setCustomersErrorMessage(size > FILE_MAX_SIZE
      ? t('errorMessages.file-is-too-large')
      : '');
  };


  const onItemsAndPricesChange = async ({ target: { files } }) => {
    await setItemsAndPricesFilePath(files[0]?.name);
    await checkItemsAndPricesFileSize(files[0]?.size, files[0]?.type);
    await setItemsAndPricesFileType(files[0]?.type);

    if (itemsAndPricesErrorMessage) return;
    const isZip = files[0]?.type === 'application/zip';

    const reader = new FileReader();
    reader.onabort = () => console.log('File reading was aborted!');
    reader.onerror = () => console.log('File reading has failed!');
    reader.onload = () => setItemsAndPricesFileContent(isZip
      ? reader.result.replace('data:', '').replace(/^.+,/, '')
      : reader.result);

    if (isZip) {
      reader.readAsDataURL(files[0]);
      return;
    }

    reader.readAsText(files[0]);
  };


  const onCustomersChange = async ({ target: { files } }) => {
    await setCustomersFilePath(files[0]?.name);
    await checkCustomersFileSize(files[0]?.size);

    if (customersErrorMessage) return;

    const reader = new FileReader();
    reader.onabort = () => console.log('File reading was aborted!');
    reader.onerror = () => console.log('File reading has failed!');
    reader.onload = () => setCustomersFileContent(reader.result);
    reader.readAsText(files[0]);
  };


  const resetItemsAndPricesFile = () => {
    setIsItemsAndPricesProcessing(false);
    setItemsAndPricesFilePath('');
    setItemsAndPricesFileType('');
    setItemsAndPricesFileContent('');
  };


  const onItemsAndPricesSubmit = async () => {
    setIsItemsAndPricesProcessing(true);

    const isZip = itemsAndPricesFileType === 'application/zip';
    const response = isZip
      ? await API.json.apply.itemsListAndPricesZIP(itemsAndPricesFileContent)
      : await API.json.apply.itemsListAndPricesJSON(itemsAndPricesFileContent);
    resetItemsAndPricesFile();

    if (_.isEmpty(response?.data)) {
      const msg = t('errorMessages.failed-uploading-file');
      setItemsAndPricesErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    if (!response.ok) {
      setItemsAndPricesErrorMessage(t('errorMessages.failed-uploading-file'));
      const msg = response.data?.error?.message;
      showToast(msg ? t(`errorMessagesHelper.${msg}`) : t('errorMessages.something-went-wrong'), 'error');
      return;
    }
    showToast(t('successMessages.file-uploaded-successfully'), 'success');
    console.info('Uploaded:', response.data?.data);
  };


  const onCustomersSubmit = async () => {
    setIsCustomersProcessing(true);
    const response = await API.json.apply.customersJSON(customersFileContent);
    setCustomersFilePath('');
    setIsCustomersProcessing(false);

    if (!response.ok) {
      setCustomersErrorMessage(t('errorMessages.failed-uploading-file'));
      const msg = response.data?.error?.message;
      showToast(msg ? t(`errorMessagesHelper.${msg}`) : t('errorMessages.something-went-wrong'), 'error');
      return;
    }

    const {
      totalCustomersInFile,
      sanitizedCustomers,
      uniqPhones,
      upsertedUsers,
    } = response.data.data;
    const usertedCustomers = upsertedUsers
      ? `${t('jsonForm.uploaded')}: ${upsertedUsers}.`
      : '';

    showToast(`
      ${usertedCustomers}
      ${t('jsonForm.invalid-phone-numbers')}: ${totalCustomersInFile - sanitizedCustomers}.
      ${t('jsonForm.nonunique-phone-numbers')}: ${sanitizedCustomers - uniqPhones}.
    `, 'info');
    console.info('Uploaded file info:', response.data?.data);
  };


  const trigger = (
    <div className="json-trigger-wrapper">
      <img
        className="trigger-image"
        src="src/client/assets/icons/json.svg"
        alt="json"
      />
      <p className="trigger-text">{t('jsonForm.example')}</p>
    </div>
  );


  return (
    <Main
      className="json-form"
      hasFooter={false}
      canGoBack={false}
    >
      <div className="title-wrapper">
        <div className="title">{t('jsonForm.orders-info')}</div>
      </div>

      <div className="content-wrapper">
        <div className="content-wrapper-info">
          <div className="info-row">
            {t('jsonForm.orders-count-total')}
            :&nbsp;
            <b>{ordersCountTotal}</b>
          </div>
          <div className="info-row">
            {t('jsonForm.orders-count-new')}
            :&nbsp;
            <b>{ordersCountNew}</b>
          </div>
          <div className="info-row">
            {t('jsonForm.orders-count-in-processing')}
            :&nbsp;
            <b>{ordersCountInProcessing}</b>
          </div>
          <div className="info-row">
            {t('jsonForm.users-count-with-new-orders')}
            :&nbsp;
            <b>{usersCountWithNewOrders}</b>
          </div>
          <div className="info-row">
            {t('jsonForm.users-count-with-in-processing-orders')}
            :&nbsp;
            <b>{usersCountWithInProcessingOrders}</b>
          </div>
        </div>
      </div>
      <br />


      <div className="title-wrapper">
        <div className="title">{t('jsonForm.upload-json-files')}</div>
      </div>

      <div className="content-wrapper">
        <div className="content-wrapper-inner">

          <div><p>{t('jsonForm.instruction-to-upload-json')}</p></div>

          <div>
            <Label
              value={t('jsonForm.file-with-items-list-and-price-list')}
              infoTagValue={t('jsonForm.compress-huge-file')}
              withInfoTag
            />
            <label
              className="label--upload-file"
              htmlFor="json-uploader-items"
            >
              <input
                type="file"
                id="json-uploader-items"
                name="json-uploader"
                accept={['.json', '.zip']}
                ref={uploadItemsAndPricesRef}
                onChange={onItemsAndPricesChange}
                disabled={isItemsAndPricesProcessing}
              />
              <span className="upload-custom">{itemsAndPricesFilePath || '.json / .zip файл'}</span>
            </label>
            <div className="label--error-message">
              <span>{itemsAndPricesErrorMessage}</span>
            </div>
          </div>

          <div className="content-wrapper--action-buttons">
            <Button
              value={t('jsonForm.submit')}
              type="rounded"
              onClick={async (e) => {
                e.preventDefault();
                onItemsAndPricesSubmit();
              }}
              isDisabled={!itemsAndPricesFilePath || !!itemsAndPricesErrorMessage || isItemsAndPricesProcessing}
              isProcessing={isItemsAndPricesProcessing}
            />

            <Button
              value={t('jsonForm.clear')}
              onClick={async (e) => {
                e.preventDefault();
                setItemsAndPricesFilePath('');
              }}
              isDisabled={isItemsAndPricesProcessing || !itemsAndPricesFilePath
                || !!itemsAndPricesErrorMessage || isItemsAndPricesProcessing}
            />
          </div>
          <br />

          <div>
            <p><code>{curlItemsJson}</code></p>
            <Collapsible trigger={trigger}>
              {sampleItemsJson()}
            </Collapsible>
          </div>
          <br />

          <div>
            <Label value={t('jsonForm.file-with-customers')} />
            <label
              className="label--upload-file"
              htmlFor="json-uploader-customers"
            >
              <input
                type="file"
                id="json-uploader-customers"
                name="json-uploader"
                accept=".json"
                ref={uploadCustomersRef}
                onChange={onCustomersChange}
                disabled={isCustomersProcessing}
              />
              <span className="upload-custom">{customersFilePath || '.json файл'}</span>
            </label>
            <div className="label--error-message">
              <span>{customersErrorMessage}</span>
            </div>
          </div>

          <div className="content-wrapper--action-buttons">
            <Button
              value={t('jsonForm.submit')}
              type="rounded"
              onClick={async (e) => {
                e.preventDefault();
                onCustomersSubmit();
              }}
              isDisabled={!customersFilePath || !!customersErrorMessage || isCustomersProcessing}
              isProcessing={isCustomersProcessing}
            />

            <Button
              value={t('jsonForm.clear')}
              onClick={async (e) => {
                e.preventDefault();
                setCustomersFilePath('');
              }}
              isDisabled={isCustomersProcessing || !customersFilePath || !!customersErrorMessage
                || isCustomersProcessing}
            />
          </div>
          <br />

          <div>
            <p><code>{curlCustomers}</code></p>
            <Collapsible trigger={trigger}>
              {sampleCustomers()}
            </Collapsible>
          </div>
          <br />

          <div className="title-wrapper-secondary">
            <div className="title">{t('jsonForm.1с-orders-exchange')}</div>
          </div>

          <div>
            <p><code>{curlStatusesAPI}</code></p>
            <Collapsible trigger={trigger}>
              {sampleStatuses()}
            </Collapsible>
          </div>
          <br />

          <div>
            <p>
              {t('jsonForm.instruction-to-load-orders-by-region')}
              <span>:</span>
            </p>
            <p>
              <b>
                {t('regions.lviv')}
                <span>:</span>
                &nbsp;
              </b>
              <code>{curlOrdersLviv}</code>
            </p>
            <p>
              <b>
                {t('regions.kyiv')}
                <span>:</span>
                &nbsp;
              </b>
              <code>{curlOrdersKyiv}</code>
            </p>
            <p>
              <b>
                {t('regions.kharkiv')}
                <span>:</span>
                &nbsp;
              </b>
              <code>{curlOrdersKharkiv}</code>
            </p>
            <p>
              <b>
                {t('regions.odesa')}
                <span>:</span>
                &nbsp;
              </b>
              <code>{curlOrdersOdesa}</code>
            </p>
          </div>
          <br />

          <div className="title-wrapper-secondary">
            <div className="title">{t('jsonForm.1с-orders-exchange-raw')}</div>
          </div>

          <div>
            <p><code>{curlOrdersRawAPI}</code></p>
          </div>
          <br />

          <div className="title-wrapper-secondary">
            <div className="title">{t('jsonForm.1с-orders-set-exchanged')}</div>
          </div>

          <div>
            <p><code>{curlOrdersSetExchangedAPI}</code></p>
            <Collapsible trigger={trigger}>
              {sampleSetOrdersEschanged()}
            </Collapsible>
          </div>
          <br />


          <div className="title-wrapper-secondary">
            <div className="title">{t('jsonForm.1с-system-constants-exchange')}</div>
          </div>

          <div>
            <p><code>{curlSystemConstantsAPI}</code></p>
            <Collapsible trigger={trigger}>
              {sampleSystemConstants()}
            </Collapsible>
          </div>
          <br />

          <div className="title-wrapper-secondary">
            <div className="title">{t('jsonForm.1с-delivery-exchange')}</div>
          </div>

          <div>
            <p><code>{curlDeliveryJson}</code></p>
            <Collapsible trigger={trigger}>
              {sampleDeliveryJson()}
            </Collapsible>
          </div>
          <br />
          <br />

        </div>
      </div>

    </Main>
  );
};

FileUploadForm.propTypes = {
  toastManager: PropTypes.shape(notificationPropTypes).isRequired,
};

export default withToastManager(FileUploadForm);
