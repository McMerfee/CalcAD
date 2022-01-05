import _ from 'lodash';
import express from 'express';
import bcrypt from 'bcrypt-node';
import crypto from 'crypto';
import { Curl } from 'node-libcurl';
import dotenv from 'dotenv-safe';

import { generateToken } from '../helpers/jwt';
import errorLogger from '../helpers/errorLogger';
import logger from '../helpers/logger';
import { isValidPhoneNumber } from '../helpers/validation';
import {
  generateTotpSecret,
  generateTotpToken,
  verifyTotpToken,
} from '../helpers/otp';

import { EmailService } from '../services';

import { Orders, Users } from '../db';
import {
  defaultPackageName,
  defaultPackagesByRegion,
  defaultRegion,
  jwtExpiresShort,
  jwtExpiresLong,
} from '../helpers/constants';

dotenv.config({ path: '.env' });

const ENV = process.env.NODE_ENV || 'development';
const router = express.Router();
const { NODE_ENV = 'development' } = process.env;

router.post('/signin-admin', signinAsAdmin);
router.post('/signin', signin);
router.post('/signup-by/:phone', signupByPhone);

router.get('/profile/:userId', getProfile);
router.get('/admin/get-admin-page-info', getAdminPageInfo);

router.put('/set-password', setPassword);
router.put('/profile/:userId', updateProfile);
router.put('/profile/:userId/phone', updatePhoneNumber);
router.put('/profile/:userId/lang', updateLanguage);
router.put('/profile/password/reset', resetPassword);

async function signinAsAdmin(req, res) {
  try {
    const { password, email } = req.body;

    if (_.isEmpty(email) || _.isEmpty(password)) {
      return res.status(400).send({ error: { message: 'BAD_REQUEST' } });
    }

    const user = await Users.findOne({ email: email.toLowerCase() }).exec();

    if (!user) {
      return res
        .status(400)
        .send({ error: { message: 'USER_NOT_FOUND' } });
    }

    const isMatch = await bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .send({ error: { message: 'INCORRECT_LOGIN_OR_PASSWORD' } });
    }

    const {
      _id,
      role,
      adminAccessToken,
      packageName,
      isPhoneNumberVerified,
    } = user;

    const jwtToken = generateToken(
      {
        userId: _id,
        email: email.toLowerCase(),
        role,
        packageName,
        adminAccessToken,
        isPhoneNumberVerified,
      },
      { expiresIn: jwtExpiresLong },
    );

    await Users.findOneAndUpdate({ _id }, { lastLoginOn: new Date().toISOString() });

    return res.send({ jwtToken });
  } catch (err) {
    errorLogger(err, { method: 'signinAsAdmin', url: ENV });
    return res.status(500).send(err);
  }
}


async function signin(req, res) {
  try {
    const { phone, password } = req.body;


    if (_.isEmpty(phone) || _.isEmpty(password)) {
      return res.status(400).send({ error: { message: 'BAD_REQUEST' } });
    }

    const phoneWithCode = Number(`38${phone}`);
    const user = await Users.findOne({ phone: phoneWithCode }).exec();

    if (!user) {
      return res
        .status(404)
        .send({ error: { message: 'USER_NOT_FOUND' } });
    }

    const {
      _id,
      phone: phoneNumber,
      packageName,
      isPhoneNumberVerified,
    } = user;

    const isPasswordMatch = await bcrypt.compareSync(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .send({ error: { message: 'INCORRECT_PASSWORD' } });
    }

    const jwtToken = generateToken(
      {
        userId: _id,
        phone: phoneNumber,
        packageName,
        isPhoneNumberVerified,
      },
      { expiresIn: jwtExpiresShort },
    );

    await Users.findOneAndUpdate({ _id }, { lastLoginOn: new Date().toISOString() });

    return res.send({ jwtToken });
  } catch (err) {
    errorLogger(err, { method: 'signin', url: ENV });
    return res.status(500).send(err);
  }
}


async function getProfile(req, res) {
  try {
    const { userId } = req.params;

    if (_.isEmpty(userId)) {
      return res
        .status(400)
        .send({ error: { message: 'BAD_REQUEST' } });
    }

    const user = await Users
      .findOne({ _id: userId })
      .select({
        firstName: 1,
        lastName: 1,
        phone: 1,
        primaryRegion: 1,
        delivery: 1,
        regionsList: 1,
        packageName: 1,
        isPhoneNumberVerified: 1,
        language: 1,
        _id: 0,
      })
      .lean();

    if (!user) {
      return res
        .status(400)
        .send({ error: { message: 'USER_NOT_FOUND' } });
    }

    const hasRegionDefaultPackage = defaultPackagesByRegion.find((p) => p.packageName === user.packageName);
    const packageName = hasRegionDefaultPackage?.packageName ? defaultPackageName : user.packageName;

    const sanitizedUser = {
      ...user,
      ...{
        packageName,
        phone: user.phone.toString().substring(2),
      },
    };

    return res.send({ profile: sanitizedUser });
  } catch (err) {
    errorLogger(err, { method: 'getProfile', url: ENV });
    return res.status(500).send(err);
  }
}


async function getAdminPageInfo(req, res) {
  try {
    logger.info('[getAdminPageInfo] Called');

    if (req?.user?.role !== 'admin') return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });

    const newOrdersByUserQuery = [
      { $match: { status: { $eq: 'new' } } },
      { $group: { _id: '$user.userId' } },
    ];

    const inProcessingOrdersByUserQuery = [
      { $match: { status: { $eq: 'in-processing' } } },
      { $group: { _id: '$user.userId' } },
    ];

    const ordersCountTotal = await Orders.find().count();
    const ordersCountNew = await Orders.find({ status: 'new' }).count();
    const ordersCountInProcessing = await Orders.find({ status: 'in-processing' }).count();

    const usersWithNewOrders = await Orders.aggregate([...newOrdersByUserQuery]);
    const usersWithInProcessingOrders = await Orders.aggregate([...inProcessingOrdersByUserQuery]);

    return res.send({
      ordersCountTotal: ordersCountTotal || 0,
      ordersCountNew: ordersCountNew || 0,
      ordersCountInProcessing: ordersCountInProcessing || 0,
      usersCountWithNewOrders: usersWithNewOrders?.length || 0,
      usersCountWithInProcessingOrders: usersWithInProcessingOrders?.length || 0,
    });
  } catch (err) {
    errorLogger(err, { method: 'getAdminPageInfo', url: ENV });
    return res.status(500).send(err);
  }
}


async function signupByPhone(req, res) {
  try {
    const { phone } = req.params;
    const phoneWithCode = Number(`38${phone}`);
    let isConfirmationCodeSent = false;

    if (_.isEmpty(phone)) return res.status(400).send({ message: 'Телефоний номер відсутній' });
    if (!isValidPhoneNumber(phone)) return res.status(400).send({ message: 'Некоректний телефон' });

    let user = await Users
      .findOne({ phone: phoneWithCode })
      .select({
        _id: 1,
        phone: 1,
        firstName: 1,
        lastName: 1,
        primaryRegion: 1,
        regionsList: 1,
        isPhoneNumberVerified: 1,
      })
      .lean();

    if (!_.isEmpty(user) && user?.isPhoneNumberVerified) return res.send({ error: { message: 'USER_ALREADY_EXISTS' } });

    if (_.isEmpty(user)) {
      user = await Users.create({
        phone: phoneWithCode,
        isPhoneNumberVerified: false,
      });

      if (!user?._id) return res.status(500).send({ message: 'Помилка створення користувача' });
      logger.info(`User has been created: ${user._id}`);
    }

    /** Send SMS */
    const totpSecret = generateTotpSecret();
    const confirmationCode = generateTotpToken(totpSecret);

    await Users.findOneAndUpdate(
      { _id: user._id },
      {
        totpSecret,
        lastLoginOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
      },
      { new: true },
    );

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

    const jwtToken = generateToken(
      {
        userId: user._id,
        phone,
      },
      { expiresIn: jwtExpiresShort },
    );

    return res.send({
      status: 200,
      jwtToken,
      isConfirmationCodeSent,
      profile: {
        ...user,
        ...{ phone: user.phone.toString().substring(2) },
      },
    });
  } catch (err) {
    errorLogger(err, { method: 'getProfile', url: ENV });
    return res.status(500).send(err);
  }
}


async function setPassword(req, res) {
  try {
    const {
      userId,
      firstName,
      lastName,
      password,
      region,
    } = req.body;

    if (!(firstName && lastName && password && region)) {
      return res
        .status(400)
        .send({ error: { message: 'BAD_REQUEST' } });
    }

    const dbUser = await Users
      .findOne({ _id: userId })
      .select({
        _id: 1,
        regionsList: 1,
        packageName: 1,
      })
      .lean();

    const userFullName = `${firstName} ${lastName}`;
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(password, salt);
    const passwordToken = crypto.randomBytes(20).toString('hex');
    const ONE_DAY = 86400000;
    const passwordExpiresOn = Date.now() + ONE_DAY;

    const defaultPackage = defaultPackagesByRegion.find((p) => p.region === region)?.packageName || defaultPackageName;

    const updatedUser = await Users
      .findOneAndUpdate({ _id: userId }, {
        firstName,
        lastName,
        password: hash,
        passwordToken,
        passwordExpiresOn,
        primaryRegion: region || defaultRegion,
        regionsList: _.union(dbUser.regionsList, [region])
          .filter((value, index, self) => self.indexOf(value) === index),
        isPhoneNumberVerified: true,
        packageName: dbUser.packageName || defaultPackage,
        lastLoginOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
      }, { new: true });

    if (!updatedUser?._id) {
      return res
        .status(500)
        .send({ message: 'Помилка створення користувача' });
    }
    logger.info(`User has been updated: ${updatedUser._id}`);

    const sanitizedPhone = updatedUser.phone.toString().substring(2);
    const sanitizedUser = {
      ...updatedUser,
      ...{ phone: sanitizedPhone },
    };

    if (NODE_ENV !== 'development') {
      EmailService.sendNewUserCreatedEmail(userFullName, sanitizedPhone, updatedUser.primaryRegion);
    }

    const jwtToken = generateToken(
      {
        userId,
        phone: sanitizedPhone,
        packageName: defaultPackage,
        isPhoneNumberVerified: true,
      },
      { expiresIn: jwtExpiresShort },
    );

    return res.send({
      profile: sanitizedUser,
      jwtToken,
    });
  } catch (err) {
    errorLogger(err, { method: 'signup', url: ENV });
    return res.status(500).send(err);
  }
}

async function updateProfile(req, res) {
  try {
    const { userId } = req.params;
    const { profile } = req.body;

    if (_.isEmpty(userId)) {
      return res
        .status(400)
        .send({ error: { message: 'BAD_REQUEST' } });
    }

    if (req?.user?.userId !== userId) {
      return res
        .status(403)
        .send({ error: { message: 'PERMISSION_DENIED' } });
    }

    const user = await Users
      .findOne({ _id: userId })
      .select({ phone: 1 })
      .lean();

    const shouldRedirectToConfirmPhone = user.phone.toString().substring(2) !== profile.phone;

    const query = { _id: userId };
    const updateDoc = {
      $set: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        updatedOn: new Date().toISOString(),
        delivery: {
          type: profile.delivery?.type || '',
          office: profile.delivery?.office || '',
          addressLine: profile.delivery?.addressLine || '',
          city: profile.delivery?.city || '',
          code1C: profile.delivery?.code1C || '',
        },
      },
    };
    const options = { new: true, upsert: true };
    const callback = (error) => { if (error) logger.error(error); };

    const updatedUser = await Users.findOneAndUpdate(query, updateDoc, options, callback);

    return res.send({
      status: updatedUser?._id ? 200 : 500,
      shouldRedirectToConfirmPhone,
    });
  } catch (err) {
    errorLogger(err, { method: 'updateProfile', url: ENV });
    return res.status(500).send(err);
  }
}

async function updatePhoneNumber(req, res) {
  try {
    const { userId } = req.params;
    const { phone } = req.body;

    if (_.isEmpty(userId)) {
      return res
        .status(400)
        .send({ error: { message: 'BAD_REQUEST' } });
    }

    if (req?.user?.userId !== userId) {
      return res
        .status(403)
        .send({ error: { message: 'PERMISSION_DENIED' } });
    }

    const phoneWithCode = Number(`38${phone}`);

    await Users
      .findOneAndUpdate(
        { _id: userId },
        {
          phone: phoneWithCode,
          updatedOn: new Date().toISOString(),
        },
        { new: true },
      );

    return res.send({ status: 200 });
  } catch (err) {
    errorLogger(err, { method: 'updatePhoneNumber', url: ENV });
    return res.status(500).send(err);
  }
}

async function updateLanguage(req, res) {
  try {
    const { userId } = req.params;
    const { lngCode } = req.body;

    if (_.isEmpty(userId)) {
      return res
        .status(400)
        .send({ error: { message: 'BAD_REQUEST' } });
    }

    if (req?.user?.userId !== userId) {
      return res
        .status(403)
        .send({ error: { message: 'PERMISSION_DENIED' } });
    }

    await Users
      .findOneAndUpdate(
        { _id: userId },
        {
          language: lngCode,
          updatedOn: new Date().toISOString(),
        },
        { new: true },
      );

    return res.send({ status: 200 });
  } catch (err) {
    errorLogger(err, { method: 'updateLanguage', url: ENV });
    return res.status(500).send(err);
  }
}

async function resetPassword(req, res) {
  try {
    const {
      phone,
      password,
      token,
    } = req.body;
    const phoneWithCode = Number(`38${phone}`);

    const user = await Users
      .findOne({ phone: phoneWithCode })
      .select({ totpSecret: 1 })
      .lean();

    const isConfirmationCodeValid = verifyTotpToken(user.totpSecret, token);

    if (!isConfirmationCodeValid) {
      return res
        .status(400)
        .send({ error: { message: 'VERIFICATION_CODE_IS_INVALID' } });
    }

    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(password, salt);
    const passwordToken = crypto.randomBytes(20).toString('hex');
    const ONE_DAY = 86400000;
    const passwordExpiresOn = Date.now() + ONE_DAY;

    const updatedUser = await Users
      .findOneAndUpdate(
        { _id: user._id },
        {
          isPhoneNumberVerified: true,
          password: hash,
          passwordToken,
          passwordExpiresOn,
          lastLoginOn: new Date().toISOString(),
          updatedOn: new Date().toISOString(),
        },
        { new: true },
      );

    return res.send({
      status: 200,
      isConfirmationCodeValid,
      isPasswordUpdated: !!updatedUser,
    });
  } catch (err) {
    errorLogger(err, { method: 'resetPassword', url: ENV });
    return res.status(500).send(err);
  }
}


module.exports = router;
