import speakeasy from 'speakeasy';


export const TOTP_OPTIONS = {
  step: 900, // 15 minutes time step
  window: 0,
  encoding: 'base32',
};

export const generateTotpSecret = () => {
  const secret = speakeasy.generateSecret({ length: 6 });

  return secret.base32;
};

export const generateTotpToken = (secret) => speakeasy.totp({
  ...TOTP_OPTIONS,
  ...{ secret },
});

export const verifyTotpToken = (secret, token) => {
  const isValid = speakeasy.totp.verify({
    ...TOTP_OPTIONS,
    ...{ secret, token },
  });

  return isValid;
};
