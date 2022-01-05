import decode from 'jwt-decode';
import Cookies from 'js-cookie';

const setToken = (token) => Cookies.set('jwtToken', token);

const getToken = () => Cookies.get('jwtToken');

const isTokenExpired = (token) => {
  try {
    const decoded = decode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (err) {
    return false;
  }
};

const isLoggedIn = () => {
  const token = getToken();
  return Boolean(token) && !isTokenExpired(token);
};

const getRole = () => {
  if (isLoggedIn()) {
    const token = getToken();
    try {
      const decoded = decode(token);
      return decoded.role;
    } catch (err) {
      return false;
    }
  }
  return false;
};

const getAdminAccessToken = () => {
  if (isLoggedIn()) {
    const token = getToken();
    const role = getRole();
    if (role !== 'admin') return false;
    try {
      const decoded = decode(token);
      return decoded.adminAccessToken;
    } catch (err) {
      return false;
    }
  }
  return false;
};

const getUserId = () => {
  if (isLoggedIn()) {
    const token = getToken();
    try {
      const decoded = decode(token);
      return decoded.userId;
    } catch (err) {
      return false;
    }
  }
  return false;
};

const isPhoneNumberVerified = () => {
  if (isLoggedIn()) {
    const token = getToken();
    try {
      const decoded = decode(token);
      return decoded.isPhoneNumberVerified;
    } catch (err) {
      return false;
    }
  }
  return false;
};

const logout = () => {
  Cookies.remove('jwtToken');
};

export default {
  setToken,
  getToken,
  isTokenExpired,
  isLoggedIn,
  getRole,
  getAdminAccessToken,
  getUserId,
  isPhoneNumberVerified,
  logout,
};
