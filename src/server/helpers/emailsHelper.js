import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv-safe';

import logger from './logger';
import errorLogger from './errorLogger';

dotenv.config({ path: '.env' });

const {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  NODE_ENV = 'development',
} = process.env;

const auth = {
  auth: {
    api_key: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN,
  },
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const getEmailTemplatePath = (templateName) => path.join(__dirname, `../../client/emailTemplates/${templateName}`);

const readHTMLFile = (htmlPath, callback) => fs
  .readFile(htmlPath, { encoding: 'utf-8' }, (error, htmlFile) => {
    if (error) {
      errorLogger(error, { method: 'readHTMLFile', url: NODE_ENV });
      callback(error);
      return;
    }
    callback(null, htmlFile);
  });


async function sendHtmlEmail(
  templatePath,
  replacements,
  mailOptions,
  replacementHTML = null,
) {
  nodemailerMailgun.verify((error) => {
    if (error) {
      errorLogger(error, { method: 'nodemailerMailgun.verify', url: NODE_ENV });
    } else {
      logger.info('nodemailerMailgun: Connection configuration is verified');
    }
  });

  return readHTMLFile(templatePath, (err, htmlFile) => {
    const htmlFileContent = replacementHTML
      ? htmlFile.replace('HTMLContent', replacementHTML)
      : htmlFile;
    const template = handlebars.compile(htmlFileContent);
    const html = template(replacements);
    const htmlEmailOptions = {
      ...mailOptions,
      ...{ html },
    };

    return nodemailerMailgun.sendMail(htmlEmailOptions, (error, result) => {
      if (error) {
        errorLogger(error, { method: 'nodemailerMailgun.sendMail', url: NODE_ENV });
        return false;
      }
      logger.info(`Email %s was sent: ${result.messageId}`);

      return !!result.messageId;
    });
  });
}

export {
  getEmailTemplatePath,
  sendHtmlEmail,
};
