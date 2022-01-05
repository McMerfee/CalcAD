import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const generateToken = (payload, options) => jwt.sign(
  payload,
  JWT_SECRET,
  options,
);

export const verifyToken = (jwtPayload) => jwt.verify(jwtPayload, JWT_SECRET);

export const hasher = (password, salt) => {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);

  const hashedPassword = hash.digest('hex');

  return {
    salt,
    hashedPassword,
  };
};
