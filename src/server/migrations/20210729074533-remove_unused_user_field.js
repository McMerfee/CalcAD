/**
 * Users migration:
 * Remove following unused field: shipping
 */

module.exports = {
  async up(db) {
    await db.collection('Users').updateMany({}, { $unset: { shipping: '' } });
  },

  async down() {
    return null;
  },
};
