const dotenv = require('dotenv-safe');

dotenv.config({ path: '.env' });

const ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = ENV === 'production' || ENV === 'staging'
  ? process.env.MONGODB_URI
  : 'mongodb://localhost:27017/ads';

const migrationConfig = {
  mongodb: {
    url: MONGODB_URI,

    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // The migrations dir, can be an relative or absolute path.
  migrationsDir: './src/server/migrations',

  // The mongodb collection where the applied changes are stored.
  changelogCollectionName: 'changelog',

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: '.js',
};

module.exports = migrationConfig;
