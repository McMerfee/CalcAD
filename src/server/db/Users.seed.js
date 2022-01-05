const mongoose = require('mongoose');

module.exports = [
  {
    _id: new mongoose.Types.ObjectId(),
    email: 'ads-admin@gmail.com',
    phone: 380670000000,
    isPhoneNumberVerified: true,
    password: '$2a$10$JSTRLMbFA1KyxqdB6pz.mu3cJEBksxvrn8QvpgWmDsXVwK05AUDQa',
    adminAccessToken: 'YWRtaW46cGFzc3cwcmQhcGFzc3cwcmQh',
    firstName: 'Админ',
    lastName: 'ADS',
    role: 'admin',
    packageName: 'Розничная',
    primaryRegion: 'Львов',
    regionsList: ['Львов', 'Харьков'],
  },
];
