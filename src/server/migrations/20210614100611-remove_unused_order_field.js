/**
 * Orders migration:
 * Remove following unused field: isAccepted
 */

module.exports = {
  async up(db) {
    await db.collection('Orders').updateMany({}, { $unset: { isAccepted: '' } });
  },

  async down() {
    return null;
  },
};
