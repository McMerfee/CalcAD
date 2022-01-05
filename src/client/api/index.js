import apisauce from 'apisauce';

import { AuthService } from '../services';

const SITE_URL = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
  ? process.env.SITE_URL
  : 'http://localhost:3000';

const api = apisauce.create({
  baseURL: SITE_URL,
  timeout: 10000,

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

if (AuthService.isLoggedIn()) {
  api.setHeader('authorization', `Bearer ${AuthService.getToken()}`);
}

export default {
  user: {
    signInAsAdmin: (password, email) => api
      .post('api/users/signin-admin', { password, email })
      .then((res) => {
        if (res?.data?.jwtToken) {
          api.setHeader('authorization', `Bearer ${res.data.jwtToken}`);
        }
        return res;
      }),
    signIn: (phone, password) => api
      .post('api/users/signin', { phone, password })
      .then((res) => {
        if (res?.data?.jwtToken) {
          api.setHeader('authorization', `Bearer ${res.data.jwtToken}`);
        }
        return res;
      }),
    profile: {
      get: (userId) => api.get(`api/users/profile/${userId}`),
      update: (userId, profile) => api.put(`api/users/profile/${userId}`, { profile }),
      setNewPhoneNumber: (userId, phone) => api.put(`api/users/profile/${userId}/phone`, { phone }),
      changeLanguage: (userId, lngCode) => api.put(`api/users/profile/${userId}/lang`, { lngCode }),
      resetPassword: (phone, password, token) => api
        .put('api/users/profile/password/reset', { phone, password, token }),
    },
    tfa: {
      resetPasswordRequest: (phone) => api.post('api/tfa/reset-password-request', { phone }),
      sendConfirmationCode: (userId, phone) => api.post('api/tfa/send-confirmation-code', { userId, phone }),
      verifyConfirmationCode: (userId, token) => api.post('api/tfa/verify-confirmation-code', { userId, token }),
    },
    signUpBy: (phone) => api.post(`api/users/signup-by/${phone}`),
    setPassword: (userId, firstName, lastName, password, region) => api
      .put('api/users/set-password', {
        userId,
        firstName,
        lastName,
        password,
        region,
      })
      .then((res) => {
        if (res?.data?.jwtToken) api.setHeader('authorization', `Bearer ${res.data.jwtToken}`);
        return res;
      }),
  },
  config: {
    get: (systemType) => api.get('api/config', { systemType }),
    connectingProfiles: {
      list: (systemType) => api.get('api/config/connecting-profiles/list', { systemType }),
    },
    sideProfiles: {
      list: (systemType) => api.get('api/config/side-profiles/list', { systemType }),
    },
  },
  admin: {
    get: () => {
      api.setHeader('authorization', `Bearer ${AuthService.getToken()}`);
      return api.get('api/users/admin/get-admin-page-info');
    },
  },
  json: {
    apply: {
      itemsListAndPricesJSON: (fileContent) => {
        api.setHeader('authorization', `Bearer ${AuthService.getToken()}`);
        return api.post('api/json/apply-data-from-items-list-json', { fileContent });
      },
      itemsListAndPricesZIP: (zip) => {
        api.setHeader('authorization', `Bearer ${AuthService.getToken()}`);
        return api.post('api/json/apply-data-from-items-list-zip', { zip });
      },
      customersJSON: (fileContent) => {
        api.setHeader('authorization', `Bearer ${AuthService.getToken()}`);
        return api.put('api/json/apply-data-from-customers-json', { fileContent });
      },
      pricelistByRegion: ({ fileContent, region }) => {
        api.setHeader('authorization', `Bearer ${AuthService.getToken()}`);
        return api.put('api/json/apply-pricelist-by-region', { fileContent, region });
      },
    },
  },
  priceList: {
    get: (userId, region) => api.get('api/price-list', { userId, region }),
  },
  delivery: {
    get: () => api.get('api/delivery'),
  },
  orders: {
    create: (userId, data, region, doorsSnippet, systemType) => api
      .post('api/orders', {
        userId,
        data,
        region,
        doorsSnippet,
        systemType,
      })
      .then((res) => res.data),
    copy: (userId, orderId, title) => api
      .post(`api/orders/${orderId}/copy`, { userId, orderId, title })
      .then((res) => res.data),
    update: (orderId, userId, data, region) => api
      .put(`api/orders/${orderId}/update`, { userId, data, region })
      .then((res) => res.data),
    putIntoWork: (orderId, userId, data) => api
      .put(`api/orders/${orderId}/put-into-work`, { userId, data })
      .then((res) => res.data),
    updateTitle: (orderId, userId, title) => api
      .put(`api/orders/${orderId}/update/title`, { userId, title })
      .then((res) => res.data),
    delete: (orderId) => api
      .delete(`api/orders/${orderId}/delete`, { orderId })
      .then((res) => res.data),
    list: {
      acceptedByUserId: (userId) => api.get(`api/orders/${userId}/list/accepted`),
      savedByUserId: (userId) => api.get(`api/orders/${userId}/list/saved`),
    },
    get: (orderId) => api.get(`api/orders/${orderId}`),
    getOrderModalData: (orderId) => api.get(`api/orders/${orderId}/put-into-work-lead-up`),
  },
  ordersDraft: {
    create: (userId, data, doorsSnippet, systemType) => api
      .post('api/orders-draft', {
        userId,
        data,
        doorsSnippet,
        systemType,
      })
      .then((res) => res.data),
    update: (orderId, userId, data) => api
      .put(`api/orders-draft/${orderId}/update`, { userId, data })
      .then((res) => res.data),
    delete: (orderId) => api
      .delete(`api/orders-draft/${orderId}/delete`, { orderId })
      .then((res) => res.data),
    get: (orderId) => api.get(`api/orders-draft/${orderId}`),
  },
};
