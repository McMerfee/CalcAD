/**
 * Orders migration:
 * Add missing statuses.
 */

module.exports = {
  async up(db) {
    await db.collection('Orders').updateMany({ isAccepted: false }, { $set: { status: 'new' } });
    await db.collection('Orders').updateMany({ isAccepted: true }, { $set: { status: 'in-processing' } });
  },

  async down() {
    return null;
  },
};
