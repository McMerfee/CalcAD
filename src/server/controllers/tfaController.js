import _ from 'lodash';
import express from 'express';
import { Curl } from 'node-libcurl';
import dotenv from 'dotenv-safe';

import errorLogger from '../helpers/errorLogger';
import {
  generateTotpSecret,
  generateTotpToken,
  verifyTotpToken,
} from '../helpers/otp';

import { Users } from '../db';

dotenv.config({ path: '.env' });

const ENV = process.env.NODE_ENV || 'development';
const router = express.Router();

router.post('/reset-password-request', resetPasswordRequest);
router.post('/send-confirmation-code', sendConfirmationCode);
router.post('/verify-confirmation-code', verifyConfirmationCode);


async function resetPasswordRequest(req, res) {
  try {
    const { phone } = req.body;
    const phoneWithCode = Number(`38${phone}`);

    if (_.isEmpty(phone)) return res.status(400).send({ status: 400 });

    const user = await Users
      .findOne({ phone: phoneWithCode })
      .lean();

    if (!user) {
      return res
        .status(400)
        .send({ error: { message: 'USER_NOT_FOUND' } });
    }

    /** Send SMS */

    const totpSecret = generateTotpSecret();
    const confirmationCode = generateTotpToken(totpSecret);

    await Users
      .findOneAndUpdate({ _id: user._id }, { totpSecret, updatedOn: new Date().toISOString() }, { new: true });

    const curl = new Curl();
    curl.setOpt(Curl.option.HTTPAUTH, 1);
    curl.setOpt(Curl.option.USERPWD, `ads:${process.env.ESPUTNIK_KEY}`);
    curl.setOpt(Curl.option.URL, 'https://esputnik.com/api/v1/message/sms');
    curl.setOpt(Curl.option.POST, true);
    curl.setOpt(Curl.option.POSTFIELDS, JSON.stringify({
      from: 'ADS',
      text: `ADS Vidnovlennya parolyu: ${confirmationCode}`,
      phoneNumbers: [`${phoneWithCode}`],
    }));
    curl.setOpt(Curl.option.HTTPHEADER, [
      'Content-Type: application/json',
      'Accept: application/json',
      'charset: UTF-8',
    ]);

    curl.on('error', (err, curlErrorCode) => res
      .status(curlErrorCode)
      .send({ error: { message: err.message } }));

    await curl.perform();

    return res.send({ isConfirmationCodeSent: true });
  } catch (err) {
    errorLogger(err, { method: 'resetPasswordRequest', url: ENV });
    return res.status(500).send(err);
  }
}

async function sendConfirmationCode(req, res) {
  try {
    const { userId, phone } = req.body;
    const phoneWithCode = Number(`38${phone}`);
    let isConfirmationCodeSent = false;

    if (_.isEmpty(userId) || _.isEmpty(phone)) {
      return res
        .status(400)
        .send({ error: { message: 'BAD_REQUEST' } });
    }

    const user = await Users
      .findOne({ _id: userId })
      .select({ totpSecret: 1 })
      .lean();

    /** Send SMS */

    const totpSecret = generateTotpSecret();
    const confirmationCode = generateTotpToken(totpSecret);

    await Users
      .findOneAndUpdate({ _id: user._id }, { totpSecret, updatedOn: new Date().toISOString() }, { new: true });

    const curl = new Curl();
    curl.setOpt(Curl.option.HTTPAUTH, 1);
    curl.setOpt(Curl.option.USERPWD, `ads:${process.env.ESPUTNIK_KEY}`);
    curl.setOpt(Curl.option.URL, 'https://esputnik.com/api/v1/message/sms');
    curl.setOpt(Curl.option.POST, true);
    curl.setOpt(Curl.option.POSTFIELDS, JSON.stringify({
      from: 'ADS',
      text: `ADS Avtorizatsiya: ${confirmationCode}`,
      phoneNumbers: [`${phoneWithCode}`],
    }));
    curl.setOpt(Curl.option.HTTPHEADER, [
      'Content-Type: application/json',
      'Accept: application/json',
      'charset: UTF-8',
    ]);

    curl.on('end', (statusCode) => {
      isConfirmationCodeSent = statusCode === 200;
    });

    curl.on('error', (err, curlErrorCode) => res
      .status(curlErrorCode)
      .send({ message: err.message }));

    curl.perform();

    return res.send({ isConfirmationCodeSent });
  } catch (err) {
    errorLogger(err, { method: 'sendConfirmationCode', url: ENV });
    return res.status(500).send(err);
  }
}

async function verifyConfirmationCode(req, res) {
  try {
    const { userId, token } = req.body;

    if (_.isEmpty(userId)) {
      return res
        .status(400)
        .send({ error: { message: 'BAD_REQUEST' } });
    }

    if (_.isEmpty(token)) {
      return res
        .status(400)
        .send({ error: { message: 'INVALID_TOKEN' } });
    }

    const user = await Users
      .findOne({ _id: userId })
      .select({ totpSecret: 1 })
      .lean();

    const isConfirmationCodeValid = verifyTotpToken(user.totpSecret, token);

    if (!isConfirmationCodeValid) {
      return res
        .status(400)
        .send({ error: { message: 'VERIFICATION_CODE_IS_INVALID' } });
    }

    await Users
      .findOneAndUpdate(
        { _id: userId },
        { isPhoneNumberVerified: true, updatedOn: new Date().toISOString() },
        { new: true },
      );

    return res.send({ isConfirmationCodeValid });
  } catch (err) {
    errorLogger(err, { method: 'verifyConfirmationCode', url: ENV });
    return res.status(500).send(err);
  }
}

module.exports = router;
